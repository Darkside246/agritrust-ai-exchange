/**
 * AGRITRUST DOMAIN ENTITY SCHEMA
 * Complete relational schema covering 40+ specified platform entities.
 * Designed for strict type safety, zero data duplication, and multi-interface scalability.
 */

export type UserRole = 'ADMIN' | 'BUYER' | 'SELLER' | 'FARMER' | 'OPERATIONS' | 'SYSTEM' | 'AGENT';

export type LotStatus = 
  | 'VERIFIED'
  | 'AVAILABLE'
  | 'ALLOCATED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'RECALLED'
  | 'QUARANTINED'
  | 'REJECTED';

export type ProductUnit = 'kg' | 'crate' | 'box' | 'case' | 'pallet' | 'lot';

export type ProduceGrade = 'Grade A' | 'Grade B' | 'Premium' | 'Standard';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organisationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'FARMER_COOP' | 'COMMERCIAL_BUYER' | 'AGRITRUST_OPS';
  taxId?: string;
  registrationNumber?: string;
  createdAt: string;
}

export type BuyerCategory = 
  | 'Hotels' 
  | 'Restaurants' 
  | 'Supermarkets' 
  | 'Distributors' 
  | 'Food Processors' 
  | 'Caterers' 
  | 'Institutions';

export type SellerCategory = 
  | 'Small Farm' 
  | 'Commercial Farm' 
  | 'Cooperative' 
  | 'Agricultural Producer' 
  | 'Greenhouse' 
  | 'Hydroponic Farm' 
  | 'Organic Producer';

export interface FarmerProfile {
  id: string;
  userId: string;
  organisationId: string;
  businessName: string;
  contactName: string;
  privatePhone: string;
  privateAddress: string;
  privateGpsLat: number;
  privateGpsLng: number;
  publicRegion: string; // e.g. "Western Agricultural Zone 4"
  trustScore: number;
  verified: boolean;
  category?: SellerCategory;
  primaryCrops?: string[];
  farmSizeHectares?: number;
  productionCapacityKg?: number;
  certifications?: string[];
  createdAt: string;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  organisationId: string;
  businessName: string;
  contactName: string;
  privatePhone: string;
  privateAddress: string;
  creditLimit: number;
  verified: boolean;
  category?: BuyerCategory;
  deliveryLocations?: string[];
  paymentTerms?: string;
  orderHistoryCount?: number;
  createdAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  totalHectares: number;
  farmingMethods: string[];
  certifications: string[];
  createdAt: string;
}

export interface FarmLocation {
  id: string;
  farmId: string;
  privateAddress: string;
  privateGpsLat: number;
  privateGpsLng: number;
  publicRegion: string;
}

export interface Crop {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface CropVariety {
  id: string;
  cropId: string;
  varietyName: string;
  shelfLifeDays: number;
  optimalTempCelsius: number;
}

export interface Planting {
  id: string;
  farmId: string;
  cropVarietyId: string;
  hectares: number;
  plantedDate: string;
  estHarvestDate: string;
}

export interface Harvest {
  id: string;
  plantingId: string;
  harvestDate: string;
  totalYieldKg: number;
  notes?: string;
}

export type PublicationStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'HIDDEN'
  | 'UNPUBLISHED'
  | 'ARCHIVED'
  | 'QUARANTINED';

export interface Lot {
  id: string; // e.g. "AT-LOT-2026-000922"
  productId?: string;
  commodity: string;
  variety: string;
  description: string;
  grade: ProduceGrade;
  harvestDate: string;
  availableStock: number;
  availableQuantityKg: number;
  unit: ProductUnit;
  moq: number;
  moqUnit: ProductUnit;
  wholesalePrice: number;
  currency: string;
  productImage: string;
  additionalImages?: string[];
  availability: boolean;
  traceabilityStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  qualityStatus: 'PASSED' | 'PENDING' | 'FAILED';
  procurementStatus: 'AVAILABLE' | 'ALLOCATED' | 'COMPLETED';
  status: LotStatus;
  publicationStatus: PublicationStatus;
  publishedAt?: string;
  scheduledFor?: string;
  unpublishedAt?: string;
  archivedAt?: string;
  publishedBy?: string;
  hiddenBy?: string;
  publicationReason?: string;
  version?: number;
  draftVersion?: Partial<Lot>;
  publicVisibility: boolean;
  createdAt: string;
  updatedAt: string;
  internalNotes?: string;
  harvestId?: string;
  farmerId?: string;
  cropName?: string;
  varietyName?: string;
  initialQuantityKg?: number;
  verificationHash?: string;
  publicRegion?: string;
}

export interface LotRevision {
  id: string;
  lotId: string;
  version: number;
  author: string;
  timestamp: string;
  changedFields: string[];
  previousValues: Record<string, any>;
  newValues: Record<string, any>;
  publicationStatus: PublicationStatus;
  publishDate?: string;
  reason?: string;
}

export interface CMSContent {
  headline: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaText: string;
  heroImage: string;
  featuredLotIds: string[];
  trustMessaging: string;
  traceabilityMessaging: string;
  footerContent: string;
  updatedAt: string;
}

export type CMSBlockType =
  | 'HERO'
  | 'PRODUCT_GRID'
  | 'CATEGORIES'
  | 'CONTROLLED_INTERMEDIARY'
  | 'QUALITY'
  | 'TRACEABILITY'
  | 'HOW_IT_WORKS'
  | 'CTA_SECTION'
  | 'TESTIMONIALS'
  | 'FAQ'
  | 'IMAGE_TEXT'
  | 'STATS'
  | 'BANNER'
  | 'NEWSLETTER_SUBSCRIBE'
  | 'FOOTER';

export interface CMSPageBlock {
  id: string;
  type: CMSBlockType;
  title: string;
  subtitle?: string;
  content?: Record<string, any>;
  settings: {
    visible: boolean;
    bgStyle?: 'light' | 'surface' | 'dark' | 'glass' | 'brand';
    alignment?: 'left' | 'center' | 'right';
    dataSource?: 'PUBLISHED_INVENTORY' | 'FEATURED' | 'NEWEST' | 'CATEGORY';
    limit?: number;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    textLinkText?: string;
    textLinkLink?: string;
    imageUrl?: string;
  };
  displayOrder: number;
}

export interface CMSSEOConfig {
  pageTitle: string;
  metaDescription: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
}

export interface CMSNavigationItem {
  id: string;
  label: string;
  path: string;
  target?: '_self' | '_blank';
  displayOrder: number;
  visible: boolean;
}

export interface CMSFooterConfig {
  companyDescription: string;
  columns: {
    title: string;
    links: { label: string; url: string }[];
  }[];
  copyrightText: string;
  privacyPolicyUrl: string;
  termsUrl: string;
}

export interface CMSPageRevision {
  version: number;
  author: string;
  timestamp: string;
  blocks: CMSPageBlock[];
  seoConfig: CMSSEOConfig;
  navConfig: CMSNavigationItem[];
  footerConfig: CMSFooterConfig;
  auditReason?: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  dimensions?: { width: number; height: number };
  uploadedBy: string;
  uploadedAt: string;
  usedIn: string[]; // Usage references e.g. ["Landing Page Hero", "Tomatoes Product"]
  hash: string;
}

export interface AIAgentRecord {
  id: string;
  name: string;
  version: string;
  status: 'ACTIVE' | 'PAUSED' | 'QUARANTINED' | 'DISABLED' | 'UNDER_REVIEW' | 'FAILED';
  owner: string;
  purpose: string;
  allowedCapabilities: string[];
  allowedTools: string[];
  riskLevel: RiskLevel;
  lastActivity: string;
  currentPolicy: string;
}

export interface AIRunRecord {
  id: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  requestedAction: string;
  inputEntity: string;
  outputSummary: string;
  confidence: number;
  riskLevel: RiskLevel;
  policyResult: 'PASSED' | 'FLAGGED' | 'BLOCKED';
  humanApprovalRequired: boolean;
  approvalStatus: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  executionStatus: 'COMPLETED' | 'PAUSED' | 'FAILED';
}

export interface LotEvent {
  id: string;
  lotId: string;
  eventType: 'HARVESTED' | 'GRADED' | 'VERIFIED' | 'ALLOCATED' | 'DISPATCHED' | 'DELIVERED';
  timestamp: string;
  locationSummary: string;
  notes?: string;
}

export interface LotQuality {
  id: string;
  lotId: string;
  grade: ProduceGrade;
  aiConfidenceScore: number;
  inspectorId?: string;
  inspectionDate: string;
  defectsDetected: string[];
  status: 'ACCEPTED' | 'HUMAN_REVIEW_REQUIRED' | 'REJECTED';
}

export interface LotDocument {
  id: string;
  lotId: string;
  documentType: 'QUALITY_CERT' | 'FARM_ORIGIN' | 'PHYTOSANITARY' | 'LAB_TEST';
  fileUrl: string;
  fileHash: string;
  uploadedAt: string;
}

export type SupplySubmissionStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'QUALITY_REVIEW'
  | 'COMMERCIAL_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'QUARANTINED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface SupplySubmission {
  id: string; // e.g. "SUP-2026-000001"
  sellerId: string;
  sellerName?: string;
  commodity: string;
  variety: string;
  description: string;
  expectedGrade: ProduceGrade;
  estimatedQuantity: number;
  unit: ProductUnit;
  minimumQuantity: number;
  expectedHarvestDate: string;
  availableFrom: string;
  availableUntil: string;
  expectedShelfLifeDays: number;
  growingMethod: string;
  packagingType: string;
  preferredCollectionMethod: string;
  additionalNotes?: string;
  status: SupplySubmissionStatus;
  images: string[];
  documents: string[];
  location: {
    region: string;
    privateGpsLat?: number;
    privateGpsLng?: number;
  };
  aiRecommendation?: {
    suggestedGrade: ProduceGrade;
    suggestedPrice: number;
    suggestedMoq: number;
    confidence: number;
  };
  createdLotId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  lotId: string;
  name: string;
  variety: string;
  category: string;
  description: string;
  unit: ProductUnit;
  unitWeightKg: number;
  pricePerUnit: number;
  moqUnits: number; // Minimum order quantity
  availableUnits: number;
  grade: ProduceGrade;
  availabilityStatus: 'IN_STOCK' | 'LOW_STOCK' | 'PRE_ORDER' | 'OUT_OF_STOCK';
  harvestDate: string;
  publicRegion: string;
  imageUrl: string;
  createdAt: string;
  volumePricing?: { minQty: number; pricePerUnit: number }[];
  priceFloor?: number;
}

export interface ProductCatalogue {
  id: string;
  productId: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface Inventory {
  id: string;
  productId: string;
  lotId: string;
  reservedUnits: number;
  availableUnits: number;
  warehouseLocation: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  inventoryId: string;
  movementType: 'INTAKE' | 'RESERVATION' | 'DISPATCH' | 'ADJUSTMENT';
  units: number;
  referenceOrderId?: string;
  timestamp: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  lotId: string;
  unit: ProductUnit;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  buyerId: string;
  items: OrderItem[];
  subtotal: number;
  logisticsFee: number;
  platformFee: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'ALLOCATED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

export interface ProcurementRequest {
  id: string;
  buyerId: string;
  cropName: string;
  quantityKg: number;
  requiredDeliveryDate: string;
  maxPricePerKg: number;
  status: 'OPEN' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';
}

export interface CostEntry {
  id: string;
  lotId: string;
  farmerProcurementCost: number;
  gradingCost: number;
  packagingCost: number;
  storageCost: number;
  transportCost: number;
  paymentProcessingCost: number;
  platformCost: number;
  expectedSpoilageLossCost: number;
  riskReserveCost: number;
  otherAllocatedCost: number;
}

export interface MarginCalculation {
  id: string;
  costEntryId: string;
  trueLandedCost: number;
  targetMarginPercent: number; // e.g. 20 (for 20%)
  minimumSellingPrice: number;
  calculatedProfit: number;
  calculatedMarginPercent: number;
  isMarginSatisfied: boolean;
}

export interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  amount: number;
  status: 'UNPAID' | 'PAID' | 'OVERDUE';
  issuedAt: string;
  dueAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: 'ESCROW' | 'BANK_TRANSFER' | 'CARD';
  status: 'PENDING' | 'SETTLED' | 'FAILED';
  processedAt: string;
}

export interface Receipt {
  id: string;
  paymentId: string;
  receiptNumber: string;
  issuedAt: string;
}

export interface LogisticsOrder {
  id: string;
  orderId: string;
  carrierName: string;
  vehicleType: string;
  originHub: string;
  destinationHub: string;
  estArrival: string;
  status: 'SCHEDULED' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface Shipment {
  id: string;
  logisticsOrderId: string;
  trackingCode: string;
  currentPublicLocation: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  mimeType: string;
  fileSize: number;
  fileHash: string;
  scanStatus: 'PENDING' | 'CLEAN' | 'QUARANTINED';
  uploadedByUserId: string;
  uploadedAt: string;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  capabilities: string[];
  maxRiskLevel: RiskLevel;
  isActive: boolean;
  createdAt: string;
}

export interface AIRun {
  id: string;
  agentId: string;
  actionName: string;
  entityId: string;
  timestamp: string;
  executionStatus: 'SUCCESS' | 'BLOCKED' | 'FLAGGED';
}

export interface AIDecision {
  id: string;
  aiRunId: string;
  confidenceScore: number;
  reasoningSummary: string;
  policyId: string;
  recommendation: string;
  requiresHumanReview: boolean;
}

export interface AIApproval {
  id: string;
  requestId: string;
  requestedAction: string;
  riskLevel: RiskLevel;
  human1UserId: string;
  human1Timestamp: string;
  human2UserId?: string;
  human2Timestamp?: string;
  status: 'PENDING_HUMAN_1' | 'PENDING_HUMAN_2' | 'APPROVED' | 'DENIED';
  policyVersion: string;
  createdAt: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetEntity: string;
  details: string;
  ipAddress?: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  actorId: string;
  eventType: string;
  riskSeverity: RiskLevel;
  previousHash: string;
  eventHash: string;
}

export interface SystemConfiguration {
  minimumTargetMarginPercent: number;
  maxFileUploadBytes: number;
  allowedFileMimeTypes: string[];
  aiQualityConfidenceThreshold: number;
  requireTwoHumanApprovalForAgentCreation: boolean;
}

export type FeatureFlagStatus = 'ENABLED' | 'DISABLED' | 'BETA' | 'INTERNAL_ONLY' | 'MAINTENANCE';

export interface FeatureFlagSetting {
  id: string;
  name: string;
  key: string;
  description: string;
  status: FeatureFlagStatus;
  targetAudience: 'ALL' | 'ADMINS' | 'BUYERS' | 'SELLERS' | 'INTERNAL_TESTERS';
  updatedAt: string;
  updatedBy: string;
}

export interface AdminPreferences {
  language: string;
  timeZone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifyEmail: boolean;
  notifyInApp: boolean;
  defaultDashboardView: 'OVERVIEW' | 'PROCUREMENT' | 'MARKETPLACE' | 'SECURITY';
}

export interface AdminProfile {
  id: string;
  actorId: string; // Immutable underlying user ID
  photoUrl?: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username: string;
  email: string;
  pendingEmail?: string;
  emailVerified: boolean;
  phone: string;
  jobTitle: string;
  department: string;
  preferredLanguage: string;
  timeZone: string;
  preferences: AdminPreferences;
}

export interface TOTP2FAState {
  isEnabled: boolean;
  secretKey: string;
  qrCodeUrl: string;
  verifiedAt?: string;
  recoveryCodes: string[];
  backupCodesUsed: number;
}

export interface ActiveSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface AuthenticationActivity {
  id: string;
  timestamp: string;
  accountEmail: string;
  eventType: 
    | 'LOGIN_SUCCESS' 
    | 'LOGIN_FAILED' 
    | '2FA_SUCCESS' 
    | '2FA_FAILED' 
    | 'PASSWORD_CHANGED' 
    | 'EMAIL_CHANGED' 
    | '2FA_ENABLED' 
    | '2FA_DISABLED' 
    | 'SESSION_REVOKED' 
    | 'SECURITY_ALERT';
  device: string;
  ipAddress: string;
}

export interface NotificationRecipientRouting {
  id: string;
  category: 'SECURITY' | 'PROCUREMENT' | 'FINANCE' | 'ORDERS' | 'QUALITY' | 'SYSTEM';
  emailAddress: string;
  verificationStatus: 'PENDING_VERIFICATION' | 'VERIFIED';
  adminAlertEnabled: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface RegionalSettings {
  country: string; // Default: 'Barbados'
  currency: string; // Default: 'BBD'
  timeZone: string; // Default: 'America/Barbados'
  weightUnit: 'kg' | 'g' | 'tonnes';
  volumeUnit: 'litres' | 'crates' | 'boxes';
  distanceUnit: 'km' | 'miles';
  dateFormat: string;
}

export interface UploadSecuritySettings {
  maxFileSizeBytes: number;
  allowedImageTypes: string[];
  allowedDocumentTypes: string[];
  blockedExecutableExtensions: string[];
  virusScanningEnabled: boolean;
  malwareScanningEnabled: boolean;
  pdfIsolatedProcessing: boolean;
}

export interface MaintenanceModeConfig {
  enabled: boolean;
  message: string;
  expectedReturnTime?: string;
  allowAdminAccess: boolean;
}

export interface ConfigurationRevision {
  id: string;
  settingKey: string;
  previousValue: string;
  newValue: string;
  changedByUserId: string;
  timestamp: string;
  auditReason: string;
}

export interface FeatureFlags {
  AI_GRADING: boolean;
  GOOGLE_LOGIN: boolean;
  APPLE_LOGIN: boolean;
  ADVANCED_LOGISTICS: boolean;
  PUBLIC_TRACEABILITY: boolean;
  AUTO_PROCUREMENT: boolean;
}

export interface Settlement {
  id: string;
  farmerId: string;
  lotId: string;
  cropName: string;
  totalUnitsKg: number;
  grossAmount: number;
  platformDeduction: number;
  netPayout: number;
  status: 'ESCROW_HELD' | 'SETTLED' | 'PROCESSING';
  payoutDate: string;
}

// --- Dynamic File-Type Upload Security Policy ---
export type UploadSecurityRuleType = 'PROTECTED_BASELINE' | 'ADMINISTRATOR_ADDED';

export interface UploadSecurityRule {
  extension: string; // e.g. ".exe", ".php"
  status: 'BLOCKED' | 'ALLOWED' | 'QUARANTINED';
  ruleType: UploadSecurityRuleType;
  protectionLevel: 'PROTECTED' | 'ADMIN_EDITABLE';
  description: string;
  addedBy?: string;
  addedAt?: string;
}

export interface ApprovedUploadType {
  extension: string; // e.g. ".jpg", ".pdf"
  category: 'IMAGES' | 'DOCUMENTS';
  mimeType: string;
  maxSizeMB: number;
  virusScanRequired: boolean;
  contentValidationRequired: boolean;
  ocrSupported: boolean;
  quarantinePolicy: string;
  status: 'ACTIVE' | 'DISABLED';
}

export interface QuarantinedFile {
  id: string; // e.g. "qfile-001"
  userId: string;
  accountType: string;
  fileName: string;
  declaredMimeType: string;
  detectedMimeType: string;
  fileSizeBytes: number;
  quarantinedAt: string;
  quarantineReason: string;
  status: 'SECURITY_REVIEW_REQUIRED' | 'RELEASED' | 'PERMANENTLY_DELETED';
  ipAddress?: string;
}

export interface UploadSecurityEvent {
  id: string; // e.g. "usec-evt-001"
  timestamp: string;
  userId: string;
  accountType: string;
  fileName: string;
  declaredType: string;
  detectedType: string;
  fileSizeBytes: number;
  ipAddress: string;
  scanResult: 'ACCEPTED' | 'REJECTED' | 'QUARANTINED';
  reasonCode: 'PROHIBITED_EXTENSION' | 'MAGIC_BYTE_MISMATCH' | 'MALWARE_DETECTED' | 'OVERSIZED_UPLOAD' | 'MALFORMED_CONTENT' | 'SUCCESS';
  quarantineStatus: boolean;
}

export interface UploadSecurityMetrics {
  totalScanned: number;
  acceptedCount: number;
  rejectedCount: number;
  quarantinedCount: number;
  securityStatus: 'PROTECTED' | 'WARNING' | 'CRITICAL';
}

export type MarketingAudienceType = 'BUYER' | 'FARMER' | 'INTERESTED';
export type ConsentStatus = 'GRANTED' | 'WITHDRAWN' | 'EXPIRED';
export type SubscriptionStatus = 'SUBSCRIBED' | 'UNSUBSCRIBED' | 'BOUNCED';

export interface MarketingSubscriber {
  id: string; // e.g. "mkt-sub-001"
  email: string;
  emailNormalized: string; // lowercased & trimmed e.g. "hasan@example.com"
  audienceType: MarketingAudienceType;
  firstName?: string;
  lastName?: string;
  source: string; // e.g. "landing_page"
  sourcePage: string; // e.g. "homepage"
  consentStatus: ConsentStatus;
  consentType: string; // e.g. "EXPLICIT_OPT_IN"
  consentTimestamp: string;
  consentVersion: string; // e.g. "v1.0"
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
  unsubscribedAt?: string;
  unsubscribeToken: string; // Secure token for single-click unsubscribe
  lastMarketingActivityAt: string;
}

export interface MarketingConsentHistory {
  id: string;
  subscriberId: string;
  consentStatus: ConsentStatus;
  consentType: string;
  consentVersion: string;
  source: string;
  timestamp: string;
  ipAddress?: string;
}

export interface MarketingMetrics {
  totalSubscribers: number;
  activeSubscribers: number;
  buyerSubscribers: number;
  farmerSubscribers: number;
  generalSubscribers: number;
  unsubscribedCount: number;
}

export interface MarketplaceSettings {
  minimumRequiredMarginPercent: number; // Configurable target margin e.g. 20 (20%)
  defaultMOQKg: number;
  orderAutoApprovalThreshold: number;
  escrowHoldDays: number;
  updatedAt: string;
  updatedByUserId?: string;
}

/* ==========================================================================
   WHATSAPP BUSINESS AI COMMUNICATION CORE DOMAIN ENTITIES (SECTION 71)
   ========================================================================== */

export type WhatsAppAccountStatus = 
  | 'NOT_CONNECTED' 
  | 'CONNECTING' 
  | 'AUTHENTICATION_REQUIRED' 
  | 'CONNECTED' 
  | 'WEBHOOK_PENDING' 
  | 'WEBHOOK_VERIFICATION_REQUIRED' 
  | 'CONNECTION_ERROR' 
  | 'TOKEN_ERROR' 
  | 'PERMISSION_ERROR' 
  | 'DISCONNECTED' 
  | 'SUSPENDED';

export type WhatsAppConversationStatus = 'AI_ACTIVE' | 'AI_PAUSED' | 'HUMAN_ACTIVE' | 'ESCALATED' | 'CLOSED';
export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppMessageClassification = 
  | 'PRICE_REQUEST' 
  | 'PRODUCT_REQUEST' 
  | 'AVAILABILITY' 
  | 'ORDER' 
  | 'ORDER_CHANGE' 
  | 'DELIVERY' 
  | 'LOGISTICS' 
  | 'QUALITY' 
  | 'PAYMENT' 
  | 'INVOICE' 
  | 'COMPLAINT' 
  | 'DOCUMENT' 
  | 'GENERAL' 
  | 'UNKNOWN';

export type WhatsAppTemplateStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

export interface WhatsAppAccount {
  id: string; // e.g. "waba-001"
  phoneNumber: string; // e.g. "+1 (246) 555-AGRI"
  displayBusinessName: string; // "AgriTrust Wholesale"
  wabaAccountId: string;
  status: WhatsAppAccountStatus;
  connectedAt?: string;
  lastSyncAt: string;
  webhookUrl: string;
  webhookStatus: 'ACTIVE' | 'INACTIVE' | 'NOT_VERIFIED' | 'VERIFIED';
  messagesTodayCount: number;
  activeBuyerConvsCount: number;
  activeSellerConvsCount: number;
  humanEscalationsCount: number;
  aiAssistedConvsCount: number;
  pendingApprovalsCount: number;
  aiSystemPaused: boolean;
  lastHealthCheck?: string;
}

export interface WhatsAppContact {
  id: string; // e.g. "wa-cnt-001"
  whatsappId: string; // e.g. "12465550199@c.us"
  phoneNumber: string;
  name: string; // Internal display name e.g. "Buyer Representative" or "St. Philip Co-op Rep"
  accountType: 'BUYER' | 'SELLER' | 'UNKNOWN_CONTACT';
  linkedEntityId: string; // buyerId (e.g. "buy-001") or sellerId (e.g. "sel-001")
  organisationName: string;
  verifiedStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string; // e.g. "wa-msg-1001"
  conversationId: string; // e.g. "wa-conv-001"
  direction: WhatsAppMessageDirection;
  senderWhatsAppId: string;
  senderName: string;
  recipientWhatsAppId: string;
  text: string;
  timestamp: string;
  classification: WhatsAppMessageClassification;
  aiGenerated: boolean;
  aiAgentId?: string;
  aiAgentVersion?: string;
  humanApproved: boolean;
  approverId?: string;
  requiresHumanReview?: boolean;
  redactApplied?: boolean;
  deliveryStatus: 'RECEIVED' | 'PROCESSING' | 'DRAFTED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'REJECTED' | 'PENDING';
  toolCallsUsed?: string[];
  dataSourcesUsed?: string[];
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  environment?: 'development' | 'production' | 'test';
  provider?: 'development' | 'whatsapp_web' | 'meta_cloud';
  simulated?: boolean;
}

export interface WhatsAppConversation {
  id: string; // e.g. "wa-conv-001"
  contactId: string;
  accountType: 'BUYER' | 'SELLER';
  linkedEntityId: string;
  displayName?: string;
  organisationName?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  status: WhatsAppConversationStatus;
  aiEnabled: boolean;
  assignedHumanOperatorId?: string;
  assignedHumanOperatorName?: string;
  currentAssignedHumanId?: string;
  currentAssignedHumanName?: string;
  lastMessageText: string;
  lastMessageTimestamp?: string;
  lastActivityAt?: string;
  unreadCount: number;
  activeOrderOrLotId?: string;
  currentOrderId?: string;
  currentLotId?: string;
  currentProcurementId?: string;
  currentShipmentId?: string;
  negotiationState?: {
    commodityId?: string;
    commodityName?: string;
    requestedQuantityKg?: number;
    offeredPricePerKg?: number;
    approvedPriceFloorPerKg?: number;
    minimumTargetMarginPercent?: number;
    status: 'IDLE' | 'IN_PROGRESS' | 'FLOOR_BREACH_ESCALATED' | 'AGREED' | 'REJECTED';
  };
  humanTakeoverReason?: string;
  humanTakeoverStartedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppTemplate {
  id: string; // e.g. "wa-tpl-001"
  name: string; // e.g. "ORDER_CONFIRMATION"
  category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
  language: string; // e.g. "en_US"
  bodyText: string;
  variables: string[]; // e.g. ["order_id", "delivery_date"]
  status: WhatsAppTemplateStatus;
  createdAt: string;
  approvedAt?: string;
}

export interface WhatsAppWebhookEvent {
  id: string; // e.g. "wa-evt-001"
  eventTime: string;
  eventPayloadHash: string;
  signatureVerified: boolean;
  processed: boolean;
  messageId?: string;
}

export interface WhatsAppApproval {
  id: string; // e.g. "wa-appr-001"
  conversationId?: string;
  messageId?: string;
  proposalType?: 'PRICE_EXCEPTION' | 'LARGE_ORDER' | 'REFUND' | 'QUALITY_DISPUTE' | 'MARGIN_OVERRIDE';
  actionType?: string;
  requesterUserId?: string;
  proposedAction?: string;
  details?: string;
  requiredApproversCount?: number;
  approver1UserId?: string;
  approver1Timestamp?: string;
  human1ApproverId?: string;
  human1Decision?: 'APPROVED' | 'REJECTED';
  human1Timestamp?: string;
  approver2UserId?: string;
  approver2Timestamp?: string;
  human2ApproverId?: string;
  human2Decision?: 'APPROVED' | 'REJECTED';
  human2Timestamp?: string;
  executedAt?: string;
  status: 'PENDING_APPROVAL' | 'PENDING_HUMAN_1' | 'PENDING_HUMAN_2' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface WhatsAppHumanHandoff {
  id: string; // e.g. "wa-hdf-001"
  conversationId: string;
  triggerReason: string;
  escalatedAt: string;
  assignedOperatorId: string;
  assignedOperatorName: string;
  takeoverDurationSeconds?: number;
  resolvedAt?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

export interface WhatsAppAIAction {
  id: string; // e.g. "wa-act-001"
  agentId: string;
  agentVersion: string;
  conversationId: string;
  messageId: string;
  actionType: string; // e.g. "PARSE_REQUEST" | "QUOTE_PRICE" | "ESCALATE_HUMAN"
  dataSources: string[];
  toolsUsed: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  policyVersion: string;
}

export interface WhatsAppNegotiationPolicy {
  commodityId: string; // e.g. "cmd-tomatoes-01"
  commodityName: string; // "Vine Tomatoes Grade A"
  baseCostPerKg: number; // e.g. 1.70
  currentMarketRefPrice: number; // e.g. 2.50
  logisticsCostPerKg: number; // e.g. 0.15
  processingCostPerKg: number; // e.g. 0.05
  operationalOverheadPerKg: number; // e.g. 0.05
  minimumMarginPercent: number; // e.g. 20 (20%)
  absolutePriceFloorPerKg: number; // e.g. 2.18
  maxNegotiationRangePercent: number; // e.g. 10 (10%)
}


