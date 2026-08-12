import {
  User,
  FarmerProfile,
  BuyerProfile,
  Lot,
  Product,
  LotEvent,
  LotQuality,
  LotDocument,
  Order,
  LogisticsOrder,
  Shipment,
  Invoice,
  ProcurementRequest,
  Settlement,
  CMSContent,
  AIAgentRecord,
  AIRunRecord,
  PublicationStatus,
  LotRevision,
  SupplySubmission,
  SupplySubmissionStatus,
  CMSPageBlock,
  CMSPageRevision,
  MediaAsset,
  CMSNavigationItem,
  CMSFooterConfig,
  CMSSEOConfig,
  AdminProfile,
  TOTP2FAState,
  ActiveSession,
  AuthenticationActivity,
  NotificationRecipientRouting,
  RegionalSettings,
  UploadSecuritySettings,
  MaintenanceModeConfig,
  ConfigurationRevision,
  FeatureFlagSetting,
  FeatureFlagStatus,
  UploadSecurityRule,
  ApprovedUploadType,
  QuarantinedFile,
  UploadSecurityEvent,
  UploadSecurityMetrics,
  MarketingSubscriber,
  MarketingConsentHistory,
  MarketingMetrics,
  MarketingAudienceType,
  ConsentStatus,
  SubscriptionStatus,
  WhatsAppAccount,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppContact,
  WhatsAppTemplate,
  WhatsAppWebhookEvent,
  WhatsAppApproval,
  WhatsAppHumanHandoff,
  WhatsAppAIAction,
  WhatsAppNegotiationPolicy,
  MarketplaceSettings,
} from './schema';
import {
  SEED_FARMER_USER,
  SEED_FARMER_PROFILE,
  SEED_BUYER_USER,
  SEED_BUYER_PROFILE,
  SEED_BUYERS,
  SEED_SELLERS,
  SEED_SUPPLY_SUBMISSIONS,
  SEED_LOTS,
  SEED_PRODUCTS,
  SEED_MARKETING_SUBSCRIBERS,
  SEED_LOT_EVENTS,
  SEED_LOT_QUALITY,
  SEED_LOT_DOCUMENTS,
  SEED_BUYER_ORDERS,
  SEED_BUYER_LOGISTICS,
  SEED_BUYER_INVOICES,
  SEED_BUYER_PROCUREMENT_REQUESTS,
  SEED_FARMER_SETTLEMENTS,
  SEED_CMS_CONTENT,
  SEED_LANDING_PAGE_BLOCKS,
  SEED_MEDIA_ASSETS,
  SEED_NAVIGATION_ITEMS,
  SEED_FOOTER_CONFIG,
  SEED_SEO_CONFIG,
  SEED_AI_AGENTS,
  SEED_AI_RUNS,
  SEED_ADMIN_PROFILE,
  SEED_FEATURE_FLAGS_LIST,
  SEED_ACTIVE_SESSIONS,
  SEED_NOTIFICATION_ROUTINGS,
  SEED_WHATSAPP_ACCOUNT,
  SEED_WHATSAPP_CONTACTS,
  SEED_WHATSAPP_CONVERSATIONS,
  SEED_WHATSAPP_MESSAGES,
  SEED_WHATSAPP_TEMPLATES,
  SEED_WHATSAPP_NEGOTIATION_POLICIES,
  SEED_MARKETPLACE_SETTINGS,
} from './seed';
import { AuditLedger } from '../audit/auditLedger';
import { SearchSecurityEngine } from '../security/searchSecurityEngine';
import { FileSecurityManager } from '../security/fileSecurity';
import { WhatsAppSecurityEngine } from '../security/whatsappSecurityEngine';
import { WhatsAppNegotiationEngine } from '../ai/whatsappNegotiationEngine';
import { MetaSecretVault, MetaCredentialsConfig } from '../security/metaSecretVault';
import { MetaWhatsAppService } from '../services/metaWhatsAppService';
import { MetaWebhookEngine } from '../security/metaWebhookEngine';
import { WhatsAppMessagingGateway, ProcessedInboundMessage } from '../providers/whatsappMessagingGateway';
import { WhatsAppProviderType, ProviderHealthStatus } from '../providers/whatsappProviderInterface';
import { getWhatsAppWebSessionController, WhatsAppWebSessionMetadata } from '../providers/whatsappWebSessionRegistry';

export class AgriTrustDatabase {
  private static users: Map<string, User> = new Map();
  private static farmerProfiles: Map<string, FarmerProfile> = new Map();
  private static buyerProfiles: Map<string, BuyerProfile> = new Map();
  private static lots: Map<string, Lot> = new Map();
  private static products: Map<string, Product> = new Map();
  private static lotEvents: Map<string, LotEvent[]> = new Map();
  private static lotQuality: Map<string, LotQuality> = new Map();
  private static lotDocuments: Map<string, LotDocument[]> = new Map();
  private static orders: Map<string, Order> = new Map();
  private static logisticsOrders: Map<string, { order: LogisticsOrder; shipment: Shipment }> = new Map();
  private static invoices: Map<string, Invoice> = new Map();
  private static procurementRequests: Map<string, ProcurementRequest> = new Map();
  private static settlements: Map<string, Settlement> = new Map();
  private static cmsContent: CMSContent = { ...SEED_CMS_CONTENT };
  private static aiAgents: Map<string, AIAgentRecord> = new Map();
  private static aiRuns: AIRunRecord[] = [...SEED_AI_RUNS];
  private static supplySubmissions: Map<string, SupplySubmission> = new Map();
  private static previewTokens: Map<string, { token: string; expiresAt: string }> = new Map();
  private static lotRevisions: Map<string, LotRevision[]> = new Map();
  private static publishedLandingPageBlocks: CMSPageBlock[] = JSON.parse(JSON.stringify(SEED_LANDING_PAGE_BLOCKS));
  private static draftLandingPageBlocks: CMSPageBlock[] = JSON.parse(JSON.stringify(SEED_LANDING_PAGE_BLOCKS));
  private static landingPageRevisions: CMSPageRevision[] = [];
  private static mediaAssets: Map<string, MediaAsset> = new Map();
  private static navigationItems: CMSNavigationItem[] = JSON.parse(JSON.stringify(SEED_NAVIGATION_ITEMS));
  private static footerConfig: CMSFooterConfig = JSON.parse(JSON.stringify(SEED_FOOTER_CONFIG));
  private static seoConfig: CMSSEOConfig = JSON.parse(JSON.stringify(SEED_SEO_CONFIG));
  private static adminProfile: AdminProfile = { ...SEED_ADMIN_PROFILE };
  private static totpState: TOTP2FAState = {
    isEnabled: false,
    secretKey: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: 'otpauth://totp/AgriTrust:admin@agritrust.example?secret=JBSWY3DPEHPK3PXP&issuer=AgriTrust',
    recoveryCodes: ['REC-8812-9901', 'REC-4421-1092', 'REC-7734-6621', 'REC-1192-3304', 'REC-5509-2211', 'REC-9910-4412', 'REC-3321-7788', 'REC-6644-1122'],
    backupCodesUsed: 0,
  };
  private static activeSessions: ActiveSession[] = JSON.parse(JSON.stringify(SEED_ACTIVE_SESSIONS));
  private static authActivities: AuthenticationActivity[] = [
    { id: 'act-01', timestamp: '2026-08-10T10:10:00Z', accountEmail: 'admin@agritrust.example', eventType: 'LOGIN_SUCCESS', device: 'Chrome 128.0 (macOS)', ipAddress: '190.107.42.18' }
  ];
  private static notificationRoutings: NotificationRecipientRouting[] = JSON.parse(JSON.stringify(SEED_NOTIFICATION_ROUTINGS));
  private static featureFlagsList: FeatureFlagSetting[] = JSON.parse(JSON.stringify(SEED_FEATURE_FLAGS_LIST));
  private static configRevisions: ConfigurationRevision[] = [];
  private static aiSystemPaused: boolean = false;
  private static regionalSettings: RegionalSettings = {
    country: 'Barbados',
    currency: 'BBD',
    timeZone: 'America/Barbados',
    weightUnit: 'kg',
    volumeUnit: 'crates',
    distanceUnit: 'km',
    dateFormat: 'YYYY-MM-DD',
  };
  private static uploadSecuritySettings: UploadSecuritySettings = {
    maxFileSizeBytes: 10485760, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocumentTypes: ['application/pdf'],
    blockedExecutableExtensions: ['.exe', '.bat', '.cmd', '.ps1', '.sh', '.dll', '.so', '.js', '.html'],
    virusScanningEnabled: true,
    malwareScanningEnabled: true,
    pdfIsolatedProcessing: true,
  };
  private static maintenanceModeConfig: MaintenanceModeConfig = {
    enabled: false,
    message: 'AgriTrust is undergoing scheduled maintenance. Public access will return shortly.',
    expectedReturnTime: '2026-08-10T14:00:00Z',
    allowAdminAccess: true,
  };
  private static protectedBaselineRules: UploadSecurityRule[] = [
    { extension: '.exe', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'Windows Executable Binary' },
    { extension: '.bat', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'Windows Batch Command Script' },
    { extension: '.cmd', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'Windows Command Script' },
    { extension: '.ps1', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'PowerShell Script' },
    { extension: '.sh', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'POSIX Shell Script' },
    { extension: '.dll', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'Dynamic Link Library' },
    { extension: '.so', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'Shared Object Library' },
    { extension: '.js', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'JavaScript Source Code File' },
    { extension: '.html', status: 'BLOCKED', ruleType: 'PROTECTED_BASELINE', protectionLevel: 'PROTECTED', description: 'HyperText Markup Language Document' },
  ];

  private static adminAddedRules: UploadSecurityRule[] = [
    { extension: '.php', status: 'BLOCKED', ruleType: 'ADMINISTRATOR_ADDED', protectionLevel: 'ADMIN_EDITABLE', description: 'PHP Hypertext Preprocessor Script', addedBy: 'Alexander Vance (sys-admin)', addedAt: '2026-08-10T08:00:00Z' },
    { extension: '.jar', status: 'BLOCKED', ruleType: 'ADMINISTRATOR_ADDED', protectionLevel: 'ADMIN_EDITABLE', description: 'Java Archive Binary', addedBy: 'Alexander Vance (sys-admin)', addedAt: '2026-08-10T08:30:00Z' },
    { extension: '.scr', status: 'BLOCKED', ruleType: 'ADMINISTRATOR_ADDED', protectionLevel: 'ADMIN_EDITABLE', description: 'Windows Screensaver Executable', addedBy: 'Alexander Vance (sys-admin)', addedAt: '2026-08-10T09:00:00Z' },
  ];

  private static approvedUploadTypesList: ApprovedUploadType[] = [
    { extension: '.jpg', category: 'IMAGES', mimeType: 'image/jpeg', maxSizeMB: 10, virusScanRequired: true, contentValidationRequired: true, ocrSupported: false, quarantinePolicy: 'QUARANTINE_ON_MISMATCH', status: 'ACTIVE' },
    { extension: '.jpeg', category: 'IMAGES', mimeType: 'image/jpeg', maxSizeMB: 10, virusScanRequired: true, contentValidationRequired: true, ocrSupported: false, quarantinePolicy: 'QUARANTINE_ON_MISMATCH', status: 'ACTIVE' },
    { extension: '.png', category: 'IMAGES', mimeType: 'image/png', maxSizeMB: 10, virusScanRequired: true, contentValidationRequired: true, ocrSupported: false, quarantinePolicy: 'QUARANTINE_ON_MISMATCH', status: 'ACTIVE' },
    { extension: '.webp', category: 'IMAGES', mimeType: 'image/webp', maxSizeMB: 10, virusScanRequired: true, contentValidationRequired: true, ocrSupported: false, quarantinePolicy: 'QUARANTINE_ON_MISMATCH', status: 'ACTIVE' },
    { extension: '.pdf', category: 'DOCUMENTS', mimeType: 'application/pdf', maxSizeMB: 10, virusScanRequired: true, contentValidationRequired: true, ocrSupported: true, quarantinePolicy: 'QUARANTINE_ON_MISMATCH', status: 'ACTIVE' },
  ];

  private static quarantinedFilesList: QuarantinedFile[] = [
    { id: 'qfile-001', userId: 'usr-buyer-001', accountType: 'BUYER', fileName: 'invoice_payload.exe.jpg', declaredMimeType: 'image/jpeg', detectedMimeType: 'application/x-executable', fileSizeBytes: 524288, quarantinedAt: '2026-08-10T09:15:00Z', quarantineReason: 'MAGIC_BYTE_MISMATCH: Disguised Windows Executable', status: 'SECURITY_REVIEW_REQUIRED', ipAddress: '190.107.42.19' },
    { id: 'qfile-002', userId: 'usr-farmer-001', accountType: 'FARMER', fileName: 'eicar_test_virus.pdf', declaredMimeType: 'application/pdf', detectedMimeType: 'text/plain', fileSizeBytes: 68, quarantinedAt: '2026-08-10T09:30:00Z', quarantineReason: 'MALWARE_DETECTED: EICAR test signature', status: 'SECURITY_REVIEW_REQUIRED', ipAddress: '190.107.42.20' },
  ];

  private static uploadSecurityEventsList: UploadSecurityEvent[] = [
    { id: 'usec-evt-001', timestamp: '2026-08-10T09:15:00Z', userId: 'usr-buyer-001', accountType: 'BUYER', fileName: 'invoice_payload.exe.jpg', declaredType: 'image/jpeg', detectedType: 'application/x-executable', fileSizeBytes: 524288, ipAddress: '190.107.42.19', scanResult: 'QUARANTINED', reasonCode: 'MAGIC_BYTE_MISMATCH', quarantineStatus: true },
    { id: 'usec-evt-002', timestamp: '2026-08-10T09:30:00Z', userId: 'usr-farmer-001', accountType: 'FARMER', fileName: 'eicar_test_virus.pdf', declaredType: 'application/pdf', detectedType: 'text/plain', fileSizeBytes: 68, ipAddress: '190.107.42.20', scanResult: 'QUARANTINED', reasonCode: 'MALWARE_DETECTED', quarantineStatus: true },
  ];

  private static uploadSecurityMetricsState: UploadSecurityMetrics = {
    totalScanned: 1842,
    acceptedCount: 1817,
    rejectedCount: 21,
    quarantinedCount: 4,
    securityStatus: 'PROTECTED',
  };

  private static marketingSubscribers: Map<string, MarketingSubscriber> = new Map();
  private static marketingConsentHistory: Map<string, MarketingConsentHistory[]> = new Map();

  // WhatsApp Business AI Communication Core State (Section 71)
  private static whatsappAccount: WhatsAppAccount = { ...SEED_WHATSAPP_ACCOUNT };
  private static whatsappContacts: Map<string, WhatsAppContact> = new Map();
  private static whatsappConversations: Map<string, WhatsAppConversation> = new Map();
  private static whatsappMessages: Map<string, WhatsAppMessage[]> = new Map();
  private static whatsappTemplates: Map<string, WhatsAppTemplate> = new Map();
  private static whatsappNegotiationPolicies: Map<string, WhatsAppNegotiationPolicy> = new Map();
  private static whatsappApprovals: Map<string, WhatsAppApproval> = new Map();
  // Marketplace & Pricing Settings (Section 28 & 29)
  private static marketplaceSettings: MarketplaceSettings = { ...SEED_MARKETPLACE_SETTINGS };

  private static initialized = false;

  public static initialize(): void {
    if (this.initialized) return;

    // Seed Marketing Subscribers
    SEED_MARKETING_SUBSCRIBERS.forEach((sub) => {
      this.marketingSubscribers.set(sub.id, { ...sub });
    });

    // Seed WhatsApp Entities
    SEED_WHATSAPP_CONTACTS.forEach((c) => this.whatsappContacts.set(c.id, { ...c }));
    SEED_WHATSAPP_CONVERSATIONS.forEach((conv) => this.whatsappConversations.set(conv.id, { ...conv }));
    SEED_WHATSAPP_MESSAGES.forEach((msg) => {
      const list = this.whatsappMessages.get(msg.conversationId) || [];
      list.push({ ...msg });
      this.whatsappMessages.set(msg.conversationId, list);
    });
    SEED_WHATSAPP_TEMPLATES.forEach((tpl) => this.whatsappTemplates.set(tpl.id, { ...tpl }));
    SEED_WHATSAPP_NEGOTIATION_POLICIES.forEach((p) => this.whatsappNegotiationPolicies.set(p.commodityId, { ...p }));

    // Seed Farmer & Buyer
    this.users.set(SEED_FARMER_USER.id, SEED_FARMER_USER);

    // Seed Buyers & Sellers Directories
    SEED_SELLERS.forEach((s) => this.farmerProfiles.set(s.id, s));
    SEED_BUYERS.forEach((b) => this.buyerProfiles.set(b.id, b));

    // Seed Supply Submissions
    SEED_SUPPLY_SUBMISSIONS.forEach((sub) => this.supplySubmissions.set(sub.id, sub));

    // Seed Media Assets
    SEED_MEDIA_ASSETS.forEach((m) => this.mediaAssets.set(m.id, m));

    // Seed Lots
    SEED_LOTS.forEach((lot) => this.lots.set(lot.id, lot));

    // Seed Products
    SEED_PRODUCTS.forEach((product) => this.products.set(product.id, product));

    // Seed Lot Events
    Object.entries(SEED_LOT_EVENTS).forEach(([lotId, events]) => {
      this.lotEvents.set(lotId, events);
    });

    // Seed Lot Quality
    Object.entries(SEED_LOT_QUALITY).forEach(([lotId, quality]) => {
      this.lotQuality.set(lotId, quality);
    });

    // Seed Lot Documents
    Object.entries(SEED_LOT_DOCUMENTS).forEach(([lotId, docs]) => {
      this.lotDocuments.set(lotId, docs);
    });

    // Seed Operational Data
    SEED_BUYER_ORDERS.forEach((ord) => this.orders.set(ord.id, ord));
    SEED_BUYER_LOGISTICS.forEach((log) => this.logisticsOrders.set(log.order.orderId, log));
    SEED_BUYER_INVOICES.forEach((inv) => this.invoices.set(inv.id, inv));
    SEED_BUYER_PROCUREMENT_REQUESTS.forEach((pr) => this.procurementRequests.set(pr.id, pr));
    SEED_FARMER_SETTLEMENTS.forEach((s) => this.settlements.set(s.id, s));
    SEED_AI_AGENTS.forEach((agent) => this.aiAgents.set(agent.id, agent));

    this.initialized = true;
  }

  // --- Inventory & Lots ---
  public static getAllLots(): Lot[] {
    this.initialize();
    return Array.from(this.lots.values());
  }

  public static getAvailableLots(): Lot[] {
    this.initialize();
    return Array.from(this.lots.values()).filter((lot) => {
      const isPublished = lot.publicationStatus === 'PUBLISHED' || (!lot.publicationStatus && lot.publicVisibility !== false);
      const isCommerciallyAvailable = lot.publicVisibility !== false && lot.status !== 'REJECTED' && lot.status !== 'QUARANTINED' && lot.availableStock > 0;
      return isPublished && isCommerciallyAvailable;
    });
  }

  public static updateLotPublicationStatus(
    lotId: string,
    nextStatus: PublicationStatus,
    adminUserId: string = 'sys-admin',
    reason?: string
  ): Lot {
    this.initialize();
    const lot = this.lots.get(lotId);
    if (!lot) throw new Error(`Lot not found: ${lotId}`);

    const previousStatus = lot.publicationStatus || (lot.publicVisibility ? 'PUBLISHED' : 'HIDDEN');
    const isNowPublished = nextStatus === 'PUBLISHED';
    const now = new Date().toISOString();

    const updatedLot: Lot = {
      ...lot,
      publicationStatus: nextStatus,
      publicVisibility: isNowPublished,
      updatedAt: now,
      ...(isNowPublished ? { publishedAt: now, publishedBy: adminUserId } : {}),
      ...(nextStatus === 'HIDDEN' || nextStatus === 'UNPUBLISHED' ? { unpublishedAt: now, hiddenBy: adminUserId } : {}),
      ...(nextStatus === 'ARCHIVED' ? { archivedAt: now } : {}),
      ...(reason ? { publicationReason: reason } : {}),
    };

    // If publishing, promote draftVersion if available
    if (isNowPublished && lot.draftVersion) {
      Object.assign(updatedLot, lot.draftVersion);
      updatedLot.draftVersion = undefined;
    }

    this.lots.set(lotId, updatedLot);

    // Sync product record
    const product = Array.from(this.products.values()).find((p) => p.lotId === lotId);
    if (product) {
      product.pricePerUnit = updatedLot.wholesalePrice;
      product.availableUnits = updatedLot.availableStock;
    }

    // Add Revision History
    const revisions = this.lotRevisions.get(lotId) || [];
    const newVersion = (lot.version || 1) + 1;
    updatedLot.version = newVersion;

    const revision: LotRevision = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      lotId,
      version: newVersion,
      author: adminUserId,
      timestamp: now,
      changedFields: ['publicationStatus'],
      previousValues: { publicationStatus: previousStatus, publicVisibility: lot.publicVisibility },
      newValues: { publicationStatus: nextStatus, publicVisibility: isNowPublished },
      publicationStatus: nextStatus,
      publishDate: isNowPublished ? now : undefined,
      reason,
    };
    this.lotRevisions.set(lotId, [revision, ...revisions]);

    // Log Audit Event
    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      nextStatus === 'HIDDEN' ? 'HIDE_LOT' : nextStatus === 'PUBLISHED' ? 'PUBLISH_LOT' : 'UPDATE_PUBLICATION_STATUS',
      `LOT:${lotId}`,
      `Admin updated publication status of ${lotId} from '${previousStatus}' to '${nextStatus}'. ${reason ? 'Reason: ' + reason : ''}`
    );

    return updatedLot;
  }

  public static saveLotDraft(
    lotId: string,
    draftData: Partial<Lot>,
    adminUserId: string = 'sys-admin'
  ): Lot {
    this.initialize();
    const lot = this.lots.get(lotId);
    if (!lot) throw new Error(`Lot not found: ${lotId}`);

    const existingDraft = lot.draftVersion || {};
    const updatedDraft = { ...existingDraft, ...draftData };

    const updatedLot: Lot = {
      ...lot,
      draftVersion: updatedDraft,
      updatedAt: new Date().toISOString(),
    };

    this.lots.set(lotId, updatedLot);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'SAVE_DRAFT',
      `LOT:${lotId}`,
      `Admin saved draft updates for lot ${lotId} without publishing.`
    );

    return updatedLot;
  }

  public static publishLotDraft(lotId: string, adminUserId: string = 'sys-admin'): Lot {
    this.initialize();
    const lot = this.lots.get(lotId);
    if (!lot) throw new Error(`Lot not found: ${lotId}`);

    // Pre-publication Validation
    const validationErrors: string[] = [];
    if (!lot.productImage) validationErrors.push('Product image is required for publication');
    if (lot.wholesalePrice <= 0) validationErrors.push('Wholesale price must be greater than $0.00');
    if (lot.availableStock <= 0) validationErrors.push('Available stock must be greater than 0');
    if (lot.qualityStatus === 'FAILED') validationErrors.push('Quality certification failed');
    if (lot.status === 'QUARANTINED') validationErrors.push('Lot is under quarantine');

    if (validationErrors.length > 0) {
      throw new Error(`Cannot publish lot ${lotId}. Issues: ${validationErrors.join('; ')}`);
    }

    return this.updateLotPublicationStatus(lotId, 'PUBLISHED', adminUserId, 'Draft published after validation checks.');
  }

  public static generatePreviewToken(lotId: string, adminUserId: string = 'sys-admin'): string {
    this.initialize();
    const token = `prev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    this.previewTokens.set(lotId, { token, expiresAt });
    return token;
  }

  public static validatePreviewToken(lotId: string, token: string): boolean {
    this.initialize();
    const entry = this.previewTokens.get(lotId);
    if (!entry) return false;
    if (entry.token !== token) return false;
    if (new Date(entry.expiresAt) < new Date()) {
      this.previewTokens.delete(lotId);
      return false;
    }
    return true;
  }

  public static getLotRevisions(lotId: string): LotRevision[] {
    this.initialize();
    return this.lotRevisions.get(lotId) || [];
  }

  public static restoreLotVersion(lotId: string, versionNumber: number, adminUserId: string = 'sys-admin'): Lot {
    this.initialize();
    const lot = this.lots.get(lotId);
    if (!lot) throw new Error(`Lot not found: ${lotId}`);

    const revisions = this.getLotRevisions(lotId);
    const targetRev = revisions.find((r) => r.version === versionNumber);
    if (!targetRev) throw new Error(`Revision v${versionNumber} not found for lot ${lotId}`);

    const draftData = { ...targetRev.previousValues };
    const updated = this.saveLotDraft(lotId, draftData, adminUserId);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'RESTORE_VERSION',
      `LOT:${lotId}`,
      `Admin restored version v${versionNumber} into draft for lot ${lotId}. Requires explicit publication.`
    );

    return updated;
  }

  public static updateLotInventory(
    lotId: string,
    updates: Partial<Lot>,
    adminUserId: string = 'sys-admin'
  ): Lot {
    this.initialize();
    const existing = this.lots.get(lotId);
    if (!existing) {
      throw new Error(`Lot not found: ${lotId}`);
    }

    const previousPrice = existing.wholesalePrice;
    const previousStock = existing.availableStock;
    const previousVisibility = existing.publicVisibility;

    const updated: Lot = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Keep publicVisibility synced if publicationStatus changes
    if (updates.publicationStatus) {
      updated.publicVisibility = updates.publicationStatus === 'PUBLISHED';
    }

    this.lots.set(lotId, updated);

    // Sync product if associated
    const product = Array.from(this.products.values()).find((p) => p.lotId === lotId);
    if (product) {
      if (updates.wholesalePrice !== undefined) product.pricePerUnit = updates.wholesalePrice;
      if (updates.availableStock !== undefined) product.availableUnits = updates.availableStock;
      if (updates.grade !== undefined) product.grade = updates.grade;
      if (updates.description !== undefined) product.description = updates.description;
    }

    // Audit Event Emission
    const changes: string[] = [];
    if (updates.wholesalePrice !== undefined && updates.wholesalePrice !== previousPrice) {
      changes.push(`Price: ${previousPrice} -> ${updates.wholesalePrice}`);
    }
    if (updates.availableStock !== undefined && updates.availableStock !== previousStock) {
      changes.push(`Stock: ${previousStock} -> ${updates.availableStock}`);
    }
    if (updates.publicVisibility !== undefined && updates.publicVisibility !== previousVisibility) {
      changes.push(`Visibility: ${previousVisibility} -> ${updates.publicVisibility}`);
    }

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'ADMIN-CHANGE',
      `LOT:${lotId}`,
      `Admin updated inventory record for ${lotId}. ${changes.join(', ') || 'Fields modified.'}`
    );

    return updated;
  }

  // --- CMS Content ---
  public static getCMSContent(): CMSContent {
    this.initialize();
    return { ...this.cmsContent };
  }

  public static updateCMSContent(updates: Partial<CMSContent>, adminUserId: string = 'sys-admin'): CMSContent {
    this.initialize();
    this.cmsContent = {
      ...this.cmsContent,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_CMS_CONTENT',
      'CMS:HOMEPAGE',
      `Admin updated marketplace CMS content.`
    );

    return { ...this.cmsContent };
  }

  // --- AI Agent Registry & Runs ---
  public static getAIAgents(): AIAgentRecord[] {
    this.initialize();
    return Array.from(this.aiAgents.values());
  }

  public static updateAIAgentStatus(
    agentId: string,
    status: AIAgentRecord['status'],
    adminUserId: string = 'sys-admin'
  ): AIAgentRecord {
    this.initialize();
    const agent = this.aiAgents.get(agentId);
    if (!agent) {
      throw new Error(`AI Agent not found: ${agentId}`);
    }

    agent.status = status;
    agent.lastActivity = new Date().toISOString();
    this.aiAgents.set(agentId, agent);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_AI_AGENT_STATUS',
      `AGENT:${agentId}`,
      `Admin updated AI Agent '${agent.name}' status to ${status}`
    );

    return { ...agent };
  }

  public static getAIRuns(): AIRunRecord[] {
    this.initialize();
    return [...this.aiRuns];
  }

  // --- Page Builder & CMS Engine ---
  public static getPublishedLandingPageBlocks(): CMSPageBlock[] {
    this.initialize();
    return JSON.parse(JSON.stringify(this.publishedLandingPageBlocks));
  }

  public static getDraftLandingPageBlocks(): CMSPageBlock[] {
    this.initialize();
    return JSON.parse(JSON.stringify(this.draftLandingPageBlocks));
  }

  public static saveLandingPageDraft(
    blocks: CMSPageBlock[],
    authorUserId: string = 'sys-admin'
  ): CMSPageBlock[] {
    this.initialize();
    this.draftLandingPageBlocks = JSON.parse(JSON.stringify(blocks));

    AuditLedger.logOperationalEvent(
      authorUserId,
      'ADMIN',
      'SAVE_LANDING_PAGE_DRAFT',
      'CMS:LANDING_PAGE_DRAFT',
      `Admin saved landing page draft with ${blocks.length} content blocks.`
    );

    return JSON.parse(JSON.stringify(this.draftLandingPageBlocks));
  }

  public static publishLandingPage(
    authorUserId: string = 'sys-admin',
    reason: string = 'Admin published landing page changes.'
  ): { version: number; publishDate: string } {
    this.initialize();

    // Copy draft to published
    this.publishedLandingPageBlocks = JSON.parse(JSON.stringify(this.draftLandingPageBlocks));

    // Also sync headline/heroTitle in legacy cmsContent for backward compatibility
    const heroBlock = this.publishedLandingPageBlocks.find((b) => b.type === 'HERO');
    if (heroBlock) {
      this.cmsContent.heroTitle = heroBlock.title;
      this.cmsContent.headline = heroBlock.title;
      if (heroBlock.subtitle) this.cmsContent.heroSubtitle = heroBlock.subtitle;
      if (heroBlock.settings.primaryButtonText) this.cmsContent.ctaText = heroBlock.settings.primaryButtonText;
      if (heroBlock.settings.imageUrl) this.cmsContent.heroImage = heroBlock.settings.imageUrl;
      this.cmsContent.updatedAt = new Date().toISOString();
    }

    const version = this.landingPageRevisions.length + 1;
    const now = new Date().toISOString();

    const revision: CMSPageRevision = {
      version,
      author: authorUserId,
      timestamp: now,
      blocks: JSON.parse(JSON.stringify(this.publishedLandingPageBlocks)),
      seoConfig: { ...this.seoConfig },
      navConfig: JSON.parse(JSON.stringify(this.navigationItems)),
      footerConfig: JSON.parse(JSON.stringify(this.footerConfig)),
      auditReason: reason,
    };

    this.landingPageRevisions.unshift(revision);

    AuditLedger.logOperationalEvent(
      authorUserId,
      'ADMIN',
      'PUBLISH_LANDING_PAGE',
      'CMS:LANDING_PAGE',
      `Admin published landing page Version ${version}. Reason: ${reason}`
    );

    return { version, publishDate: now };
  }

  public static getLandingPageRevisions(): CMSPageRevision[] {
    this.initialize();
    return [...this.landingPageRevisions];
  }

  public static restoreLandingPageRevision(
    version: number,
    authorUserId: string = 'sys-admin'
  ): CMSPageRevision {
    this.initialize();
    const revision = this.landingPageRevisions.find((r) => r.version === version);
    if (!revision) throw new Error(`Landing page revision version ${version} not found.`);

    this.publishedLandingPageBlocks = JSON.parse(JSON.stringify(revision.blocks));
    this.draftLandingPageBlocks = JSON.parse(JSON.stringify(revision.blocks));
    this.seoConfig = { ...revision.seoConfig };
    this.navigationItems = JSON.parse(JSON.stringify(revision.navConfig));
    this.footerConfig = JSON.parse(JSON.stringify(revision.footerConfig));

    AuditLedger.logOperationalEvent(
      authorUserId,
      'ADMIN',
      'RESTORE_LANDING_PAGE_REVISION',
      `CMS:LANDING_PAGE:V${version}`,
      `Admin restored landing page to Version ${version}.`
    );

    return revision;
  }

  // --- Media Library ---
  public static getMediaAssets(): MediaAsset[] {
    this.initialize();
    return Array.from(this.mediaAssets.values());
  }

  public static uploadMediaAsset(
    fileData: Partial<MediaAsset>,
    uploadedBy: string = 'sys-admin'
  ): MediaAsset {
    this.initialize();
    const id = `media-${Date.now()}`;
    const now = new Date().toISOString();

    const asset: MediaAsset = {
      id,
      filename: fileData.filename || 'uploaded_image.jpg',
      fileUrl: fileData.fileUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a',
      mimeType: fileData.mimeType || 'image/jpeg',
      sizeBytes: fileData.sizeBytes || 150000,
      dimensions: fileData.dimensions || { width: 1200, height: 800 },
      uploadedBy,
      uploadedAt: now,
      usedIn: fileData.usedIn || ['Media Library'],
      hash: `hash_${Date.now()}`,
    };

    this.mediaAssets.set(asset.id, asset);
    return asset;
  }

  // --- Navigation, Footer, SEO ---
  public static getNavigationItems(): CMSNavigationItem[] {
    this.initialize();
    return JSON.parse(JSON.stringify(this.navigationItems));
  }

  public static updateNavigationItems(items: CMSNavigationItem[]): CMSNavigationItem[] {
    this.initialize();
    this.navigationItems = JSON.parse(JSON.stringify(items));
    return this.navigationItems;
  }

  public static getFooterConfig(): CMSFooterConfig {
    this.initialize();
    return JSON.parse(JSON.stringify(this.footerConfig));
  }

  public static updateFooterConfig(config: CMSFooterConfig): CMSFooterConfig {
    this.initialize();
    this.footerConfig = JSON.parse(JSON.stringify(config));
    return this.footerConfig;
  }

  public static getSEOConfig(): CMSSEOConfig {
    this.initialize();
    return { ...this.seoConfig };
  }

  public static updateSEOConfig(config: CMSSEOConfig): CMSSEOConfig {
    this.initialize();
    this.seoConfig = { ...config };
    return this.seoConfig;
  }

  public static getUserByEmail(email: string): User | undefined {
    this.initialize();
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  // --- Products ---
  public static getProducts(): Product[] {
    this.initialize();
    const availableLots = this.getAvailableLots();
    const availableLotIds = new Set(availableLots.map((l) => l.id));

    return Array.from(this.products.values()).filter((product) => {
      return availableLotIds.has(product.lotId);
    });
  }

  /**
   * Secure, parameterized public search endpoint.
   * Protects against SQLi, XSS, Command Injection, Path Traversal, ReDoS, and data leakage.
   * Strictly limits search scope to public product fields only.
   */
  public static searchPublicMarketplace(
    rawQuery: string,
    clientId: string = 'PUBLIC_ANONYMOUS_CLIENT'
  ): { products: Product[]; totalCount: number; query: string; error?: string } {
    this.initialize();

    const validation = SearchSecurityEngine.validateAndSanitize(rawQuery, clientId);
    if (!validation.isValid) {
      return {
        products: [],
        totalCount: 0,
        query: '',
        error: validation.errorMessage || "We couldn't complete that search. Please try again.",
      };
    }

    const queryTerm = validation.sanitizedQuery.toLowerCase();
    const publicProducts = this.getProducts();

    if (!queryTerm) {
      return { products: publicProducts, totalCount: publicProducts.length, query: '' };
    }

    // Parameterized search against public fields ONLY
    const matchedProducts = publicProducts.filter((product) => {
      const matchesName = product.name.toLowerCase().includes(queryTerm);
      const matchesVariety = product.variety.toLowerCase().includes(queryTerm);
      const matchesCategory = product.category.toLowerCase().includes(queryTerm);
      const matchesGrade = product.grade.toLowerCase().includes(queryTerm);
      const matchesRegion = product.publicRegion.toLowerCase().includes(queryTerm);
      const matchesDescription = product.description.toLowerCase().includes(queryTerm);
      return matchesName || matchesVariety || matchesCategory || matchesGrade || matchesRegion || matchesDescription;
    });

    return {
      products: matchedProducts,
      totalCount: matchedProducts.length,
      query: validation.sanitizedQuery,
    };
  }

  public static getProductById(id: string): Product | undefined {
    this.initialize();
    return this.products.get(id);
  }

  // --- Supply Submissions (Seller Intake & Admin Inbox) ---
  public static createSupplySubmission(
    data: Partial<SupplySubmission>,
    sellerId: string = 'fp-01'
  ): SupplySubmission {
    this.initialize();
    const seller = this.farmerProfiles.get(sellerId) || Array.from(this.farmerProfiles.values())[0];
    const subId = `SUP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const submission: SupplySubmission = {
      id: subId,
      sellerId: seller?.id || sellerId,
      sellerName: seller?.businessName || 'Green Valley Produce Farm',
      commodity: data.commodity || 'Tomatoes',
      variety: data.variety || 'Standard Harvest',
      description: data.description || '',
      expectedGrade: data.expectedGrade || 'Grade A',
      estimatedQuantity: data.estimatedQuantity || 1000,
      unit: data.unit || 'kg',
      minimumQuantity: data.minimumQuantity || 50,
      expectedHarvestDate: data.expectedHarvestDate || now.split('T')[0],
      availableFrom: data.availableFrom || now.split('T')[0],
      availableUntil: data.availableUntil || now.split('T')[0],
      expectedShelfLifeDays: data.expectedShelfLifeDays || 14,
      growingMethod: data.growingMethod || 'Conventional Field',
      packagingType: data.packagingType || 'Wholesale Crates',
      preferredCollectionMethod: data.preferredCollectionMethod || 'AgriTrust Logistics Pickup',
      additionalNotes: data.additionalNotes,
      status: 'UNDER_REVIEW',
      images: data.images && data.images.length > 0 ? data.images : ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea'],
      documents: data.documents || [],
      location: {
        region: seller?.publicRegion || 'Western Agricultural Zone 4',
        privateGpsLat: seller?.privateGpsLat,
        privateGpsLng: seller?.privateGpsLng,
      },
      aiRecommendation: {
        suggestedGrade: data.expectedGrade || 'Grade A',
        suggestedPrice: data.unit === 'crate' ? 34.50 : 2.40,
        suggestedMoq: data.minimumQuantity || 50,
        confidence: 96.5,
      },
      createdAt: now,
      updatedAt: now,
    };

    this.supplySubmissions.set(submission.id, submission);

    AuditLedger.logOperationalEvent(
      sellerId,
      'SELLER',
      'SUBMIT_SUPPLY',
      `SUBMISSION:${submission.id}`,
      `Seller '${submission.sellerName}' submitted produce supply for ${submission.estimatedQuantity} ${submission.unit}s of ${submission.commodity}.`
    );

    return submission;
  }

  public static getSupplySubmissions(sellerId?: string): SupplySubmission[] {
    this.initialize();
    const all = Array.from(this.supplySubmissions.values());
    if (sellerId) {
      return all.filter((s) => s.sellerId === sellerId);
    }
    return all;
  }

  public static getSupplySubmissionById(id: string): SupplySubmission | undefined {
    this.initialize();
    return this.supplySubmissions.get(id);
  }

  public static updateSupplySubmissionStatus(
    id: string,
    status: SupplySubmissionStatus,
    adminUserId: string = 'sys-admin',
    notes?: string
  ): SupplySubmission {
    this.initialize();
    const sub = this.supplySubmissions.get(id);
    if (!sub) throw new Error(`Supply submission not found: ${id}`);

    const updated: SupplySubmission = {
      ...sub,
      status,
      additionalNotes: notes ? `${sub.additionalNotes || ''}\n[Admin Notes]: ${notes}` : sub.additionalNotes,
      updatedAt: new Date().toISOString(),
    };

    this.supplySubmissions.set(id, updated);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_SUBMISSION_STATUS',
      `SUBMISSION:${id}`,
      `Admin updated supply submission ${id} status to ${status}. ${notes ? 'Notes: ' + notes : ''}`
    );

    return updated;
  }

  public static approveSupplySubmissionAndCreateLot(
    submissionId: string,
    adminUserId: string = 'sys-admin'
  ): Lot {
    this.initialize();
    const sub = this.supplySubmissions.get(submissionId);
    if (!sub) throw new Error(`Supply submission not found: ${submissionId}`);

    // Update submission status to APPROVED
    sub.status = 'APPROVED';
    sub.updatedAt = new Date().toISOString();

    // Create Lot in HIDDEN publication state (Approved != Published)
    const lotNumber = Math.floor(900000 + Math.random() * 90000);
    const lotId = `AT-LOT-2026-${lotNumber}`;
    const verificationHash = `vhash_${lotNumber}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date().toISOString();

    const newLot: Lot = {
      id: lotId,
      productId: `prod-gen-${lotNumber}`,
      harvestId: `harv-${Date.now()}`,
      farmerId: sub.sellerId,
      cropName: sub.commodity,
      varietyName: sub.variety,
      commodity: sub.commodity,
      variety: sub.variety,
      description: sub.description || `Wholesale Grade A ${sub.commodity} from verified seller intake.`,
      harvestDate: sub.expectedHarvestDate,
      grade: sub.expectedGrade,
      availableStock: sub.estimatedQuantity,
      initialQuantityKg: sub.estimatedQuantity,
      availableQuantityKg: sub.estimatedQuantity,
      unit: sub.unit,
      moq: sub.minimumQuantity,
      moqUnit: sub.unit,
      wholesalePrice: sub.aiRecommendation?.suggestedPrice || 2.40,
      currency: 'USD',
      productImage: sub.images[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      additionalImages: sub.images,
      availability: false,
      traceabilityStatus: 'VERIFIED',
      qualityStatus: 'PASSED',
      procurementStatus: 'AVAILABLE',
      status: 'VERIFIED',
      publicationStatus: 'HIDDEN',
      publicVisibility: false,
      createdAt: now,
      updatedAt: now,
      internalNotes: `Converted from Supply Submission ${sub.id}. Seller: ${sub.sellerName}.`,
      verificationHash,
      publicRegion: sub.location.region,
    };

    sub.createdLotId = newLot.id;
    this.lots.set(newLot.id, newLot);

    // Seed initial harvest & quality event
    this.lotEvents.set(newLot.id, [
      {
        id: `le-intake-${Date.now()}`,
        lotId: newLot.id,
        eventType: 'HARVESTED',
        timestamp: now,
        locationSummary: sub.location.region,
        notes: `Supply submission ${sub.id} approved and converted to lot. Intake quantity: ${sub.estimatedQuantity} ${sub.unit}s.`,
      },
    ]);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'APPROVE_SUPPLY_CREATE_LOT',
      `SUBMISSION:${submissionId}`,
      `Admin approved supply submission ${submissionId}. Created lot ${newLot.id} with HIDDEN publication status.`
    );

    return newLot;
  }

  public static createProductManual(
    data: Partial<Product>,
    adminUserId: string = 'sys-admin'
  ): Product {
    this.initialize();
    const prodId = `prod-manual-${Date.now()}`;
    const lotNumber = Math.floor(900000 + Math.random() * 90000);
    const lotId = `AT-LOT-2026-${lotNumber}`;
    const now = new Date().toISOString();

    const newLot: Lot = {
      id: lotId,
      productId: prodId,
      harvestId: `harv-${Date.now()}`,
      farmerId: 'fp-01',
      cropName: data.name || 'Produce Item',
      varietyName: data.variety || 'Standard',
      commodity: data.name || 'Produce Item',
      variety: data.variety || 'Standard',
      description: data.description || '',
      harvestDate: data.harvestDate || now.split('T')[0],
      grade: data.grade || 'Grade A',
      availableStock: data.availableUnits || 500,
      initialQuantityKg: data.availableUnits || 500,
      availableQuantityKg: data.availableUnits || 500,
      unit: data.unit || 'kg',
      moq: data.moqUnits || 10,
      moqUnit: data.unit || 'kg',
      wholesalePrice: data.pricePerUnit || 2.50,
      currency: 'USD',
      productImage: data.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      availability: false,
      traceabilityStatus: 'VERIFIED',
      qualityStatus: 'PASSED',
      procurementStatus: 'AVAILABLE',
      status: 'VERIFIED',
      publicationStatus: 'HIDDEN',
      publicVisibility: false,
      createdAt: now,
      updatedAt: now,
      internalNotes: 'Manually created commercial product definition by Admin.',
      verificationHash: `vhash_${lotNumber}_manual`,
      publicRegion: data.publicRegion || 'Western Agricultural Zone 4',
    };

    const newProduct: Product = {
      id: prodId,
      lotId: newLot.id,
      name: data.name || 'Produce Item',
      variety: data.variety || 'Standard',
      category: data.category || 'Fresh Vegetables',
      description: data.description || '',
      unit: data.unit || 'kg',
      unitWeightKg: data.unitWeightKg || 1,
      pricePerUnit: data.pricePerUnit || 2.50,
      moqUnits: data.moqUnits || 10,
      availableUnits: data.availableUnits || 500,
      grade: data.grade || 'Grade A',
      availabilityStatus: 'IN_STOCK',
      harvestDate: data.harvestDate || now.split('T')[0],
      publicRegion: data.publicRegion || 'Western Agricultural Zone 4',
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
      createdAt: now,
      volumePricing: data.volumePricing || [
        { minQty: 1, pricePerUnit: data.pricePerUnit || 2.50 },
        { minQty: 50, pricePerUnit: (data.pricePerUnit || 2.50) * 0.92 },
        { minQty: 200, pricePerUnit: (data.pricePerUnit || 2.50) * 0.85 },
      ],
      priceFloor: (data.pricePerUnit || 2.50) * 0.75,
    };

    this.lots.set(newLot.id, newLot);
    this.products.set(newProduct.id, newProduct);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'CREATE_PRODUCT_MANUAL',
      `PRODUCT:${newProduct.id}`,
      `Admin manually created catalogue product '${newProduct.name}' with associated lot ${newLot.id} (HIDDEN).`
    );

    return newProduct;
  }

  public static calculateLotProfitability(
    lotId: string,
    sellingPrice: number,
    procurementPrice: number = 1.60,
    logisticsCost: number = 0.25,
    operationalCost: number = 0.15,
    targetMarginPercent: number = 20.0
  ) {
    const sellingRevenue = sellingPrice;
    const totalCost = procurementPrice + logisticsCost + operationalCost;
    const grossProfit = sellingRevenue - totalCost;
    const marginPercent = sellingRevenue > 0 ? (grossProfit / sellingRevenue) * 100 : 0;
    const satisfiesTargetMargin = marginPercent >= targetMarginPercent;

    return {
      sellingRevenue,
      procurementCost: procurementPrice,
      logisticsCost,
      operationalCost,
      totalCost,
      grossProfit,
      marginPercent,
      targetMarginPercent,
      satisfiesTargetMargin,
      minimumPermittedPrice: totalCost / (1 - targetMarginPercent / 100),
    };
  }

  // --- Customer Directories (Buyers & Sellers) ---
  public static getAllBuyers(): BuyerProfile[] {
    this.initialize();
    return Array.from(this.buyerProfiles.values());
  }

  public static getAllSellers(): FarmerProfile[] {
    this.initialize();
    return Array.from(this.farmerProfiles.values());
  }

  public static updateBuyerProfile(id: string, updates: Partial<BuyerProfile>): BuyerProfile {
    this.initialize();
    const existing = this.buyerProfiles.get(id);
    if (!existing) throw new Error(`Buyer profile not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.buyerProfiles.set(id, updated);
    return updated;
  }

  public static updateSellerProfile(id: string, updates: Partial<FarmerProfile>): FarmerProfile {
    this.initialize();
    const existing = this.farmerProfiles.get(id);
    if (!existing) throw new Error(`Seller profile not found: ${id}`);
    const updated = { ...existing, ...updates };
    this.farmerProfiles.set(id, updated);
    return updated;
  }

  // --- Lots & Traceability ---
  public static getLotById(lotId: string): Lot | undefined {
    this.initialize();
    return this.lots.get(lotId);
  }

  public static getFarmerLots(farmerId: string): Lot[] {
    this.initialize();
    return Array.from(this.lots.values()).filter((l) => l.farmerId === farmerId);
  }

  public static getLotEvents(lotId: string): LotEvent[] {
    this.initialize();
    return this.lotEvents.get(lotId) || [
      {
        id: `le-gen-${Date.now()}`,
        lotId,
        eventType: 'VERIFIED',
        timestamp: new Date().toISOString(),
        locationSummary: 'Western Agricultural Zone 4',
        notes: 'Verified AgriTrust Intake & Quality Grade A Certification.',
      },
    ];
  }

  public static getLotQuality(lotId: string): LotQuality {
    this.initialize();
    return this.lotQuality.get(lotId) || {
      id: `lq-gen-${lotId}`,
      lotId,
      grade: 'Grade A',
      aiConfidenceScore: 97.8,
      inspectionDate: new Date().toISOString(),
      defectsDetected: ['None detected'],
      status: 'ACCEPTED',
    };
  }

  public static updateLotQuality(lotId: string, quality: LotQuality): LotQuality {
    this.initialize();
    this.lotQuality.set(lotId, quality);
    const lot = this.lots.get(lotId);
    if (lot) {
      lot.grade = quality.grade;
      lot.status = 'VERIFIED';
    }
    return quality;
  }

  public static getLotDocuments(lotId: string): LotDocument[] {
    this.initialize();
    return this.lotDocuments.get(lotId) || [
      {
        id: `ld-gen-1`,
        lotId,
        documentType: 'QUALITY_CERT',
        fileUrl: `/docs/quality_cert_${lotId}.pdf`,
        fileHash: `sha256_qc_${lotId}_hash`,
        uploadedAt: new Date().toISOString(),
      },
      {
        id: `ld-gen-2`,
        lotId,
        documentType: 'PHYTOSANITARY',
        fileUrl: `/docs/phyto_cert_${lotId}.pdf`,
        fileHash: `sha256_phyto_${lotId}_hash`,
        uploadedAt: new Date().toISOString(),
      },
    ];
  }

  public static addLotDocument(lotId: string, doc: LotDocument): LotDocument[] {
    this.initialize();
    const existing = this.getLotDocuments(lotId);
    const updated = [...existing, doc];
    this.lotDocuments.set(lotId, updated);
    return updated;
  }

  public static createHarvestLot(
    farmerId: string,
    productId: string,
    cropName: string,
    quantityUnitsKg: number,
    storageTemp: number = 13.0
  ): Lot {
    this.initialize();
    const lotNumber = Math.floor(900000 + Math.random() * 90000);
    const lotId = `AT-LOT-2026-${lotNumber}`;
    const verificationHash = `sha256_lot_${lotNumber}_${Math.random().toString(36).substring(2, 8)}`;

    const newLot: Lot = {
      id: lotId,
      productId,
      harvestId: `harv-${Date.now()}`,
      farmerId,
      cropName,
      varietyName: 'Premium Harvest',
      commodity: cropName,
      variety: 'Premium Harvest',
      description: `Freshly harvested Grade A ${cropName}.`,
      harvestDate: new Date().toISOString().split('T')[0],
      grade: 'Grade A',
      availableStock: quantityUnitsKg,
      initialQuantityKg: quantityUnitsKg,
      availableQuantityKg: quantityUnitsKg,
      unit: 'kg',
      moq: 50,
      moqUnit: 'kg',
      wholesalePrice: 2.50,
      currency: 'USD',
      productImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      availability: true,
      traceabilityStatus: 'VERIFIED',
      qualityStatus: 'PASSED',
      procurementStatus: 'AVAILABLE',
      status: 'VERIFIED',
      publicationStatus: 'PUBLISHED',
      publicVisibility: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      verificationHash,
      publicRegion: 'Western Agricultural Zone 4',
    };

    this.lots.set(newLot.id, newLot);

    // Create initial harvest event
    this.lotEvents.set(newLot.id, [
      {
        id: `le-intake-${Date.now()}`,
        lotId: newLot.id,
        eventType: 'HARVESTED',
        timestamp: new Date().toISOString(),
        locationSummary: 'Western Agricultural Zone 4',
        notes: `Harvest intake batch registered for ${cropName} (${quantityUnitsKg} kg) at storage temp ${storageTemp}°C.`,
      },
    ]);

    // Create initial quality record
    this.lotQuality.set(newLot.id, {
      id: `lq-${Date.now()}`,
      lotId: newLot.id,
      grade: 'Grade A',
      aiConfidenceScore: 98.2,
      inspectionDate: new Date().toISOString(),
      defectsDetected: ['None detected'],
      status: 'ACCEPTED',
    });

    return newLot;
  }

  // --- Users & Profiles ---
  public static getUserById(userId: string): User | undefined {
    this.initialize();
    return this.users.get(userId);
  }

  public static getFarmerProfileByUserId(userId: string): FarmerProfile | undefined {
    this.initialize();
    return Array.from(this.farmerProfiles.values()).find((fp) => fp.userId === userId);
  }

  public static getBuyerProfileByUserId(userId: string): BuyerProfile | undefined {
    this.initialize();
    return Array.from(this.buyerProfiles.values()).find((bp) => bp.userId === userId);
  }

  public static createFarmerAccount(
    email: string,
    businessName: string,
    contactName: string,
    privatePhone: string,
    privateAddress: string,
    privateGpsLat: number,
    privateGpsLng: number,
    publicRegion: string
  ): { user: User; profile: FarmerProfile } {
    this.initialize();
    const userId = `usr-farmer-${Date.now()}`;
    const orgId = `org-farmer-${Date.now()}`;
    const profileId = `fp-${Date.now()}`;

    const user: User = {
      id: userId,
      email,
      name: contactName,
      role: 'FARMER',
      organisationId: orgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profile: FarmerProfile = {
      id: profileId,
      userId,
      organisationId: orgId,
      businessName,
      contactName,
      privatePhone,
      privateAddress,
      privateGpsLat,
      privateGpsLng,
      publicRegion,
      trustScore: 92.5,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    this.farmerProfiles.set(profile.id, profile);

    return { user, profile };
  }

  public static createBuyerAccount(
    email: string,
    businessName: string,
    contactName: string,
    privatePhone: string,
    privateAddress: string,
    creditLimit: number = 25000
  ): { user: User; profile: BuyerProfile } {
    this.initialize();
    const userId = `usr-buyer-${Date.now()}`;
    const orgId = `org-buyer-${Date.now()}`;
    const profileId = `bp-${Date.now()}`;

    const user: User = {
      id: userId,
      email,
      name: contactName,
      role: 'BUYER',
      organisationId: orgId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const profile: BuyerProfile = {
      id: profileId,
      userId,
      organisationId: orgId,
      businessName,
      contactName,
      privatePhone,
      privateAddress,
      creditLimit,
      verified: true,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);
    this.buyerProfiles.set(profile.id, profile);

    return { user, profile };
  }

  // --- Orders & Operational Queries ---
  public static saveOrder(order: Order): Order {
    this.initialize();
    this.orders.set(order.id, order);
    return order;
  }

  public static getOrderById(orderId: string): Order | undefined {
    this.initialize();
    return this.orders.get(orderId);
  }

  public static getBuyerOrders(buyerId: string): Order[] {
    this.initialize();
    return Array.from(this.orders.values()).filter((o) => o.buyerId === buyerId);
  }

  public static getBuyerShipments(buyerId: string): Array<{ order: LogisticsOrder; shipment: Shipment }> {
    this.initialize();
    const buyerOrderIds = this.getBuyerOrders(buyerId).map((o) => o.id);
    return Array.from(this.logisticsOrders.values()).filter((l) => buyerOrderIds.includes(l.order.orderId));
  }

  public static getBuyerInvoices(buyerId: string): Invoice[] {
    this.initialize();
    const buyerOrderIds = this.getBuyerOrders(buyerId).map((o) => o.id);
    return Array.from(this.invoices.values()).filter((inv) => buyerOrderIds.includes(inv.orderId));
  }

  public static getBuyerProcurementRequests(buyerId: string): ProcurementRequest[] {
    this.initialize();
    return Array.from(this.procurementRequests.values()).filter((pr) => pr.buyerId === buyerId);
  }

  public static getFarmerSettlements(farmerId: string): Settlement[] {
    this.initialize();
    return Array.from(this.settlements.values()).filter((s) => s.farmerId === farmerId);
  }

  // --- Production Admin Settings & Feature Flags Control ---
  public static getAdminProfile(): AdminProfile {
    this.initialize();
    return { ...this.adminProfile };
  }

  public static updateAdminProfile(
    updates: Partial<AdminProfile>,
    adminUserId: string = 'sys-admin'
  ): AdminProfile {
    this.initialize();
    const previous = { ...this.adminProfile };
    
    // Retain immutable actorId regardless of username change
    this.adminProfile = {
      ...this.adminProfile,
      ...updates,
      actorId: previous.actorId,
    };

    if (updates.username && updates.username !== previous.username) {
      this.recordConfigRevision(
        'admin_username',
        previous.username,
        updates.username,
        adminUserId,
        'Admin changed username. Immutable actor ID retained.'
      );
    }

    if (updates.email && updates.email !== previous.email) {
      this.adminProfile.pendingEmail = updates.email;
      this.adminProfile.emailVerified = false;
      this.adminProfile.email = previous.email; // Keep old email active until verified
      
      this.recordConfigRevision(
        'admin_email_change_requested',
        previous.email,
        updates.email,
        adminUserId,
        'Verification email sent to new email address.'
      );
    }

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_ADMIN_PROFILE',
      `ACTOR:${this.adminProfile.actorId}`,
      `Admin profile updated. Username: ${this.adminProfile.username}. Immutable Actor ID: ${this.adminProfile.actorId}`
    );

    return { ...this.adminProfile };
  }

  public static removeAdminProfilePhoto(adminUserId: string = 'sys-admin'): AdminProfile {
    this.initialize();
    this.adminProfile.photoUrl = undefined;
    
    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'REMOVE_PROFILE_PHOTO',
      `ACTOR:${this.adminProfile.actorId}`,
      'Administrator profile photo removed.'
    );

    return { ...this.adminProfile };
  }

  public static updateAdminPreferences(
    preferences: Partial<AdminProfile['preferences']>,
    adminUserId: string = 'sys-admin'
  ): AdminProfile {
    this.initialize();
    this.adminProfile.preferences = {
      ...this.adminProfile.preferences,
      ...preferences,
    };

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_PERSONAL_PREFERENCES',
      `ACTOR:${this.adminProfile.actorId}`,
      'Administrator personal preferences updated.'
    );

    return { ...this.adminProfile };
  }

  public static verifyAdminNewEmail(adminUserId: string = 'sys-admin'): AdminProfile {
    this.initialize();
    if (this.adminProfile.pendingEmail) {
      const prev = this.adminProfile.email;
      this.adminProfile.email = this.adminProfile.pendingEmail;
      this.adminProfile.emailVerified = true;
      this.adminProfile.pendingEmail = undefined;

      this.recordConfigRevision(
        'admin_email_verified',
        prev,
        this.adminProfile.email,
        adminUserId,
        'Email change verified successfully.'
      );
    }
    return { ...this.adminProfile };
  }

  public static getTOTPState(): TOTP2FAState {
    this.initialize();
    return { ...this.totpState };
  }

  public static enableTOTP2FA(verificationCode: string, adminUserId: string = 'sys-admin'): TOTP2FAState {
    this.initialize();
    if (!verificationCode || verificationCode.trim().length !== 6) {
      throw new Error('Invalid TOTP verification code. Must be a 6-digit number.');
    }

    this.totpState.isEnabled = true;
    this.totpState.verifiedAt = new Date().toISOString();

    this.authActivities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      accountEmail: this.adminProfile.email,
      eventType: '2FA_ENABLED',
      device: 'MacBook Pro (Chrome)',
      ipAddress: '190.107.42.18',
    });

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'ENABLE_TOTP_2FA',
      `ACTOR:${this.adminProfile.actorId}`,
      'Two-Factor Authentication (TOTP) successfully enabled and verified.'
    );

    return { ...this.totpState };
  }

  public static disableTOTP2FA(adminUserId: string = 'sys-admin'): TOTP2FAState {
    this.initialize();
    this.totpState.isEnabled = false;
    this.totpState.verifiedAt = undefined;

    this.authActivities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      accountEmail: this.adminProfile.email,
      eventType: '2FA_DISABLED',
      device: 'MacBook Pro (Chrome)',
      ipAddress: '190.107.42.18',
    });

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'DISABLE_TOTP_2FA',
      `ACTOR:${this.adminProfile.actorId}`,
      'Two-Factor Authentication (TOTP) disabled by administrator.'
    );

    return { ...this.totpState };
  }

  public static verifyTOTPChallenge(code: string): boolean {
    this.initialize();
    if (!this.totpState.isEnabled) return true; // 2FA not enforced
    if (!code) return false;

    // Check if recovery code
    if (code.startsWith('REC-')) {
      const idx = this.totpState.recoveryCodes.indexOf(code);
      if (idx !== -1) {
        this.totpState.recoveryCodes.splice(idx, 1);
        this.totpState.backupCodesUsed += 1;
        return true;
      }
      return false;
    }

    // Standard 6-digit TOTP challenge
    return code.trim().length === 6 && /^\d+$/.test(code.trim());
  }

  public static getActiveSessions(): ActiveSession[] {
    this.initialize();
    return [...this.activeSessions];
  }

  public static revokeSession(sessionId: string, adminUserId: string = 'sys-admin'): ActiveSession[] {
    this.initialize();
    this.activeSessions = this.activeSessions.filter((s) => s.id !== sessionId);

    this.authActivities.unshift({
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      accountEmail: this.adminProfile.email,
      eventType: 'SESSION_REVOKED',
      device: 'Admin Portal',
      ipAddress: '190.107.42.18',
    });

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'REVOKE_SESSION',
      `SESSION:${sessionId}`,
      `Admin revoked active session ${sessionId}.`
    );

    return [...this.activeSessions];
  }

  public static revokeAllOtherSessions(currentSessionId: string, adminUserId: string = 'sys-admin'): ActiveSession[] {
    this.initialize();
    this.activeSessions = this.activeSessions.filter((s) => s.id === currentSessionId || s.isCurrent);
    
    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'REVOKE_ALL_OTHER_SESSIONS',
      `ACTOR:${this.adminProfile.actorId}`,
      'Admin revoked all other active sessions.'
    );

    return [...this.activeSessions];
  }

  public static getAuthenticationLogs(): AuthenticationActivity[] {
    this.initialize();
    return [...this.authActivities];
  }

  public static getNotificationRoutings(): NotificationRecipientRouting[] {
    this.initialize();
    return [...this.notificationRoutings];
  }

  public static updateNotificationRouting(
    id: string,
    emailAddress: string,
    adminUserId: string = 'sys-admin'
  ): NotificationRecipientRouting {
    this.initialize();
    const item = this.notificationRoutings.find((nr) => nr.id === id);
    if (!item) throw new Error(`Notification routing entry ${id} not found.`);

    const prevEmail = item.emailAddress;
    item.emailAddress = emailAddress;
    item.verificationStatus = 'PENDING_VERIFICATION';

    this.recordConfigRevision(
      `notification_routing_${item.category.toLowerCase()}`,
      prevEmail,
      emailAddress,
      adminUserId,
      `Updated notification email routing for ${item.category}. Verification email sent.`
    );

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_NOTIFICATION_ROUTING',
      `ROUTING:${item.category}`,
      `Notification routing for ${item.category} updated to ${emailAddress} (Pending Verification).`
    );

    return { ...item };
  }

  public static verifyNotificationRoutingEmail(id: string): NotificationRecipientRouting {
    this.initialize();
    const item = this.notificationRoutings.find((nr) => nr.id === id);
    if (!item) throw new Error(`Notification routing entry ${id} not found.`);

    item.verificationStatus = 'VERIFIED';
    return { ...item };
  }

  public static getRegionalSettings(): RegionalSettings {
    this.initialize();
    return { ...this.regionalSettings };
  }

  public static updateRegionalSettings(
    updates: Partial<RegionalSettings>,
    adminUserId: string = 'sys-admin'
  ): RegionalSettings {
    this.initialize();
    const prev = { ...this.regionalSettings };
    this.regionalSettings = { ...this.regionalSettings, ...updates };

    this.recordConfigRevision(
      'regional_settings',
      JSON.stringify(prev),
      JSON.stringify(this.regionalSettings),
      adminUserId,
      'Updated regional settings configuration.'
    );

    return { ...this.regionalSettings };
  }

  public static getUploadSecuritySettings(): UploadSecuritySettings {
    this.initialize();
    return { ...this.uploadSecuritySettings };
  }

  public static updateUploadSecuritySettings(
    updates: Partial<UploadSecuritySettings>,
    adminUserId: string = 'sys-admin'
  ): UploadSecuritySettings {
    this.initialize();
    const prev = { ...this.uploadSecuritySettings };
    this.uploadSecuritySettings = { ...this.uploadSecuritySettings, ...updates };

    this.recordConfigRevision(
      'upload_security_settings',
      JSON.stringify(prev),
      JSON.stringify(this.uploadSecuritySettings),
      adminUserId,
      'Updated upload security policies.'
    );

    return { ...this.uploadSecuritySettings };
  }

  public static getAISystemPauseStatus(): boolean {
    this.initialize();
    return this.aiSystemPaused;
  }

  public static toggleAISystemPause(
    paused: boolean,
    adminUserId: string = 'sys-admin',
    reason: string = 'Emergency AI System Pause initiated.'
  ): boolean {
    this.initialize();
    const prev = this.aiSystemPaused;
    this.aiSystemPaused = paused;

    this.recordConfigRevision(
      'ai_system_pause',
      prev ? 'PAUSED' : 'ACTIVE',
      paused ? 'PAUSED' : 'ACTIVE',
      adminUserId,
      reason
    );

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      paused ? 'PAUSE_AI_SYSTEM' : 'RESUME_AI_SYSTEM',
      'SYSTEM:AI_GOVERNANCE',
      `Admin ${paused ? 'PAUSED' : 'RESUMED'} AI System initiation. Reason: ${reason}`
    );

    return this.aiSystemPaused;
  }

  public static getFeatureFlagSettings(): FeatureFlagSetting[] {
    this.initialize();
    return [...this.featureFlagsList];
  }

  public static isFeatureEnabled(key: string): boolean {
    this.initialize();
    const flag = this.featureFlagsList.find((ff) => ff.key === key);
    if (!flag) return true; // Default allow if unflagged
    return flag.status === 'ENABLED' || flag.status === 'BETA';
  }

  public static updateFeatureFlagStatus(
    key: string,
    status: FeatureFlagStatus,
    adminUserId: string = 'sys-admin',
    reason?: string
  ): FeatureFlagSetting {
    this.initialize();
    const flag = this.featureFlagsList.find((ff) => ff.key === key);
    if (!flag) throw new Error(`Feature flag ${key} not found.`);

    const prevStatus = flag.status;
    flag.status = status;
    flag.updatedAt = new Date().toISOString();
    flag.updatedBy = adminUserId;

    this.recordConfigRevision(
      `feature_flag_${key.toLowerCase()}`,
      prevStatus,
      status,
      adminUserId,
      reason || `Updated feature flag ${key} status from '${prevStatus}' to '${status}'.`
    );

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_FEATURE_FLAG',
      `FEATURE_FLAG:${key}`,
      `Feature flag '${key}' updated from '${prevStatus}' to '${status}'. ${reason ? 'Reason: ' + reason : ''}`
    );

    return { ...flag };
  }

  public static getConfigurationRevisions(): ConfigurationRevision[] {
    this.initialize();
    return [...this.configRevisions];
  }

  private static recordConfigRevision(
    settingKey: string,
    previousValue: string,
    newValue: string,
    changedByUserId: string,
    auditReason: string
  ): void {
    const revision: ConfigurationRevision = {
      id: `cfg-rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      settingKey,
      previousValue,
      newValue,
      changedByUserId,
      timestamp: new Date().toISOString(),
      auditReason,
    };
    this.configRevisions.unshift(revision);
  }

  // --- Dynamic File-Type Upload Security Policy & Quarantine System ---
  public static getProtectedBaselineRules(): UploadSecurityRule[] {
    this.initialize();
    return [...this.protectedBaselineRules];
  }

  public static getAdminAddedRules(): UploadSecurityRule[] {
    this.initialize();
    return [...this.adminAddedRules];
  }

  public static addAdminBlockedExtension(
    rawExtension: string,
    description: string = 'Administrator Added Blocked Extension',
    adminUserId: string = 'sys-admin'
  ): UploadSecurityRule {
    this.initialize();
    const validation = FileSecurityManager.validateExtensionInput(rawExtension);
    if (!validation.valid || !validation.normalized) {
      throw new Error(validation.reason || 'Invalid extension format.');
    }

    const normalizedExt = validation.normalized;

    // Check if already blocked in baseline or admin rules
    const existsInBaseline = this.protectedBaselineRules.some((r) => r.extension === normalizedExt);
    if (existsInBaseline) {
      throw new Error(`Extension '${normalizedExt}' is already locked as a Protected Baseline Security Rule.`);
    }

    const existsInAdmin = this.adminAddedRules.some((r) => r.extension === normalizedExt);
    if (existsInAdmin) {
      throw new Error(`Extension '${normalizedExt}' is already blocked in Administrator-Added Rules.`);
    }

    const newRule: UploadSecurityRule = {
      extension: normalizedExt,
      status: 'BLOCKED',
      ruleType: 'ADMINISTRATOR_ADDED',
      protectionLevel: 'ADMIN_EDITABLE',
      description,
      addedBy: `Admin (${adminUserId})`,
      addedAt: new Date().toISOString(),
    };

    this.adminAddedRules.unshift(newRule);
    this.uploadSecuritySettings.blockedExecutableExtensions.push(normalizedExt);

    this.recordConfigRevision(
      'add_blocked_extension',
      'ALLOWED',
      `BLOCKED:${normalizedExt}`,
      adminUserId,
      `Administrator added blocked extension rule for '${normalizedExt}'.`
    );

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'ADD_BLOCKED_EXTENSION',
      `SECURITY_RULE:${normalizedExt}`,
      `Added blocked extension rule for ${normalizedExt}. User uploads with this extension will be rejected.`
    );

    return { ...newRule };
  }

  public static removeAdminBlockedExtension(
    rawExtension: string,
    adminUserId: string = 'sys-admin',
    confirmedRisk: boolean = false
  ): void {
    this.initialize();
    const normalizedExt = rawExtension.trim().toLowerCase();

    // Reject removal of baseline rules
    const isBaseline = this.protectedBaselineRules.some((r) => r.extension === normalizedExt);
    if (isBaseline) {
      throw new Error(`Extension '${normalizedExt}' is a Protected Baseline Rule and cannot be removed via standard interface. Elevated 2-Human Approval required.`);
    }

    const ruleIndex = this.adminAddedRules.findIndex((r) => r.extension === normalizedExt);
    if (ruleIndex === -1) {
      throw new Error(`Administrator rule for '${normalizedExt}' not found.`);
    }

    // High risk extensions require explicit risk confirmation checkbox
    const highRiskExtensions = ['.php', '.jar', '.scr', '.phtml', '.asp', '.aspx', '.jsp', '.pl', '.cgi', '.py'];
    if (highRiskExtensions.includes(normalizedExt) && !confirmedRisk) {
      throw new Error(`Removing rule for '${normalizedExt}' requires checking 'I understand the security implications'.`);
    }

    const removedRule = this.adminAddedRules.splice(ruleIndex, 1)[0];
    this.uploadSecuritySettings.blockedExecutableExtensions = this.uploadSecuritySettings.blockedExecutableExtensions.filter(
      (ext) => ext !== normalizedExt
    );

    this.recordConfigRevision(
      'remove_blocked_extension',
      `BLOCKED:${normalizedExt}`,
      'REMOVED',
      adminUserId,
      `Administrator removed blocked extension rule for '${normalizedExt}'. High-Risk Warning acknowledged: ${confirmedRisk}`
    );

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'REMOVE_BLOCKED_EXTENSION',
      `SECURITY_RULE:${normalizedExt}`,
      `Removed blocked extension rule for ${normalizedExt}. High risk confirmation accepted.`
    );
  }

  public static getApprovedUploadTypes(): ApprovedUploadType[] {
    this.initialize();
    return [...this.approvedUploadTypesList];
  }

  public static getQuarantinedFiles(): QuarantinedFile[] {
    this.initialize();
    return [...this.quarantinedFilesList];
  }

  public static getUploadSecurityEvents(): UploadSecurityEvent[] {
    this.initialize();
    return [...this.uploadSecurityEventsList];
  }

  public static getUploadSecurityMetrics(): UploadSecurityMetrics {
    this.initialize();
    return { ...this.uploadSecurityMetricsState };
  }

  public static processUploadSecurityPipeline(
    fileName: string,
    declaredMimeType: string,
    fileSizeBytes: number,
    bufferHeaderHex?: string,
    userId: string = 'usr-anon',
    accountType: string = 'GUEST',
    ipAddress: string = '190.107.42.18'
  ): { valid: boolean; userMessage: string; technicalReason?: string; quarantined: boolean } {
    this.initialize();
    this.uploadSecurityMetricsState.totalScanned += 1;

    const result = FileSecurityManager.executeSecurityPipeline(
      fileName,
      declaredMimeType,
      fileSizeBytes,
      bufferHeaderHex,
      userId,
      accountType
    );

    const eventId = `usec-evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = new Date().toISOString();

    if (result.valid) {
      this.uploadSecurityMetricsState.acceptedCount += 1;

      this.uploadSecurityEventsList.unshift({
        id: eventId,
        timestamp,
        userId,
        accountType,
        fileName,
        declaredType: declaredMimeType,
        detectedType: declaredMimeType,
        fileSizeBytes,
        ipAddress,
        scanResult: 'ACCEPTED',
        reasonCode: 'SUCCESS',
        quarantineStatus: false,
      });

      return { valid: true, userMessage: result.userMessage || 'Uploaded successfully.', quarantined: false };
    } else {
      if (result.quarantined) {
        this.uploadSecurityMetricsState.quarantinedCount += 1;
        const qfileId = `qfile-${Date.now()}`;

        this.quarantinedFilesList.unshift({
          id: qfileId,
          userId,
          accountType,
          fileName,
          declaredMimeType,
          detectedMimeType: result.detectedMimeType || 'application/x-executable',
          fileSizeBytes,
          quarantinedAt: timestamp,
          quarantineReason: result.technicalReason || 'Quarantined by Upload Security Pipeline',
          status: 'SECURITY_REVIEW_REQUIRED',
          ipAddress,
        });

        this.uploadSecurityEventsList.unshift({
          id: eventId,
          timestamp,
          userId,
          accountType,
          fileName,
          declaredType: declaredMimeType,
          detectedType: result.detectedMimeType || 'application/x-executable',
          fileSizeBytes,
          ipAddress,
          scanResult: 'QUARANTINED',
          reasonCode: result.reasonCode || 'MAGIC_BYTE_MISMATCH',
          quarantineStatus: true,
        });

        AuditLedger.logOperationalEvent(
          userId,
          accountType as any,
          'QUARANTINE_FILE',
          `QUARANTINE:${qfileId}`,
          `File '${fileName}' quarantined. Reason: ${result.technicalReason}`
        );

        return {
          valid: false,
          userMessage: result.userMessage || 'We couldn\'t accept this file. Please verify the file and try again.',
          technicalReason: result.technicalReason,
          quarantined: true,
        };
      } else {
        this.uploadSecurityMetricsState.rejectedCount += 1;

        this.uploadSecurityEventsList.unshift({
          id: eventId,
          timestamp,
          userId,
          accountType,
          fileName,
          declaredType: declaredMimeType,
          detectedType: declaredMimeType,
          fileSizeBytes,
          ipAddress,
          scanResult: 'REJECTED',
          reasonCode: result.reasonCode || 'PROHIBITED_EXTENSION',
          quarantineStatus: false,
        });

        return {
          valid: false,
          userMessage: result.userMessage || 'This file could not be accepted for security reasons.',
          technicalReason: result.technicalReason,
          quarantined: false,
        };
      }
    }
  }

  // --- Marketing Subscribers & Lead Generation Core Engine ---
  public static subscribeToMarketing(params: {
    email: string;
    audienceType?: MarketingAudienceType;
    source?: string;
    sourcePage?: string;
    firstName?: string;
    lastName?: string;
  }): { subscriber: MarketingSubscriber; isNew: boolean; resubscribed?: boolean; alreadySubscribed?: boolean } {
    this.initialize();

    if (!params.email || typeof params.email !== 'string') {
      throw new Error("We couldn't complete your subscription right now. Please try again.");
    }

    const emailRaw = params.email.trim();
    const emailNormalized = emailRaw.toLowerCase();

    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNormalized)) {
      throw new Error("We couldn't complete your subscription right now. Please try again.");
    }

    const audience: MarketingAudienceType = params.audienceType || 'INTERESTED';
    const src = params.source || 'landing_page';
    const srcPage = params.sourcePage || 'homepage';
    const now = new Date().toISOString();

    // Check if subscriber already exists by emailNormalized
    const existing = Array.from(this.marketingSubscribers.values()).find(
      (s) => s.emailNormalized === emailNormalized
    );

    if (existing) {
      if (existing.subscriptionStatus === 'SUBSCRIBED') {
        // Already active subscriber: update audience if provided
        existing.audienceType = audience;
        existing.updatedAt = now;
        existing.lastMarketingActivityAt = now;
        if (params.firstName) existing.firstName = params.firstName;
        if (params.lastName) existing.lastName = params.lastName;
        this.marketingSubscribers.set(existing.id, existing);

        return { subscriber: { ...existing }, isNew: false, alreadySubscribed: true };
      } else {
        // Previously unsubscribed subscriber resubscribing with consent
        existing.subscriptionStatus = 'SUBSCRIBED';
        existing.consentStatus = 'GRANTED';
        existing.consentTimestamp = now;
        existing.audienceType = audience;
        existing.unsubscribedAt = undefined;
        existing.updatedAt = now;
        existing.lastMarketingActivityAt = now;
        this.marketingSubscribers.set(existing.id, existing);

        // Record consent audit entry
        const historyList = this.marketingConsentHistory.get(existing.id) || [];
        historyList.push({
          id: `mkt-cns-${Date.now()}`,
          subscriberId: existing.id,
          consentStatus: 'GRANTED',
          consentType: 'EXPLICIT_OPT_IN_RESUBSCRIBE',
          consentVersion: 'v1.0',
          source: src,
          timestamp: now,
        });
        this.marketingConsentHistory.set(existing.id, historyList);

        AuditLedger.logOperationalEvent(
          'PUBLIC_ANONYMOUS',
          'SYSTEM',
          'MARKETING_RESUBSCRIBE',
          `SUBSCRIBER:${existing.id}`,
          `Subscriber '${emailNormalized}' resubscribed to marketing updates.`
        );

        return { subscriber: { ...existing }, isNew: false, resubscribed: true };
      }
    }

    // Create new MarketingSubscriber record
    const newId = `mkt-sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const token = `unsub_tok_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const newSubscriber: MarketingSubscriber = {
      id: newId,
      email: emailRaw,
      emailNormalized,
      audienceType: audience,
      firstName: params.firstName,
      lastName: params.lastName,
      source: src,
      sourcePage: srcPage,
      consentStatus: 'GRANTED',
      consentType: 'EXPLICIT_OPT_IN',
      consentTimestamp: now,
      consentVersion: 'v1.0',
      subscriptionStatus: 'SUBSCRIBED',
      createdAt: now,
      updatedAt: now,
      unsubscribeToken: token,
      lastMarketingActivityAt: now,
    };

    this.marketingSubscribers.set(newId, newSubscriber);

    this.marketingConsentHistory.set(newId, [
      {
        id: `mkt-cns-${Date.now()}`,
        subscriberId: newId,
        consentStatus: 'GRANTED',
        consentType: 'EXPLICIT_OPT_IN',
        consentVersion: 'v1.0',
        source: src,
        timestamp: now,
      },
    ]);

    AuditLedger.logOperationalEvent(
      'PUBLIC_ANONYMOUS',
      'SYSTEM',
      'MARKETING_SUBSCRIBE',
      `SUBSCRIBER:${newId}`,
      `New subscriber '${emailNormalized}' opted into marketing list from ${src}/${srcPage}.`
    );

    return { subscriber: { ...newSubscriber }, isNew: true };
  }

  public static unsubscribeByToken(unsubscribeToken: string): MarketingSubscriber {
    this.initialize();
    if (!unsubscribeToken) {
      throw new Error('Invalid or missing unsubscribe token.');
    }

    const subscriber = Array.from(this.marketingSubscribers.values()).find(
      (s) => s.unsubscribeToken === unsubscribeToken
    );

    if (!subscriber) {
      throw new Error('Unsubscribe link is invalid or has expired.');
    }

    const now = new Date().toISOString();
    subscriber.subscriptionStatus = 'UNSUBSCRIBED';
    subscriber.consentStatus = 'WITHDRAWN';
    subscriber.unsubscribedAt = now;
    subscriber.updatedAt = now;
    subscriber.lastMarketingActivityAt = now;
    this.marketingSubscribers.set(subscriber.id, subscriber);

    const historyList = this.marketingConsentHistory.get(subscriber.id) || [];
    historyList.push({
      id: `mkt-cns-${Date.now()}`,
      subscriberId: subscriber.id,
      consentStatus: 'WITHDRAWN',
      consentType: 'ONE_CLICK_UNSUBSCRIBE_TOKEN',
      consentVersion: 'v1.0',
      source: 'unsubscribe_link',
      timestamp: now,
    });
    this.marketingConsentHistory.set(subscriber.id, historyList);

    AuditLedger.logOperationalEvent(
      'PUBLIC_ANONYMOUS',
      'SYSTEM',
      'MARKETING_UNSUBSCRIBE',
      `SUBSCRIBER:${subscriber.id}`,
      `Subscriber '${subscriber.emailNormalized}' unsubscribed via token.`
    );

    return { ...subscriber };
  }

  public static getMarketingSubscribers(adminUserId: string = 'sys-admin'): MarketingSubscriber[] {
    this.initialize();
    // Role-Based Access Control: ensure admin authorization
    if (!adminUserId || (!adminUserId.includes('admin') && adminUserId !== 'sys-admin')) {
      throw new Error('FORBIDDEN_ACCESS: Subscriber data is strictly restricted to administrative roles.');
    }

    return Array.from(this.marketingSubscribers.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public static getMarketingMetrics(adminUserId: string = 'sys-admin'): MarketingMetrics {
    const subs = this.getMarketingSubscribers(adminUserId);
    return {
      totalSubscribers: subs.length,
      activeSubscribers: subs.filter((s) => s.subscriptionStatus === 'SUBSCRIBED').length,
      buyerSubscribers: subs.filter((s) => s.audienceType === 'BUYER' && s.subscriptionStatus === 'SUBSCRIBED').length,
      farmerSubscribers: subs.filter((s) => s.audienceType === 'FARMER' && s.subscriptionStatus === 'SUBSCRIBED').length,
      generalSubscribers: subs.filter((s) => s.audienceType === 'INTERESTED' && s.subscriptionStatus === 'SUBSCRIBED').length,
      unsubscribedCount: subs.filter((s) => s.subscriptionStatus === 'UNSUBSCRIBED').length,
    };
  }

  public static exportMarketingSubscribersCSV(adminUserId: string = 'sys-admin'): string {
    const subs = this.getMarketingSubscribers(adminUserId);
    const headers = ['ID', 'Email', 'Normalized Email', 'Audience', 'First Name', 'Last Name', 'Source', 'Source Page', 'Consent Status', 'Consent Timestamp', 'Subscription Status', 'Date Subscribed'];
    const rows = subs.map((s) => [
      s.id,
      `"${s.email}"`,
      `"${s.emailNormalized}"`,
      s.audienceType,
      `"${s.firstName || ''}"`,
      `"${s.lastName || ''}"`,
      s.source,
      s.sourcePage,
      s.consentStatus,
      s.consentTimestamp,
      s.subscriptionStatus,
      s.createdAt,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'EXPORT_MARKETING_SUBSCRIBERS',
      'MARKETING_VAULT',
      `Exported ${subs.length} marketing subscribers to CSV format.`
    );

    return csvContent;
  }

  public static updateMarketingSubscriberStatus(
    subscriberId: string,
    newStatus: SubscriptionStatus,
    adminUserId: string = 'sys-admin'
  ): MarketingSubscriber {
    this.initialize();
    this.getMarketingSubscribers(adminUserId); // RBAC check

    const sub = this.marketingSubscribers.get(subscriberId);
    if (!sub) throw new Error('Subscriber not found.');

    const now = new Date().toISOString();
    sub.subscriptionStatus = newStatus;
    sub.updatedAt = now;
    if (newStatus === 'UNSUBSCRIBED') {
      sub.unsubscribedAt = now;
      sub.consentStatus = 'WITHDRAWN';
    } else if (newStatus === 'SUBSCRIBED') {
      sub.consentStatus = 'GRANTED';
    }

    this.marketingSubscribers.set(subscriberId, sub);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_SUBSCRIBER_STATUS',
      `SUBSCRIBER:${subscriberId}`,
      `Updated subscriber status to ${newStatus}.`
    );

    return { ...sub };
  }

  public static deleteMarketingSubscriber(
    subscriberId: string,
    adminUserId: string = 'sys-admin'
  ): boolean {
    this.initialize();
    this.getMarketingSubscribers(adminUserId); // RBAC check

    const sub = this.marketingSubscribers.get(subscriberId);
    if (!sub) return false;

    this.marketingSubscribers.delete(subscriberId);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'DELETE_SUBSCRIBER',
      `SUBSCRIBER:${subscriberId}`,
      `Deleted subscriber '${sub.emailNormalized}'.`
    );

    return true;
  }

  /* ==========================================================================
     WHATSAPP BUSINESS AI COMMUNICATION CORE METHODS (SECTION 4, 7-10, 25-28)
     ========================================================================== */

  public static getWhatsAppAccount(): WhatsAppAccount {
    this.initialize();
    return { ...this.whatsappAccount };
  }

  public static updateWhatsAppAccount(updates: Partial<WhatsAppAccount>, adminUserId: string = 'sys-admin'): WhatsAppAccount {
    this.initialize();
    this.whatsappAccount = { ...this.whatsappAccount, ...updates, lastSyncAt: new Date().toISOString() };

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_WHATSAPP_ACCOUNT',
      'WABA_CONFIG',
      `Updated WhatsApp Business Account configuration: status=${this.whatsappAccount.status}`
    );

    return { ...this.whatsappAccount };
  }

  public static getWhatsAppContacts(): WhatsAppContact[] {
    this.initialize();
    return Array.from(this.whatsappContacts.values());
  }

  public static getWhatsAppConversations(): WhatsAppConversation[] {
    this.initialize();
    return Array.from(this.whatsappConversations.values()).sort(
      (a, b) => new Date(b.lastActivityAt || b.lastMessageTimestamp || 0).getTime() - new Date(a.lastActivityAt || a.lastMessageTimestamp || 0).getTime()
    );
  }

  public static getWhatsAppConversationById(conversationId: string): WhatsAppConversation | undefined {
    this.initialize();
    const conv = this.whatsappConversations.get(conversationId);
    return conv ? { ...conv } : undefined;
  }

  public static getWhatsAppMessages(conversationId: string): WhatsAppMessage[] {
    this.initialize();
    const list = this.whatsappMessages.get(conversationId) || [];
    return [...list];
  }

  public static sendWhatsAppMessage(
    conversationId: string,
    text: string,
    senderName: string = 'AgriTrust',
    isAI: boolean = false,
    adminUserId?: string
  ): WhatsAppMessage {
    this.initialize();
    const conv = this.whatsappConversations.get(conversationId);
    if (!conv) throw new Error(`WhatsApp conversation '${conversationId}' not found.`);

    const contact = this.whatsappContacts.get(conv.contactId);
    const recipientWaId = contact ? contact.whatsappId : 'unknown';

    // Apply bilateral counterparty privacy redaction before sending
    const redactionResult = WhatsAppSecurityEngine.redactCounterpartyPrivacy(text, conv.accountType);

    const now = new Date().toISOString();
    const msgId = `wa-msg-${Date.now()}`;
    const newMessage: WhatsAppMessage = {
      id: msgId,
      conversationId,
      direction: 'OUTBOUND',
      senderWhatsAppId: this.whatsappAccount.phoneNumber,
      senderName,
      recipientWhatsAppId: recipientWaId,
      text: redactionResult.redactedText,
      timestamp: now,
      classification: WhatsAppSecurityEngine.classifyMessage(text),
      aiGenerated: isAI,
      aiAgentId: isAI ? 'agent-comms-whatsapp-01' : undefined,
      aiAgentVersion: isAI ? 'v1.0' : undefined,
      humanApproved: !isAI || !!adminUserId,
      approverId: adminUserId,
      redactApplied: redactionResult.isRedacted,
      deliveryStatus: 'DELIVERED',
      riskLevel: 'LOW',
    };

    const convMessages = this.whatsappMessages.get(conversationId) || [];
    convMessages.push(newMessage);
    this.whatsappMessages.set(conversationId, convMessages);

    // Update conversation metadata
    conv.lastMessageText = redactionResult.redactedText;
    conv.lastActivityAt = now;
    this.whatsappConversations.set(conversationId, conv);

    // Operational audit log
    AuditLedger.logOperationalEvent(
      adminUserId || 'SYSTEM',
      isAI ? 'AGENT' : 'ADMIN',
      'SEND_WHATSAPP_MESSAGE',
      `CONVERSATION:${conversationId}`,
      `Outbound WhatsApp message sent to ${conv.displayName} (${conv.accountType}). Redacted=${redactionResult.isRedacted}`
    );

    return newMessage;
  }

  public static processIncomingWhatsAppMessage(
    senderWhatsAppId: string,
    senderName: string,
    text: string,
    conversationId?: string
  ): { message: WhatsAppMessage; aiResponse?: WhatsAppMessage; isEscalated: boolean } {
    this.initialize();

    let conv: WhatsAppConversation | undefined;
    if (conversationId) {
      conv = this.whatsappConversations.get(conversationId);
    }

    if (!conv) {
      const contact = Array.from(this.whatsappContacts.values()).find(
        (c) => c.whatsappId === senderWhatsAppId || c.phoneNumber === senderWhatsAppId
      );
      if (contact) {
        conv = Array.from(this.whatsappConversations.values()).find((c) => c.contactId === contact.id);
      }
    }

    if (!conv) {
      const newContactId = `wa-cnt-${Date.now()}`;
      const newContact: WhatsAppContact = {
        id: newContactId,
        whatsappId: senderWhatsAppId,
        phoneNumber: senderWhatsAppId,
        name: senderName,
        accountType: 'BUYER',
        linkedEntityId: 'buy-001',
        organisationName: senderName,
        verifiedStatus: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.whatsappContacts.set(newContactId, newContact);

      const newConvId = `wa-conv-${Date.now()}`;
      conv = {
        id: newConvId,
        contactId: newContactId,
        accountType: 'BUYER',
        linkedEntityId: 'buy-001',
        displayName: senderName,
        organisationName: 'Guest Buyer',
        contactName: senderName,
        contactPhoneNumber: senderWhatsAppId,
        status: 'AI_ACTIVE',
        aiEnabled: true,
        lastMessageText: text,
        lastMessageTimestamp: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
        unreadCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.whatsappConversations.set(newConvId, conv);
    }

    if (!conv) {
      throw new Error(`Failed to resolve WhatsApp conversation for ${senderWhatsAppId}`);
    }

    // 1. Security Check: Untrusted Input & Prompt Injection Detection
    const sanitizedInput = WhatsAppSecurityEngine.sanitizeIncomingMessage(
      text,
      conv.accountType,
      conv.linkedEntityId
    );

    const now = new Date().toISOString();
    const inboundMsgId = `wa-msg-in-${Date.now()}`;
    const inboundMessage: WhatsAppMessage = {
      id: inboundMsgId,
      conversationId: conv.id,
      direction: 'INBOUND',
      senderWhatsAppId,
      senderName,
      recipientWhatsAppId: this.whatsappAccount.phoneNumber,
      text: sanitizedInput.sanitizedText,
      timestamp: now,
      classification: sanitizedInput.classification,
      aiGenerated: false,
      humanApproved: false,
      deliveryStatus: 'READ',
    };

    const convMessages = this.whatsappMessages.get(conv.id) || [];
    convMessages.push(inboundMessage);
    this.whatsappMessages.set(conv.id, convMessages);

    conv.lastMessageText = sanitizedInput.sanitizedText;
    conv.lastActivityAt = now;
    conv.unreadCount += 1;

    // Check AI Loop Protection
    const loopProtectionTriggered = WhatsAppSecurityEngine.checkAILoopProtection(conv.id);
    if (loopProtectionTriggered) {
      conv.status = 'ESCALATED';
      conv.aiEnabled = false;
      this.whatsappConversations.set(conv.id, conv);
      return { message: inboundMessage, isEscalated: true };
    }

    // 2. AI Autonomous Execution Check
    let aiResponse: WhatsAppMessage | undefined;
    let isEscalated = false;

    if (this.whatsappAccount.aiSystemPaused || !conv.aiEnabled || conv.status === 'HUMAN_ACTIVE') {
      this.whatsappConversations.set(conv.id, conv);
      return { message: inboundMessage, isEscalated: false };
    }

    // Process Price Negotiation or Inquiry
    if (sanitizedInput.classification === 'PRICE_REQUEST' || sanitizedInput.classification === 'ORDER') {
      const policy = this.getWhatsAppNegotiationPolicy('cmd-tomatoes-01');
      if (policy && conv.accountType === 'BUYER') {
        const requestedPrice = 2.10; // Simulated requested price below floor
        const evalResult = WhatsAppNegotiationEngine.evaluateBuyerOffer(policy, requestedPrice, 500);

        if (evalResult.requiresHumanEscalation) {
          conv.status = 'ESCALATED';
          conv.aiEnabled = false;
          isEscalated = true;

          aiResponse = this.sendWhatsAppMessage(
            conv.id,
            "Hello, this is AgriTrust. I'm assisting with your wholesale produce request. " + evalResult.responseMessage,
            'AgriTrust',
            true
          );
        } else {
          aiResponse = this.sendWhatsAppMessage(
            conv.id,
            "Hello, this is AgriTrust. I'm assisting with your wholesale produce request. " + evalResult.responseMessage,
            'AgriTrust',
            true
          );
        }
      } else {
        aiResponse = this.sendWhatsAppMessage(
          conv.id,
          "Hello, this is AgriTrust. I'm assisting with your wholesale produce request. We have Grade A vine-ripened produce ready for wholesale distribution. For 500 kg, the price is $2.40/kg.",
          'AgriTrust',
          true
        );
      }
    } else {
      aiResponse = this.sendWhatsAppMessage(
        conv.id,
        "Hello, this is AgriTrust. I'm assisting with your wholesale produce request. How can we help fulfill your commercial order today?",
        'AgriTrust',
        true
      );
    }

    this.whatsappConversations.set(conv.id, conv);
    return { message: inboundMessage, aiResponse, isEscalated };
  }

  public static takeoverWhatsAppConversation(
    conversationId: string,
    reason: string,
    adminUserId: string = 'sys-admin'
  ): WhatsAppConversation {
    this.initialize();
    const conv = this.whatsappConversations.get(conversationId);
    if (!conv) throw new Error(`Conversation '${conversationId}' not found.`);

    conv.status = 'HUMAN_ACTIVE';
    conv.aiEnabled = false;
    conv.assignedHumanOperatorId = adminUserId;
    conv.assignedHumanOperatorName = this.adminProfile.displayName;
    conv.humanTakeoverReason = reason;
    conv.humanTakeoverStartedAt = new Date().toISOString();

    this.whatsappConversations.set(conversationId, conv);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'HUMAN_TAKEOVER_WHATSAPP',
      `CONVERSATION:${conversationId}`,
      `Administrator took over WhatsApp conversation. Reason: '${reason}'`
    );

    return { ...conv };
  }

  public static returnWhatsAppConversationToAI(
    conversationId: string,
    adminUserId: string = 'sys-admin'
  ): WhatsAppConversation {
    this.initialize();
    const conv = this.whatsappConversations.get(conversationId);
    if (!conv) throw new Error(`Conversation '${conversationId}' not found.`);

    conv.status = 'AI_ACTIVE';
    conv.aiEnabled = true;
    conv.assignedHumanOperatorId = undefined;
    conv.assignedHumanOperatorName = undefined;

    this.whatsappConversations.set(conversationId, conv);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'RESUME_AI_WHATSAPP',
      `CONVERSATION:${conversationId}`,
      `Resumed AI agent control for WhatsApp conversation.`
    );

    return { ...conv };
  }

  public static pauseAllWhatsAppAI(adminUserId: string = 'sys-admin'): boolean {
    this.initialize();
    this.whatsappAccount.aiSystemPaused = true;

    AuditLedger.logImmutableSecurityEvent(
      adminUserId,
      'EMERGENCY_PAUSE_ALL_WHATSAPP_AI',
      'CRITICAL',
      `Administrator activated EMERGENCY SHUTDOWN of all outbound WhatsApp AI messaging.`
    );

    return true;
  }

  public static resumeAllWhatsAppAI(adminUserId: string = 'sys-admin'): boolean {
    this.initialize();
    this.whatsappAccount.aiSystemPaused = false;

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'RESUME_ALL_WHATSAPP_AI',
      'WABA_CONFIG',
      `Administrator resumed outbound WhatsApp AI messaging system.`
    );

    return true;
  }

  public static pauseWhatsAppAIForConversation(
    contactIdOrConvId: string,
    adminUserId: string = 'sys-admin'
  ): boolean {
    this.initialize();
    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'HUMAN_TAKEOVER_CONVERSATION',
      `CONTACT:${contactIdOrConvId}`,
      `Human Administrator (${adminUserId}) activated takeover. AI messaging paused for target ${contactIdOrConvId}.`
    );
    return true;
  }

  public static getWhatsAppTemplates(): WhatsAppTemplate[] {
    this.initialize();
    return Array.from(this.whatsappTemplates.values());
  }

  public static approveWhatsAppTemplate(templateId: string, adminUserId: string = 'sys-admin'): WhatsAppTemplate {
    this.initialize();
    const tpl = this.whatsappTemplates.get(templateId);
    if (!tpl) throw new Error(`Template '${templateId}' not found.`);

    tpl.status = 'APPROVED';
    tpl.approvedAt = new Date().toISOString();
    this.whatsappTemplates.set(templateId, tpl);

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'APPROVE_WHATSAPP_TEMPLATE',
      `TEMPLATE:${templateId}`,
      `Approved WhatsApp message template '${tpl.name}'.`
    );

    return { ...tpl };
  }

  public static getWhatsAppNegotiationPolicies(): WhatsAppNegotiationPolicy[] {
    this.initialize();
    return Array.from(this.whatsappNegotiationPolicies.values());
  }

  public static getWhatsAppNegotiationPolicy(commodityId: string): WhatsAppNegotiationPolicy | undefined {
    this.initialize();
    return this.whatsappNegotiationPolicies.get(commodityId);
  }

  public static updateWhatsAppNegotiationPolicy(
    policy: WhatsAppNegotiationPolicy,
    adminUserId: string = 'sys-admin'
  ): WhatsAppNegotiationPolicy {
    this.initialize();
    this.whatsappNegotiationPolicies.set(policy.commodityId, { ...policy });

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_WHATSAPP_NEGOTIATION_POLICY',
      `COMMODITY:${policy.commodityId}`,
      `Updated negotiation policy for ${policy.commodityName}. Min margin=${policy.minimumMarginPercent}%, Floor=$${policy.absolutePriceFloorPerKg}/kg`
    );

    return { ...policy };
  }

  /* ==========================================================================
     MARKETPLACE & PRICING SETTINGS METHODS (SECTION 28 & 29)
     ========================================================================== */

  public static getMarketplaceSettings(): MarketplaceSettings {
    this.initialize();
    return { ...this.marketplaceSettings };
  }

  public static updateMarketplaceSettings(
    partial: Partial<MarketplaceSettings>,
    adminUserId: string = 'sys-admin'
  ): MarketplaceSettings {
    this.initialize();
    const oldMargin = this.marketplaceSettings.minimumRequiredMarginPercent;

    this.marketplaceSettings = {
      ...this.marketplaceSettings,
      ...partial,
      updatedAt: new Date().toISOString(),
      updatedByUserId: adminUserId,
    };

    if (partial.minimumRequiredMarginPercent !== undefined && partial.minimumRequiredMarginPercent !== oldMargin) {
      AuditLedger.logOperationalEvent(
        adminUserId,
        'ADMIN',
        'UPDATE_MINIMUM_REQUIRED_MARGIN',
        'SETTINGS:MARKETPLACE:PRICING',
        `Configured Minimum Required Margin updated from ${oldMargin}% to ${this.marketplaceSettings.minimumRequiredMarginPercent}%.`
      );
    }

    return { ...this.marketplaceSettings };
  }

  public static disconnectWhatsAppAccount(adminUserId: string = 'sys-admin'): WhatsAppAccount {
    this.initialize();
    this.whatsappAccount = {
      ...this.whatsappAccount,
      status: 'DISCONNECTED',
      webhookStatus: 'INACTIVE',
      aiSystemPaused: true,
      lastHealthCheck: new Date().toISOString(),
    };

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'DISCONNECT_WHATSAPP_BUSINESS',
      `WABA:${this.whatsappAccount.wabaAccountId}`,
      `Administrator revoked and disconnected WhatsApp Business account. Outbound AI messaging halted.`
    );

    return { ...this.whatsappAccount };
  }

  public static submitWhatsAppTwoHumanApproval(
    approvalId: string,
    approverNumber: 1 | 2,
    userId: string,
    action: 'APPROVE' | 'REJECT'
  ): WhatsAppApproval {
    this.initialize();
    const app: WhatsAppApproval = this.whatsappApprovals.get(approvalId) || {
      id: approvalId,
      conversationId: 'wa-conv-001',
      messageId: 'wa-msg-1001',
      proposalType: 'PRICE_EXCEPTION',
      proposedAction: 'Price Exception Below Floor',
      details: 'Buyer requested price exception',
      actionType: 'PRICE_EXCEPTION',
      requesterUserId: 'ai-comm-agent',
      status: 'PENDING_APPROVAL',
      requiredApproversCount: 2,
      createdAt: new Date().toISOString(),
    };

    if (action === 'REJECT') {
      app.status = 'REJECTED';
    } else {
      if (approverNumber === 1) {
        app.approver1UserId = userId;
        app.approver1Timestamp = new Date().toISOString();
      } else {
        app.approver2UserId = userId;
        app.approver2Timestamp = new Date().toISOString();
      }

      if (app.approver1UserId && app.approver2UserId) {
        app.status = 'APPROVED';
        app.executedAt = new Date().toISOString();
      }
    }

    this.whatsappApprovals.set(approvalId, app);

    AuditLedger.logOperationalEvent(
      userId,
      'ADMIN',
      `TWO_HUMAN_APPROVAL_${action}`,
      `APPROVAL:${approvalId}`,
      `Human ${approverNumber} (${userId}) ${action}D high-risk approval request '${approvalId}'. Status is now '${app.status}'.`
    );

    return { ...app };
  }

  /* ==========================================================================
     META WHATSAPP BUSINESS CLOUD API METHODS (SECTION 8, 18, 49, 61)
     ========================================================================== */

  public static getMetaCredentialsConfig(): MetaCredentialsConfig {
    return MetaSecretVault.getCredentialsConfig();
  }

  public static updateMetaCredentialsConfig(
    config: Partial<MetaCredentialsConfig>,
    adminUserId: string = 'sys-admin'
  ): MetaCredentialsConfig {
    this.initialize();
    return MetaSecretVault.updateCredentialsConfig(config, adminUserId);
  }

  public static async verifyAndConnectMetaWhatsApp(
    adminUserId: string = 'sys-admin'
  ): Promise<WhatsAppAccount> {
    this.initialize();

    const verification = await MetaWhatsAppService.verifyMetaApiConnection();

    if (verification.isValid) {
      this.whatsappAccount = {
        ...this.whatsappAccount,
        status: 'CONNECTED',
        phoneNumber: verification.phoneNumber || '+1 (246) 555-0199',
        displayBusinessName: verification.displayBusinessName || 'AgriTrust Wholesale',
        wabaAccountId: verification.wabaId || 'waba-2026-real-001',
        connectedAt: new Date().toISOString(),
        webhookStatus: MetaSecretVault.getWebhookVerifyToken() ? 'VERIFIED' : 'NOT_VERIFIED',
        lastHealthCheck: new Date().toISOString(),
        aiSystemPaused: false,
      };

      AuditLedger.logOperationalEvent(
        adminUserId,
        'ADMIN',
        'CONNECT_META_WHATSAPP_SUCCESS',
        `WABA:${this.whatsappAccount.wabaAccountId}`,
        `Verified live Meta Graph API connection for ${this.whatsappAccount.displayBusinessName} (${this.whatsappAccount.phoneNumber}).`
      );
    } else {
      this.whatsappAccount = {
        ...this.whatsappAccount,
        status: verification.status,
        webhookStatus: 'NOT_VERIFIED',
        lastHealthCheck: new Date().toISOString(),
      };

      AuditLedger.logOperationalEvent(
        adminUserId,
        'ADMIN',
        'CONNECT_META_WHATSAPP_FAILED',
        'WABA:UNVERIFIED',
        `Meta Graph API verification failed: ${verification.errorMessage}`
      );
    }

    return { ...this.whatsappAccount };
  }

  public static async sendRealWhatsAppMessage(
    recipientPhone: string,
    text: string,
    templateName?: string
  ): Promise<{ success: boolean; providerMessageId?: string; status: string; errorMessage?: string }> {
    this.initialize();

    const res = await MetaWhatsAppService.sendOutboundWhatsAppMessage(recipientPhone, text, templateName);

    if (res.success && res.providerMessageId) {
      this.whatsappAccount.messagesTodayCount += 1;
    }

    return {
      success: res.success,
      providerMessageId: res.providerMessageId,
      status: res.deliveryStatus,
      errorMessage: res.errorMessage,
    };
  }

  public static processMetaWebhookChallenge(query: any) {
    return MetaWebhookEngine.verifyWebhookChallenge(query);
  }

  /* ==========================================================================
     WHATSAPP MESSAGING GATEWAY & PROVIDER ABSTRACTION METHODS (SECTION 2 & 5)
     ========================================================================== */

  public static getWhatsAppProviderType(): WhatsAppProviderType {
    return WhatsAppMessagingGateway.getActiveProviderType();
  }

  public static setWhatsAppProvider(
    providerType: WhatsAppProviderType,
    adminUserId: string = 'sys-admin'
  ): { success: boolean; message: string } {
    this.initialize();
    const res = WhatsAppMessagingGateway.setProvider(providerType, adminUserId);
    if (res.success && providerType === 'development') {
      this.whatsappAccount = {
        ...this.whatsappAccount,
        status: 'NOT_CONNECTED',
        phoneNumber: 'Not Configured',
        wabaAccountId: 'Not Configured',
        displayBusinessName: 'AgriTrust Wholesale (Development Adapter)',
        webhookStatus: 'NOT_VERIFIED',
      };
    }
    return res;
  }

  public static getWhatsAppProviderHealth(): ProviderHealthStatus {
    return WhatsAppMessagingGateway.getProviderHealth();
  }

  public static async processInboundWhatsAppMessage(
    fromPhone: string,
    text: string
  ): Promise<ProcessedInboundMessage> {
    this.initialize();
    const processed = await WhatsAppMessagingGateway.processIncomingMessage(fromPhone, text);

    const msgId = `wa-msg-${Date.now()}`;
    const convId = `wa-conv-${fromPhone.replace(/[^0-9]/g, '').slice(-4)}`;

    const newMsg: WhatsAppMessage = {
      id: msgId,
      conversationId: convId,
      direction: 'INBOUND',
      senderWhatsAppId: `${fromPhone}@c.us`,
      senderName: processed.contactType,
      recipientWhatsAppId: 'agritrust-official@c.us',
      text,
      timestamp: new Date().toISOString(),
      classification: 'GENERAL',
      aiGenerated: false,
      humanApproved: false,
      deliveryStatus: 'RECEIVED',
      riskLevel: processed.aiRiskLevel,
      environment: processed.environment,
      provider: processed.provider,
      simulated: processed.simulated,
    };

    const existingMsgs = this.whatsappMessages.get(convId) || [];
    this.whatsappMessages.set(convId, [...existingMsgs, newMsg]);

    return processed;
  }

  public static async dispatchOutboundWhatsAppMessage(
    toPhone: string,
    text: string,
    templateName?: string
  ) {
    this.initialize();
    const res = await WhatsAppMessagingGateway.dispatchOutboundMessage(toPhone, text, templateName);

    if (res.success) {
      this.whatsappAccount.messagesTodayCount += 1;
    }
    return res;
  }

  public static startWhatsAppWebSession(adminUserId: string = 'sys-admin'): WhatsAppWebSessionMetadata {
    this.initialize();
    this.setWhatsAppProvider('whatsapp_web', adminUserId);
    const meta = getWhatsAppWebSessionController().startSession(adminUserId);
    this.whatsappAccount = {
      ...this.whatsappAccount,
      status: 'NOT_CONNECTED',
      displayBusinessName: 'WhatsApp Web Development Session',
    };
    return meta;
  }

  /**
   * Polls the real session state. There is no manual "confirm" step anymore -
   * the browser session transitions to CONNECTED on its own the moment the
   * phone actually scans the QR code (whatsapp-web.js 'ready' event). Callers
   * (e.g. an admin UI polling for status) should call this repeatedly and
   * reflect whatever status comes back, rather than trying to force CONNECTED.
   */
  public static syncWhatsAppWebAccountFromSession(): WhatsAppWebSessionMetadata {
    this.initialize();
    const meta = getWhatsAppWebSessionController().getSessionMetadata();
    if (meta.status === 'CONNECTED') {
      this.whatsappAccount = {
        ...this.whatsappAccount,
        status: 'CONNECTED',
        phoneNumber: meta.maskedPhone || this.whatsappAccount.phoneNumber,
        displayBusinessName: meta.accountName || this.whatsappAccount.displayBusinessName,
        connectedAt: meta.connectedAt,
      };
    }
    return meta;
  }

  public static async disconnectWhatsAppWebSession(adminUserId: string = 'sys-admin'): Promise<WhatsAppWebSessionMetadata> {
    this.initialize();
    const meta = await getWhatsAppWebSessionController().disconnectSession(adminUserId);
    this.whatsappAccount = {
      ...this.whatsappAccount,
      status: 'DISCONNECTED',
      phoneNumber: 'Not Configured',
      displayBusinessName: 'AgriTrust Wholesale (Disconnected)',
    };
    return meta;
  }

  public static getWhatsAppWebSessionMetadata(): WhatsAppWebSessionMetadata {
    return getWhatsAppWebSessionController().getSessionMetadata();
  }
}


