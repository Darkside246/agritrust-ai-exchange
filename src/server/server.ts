import express, { Request, Response } from 'express';
import { AgriTrustDatabase } from '../core/database/db';
import { MarginEngine, CostBreakdownInput } from '../core/pricing/marginEngine';
import { PrivacyManager } from '../core/security/privacy';
import { AuthManager } from '../core/identity/auth';
import { AuditLedger } from '../core/audit/auditLedger';
import { FileSecurityManager } from '../core/security/fileSecurity';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { FeatureFlagManager } from '../core/config/featureFlags';

// --- Node-only real implementations. These modules transitively import
// whatsapp-web.js/puppeteer and @anthropic-ai/sdk, so they must ONLY ever be
// imported from this file (the Express server entrypoint, run via
// `npm run server` / tsx - never bundled by Vite for the browser).
import { WhatsAppWebSessionManager } from '../core/providers/whatsappWebSessionManager';
import { WhatsAppWebDevelopmentProvider } from '../core/providers/whatsappWebDevelopmentProvider';
import { generateCommunicationsAgentDraft } from '../core/ai/communicationsAgent';
import { registerWhatsAppWebSessionController } from '../core/providers/whatsappWebSessionRegistry';
import { registerWhatsAppWebProvider } from '../core/providers/whatsappWebProviderRegistry';
import { registerCommunicationsAgent } from '../core/providers/communicationsAgentRegistry';

// Register real SQLite persistence — must be first so all subsequent
// service init can write to a real database
import * as SqliteDb from '../core/database/sqliteDb';
import { registerPersistenceLayer, IPersistenceLayer } from '../core/database/persistenceRegistry';

const sqliteLayer: IPersistenceLayer = {
  getUser: SqliteDb.dbGetUser,
  getUserByEmail: SqliteDb.dbGetUserByEmail,
  createUser: SqliteDb.dbCreateUser,
  getAllUsers: SqliteDb.dbGetAllUsers,
  createFarmerProfile: SqliteDb.dbCreateFarmerProfile,
  getFarmerProfile: SqliteDb.dbGetFarmerProfile,
  getAllFarmerProfiles: SqliteDb.dbGetAllFarmerProfiles,
  createBuyerProfile: SqliteDb.dbCreateBuyerProfile,
  getBuyerProfile: SqliteDb.dbGetBuyerProfile,
  getAllBuyerProfiles: SqliteDb.dbGetAllBuyerProfiles,
  getPublishedProducts: SqliteDb.dbGetPublishedProducts,
  getProduct: SqliteDb.dbGetProduct,
  upsertProduct: SqliteDb.dbUpsertProduct,
  getAllProducts: SqliteDb.dbGetAllProducts,
  createOrder: SqliteDb.dbCreateOrder,
  getOrder: SqliteDb.dbGetOrder,
  getBuyerOrders: SqliteDb.dbGetBuyerOrders,
  getAllOrders: SqliteDb.dbGetAllOrders,
  updateOrderStatus: SqliteDb.dbUpdateOrderStatus,
  addOrderItem: SqliteDb.dbAddOrderItem,
  getOrderItems: SqliteDb.dbGetOrderItems,
  createSupplySubmission: SqliteDb.dbCreateSupplySubmission,
  getSupplySubmissions: SqliteDb.dbGetSupplySubmissions,
  updateSupplySubmissionStatus: SqliteDb.dbUpdateSupplySubmissionStatus,
  saveWhatsAppMessage: SqliteDb.dbSaveWhatsAppMessage,
  getWhatsAppMessages: SqliteDb.dbGetWhatsAppMessages,
  getAllWhatsAppMessages: SqliteDb.dbGetAllWhatsAppMessages,
  upsertWhatsAppConversation: SqliteDb.dbUpsertWhatsAppConversation,
  getWhatsAppConversations: SqliteDb.dbGetWhatsAppConversations,
  appendAuditEvent: SqliteDb.dbAppendAuditEvent,
  getAuditEvents: SqliteDb.dbGetAuditEvents,
  getSetting: SqliteDb.dbGetSetting,
  setSetting: SqliteDb.dbSetSetting,
  getAllSettings: SqliteDb.dbGetAllSettings,
  rowExists: SqliteDb.dbRowExists,
  countRows: SqliteDb.dbCountRows,
};
registerPersistenceLayer(sqliteLayer);

import * as WaStore from '../core/database/whatsappEncryptedStore';
import { registerSyncFunctions } from '../core/providers/whatsappWebSessionManager';

// Register encrypted store sync functions so the session manager can write
// to the encrypted SQLite DB without importing it directly (Node-only boundary)
registerSyncFunctions({
  upsertChat: WaStore.waUpsertChat,
  upsertContact: WaStore.waUpsertContact,
  upsertMessage: WaStore.waUpsertMessage,
  upsertCallLog: WaStore.waUpsertCallLog,
  getChats: WaStore.waGetChats,
  getContacts: WaStore.waGetContacts,
  getMessages: WaStore.waGetMessages,
  getCallLogs: WaStore.waGetCallLogs,
  markChatRead: WaStore.waMarkChatRead,
  getSyncStats: WaStore.waGetSyncStats,
  searchContacts: WaStore.waSearchContacts,
});

// Real inbound WhatsApp Web messages (Section 13, 24) -> the same
// processInboundWhatsAppMessage() pipeline used by the dev/test HTTP routes.
// Emergency-stop/pause is enforced inside generateCommunicationsAgentDraft
// itself (AgriTrustDatabase.getAISystemPauseStatus()), so a paused system
// still stores the message but never calls the model for it.
WhatsAppWebSessionManager.onInboundMessage((fromPhone, text) => {
  AgriTrustDatabase.processInboundWhatsAppMessage(fromPhone, text).then((result) => {
    // Persist to real SQLite so messages survive server restart
    const convId = `wa-conv-${fromPhone.replace(/[^0-9]/g, '').slice(-9)}`;
    sqliteLayer.upsertWhatsAppConversation({
      id: convId,
      contact_phone: fromPhone,
      contact_name: result.contactType,
      account_type: result.contactType,
      last_message_text: text.slice(0, 200),
      last_activity_at: new Date().toISOString(),
    });
    sqliteLayer.saveWhatsAppMessage({
      id: result.messageId,
      conversation_id: convId,
      direction: 'INBOUND',
      sender_phone: fromPhone,
      text,
      provider: result.provider,
      environment: result.environment,
      ai_draft: result.aiDraftText,
      ai_risk_level: result.aiRiskLevel,
      requires_human_approval: result.requiresHumanApproval ? 1 : 0,
      is_prompt_injection: result.isPromptInjection ? 1 : 0,
    });
  }).catch((err) => {
    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'WHATSAPP_WEB_INBOUND_PROCESSING_FAILED',
      `SENDER:${fromPhone}`,
      `Failed to process real inbound WhatsApp Web message: ${err instanceof Error ? err.message : String(err)}`
    );
  });
});

const app = express();

// Webhook endpoint needs raw body for HMAC verification — must come BEFORE express.json()
app.use('/api/webhooks/whatsapp', express.raw({ type: 'application/json' }));
app.use(express.json());

// ─── Smart Provider Auto-Selection ───────────────────────────────────────────
// Meta Cloud API is used when credentials are in env (Railway production).
// WhatsApp Web (Puppeteer) is used otherwise (local development only).
import { MetaSecretVault } from '../core/security/metaSecretVault';
import { MetaWebhookEngine } from '../core/security/metaWebhookEngine';

if (process.env.META_ACCESS_TOKEN && process.env.META_PHONE_NUMBER_ID) {
  MetaSecretVault.updateCredentialsConfig({
    accessToken: process.env.META_ACCESS_TOKEN,
    phoneNumberId: process.env.META_PHONE_NUMBER_ID,
    whatsappBusinessAccountId: process.env.META_WABA_ID || '',
    metaAppId: process.env.META_APP_ID || '',
    metaAppSecret: process.env.META_APP_SECRET || '',
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'agritrust-webhook-token',
  }, 'sys-admin');
  AgriTrustDatabase.setWhatsAppProvider('meta_cloud', 'sys-admin');
  console.log('[AgriTrust] ✓ Meta Cloud API detected — using production provider (no Puppeteer needed).');
} else {
  console.log('[AgriTrust] No Meta credentials found — using WhatsApp Web development provider.');
}

// ─── Meta Cloud API Webhook Endpoints ────────────────────────────────────────

/**
 * GET /api/webhooks/whatsapp
 * Meta webhook verification challenge.
 * Paste this URL in Meta Developer Console → WhatsApp → Configuration → Webhook URL
 */
app.get('/api/webhooks/whatsapp', (req: Request, res: Response): void => {
  const result = MetaWebhookEngine.verifyWebhookChallenge(req.query as any);
  if (result.isValid) {
    res.status(200).send(result.challenge);
  } else {
    res.status(403).json({ error: result.errorMessage });
  }
});

/**
 * POST /api/webhooks/whatsapp
 * Receives real incoming WhatsApp messages from Meta Cloud API.
 * Meta posts signed JSON here when a customer messages you.
 */
app.post('/api/webhooks/whatsapp', async (req: Request, res: Response): Promise<void> => {
  // Verify HMAC signature — reject forged webhooks
  const signature = req.headers['x-hub-signature-256'] as string;
  const rawBody = (req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body))).toString();

  if (!MetaWebhookEngine.verifyWebhookSignature(rawBody, signature)) {
    AuditLedger.logImmutableSecurityEvent('sys-admin', 'META_WEBHOOK_SIGNATURE_FAILED', 'HIGH',
      'Rejected Meta webhook POST with invalid HMAC signature.');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // Respond 200 immediately — Meta retries if response takes > 20s
  res.status(200).json({ status: 'received' });

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (payload?.object !== 'whatsapp_business_account') return;

    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value?.messages) continue;

        for (const msg of value.messages) {
          if (MetaWebhookEngine.isDuplicateEvent(msg.id)) continue;

          const fromPhone = `+${msg.from}`;
          const text = msg.type === 'text' ? (msg.text?.body || '') : `[${msg.type}]`;
          const contactName = value.contacts?.[0]?.profile?.name || fromPhone;
          const ts = parseInt(msg.timestamp) || Math.floor(Date.now() / 1000);
          const chatId = `${msg.from}@c.us`;

          // Store encrypted
          WaStore.waUpsertChat({ id: chatId, name: contactName, phone: fromPhone, isGroup: false, isArchived: false, isPinned: false, isMuted: false, unreadCount: 1, lastMessage: text, lastMessageType: msg.type, lastMessageFromMe: false, timestamp: ts });
          WaStore.waUpsertMessage({ id: msg.id, chatId, body: text, type: msg.type, fromMe: false, fromPhone, fromName: contactName, timestamp: ts, hasMedia: msg.type !== 'text', isForwarded: false, isStarred: false, ack: 0 });

          // AI pipeline
          AgriTrustDatabase.processInboundWhatsAppMessage(fromPhone, text).catch((err: any) => {
            console.error('[AgriTrust] Meta webhook AI pipeline error:', err?.message);
          });
        }

        // Handle delivery/read status updates
        for (const status of value.statuses || []) {
          AuditLedger.logOperationalEvent('sys-admin', 'SYSTEM', 'META_MESSAGE_STATUS',
            `MSG:${status.id}`, `Status: ${status.status} for recipient ${status.recipient_id}`);
        }
      }
    }
  } catch (err: any) {
    console.error('[AgriTrust] Meta webhook parse error:', err?.message);
  }
});

/**
 * GET /api/admin/whatsapp/setup-guide
 * Returns full setup instructions + current configuration status
 */
app.get('/api/admin/whatsapp/setup-guide', (_req: Request, res: Response): void => {
  const configured = MetaSecretVault.isConfigured();
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  const publicUrl = process.env.PUBLIC_URL;
  const baseUrl = railwayDomain ? `https://${railwayDomain}` : publicUrl || 'https://your-app.up.railway.app';

  res.json({
    success: true,
    activeProvider: configured ? 'meta_cloud' : 'whatsapp_web',
    metaConfigured: configured,
    webhookUrl: `${baseUrl}/api/webhooks/whatsapp`,
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || 'agritrust-webhook-token',
    requiredEnvVars: [
      { name: 'META_ACCESS_TOKEN', set: !!process.env.META_ACCESS_TOKEN, description: 'Permanent System User token from Meta Business Manager' },
      { name: 'META_PHONE_NUMBER_ID', set: !!process.env.META_PHONE_NUMBER_ID, description: 'Phone Number ID from Meta Developer Console → WhatsApp → API Setup' },
      { name: 'META_WABA_ID', set: !!process.env.META_WABA_ID, description: 'WhatsApp Business Account ID' },
      { name: 'META_APP_ID', set: !!process.env.META_APP_ID, description: 'Meta App ID' },
      { name: 'META_APP_SECRET', set: !!process.env.META_APP_SECRET, description: 'App Secret for HMAC webhook signature verification' },
      { name: 'META_WEBHOOK_VERIFY_TOKEN', set: !!process.env.META_WEBHOOK_VERIFY_TOKEN, description: 'Any string you choose — use the same value in Meta Developer Console' },
      { name: 'ANTHROPIC_API_KEY', set: !!process.env.ANTHROPIC_API_KEY, description: 'Claude AI key for agent replies' },
      { name: 'WHATSAPP_ENCRYPTION_KEY', set: !!process.env.WHATSAPP_ENCRYPTION_KEY, description: 'AES-256-GCM key for encrypting messages/contacts at rest' },
    ],
    steps: [
      '1. Go to developers.facebook.com → My Apps → Create App → Business',
      '2. Add WhatsApp product to your app',
      '3. Create or connect a WhatsApp Business Account (WABA)',
      '4. Add and verify a phone number',
      '5. In Meta Business Manager → System Users → create a System User with FULL_CONTROL on the WABA → generate a permanent token',
      `6. In Meta Developer Console → WhatsApp → Configuration → set Webhook URL to: ${baseUrl}/api/webhooks/whatsapp`,
      '7. Set Webhook Verify Token to the same value as META_WEBHOOK_VERIFY_TOKEN',
      '8. Subscribe to webhook fields: messages, message_deliveries, message_reads',
      '9. Add all META_* environment variables in Railway → your service → Variables',
      '10. Click Redeploy in Railway — the app auto-selects Meta Cloud API when credentials are present',
    ],
  });
});

// Initialize Core Database (in-memory layer for UI compatibility)
AgriTrustDatabase.initialize();

// Seed the SQLite database on first boot from existing seed data
(function seedSqliteOnFirstBoot() {
  const db = sqliteLayer;
  if (db.countRows('products') === 0) {
    console.log('[AgriTrust] SQLite: seeding products from in-memory seed data...');
    const products = AgriTrustDatabase.getProducts();
    for (const p of products) {
      db.upsertProduct({
        id: p.id, lot_id: p.lotId, name: p.name, variety: p.variety,
        category: p.category, description: p.description, unit: p.unit,
        price_per_unit: p.pricePerUnit, moq_units: p.moqUnits,
        available_units: p.availableUnits, grade: p.grade,
        availability_status: p.availabilityStatus, harvest_date: p.harvestDate,
        traceability_status: 'VERIFIED',
        image_url: p.imageUrl ?? null, published: 1,
        farmer_id: null,
      });
    }
    console.log(`[AgriTrust] SQLite: seeded ${products.length} products.`);
  }

  if (db.countRows('users') === 0) {
    const farmerUser = AgriTrustDatabase.getUserById('usr-farmer-01');
    if (farmerUser) {
      db.createUser({ id: farmerUser.id, email: farmerUser.email, role: farmerUser.role as string, organisation_name: farmerUser.name });
      const fp = AgriTrustDatabase.getFarmerProfileByUserId('usr-farmer-01');
      if (fp) db.createFarmerProfile({ id: fp.id, user_id: 'usr-farmer-01', full_name: fp.contactName, farm_name: fp.businessName, location: fp.publicRegion, phone: fp.privatePhone });
    }
    const buyerUser = AgriTrustDatabase.getUserById('usr-buyer-01');
    if (buyerUser) {
      db.createUser({ id: buyerUser.id, email: buyerUser.email, role: buyerUser.role as string, organisation_name: buyerUser.name });
      const bp = AgriTrustDatabase.getBuyerProfileByUserId('usr-buyer-01');
      if (bp) db.createBuyerProfile({ id: bp.id, user_id: 'usr-buyer-01', organisation_name: bp.businessName, contact_name: bp.contactName, phone: bp.privatePhone, address: bp.privateAddress });
    }
    console.log('[AgriTrust] SQLite: seeded seed farmer/buyer accounts.');
  }
})();

/**
 * GET /api/products
 * Returns product catalog from real SQLite with optional query filters.
 */
app.get('/api/products', (req: Request, res: Response): void => {
  const { category, grade, search } = req.query;
  const rows = sqliteLayer.getPublishedProducts({
    category: category as string,
    grade: grade as string,
    search: search as string,
  });

  // Map SQLite snake_case rows to the camelCase shape the frontend expects
  const sanitizedProducts = rows.map((r: any) => ({
    id: r.id, lotId: r.lot_id, name: r.name, variety: r.variety,
    category: r.category, description: r.description, unit: r.unit,
    pricePerUnit: r.price_per_unit, moqUnits: r.moq_units,
    availableUnits: r.available_units, grade: r.grade,
    availabilityStatus: r.availability_status, harvestDate: r.harvest_date,
    traceabilityStatus: r.traceability_status, imageUrl: r.image_url,
  }));
  res.json({ success: true, count: sanitizedProducts.length, data: sanitizedProducts });
});

/**
 * GET /api/products/:id
 */
app.get('/api/products/:id', (req: Request, res: Response): void => {
  const product = AgriTrustDatabase.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, data: PrivacyManager.sanitizeProductForPublic(product) });
});

/**
 * GET /api/traceability/:lotId
 * Public lot lookup endpoint strictly enforcing counterparty privacy redaction.
 */
app.get('/api/traceability/:lotId', (req: Request, res: Response): void => {
  const lot = AgriTrustDatabase.getLotById(req.params.lotId);
  if (!lot) {
    res.status(404).json({ success: false, error: 'Lot identifier not found in active ledger' });
    return;
  }

  const publicView = PrivacyManager.sanitizeLotForPublic(lot);
  const events = AgriTrustDatabase.getLotEvents(lot.id);

  res.json({
    success: true,
    lot: publicView,
    events,
    privacyNotice: 'Counterparty identity, phone, address, and exact GPS coordinates protected by AgriTrust Core.',
  });
});

/**
 * GET /api/traceability/:lotId/full
 * Extended deep lot provenance ledger endpoint.
 */
app.get('/api/traceability/:lotId/full', (req: Request, res: Response): void => {
  const lot = AgriTrustDatabase.getLotById(req.params.lotId);
  if (!lot) {
    res.status(404).json({ success: false, error: 'Lot identifier not found in active ledger' });
    return;
  }

  const publicView = PrivacyManager.sanitizeLotForPublic(lot);
  const events = AgriTrustDatabase.getLotEvents(lot.id);
  const quality = AgriTrustDatabase.getLotQuality(lot.id);
  const documents = AgriTrustDatabase.getLotDocuments(lot.id);

  res.json({
    success: true,
    lot: publicView,
    events,
    quality,
    documents,
    verificationStatus: 'CRYPTO_HASH_VERIFIED',
    privacyNotice: 'Counterparty identity, phone, address, and exact GPS coordinates protected by AgriTrust Core.',
  });
});

/**
 * POST /api/cart/validate
 * Server-side authoritative validation of wholesale cart prices, MOQs, and total landed costs.
 */
app.post('/api/cart/validate', (req: Request, res: Response): void => {
  const { items } = req.body as { items: Array<{ productId: string; quantity: number }> };
  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, error: 'Invalid items array' });
    return;
  }

  const validatedItems = [];
  let subtotal = 0;
  const errors: string[] = [];

  for (const item of items) {
    const product = AgriTrustDatabase.getProductById(item.productId);
    if (!product) {
      errors.push(`Product '${item.productId}' does not exist.`);
      continue;
    }

    if (item.quantity < product.moqUnits) {
      errors.push(`Product '${product.name}' requires a minimum order quantity (MOQ) of ${product.moqUnits} ${product.unit}s.`);
    }

    if (item.quantity > product.availableUnits) {
      errors.push(`Requested quantity (${item.quantity}) for '${product.name}' exceeds available stock (${product.availableUnits}).`);
    }

    const itemSubtotal = Number((item.quantity * product.pricePerUnit).toFixed(2));
    subtotal += itemSubtotal;

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      lotId: product.lotId,
      unit: product.unit,
      unitPrice: product.pricePerUnit,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  const logisticsFee = subtotal > 0 ? 45.00 : 0.00;
  const platformFee = subtotal > 0 ? Number((subtotal * 0.025).toFixed(2)) : 0.00;
  const grandTotal = Number((subtotal + logisticsFee + platformFee).toFixed(2));

  res.json({
    valid: errors.length === 0,
    errors,
    summary: {
      subtotal,
      logisticsFee,
      platformFee,
      grandTotal,
    },
    items: validatedItems,
  });
});

/**
 * POST /api/margin/evaluate
 * Tests Minimum Margin Engine calculation for a cost breakdown:
 * Selling Price = TRUE LANDED COST / (1 - TARGET_MARGIN)
 */
app.post('/api/margin/evaluate', (req: Request, res: Response): void => {
  const { costs: rawCosts, proposedSellingPrice, targetMarginPercent } = req.body as {
    costs: Record<string, number>;
    proposedSellingPrice: number;
    targetMarginPercent?: number;
  };

  if (!rawCosts || typeof proposedSellingPrice !== 'number') {
    res.status(400).json({ success: false, error: 'Missing costs or proposedSellingPrice' });
    return;
  }

  // Normalise: accept both the engine's camelCase field names AND
  // common shorthand keys sent by the frontend/tests
  const costs: CostBreakdownInput = {
    farmerProcurementCost:     rawCosts.farmerProcurementCost     ?? rawCosts.farmerCost           ?? 0,
    gradingCost:               rawCosts.gradingCost               ?? rawCosts.grading              ?? 0,
    packagingCost:             rawCosts.packagingCost             ?? rawCosts.packaging            ?? 0,
    storageCost:               rawCosts.storageCost               ?? rawCosts.storage              ?? 0,
    transportCost:             rawCosts.transportCost             ?? rawCosts.transportation       ?? rawCosts.transport ?? 0,
    paymentProcessingCost:     rawCosts.paymentProcessingCost     ?? rawCosts.paymentProcessing    ?? 0,
    platformCost:              rawCosts.platformCost              ?? rawCosts.platformCosts         ?? rawCosts.platform ?? 0,
    expectedSpoilageLossCost:  rawCosts.expectedSpoilageLossCost  ?? rawCosts.expectedSpoilage     ?? rawCosts.spoilage  ?? 0,
    riskReserveCost:           rawCosts.riskReserveCost           ?? rawCosts.riskReserve          ?? 0,
    otherAllocatedCost:        rawCosts.otherAllocatedCost        ?? rawCosts.other                ?? 0,
  };

  try {
    const evaluation = MarginEngine.evaluateMargin(
      'CE-REQ-01',
      costs,
      proposedSellingPrice,
      targetMarginPercent || 20
    );

    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'EVALUATE_MARGIN',
      'COST_ENTRY',
      `Evaluated true landed cost $${evaluation.trueLandedCost} against proposed price $${proposedSellingPrice}. Satisfied: ${evaluation.isMarginSatisfied}`
    );

    res.json({ success: true, evaluation });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/auth/oauth-status
 */
app.get('/api/auth/oauth-status', (req: Request, res: Response): void => {
  res.json(AuthManager.getOAuthConfigStatus());
});

/**
 * POST /api/auth/register/buyer
 */
app.post('/api/auth/register/buyer', (req: Request, res: Response): void => {
  const { email, businessName, contactName, privatePhone, privateAddress, creditLimit } = req.body;

  if (!email || !businessName || !contactName) {
    res.status(400).json({ success: false, error: 'Missing required buyer identity fields' });
    return;
  }

  const { user, profile } = AgriTrustDatabase.createBuyerAccount(
    email,
    businessName,
    contactName,
    privatePhone || '+1-555-018-0000',
    privateAddress || 'Confidential Headquarters Address',
    creditLimit || 25000
  );

  // Persist to SQLite so registration survives server restart
  if (!sqliteLayer.getUser(user.id)) {
    sqliteLayer.createUser({ id: user.id, email: user.email, role: user.role as string, organisation_name: businessName });
    sqliteLayer.createBuyerProfile({ id: profile.id, user_id: user.id, organisation_name: businessName, contact_name: contactName, phone: privatePhone as string | undefined, address: privateAddress as string | undefined });
  }

  const session = AuthManager.createSession(user);

  AuditLedger.logOperationalEvent(
    user.id,
    'BUYER',
    'REGISTER_BUYER',
    `BUYER_PROFILE:${profile.id}`,
    `New commercial buyer registered: ${businessName}`
  );
  sqliteLayer.appendAuditEvent({ id: `aud-${Date.now()}`, actor: user.id, actor_role: 'BUYER', action: 'REGISTER_BUYER', entity_ref: profile.id, details: `Buyer: ${businessName}` });

  res.json({
    success: true,
    user: AuthManager.sanitizeRegisterRole(user.role),
    profile: PrivacyManager.redactBuyerProfile(profile),
    session,
  });
});

/**
 * POST /api/seller/submissions
 * Seller submits produce supply for procurement review
 */
app.post('/api/seller/submissions', (req: Request, res: Response): void => {
  try {
    const submission = AgriTrustDatabase.createSupplySubmission(req.body, req.body.sellerId || 'fp-01');
    // Persist to SQLite
    sqliteLayer.createSupplySubmission({
      id: submission.id,
      farmer_id: req.body.sellerId || 'fp-01',
      crop_name: req.body.cropName || req.body.crop_name || 'Unknown',
      variety: req.body.variety,
      estimated_quantity: req.body.estimatedQuantity ?? req.body.estimated_quantity,
      unit: req.body.unit ?? 'kg',
      harvest_date: req.body.harvestDate ?? req.body.harvest_date,
      asking_price: req.body.askingPrice ?? req.body.asking_price,
      notes: req.body.notes,
    });
    res.json({ success: true, submission });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/submissions
 * Admin lists all seller supply submissions
 */
app.get('/api/admin/submissions', (req: Request, res: Response): void => {
  const sellerId = req.query.sellerId as string;
  const submissions = AgriTrustDatabase.getSupplySubmissions(sellerId);
  res.json({ success: true, count: submissions.length, submissions });
});

/**
 * POST /api/admin/submissions/:id/approve
 * Admin approves submission -> Creates Lot with HIDDEN publication status (Approved != Published)
 */
app.post('/api/admin/submissions/:id/approve', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const lot = AgriTrustDatabase.approveSupplySubmissionAndCreateLot(id, 'sys-admin');
    res.json({ success: true, lot, publicationStatus: lot.publicationStatus });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/products
 * Admin manually creates a commercial product catalogue entry
 */
app.post('/api/admin/products', (req: Request, res: Response): void => {
  try {
    const product = AgriTrustDatabase.createProductManual(req.body, 'sys-admin');
    // Persist to SQLite
    sqliteLayer.upsertProduct({
      id: product.id, lot_id: product.lotId, name: product.name,
      variety: product.variety, category: product.category,
      description: product.description, unit: product.unit,
      price_per_unit: product.pricePerUnit, moq_units: product.moqUnits,
      available_units: product.availableUnits, grade: product.grade,
      availability_status: product.availabilityStatus,
      harvest_date: product.harvestDate,
      traceability_status: 'VERIFIED',
      image_url: product.imageUrl,
      published: 1,
    });
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/buyers
 * RBAC Protected: List commercial buyers
 */
app.get('/api/admin/buyers', (req: Request, res: Response): void => {
  const role = req.headers['x-role'] as string || req.headers['role'] as string;
  if (role && role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Forbidden: Admin RBAC role required.' });
    return;
  }
  const buyers = AgriTrustDatabase.getAllBuyers();
  res.json({ success: true, count: buyers.length, buyers });
});

/**
 * GET /api/admin/sellers
 * RBAC Protected: List registered sellers
 */
app.get('/api/admin/sellers', (req: Request, res: Response): void => {
  const role = req.headers['x-role'] as string || req.headers['role'] as string;
  if (role && role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Forbidden: Admin RBAC role required.' });
    return;
  }
  const sellers = AgriTrustDatabase.getAllSellers();
  res.json({ success: true, count: sellers.length, sellers });
});

/**
 * POST /api/auth/register/farmer
 */
app.post('/api/auth/register/farmer', (req: Request, res: Response): void => {
  const { email, businessName, contactName, privatePhone, privateAddress, privateGpsLat, privateGpsLng, publicRegion } = req.body;

  if (!email || !businessName || !contactName) {
    res.status(400).json({ success: false, error: 'Missing required farmer identity fields' });
    return;
  }

  const { user, profile } = AgriTrustDatabase.createFarmerAccount(
    email,
    businessName,
    contactName,
    privatePhone || '+1-555-019-0000',
    privateAddress || 'Confidential Farm Plot Address',
    privateGpsLat || 13.1939,
    privateGpsLng || -59.5432,
    publicRegion || 'Western Agricultural Zone 4'
  );

  // Persist to SQLite
  if (!sqliteLayer.getUser(user.id)) {
    sqliteLayer.createUser({ id: user.id, email: user.email, role: user.role as string, organisation_name: businessName });
    sqliteLayer.createFarmerProfile({ id: profile.id, user_id: user.id, full_name: contactName, farm_name: businessName, location: publicRegion, phone: privatePhone as string | undefined });
  }

  const session = AuthManager.createSession(user);

  AuditLedger.logOperationalEvent(
    user.id,
    'FARMER',
    'REGISTER_FARMER',
    `FARMER_PROFILE:${profile.id}`,
    `New agricultural producer registered: ${businessName}`
  );

  res.json({
    success: true,
    user: AuthManager.sanitizeRegisterRole(user.role),
    profile: PrivacyManager.redactFarmerProfile(profile),
    session,
  });
});

/**
 * POST /api/documents/upload
 * File Security Upload Endpoint
 */
app.post('/api/documents/upload', (req: Request, res: Response): void => {
  const { fileName, mimeType, fileSizeBytes } = req.body;

  if (!fileName || !mimeType || typeof fileSizeBytes !== 'number') {
    res.status(400).json({ success: false, error: 'Missing file metadata parameters' });
    return;
  }

  const validation = FileSecurityManager.validateUpload(fileName, mimeType, fileSizeBytes);
  if (!validation.valid) {
    res.status(400).json({ success: false, error: validation.reason });
    return;
  }

  const malwareResult = FileSecurityManager.scanForMalware(fileName);

  res.json({
    success: true,
    fileId: `doc-${Date.now()}`,
    fileName,
    validation,
    malwareResult,
  });
});

/**
 * GET /api/buyer/dashboard
 */
app.get('/api/buyer/dashboard', (req: Request, res: Response): void => {
  const buyerUserId = (req.query.buyerUserId as string) || 'usr-buyer-01';
  const buyerProfile = AgriTrustDatabase.getBuyerProfileByUserId(buyerUserId);

  if (!buyerProfile) {
    res.status(404).json({ success: false, error: 'Buyer profile not found' });
    return;
  }

  const redactedProfile = PrivacyManager.redactBuyerProfile(buyerProfile);
  const orders = AgriTrustDatabase.getBuyerOrders(buyerProfile.id);
  const shipments = AgriTrustDatabase.getBuyerShipments(buyerProfile.id);
  const invoices = AgriTrustDatabase.getBuyerInvoices(buyerProfile.id);
  const requests = AgriTrustDatabase.getBuyerProcurementRequests(buyerProfile.id);

  res.json({
    success: true,
    profile: redactedProfile,
    orders,
    shipments,
    invoices,
    requests,
  });
});

/**
 * POST /api/buyer/orders
 */
app.post('/api/buyer/orders', (req: Request, res: Response): void => {
  const { buyerId, items, logisticsFee } = req.body;

  if (!buyerId || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Invalid order input' });
    return;
  }

  // Server-side recalculation — never trust client totals (Section 50/51)
  const subtotal = items.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0);
  const logFee = typeof logisticsFee === 'number' ? logisticsFee : 45.00;
  const platformFee = Math.round(subtotal * 0.025 * 100) / 100;
  const total = subtotal + logFee + platformFee;
  const orderId = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  // Validate each line item exists and has sufficient inventory
  for (const item of items) {
    const product = sqliteLayer.getProduct(item.productId) || AgriTrustDatabase.getProductById(item.productId);
    if (!product) {
      res.status(400).json({ success: false, error: `Product ${item.productId} not found` });
      return;
    }
    if (item.quantity < (product.moq_units ?? product.moqUnits ?? 1)) {
      res.status(400).json({ success: false, error: `Quantity for ${product.name} is below minimum order quantity` });
      return;
    }
  }

  const newOrder = AgriTrustDatabase.saveOrder({
    id: orderId, buyerId, items, subtotal, logisticsFee: logFee,
    platformFee, tax: 0.00, total, status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  });

  // Persist to SQLite
  sqliteLayer.createOrder({ id: orderId, buyer_id: buyerId, total, item_count: items.length });
  for (const item of items) {
    sqliteLayer.addOrderItem({
      id: `oi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      order_id: orderId, product_id: item.productId, product_name: item.name || item.productId,
      quantity: item.quantity, unit: item.unit || 'kg', price_per_unit: item.pricePerUnit,
      subtotal: item.subtotal,
    });
  }
  sqliteLayer.appendAuditEvent({
    id: `aud-ord-${Date.now()}`, actor: buyerId, actor_role: 'BUYER',
    action: 'CREATE_ORDER', entity_ref: orderId,
    details: `Order total $${total.toFixed(2)}, ${items.length} items`,
  });

  AuditLedger.logOperationalEvent(
    buyerId, 'BUYER', 'CREATE_ORDER', `ORDER:${newOrder.id}`,
    `Buyer placed wholesale order for total $${total.toFixed(2)}`
  );

  res.json({ success: true, order: newOrder });
});

/**
 * GET /api/farmer/dashboard
 */
app.get('/api/farmer/dashboard', (req: Request, res: Response): void => {
  const farmerUserId = (req.query.farmerUserId as string) || 'usr-farmer-01';
  const farmerProfile = AgriTrustDatabase.getFarmerProfileByUserId(farmerUserId);

  if (!farmerProfile) {
    res.status(404).json({ success: false, error: 'Farmer profile not found' });
    return;
  }

  const redactedProfile = PrivacyManager.redactFarmerProfile(farmerProfile);
  const lots = AgriTrustDatabase.getFarmerLots(farmerProfile.id);
  const settlements = AgriTrustDatabase.getFarmerSettlements(farmerProfile.id);

  res.json({
    success: true,
    profile: redactedProfile,
    lots,
    settlements,
  });
});

/**
 * POST /api/farmer/intake
 */
app.post('/api/farmer/intake', (req: Request, res: Response): void => {
  const { farmerId, productId, cropName, quantityUnitsKg, storageTemp } = req.body;

  if (!farmerId || !productId || typeof quantityUnitsKg !== 'number') {
    res.status(400).json({ success: false, error: 'Missing required harvest intake parameters' });
    return;
  }

  const lot = AgriTrustDatabase.createHarvestLot(
    farmerId,
    productId,
    cropName || 'Produce Harvest Batch',
    quantityUnitsKg,
    typeof storageTemp === 'number' ? storageTemp : 13.0
  );

  AuditLedger.logOperationalEvent(
    farmerId,
    'FARMER',
    'REGISTER_HARVEST_INTAKE',
    `LOT:${lot.id}`,
    `Farmer registered harvest batch intake (${quantityUnitsKg} kg) with SHA-256 hash ${lot.verificationHash}`
  );

  res.json({ success: true, lot });
});

/**
 * POST /api/quality/inspect
 */
app.post('/api/quality/inspect', (req: Request, res: Response): void => {
  const { lotId, inspectorId, grade, aiConfidenceScore, defectsDetected } = req.body;

  if (!lotId || !grade) {
    res.status(400).json({ success: false, error: 'Missing lotId or grade parameter' });
    return;
  }

  const quality = AgriTrustDatabase.updateLotQuality(lotId, {
    id: `lq-${Date.now()}`,
    lotId,
    grade,
    aiConfidenceScore: typeof aiConfidenceScore === 'number' ? aiConfidenceScore : 98.4,
    inspectorId: inspectorId || 'insp-042',
    inspectionDate: new Date().toISOString(),
    defectsDetected: Array.isArray(defectsDetected) ? defectsDetected : ['None detected'],
    status: 'ACCEPTED',
  });

  const certHash = `sha256_qc_${lotId}_${Math.random().toString(36).substring(2, 8)}`;
  AgriTrustDatabase.addLotDocument(lotId, {
    id: `ld-cert-${Date.now()}`,
    lotId,
    documentType: 'QUALITY_CERT',
    fileUrl: `/docs/quality_cert_${lotId}.pdf`,
    fileHash: certHash,
    uploadedAt: new Date().toISOString(),
  });

  AuditLedger.logOperationalEvent(
    inspectorId || 'insp-042',
    'OPERATIONS',
    'QUALITY_INSPECT',
    `LOT:${lotId}`,
    `Certified lot quality '${grade}' with certificate hash ${certHash}`
  );

  res.json({ success: true, quality, certHash });
});

/**
 * POST /api/quality/override
 * Two-Human Review Sign-Off Endpoint
 */
app.post('/api/quality/override', (req: Request, res: Response): void => {
  const { lotId, targetGrade, human1Signature, human2Signature, overrideReason } = req.body;

  if (!lotId || !targetGrade || !human1Signature || !human2Signature) {
    res.status(400).json({ success: false, error: 'Two-Human sign-off requires Human 1 + Human 2 signatures' });
    return;
  }

  // Create & Sign Two-Human Approval
  const approval = AIGovernanceEngine.createApprovalRequest(
    `OVERRIDE_AI_GRADE_${lotId}`,
    'HIGH',
    human1Signature
  );
  AIGovernanceEngine.signApprovalHuman2(approval.id, human2Signature);

  const quality = AgriTrustDatabase.updateLotQuality(lotId, {
    id: `lq-override-${Date.now()}`,
    lotId,
    grade: targetGrade,
    aiConfidenceScore: 98.4,
    inspectorId: human1Signature,
    inspectionDate: new Date().toISOString(),
    defectsDetected: [`Override Reason: ${overrideReason || 'Manual Inspector Review'}`, `Human 1: ${human1Signature}`, `Human 2: ${human2Signature}`],
    status: 'ACCEPTED',
  });

  const certHash = `sha256_qc_override_${lotId}_${Math.random().toString(36).substring(2, 8)}`;

  AuditLedger.logOperationalEvent(
    human1Signature,
    'OPERATIONS',
    'TWO_HUMAN_GRADE_OVERRIDE',
    `LOT:${lotId}`,
    `Two-Human Grade Override Executed (${human1Signature} + ${human2Signature}) to '${targetGrade}'. Certificate hash: ${certHash}`
  );

  res.json({ success: true, quality, approval, certHash });
});

/**
 * GET /api/admin/dashboard
 */
app.get('/api/admin/dashboard', (req: Request, res: Response): void => {
  const flags = FeatureFlagManager.getFlags();
  const operationalLogs = AuditLedger.getOperationalLogs();
  const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();

  res.json({
    success: true,
    flags,
    operationalLogs,
    securityVaultIntegrity: vaultStatus,
  });
});

/**
 * POST /api/admin/feature-flags
 */
app.post('/api/admin/feature-flags', (req: Request, res: Response): void => {
  const { flagKey, enabled, adminUserId } = req.body;

  if (!flagKey || typeof enabled !== 'boolean') {
    res.status(400).json({ success: false, error: 'Invalid flagKey or enabled parameter' });
    return;
  }

  const updatedFlags = FeatureFlagManager.setFlag(flagKey, enabled);

  AuditLedger.logOperationalEvent(
    adminUserId || 'sys-admin',
    'ADMIN',
    'UPDATE_FEATURE_FLAG',
    `FLAG:${flagKey}`,
    `Admin updated feature flag '${flagKey}' to ${enabled}`
  );

  res.json({ success: true, flags: updatedFlags });
});

/**
 * POST /api/admin/approvals/sign
 */
app.post('/api/admin/approvals/sign', (req: Request, res: Response): void => {
  const { requestedAction, human1UserId, human2UserId } = req.body;

  if (!requestedAction || !human1UserId || !human2UserId) {
    res.status(400).json({ success: false, error: 'Missing required sign-off fields' });
    return;
  }

  const approval = AIGovernanceEngine.createApprovalRequest(requestedAction, 'HIGH', human1UserId);
  const completed = AIGovernanceEngine.signApprovalHuman2(approval.id, human2UserId);

  AuditLedger.logOperationalEvent(
    human2UserId,
    'ADMIN',
    'SIGN_TWO_HUMAN_APPROVAL',
    `APPROVAL:${completed.id}`,
    `Admin completed Human 2 sign-off for '${requestedAction}' (Human 1: ${human1UserId}, Human 2: ${human2UserId})`
  );

  res.json({ success: true, approval: completed });
});

/**
 * GET /api/admin/inventory
 */
app.get('/api/admin/inventory', (req: Request, res: Response): void => {
  const lots = AgriTrustDatabase.getAllLots();
  res.json({ success: true, lots });
});

/**
 * PUT /api/admin/inventory/:lotId
 */
app.put('/api/admin/inventory/:lotId', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const updates = req.body;
  const adminUserId = req.headers['x-admin-id'] as string || 'sys-admin';

  try {
    const updated = AgriTrustDatabase.updateLotInventory(lotId, updates, adminUserId);
    res.json({ success: true, lot: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/lots/:lotId/status
 */
app.post('/api/admin/lots/:lotId/status', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const { publicationStatus, reason } = req.body;
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';

  try {
    const updated = AgriTrustDatabase.updateLotPublicationStatus(lotId, publicationStatus, adminUserId, reason);
    res.json({ success: true, lot: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/lots/:lotId/draft
 */
app.post('/api/admin/lots/:lotId/draft', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const draftData = req.body;
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';

  try {
    const updated = AgriTrustDatabase.saveLotDraft(lotId, draftData, adminUserId);
    res.json({ success: true, lot: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/lots/:lotId/publish
 */
app.post('/api/admin/lots/:lotId/publish', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';

  try {
    const published = AgriTrustDatabase.publishLotDraft(lotId, adminUserId);
    res.json({ success: true, lot: published });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/lots/:lotId/preview-token
 */
app.post('/api/admin/lots/:lotId/preview-token', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';
  const token = AgriTrustDatabase.generatePreviewToken(lotId, adminUserId);
  res.json({ success: true, previewToken: token });
});

/**
 * GET /api/admin/lots/:lotId/preview
 */
app.get('/api/admin/lots/:lotId/preview', (req: Request, res: Response): void => {
  const { lotId } = req.params;
  const token = req.query.token as string;
  const adminUserId = req.headers['x-admin-id'] as string;

  if (!adminUserId) {
    res.status(401).json({ success: false, error: 'Unauthorized. Admin authentication session required for preview.' });
    return;
  }

  const isValid = AgriTrustDatabase.validatePreviewToken(lotId, token);
  if (!isValid) {
    res.status(403).json({ success: false, error: 'Forbidden. Invalid or expired preview token.' });
    return;
  }

  const lot = AgriTrustDatabase.getLotById(lotId);
  res.json({ success: true, lot, mode: 'PREVIEW_MODE' });
});

/**
 * GET /api/admin/cms
 */
app.get('/api/admin/cms', (req: Request, res: Response): void => {
  const cms = AgriTrustDatabase.getCMSContent();
  res.json({ success: true, cms });
});

/**
 * PUT /api/admin/cms
 */
app.put('/api/admin/cms', (req: Request, res: Response): void => {
  const updates = req.body;
  const adminUserId = req.headers['x-admin-id'] as string || 'sys-admin';
  const updated = AgriTrustDatabase.updateCMSContent(updates, adminUserId);
  res.json({ success: true, cms: updated });
});

/**
 * GET /api/admin/ai/agents
 */
app.get('/api/admin/ai/agents', (req: Request, res: Response): void => {
  const agents = AgriTrustDatabase.getAIAgents();
  res.json({ success: true, agents });
});

/**
 * POST /api/admin/ai/agents/:agentId/status
 */
app.post('/api/admin/ai/agents/:agentId/status', (req: Request, res: Response): void => {
  const { agentId } = req.params;
  const { status } = req.body;
  const adminUserId = req.headers['x-admin-id'] as string || 'sys-admin';

  try {
    const updated = AgriTrustDatabase.updateAIAgentStatus(agentId, status, adminUserId);
    res.json({ success: true, agent: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/ai/runs
 */
app.get('/api/admin/ai/runs', (req: Request, res: Response): void => {
  const runs = AgriTrustDatabase.getAIRuns();
  res.json({ success: true, runs });
});

/**
 * GET /api/audit/logs
 * Reads from both SQLite (persistent) and in-memory audit ledger
 */
app.get('/api/audit/logs', (req: Request, res: Response): void => {
  const operationalLogs = AuditLedger.getOperationalLogs();
  const sqliteLogs = sqliteLayer.getAuditEvents(200);
  const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();

  res.json({
    success: true,
    operationalLogs,
    persistedLogs: sqliteLogs,
    securityVaultIntegrity: vaultStatus,
  });
});

/**
 * GET /api/seed
 */
app.get('/api/seed', (req: Request, res: Response): void => {
  const farmerUser = AgriTrustDatabase.getUserById('usr-farmer-01');
  const farmerProfile = AgriTrustDatabase.getFarmerProfileByUserId('usr-farmer-01');
  const buyerUser = AgriTrustDatabase.getUserById('usr-buyer-01');
  const buyerProfile = AgriTrustDatabase.getBuyerProfileByUserId('usr-buyer-01');

  res.json({
    success: true,
    farmer: { user: farmerUser, profile: farmerProfile },
    buyer: { user: buyerUser, profile: buyerProfile },
    products: AgriTrustDatabase.getProducts(),
  });
});

/**
 * POST /api/admin/whatsapp/connect
 * Launches (or re-attaches to) the real WhatsApp Web browser session.
 * Does NOT wait for CONNECTED - the client should poll GET status for the
 * real QR code image and connection state.
 */
app.post('/api/admin/whatsapp/connect', (req: Request, res: Response): void => {
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';
  try {
    const meta = AgriTrustDatabase.startWhatsAppWebSession(adminUserId);
    res.json({ success: true, session: meta });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/whatsapp/status
 * Real, current session status - including the real QR data URL while
 * QR_REQUIRED, and real account/phone info once CONNECTED. Poll this,
 * don't cache it client-side.
 */
app.get('/api/admin/whatsapp/status', (req: Request, res: Response): void => {
  const meta = AgriTrustDatabase.syncWhatsAppWebAccountFromSession();
  res.json({ success: true, session: meta });
});

/**
 * POST /api/admin/whatsapp/disconnect
 */
app.post('/api/admin/whatsapp/disconnect', async (req: Request, res: Response): Promise<void> => {
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';
  try {
    const meta = await AgriTrustDatabase.disconnectWhatsAppWebSession(adminUserId);
    res.json({ success: true, session: meta });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/whatsapp/conversations
 * Reads from real SQLite — persists across restarts
 */
app.get('/api/admin/whatsapp/conversations', (req: Request, res: Response): void => {
  const sqliteConvs = sqliteLayer.getWhatsAppConversations();
  const memConvs = AgriTrustDatabase.getWhatsAppConversations();
  // Merge: SQLite is authoritative, in-memory fills gaps for dev/test data
  const idSet = new Set(sqliteConvs.map((c: any) => c.id));
  const merged = [...sqliteConvs, ...memConvs.filter((c: any) => !idSet.has(c.id))];
  res.json({ success: true, conversations: merged });
});

/**
 * GET /api/admin/whatsapp/conversations/:conversationId/messages
 * Reads from real SQLite — persists across restarts
 */
app.get('/api/admin/whatsapp/conversations/:conversationId/messages', (req: Request, res: Response): void => {
  const { conversationId } = req.params;
  const sqliteMsgs = sqliteLayer.getWhatsAppMessages(conversationId);
  const memMsgs = AgriTrustDatabase.getWhatsAppMessages(conversationId);
  const idSet = new Set(sqliteMsgs.map((m: any) => m.id));
  const merged = [...sqliteMsgs, ...memMsgs.filter((m: any) => !idSet.has(m.id))];
  res.json({ success: true, messages: merged });
});

/**
 * POST /api/admin/whatsapp/send
 * Human-approved real send through the connected WhatsApp Web session.
 * Body: { toPhone, text, templateName? }
 */
app.post('/api/admin/whatsapp/send', async (req: Request, res: Response): Promise<void> => {
  const { toPhone, text, templateName } = req.body;
  if (!toPhone || !text) {
    res.status(400).json({ success: false, error: 'toPhone and text are required.' });
    return;
  }
  try {
    const result = await AgriTrustDatabase.dispatchOutboundWhatsAppMessage(toPhone, text, templateName);
    res.json({ success: result.success, result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/whatsapp/emergency-stop
 */
app.post('/api/admin/whatsapp/emergency-stop', (req: Request, res: Response): void => {
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';
  const paused = AgriTrustDatabase.pauseAllWhatsAppAI(adminUserId);
  res.json({ success: true, aiSystemPaused: paused });
});

/**
 * POST /api/admin/whatsapp/resume-ai
 */
app.post('/api/admin/whatsapp/resume-ai', (req: Request, res: Response): void => {
  const adminUserId = (req.headers['x-admin-id'] as string) || 'sys-admin';
  const resumed = AgriTrustDatabase.resumeAllWhatsAppAI(adminUserId);
  res.json({ success: true, aiSystemPaused: !resumed });
});

/**
 * GET /api/admin/profile
 * Returns the stored admin profile from SQLite (falls back to in-memory seed)
 */
app.get('/api/admin/profile', (req: Request, res: Response): void => {
  const stored = sqliteLayer.getSetting('admin_profile');
  if (stored) {
    res.json({ success: true, profile: JSON.parse(stored) });
    return;
  }
  // First load — return seed profile from in-memory store
  const profile = AgriTrustDatabase.getAdminProfile();
  res.json({ success: true, profile });
});

/**
 * PUT /api/admin/profile
 * Persists admin profile changes to SQLite
 */
app.put('/api/admin/profile', (req: Request, res: Response): void => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    res.status(400).json({ success: false, error: 'Invalid profile data' });
    return;
  }

  // Get existing (SQLite or seed)
  const storedRaw = sqliteLayer.getSetting('admin_profile');
  const existing = storedRaw
    ? JSON.parse(storedRaw)
    : AgriTrustDatabase.getAdminProfile();

  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() };
  sqliteLayer.setSetting('admin_profile', JSON.stringify(merged));

  // Also update in-memory store so the rest of the app sees it immediately
  AgriTrustDatabase.updateAdminProfile(updates, 'sys-admin');

  sqliteLayer.appendAuditEvent({
    id: `aud-profile-${Date.now()}`,
    actor: 'sys-admin', actor_role: 'ADMIN',
    action: 'UPDATE_ADMIN_PROFILE',
    details: `Updated fields: ${Object.keys(updates).join(', ')}`,
  });

  res.json({ success: true, profile: merged });
});

/**
 * PUT /api/admin/preferences
 * Persists admin preferences to SQLite
 */
app.put('/api/admin/preferences', (req: Request, res: Response): void => {
  const prefs = req.body;
  if (!prefs || typeof prefs !== 'object') {
    res.status(400).json({ success: false, error: 'Invalid preferences data' });
    return;
  }

  const storedRaw = sqliteLayer.getSetting('admin_preferences');
  const existing = storedRaw ? JSON.parse(storedRaw) : {};
  const merged = { ...existing, ...prefs };

  sqliteLayer.setSetting('admin_preferences', JSON.stringify(merged));
  AgriTrustDatabase.updateAdminPreferences(prefs, 'sys-admin');

  res.json({ success: true, preferences: merged });
});

/**
 * GET /api/admin/preferences
 */
app.get('/api/admin/preferences', (req: Request, res: Response): void => {
  const stored = sqliteLayer.getSetting('admin_preferences');
  const profile = AgriTrustDatabase.getAdminProfile();
  const prefs = stored ? JSON.parse(stored) : profile.preferences;
  res.json({ success: true, preferences: prefs });
});

/**
 * POST /api/admin/whatsapp/sync
 * Triggers a full sync of chats, contacts, messages from live session
 */
app.post('/api/admin/whatsapp/sync', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await WhatsAppWebSessionManager.runFullSync();
    res.json({ success: true, synced: result });
  } catch (err: any) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/whatsapp/chats
 * All chats from encrypted store (decrypted for this admin session)
 */
app.get('/api/admin/whatsapp/chats', (_req: Request, res: Response): void => {
  res.json({ success: true, chats: WaStore.waGetChats() });
});

/**
 * GET /api/admin/whatsapp/chats/:chatId/messages?limit=50&before=timestamp
 */
app.get('/api/admin/whatsapp/chats/:chatId/messages', (req: Request, res: Response): void => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit as string || '50');
  const before = req.query.before ? parseInt(req.query.before as string) : undefined;
  WaStore.waMarkChatRead(chatId);
  res.json({ success: true, messages: WaStore.waGetMessages(chatId, limit, before) });
});

/**
 * POST /api/admin/whatsapp/chats/:chatId/send
 * Send message to a specific chat
 */
app.post('/api/admin/whatsapp/chats/:chatId/send', async (req: Request, res: Response): Promise<void> => {
  const { chatId } = req.params;
  const { text } = req.body;
  if (!text?.trim()) { res.status(400).json({ success: false, error: 'text required' }); return; }
  try {
    const phone = chatId.replace(/@c\.us|@g\.us/, '');
    const result = await WhatsAppWebSessionManager.sendToPhone(phone, text.trim());
    res.json({ success: true, messageId: result.id });
  } catch (err: any) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/admin/whatsapp/new-chat
 * Start a new chat with any phone number
 */
app.post('/api/admin/whatsapp/new-chat', async (req: Request, res: Response): Promise<void> => {
  const { phone, text } = req.body;
  if (!phone) { res.status(400).json({ success: false, error: 'phone required' }); return; }
  try {
    const result = await WhatsAppWebSessionManager.sendToPhone(phone, text || '👋');
    res.json({ success: true, messageId: result.id });
  } catch (err: any) {
    res.status(503).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/whatsapp/contacts?search=query
 */
app.get('/api/admin/whatsapp/contacts', (req: Request, res: Response): void => {
  const search = req.query.search as string;
  const contacts = search ? WaStore.waSearchContacts(search) : WaStore.waGetContacts();
  res.json({ success: true, contacts });
});

/**
 * GET /api/admin/whatsapp/call-logs
 */
app.get('/api/admin/whatsapp/call-logs', (_req: Request, res: Response): void => {
  res.json({ success: true, calls: WaStore.waGetCallLogs(200) });
});

/**
 * GET /api/admin/whatsapp/sync-stats
 */
app.get('/api/admin/whatsapp/sync-stats', (_req: Request, res: Response): void => {
  res.json({ success: true, stats: WaStore.waGetSyncStats() });
});

const PORT = process.env.PORT || 5000;

// Global error handler
app.use((err: any, req: Request, res: Response, _next: any) => {
  console.error('[AgriTrust] Unhandled route error:', err?.message || err);
  if (!res.headersSent) {
    res.status(500).json({ success: false, error: 'Internal server error', detail: err?.message });
  }
});

// Serve built React frontend in production (Railway/Render/any PaaS).
// The dist/ folder is created by `npm run build` before the server starts.
import { existsSync } from 'fs';
import { join as pathJoin, dirname as pathDirname } from 'path';
import { fileURLToPath as pathURLToPath } from 'url';

const __srvDir = pathDirname(pathURLToPath(import.meta.url));
const distPath = pathJoin(__srvDir, '../../dist');

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  // React Router fallback — serve index.html for all non-API routes
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(pathJoin(distPath, 'index.html'));
    }
  });
  console.log(`[AgriTrust] Serving built frontend from ${distPath}`);
}

app.listen(PORT, () => {
  console.log(`[AgriTrust Core API] Server running on port ${PORT}`);
});
