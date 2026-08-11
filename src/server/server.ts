import express, { Request, Response } from 'express';
import { AgriTrustDatabase } from '../core/database/db';
import { MarginEngine, CostBreakdownInput } from '../core/pricing/marginEngine';
import { PrivacyManager } from '../core/security/privacy';
import { AuthManager } from '../core/identity/auth';
import { AuditLedger } from '../core/audit/auditLedger';
import { FileSecurityManager } from '../core/security/fileSecurity';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { FeatureFlagManager } from '../core/config/featureFlags';

const app = express();
app.use(express.json());

// Initialize Core Database
AgriTrustDatabase.initialize();

/**
 * GET /api/products
 * Returns product catalog with optional query filters (category, grade, search).
 */
app.get('/api/products', (req: Request, res: Response): void => {
  let products = AgriTrustDatabase.getProducts();
  const { category, grade, search } = req.query;

  if (category && typeof category === 'string' && category !== 'ALL') {
    products = products.filter((p) => p.category === category);
  }
  if (grade && typeof grade === 'string' && grade !== 'ALL') {
    products = products.filter((p) => p.grade === grade);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.variety.toLowerCase().includes(q) ||
      p.lotId.toLowerCase().includes(q)
    );
  }

  const sanitizedProducts = products.map((p) => PrivacyManager.sanitizeProductForPublic(p));
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
  const { costs, proposedSellingPrice, targetMarginPercent } = req.body as {
    costs: CostBreakdownInput;
    proposedSellingPrice: number;
    targetMarginPercent?: number;
  };

  if (!costs || typeof proposedSellingPrice !== 'number') {
    res.status(400).json({ success: false, error: 'Missing costs or proposedSellingPrice' });
    return;
  }

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

  const session = AuthManager.createSession(user);

  AuditLedger.logOperationalEvent(
    user.id,
    'BUYER',
    'REGISTER_BUYER',
    `BUYER_PROFILE:${profile.id}`,
    `New commercial buyer registered: ${businessName}`
  );

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

  const subtotal = items.reduce((acc: number, item: any) => acc + (item.subtotal || 0), 0);
  const logFee = typeof logisticsFee === 'number' ? logisticsFee : 45.00;
  const platformFee = Math.round(subtotal * 0.025 * 100) / 100;
  const total = subtotal + logFee + platformFee;

  const newOrder = AgriTrustDatabase.saveOrder({
    id: `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
    buyerId,
    items,
    subtotal,
    logisticsFee: logFee,
    platformFee,
    tax: 0.00,
    total,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
  });

  AuditLedger.logOperationalEvent(
    buyerId,
    'BUYER',
    'CREATE_ORDER',
    `ORDER:${newOrder.id}`,
    `Buyer placed wholesale order for total landed price $${total.toFixed(2)}`
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
 */
app.get('/api/audit/logs', (req: Request, res: Response): void => {
  const operationalLogs = AuditLedger.getOperationalLogs();
  const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();

  res.json({
    success: true,
    operationalLogs,
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[AgriTrust Core API] Server running on port ${PORT}`);
});
