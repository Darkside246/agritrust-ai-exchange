/**
 * Persistence Registry — browser-safe interface
 *
 * better-sqlite3 uses Node built-ins (fs, path, native addons) and must never
 * enter the browser bundle. db.ts imports this file (safe), not sqliteDb.ts.
 * The real SQLite implementation is registered from server.ts at boot.
 */

export interface IPersistenceLayer {
  // Users
  getUser(id: string): any;
  getUserByEmail(email: string): any;
  createUser(u: { id: string; email: string; role: string; organisation_name?: string; password_hash?: string }): any;
  getAllUsers(): any[];

  // Farmer profiles
  createFarmerProfile(p: { id: string; user_id: string; full_name: string; farm_name?: string; location?: string; phone?: string }): void;
  getFarmerProfile(userId: string): any;
  getAllFarmerProfiles(): any[];

  // Buyer profiles
  createBuyerProfile(p: { id: string; user_id: string; organisation_name: string; contact_name?: string; phone?: string; address?: string }): void;
  getBuyerProfile(userId: string): any;
  getAllBuyerProfiles(): any[];

  // Products
  getPublishedProducts(filters?: { category?: string; grade?: string; search?: string }): any[];
  getProduct(id: string): any;
  upsertProduct(p: any): void;
  getAllProducts(): any[];

  // Orders
  createOrder(o: { id: string; buyer_id: string; total: number; item_count: number; notes?: string }): void;
  getOrder(id: string): any;
  getBuyerOrders(buyerId: string): any[];
  getAllOrders(): any[];
  updateOrderStatus(id: string, status: string): void;
  addOrderItem(item: any): void;
  getOrderItems(orderId: string): any[];

  // Supply submissions
  createSupplySubmission(s: any): void;
  getSupplySubmissions(farmerId?: string): any[];
  updateSupplySubmissionStatus(id: string, status: string): void;

  // WhatsApp
  saveWhatsAppMessage(m: any): void;
  getWhatsAppMessages(conversationId: string): any[];
  getAllWhatsAppMessages(): any[];
  upsertWhatsAppConversation(c: any): void;
  getWhatsAppConversations(): any[];

  // Audit
  appendAuditEvent(e: any): void;
  getAuditEvents(limit?: number): any[];

  // Helpers
  rowExists(table: string, id: string): boolean;
  countRows(table: string): number;
}

class NoopPersistence implements IPersistenceLayer {
  private warn(method: string) {
    // Only warn in server context; in browser this is expected and silent
    if (typeof window === 'undefined') {
      console.warn(`[AgriTrust] PersistenceRegistry: real SQLite not registered — ${method} is a no-op. Call registerPersistenceLayer() at server boot.`);
    }
  }
  getUser(id: string) { this.warn('getUser'); return null; }
  getUserByEmail(email: string) { this.warn('getUserByEmail'); return null; }
  createUser(u: any) { this.warn('createUser'); return u; }
  getAllUsers() { this.warn('getAllUsers'); return []; }
  createFarmerProfile(p: any) { this.warn('createFarmerProfile'); }
  getFarmerProfile(userId: string) { this.warn('getFarmerProfile'); return null; }
  getAllFarmerProfiles() { this.warn('getAllFarmerProfiles'); return []; }
  createBuyerProfile(p: any) { this.warn('createBuyerProfile'); }
  getBuyerProfile(userId: string) { this.warn('getBuyerProfile'); return null; }
  getAllBuyerProfiles() { this.warn('getAllBuyerProfiles'); return []; }
  getPublishedProducts(f?: any) { this.warn('getPublishedProducts'); return []; }
  getProduct(id: string) { this.warn('getProduct'); return null; }
  upsertProduct(p: any) { this.warn('upsertProduct'); }
  getAllProducts() { this.warn('getAllProducts'); return []; }
  createOrder(o: any) { this.warn('createOrder'); }
  getOrder(id: string) { this.warn('getOrder'); return null; }
  getBuyerOrders(buyerId: string) { this.warn('getBuyerOrders'); return []; }
  getAllOrders() { this.warn('getAllOrders'); return []; }
  updateOrderStatus(id: string, status: string) { this.warn('updateOrderStatus'); }
  addOrderItem(item: any) { this.warn('addOrderItem'); }
  getOrderItems(orderId: string) { this.warn('getOrderItems'); return []; }
  createSupplySubmission(s: any) { this.warn('createSupplySubmission'); }
  getSupplySubmissions(farmerId?: string) { this.warn('getSupplySubmissions'); return []; }
  updateSupplySubmissionStatus(id: string, status: string) { this.warn('updateSupplySubmissionStatus'); }
  saveWhatsAppMessage(m: any) { this.warn('saveWhatsAppMessage'); }
  getWhatsAppMessages(conversationId: string) { this.warn('getWhatsAppMessages'); return []; }
  getAllWhatsAppMessages() { this.warn('getAllWhatsAppMessages'); return []; }
  upsertWhatsAppConversation(c: any) { this.warn('upsertWhatsAppConversation'); }
  getWhatsAppConversations() { this.warn('getWhatsAppConversations'); return []; }
  appendAuditEvent(e: any) { this.warn('appendAuditEvent'); }
  getAuditEvents(limit?: number) { this.warn('getAuditEvents'); return []; }
  rowExists(table: string, id: string) { this.warn('rowExists'); return false; }
  countRows(table: string) { this.warn('countRows'); return 0; }
}

let layer: IPersistenceLayer = new NoopPersistence();

export function registerPersistenceLayer(impl: IPersistenceLayer): void {
  layer = impl;
}

export function getPersistence(): IPersistenceLayer {
  return layer;
}
