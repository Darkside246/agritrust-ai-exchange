/**
 * AgriTrust SQLite Persistence Layer
 *
 * This module owns the real SQLite database. It is server-side ONLY and must
 * never be imported by browser code. db.ts uses the registry pattern to call
 * into this module from the Node server process.
 *
 * Schema: core business entities that must survive server restarts.
 * In-memory Maps in db.ts are now seeded FROM this layer, not from seed.ts.
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../../../agritrust.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema(): void {
  const d = db;

  d.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'BUYER',
      organisation_name TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS farmer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      full_name TEXT NOT NULL,
      farm_name TEXT,
      location TEXT,
      phone TEXT,
      trust_score REAL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS buyer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      organisation_name TEXT NOT NULL,
      contact_name TEXT,
      phone TEXT,
      address TEXT,
      buyer_type TEXT DEFAULT 'WHOLESALE',
      credit_limit REAL DEFAULT 0,
      verified INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      lot_id TEXT,
      name TEXT NOT NULL,
      variety TEXT,
      category TEXT,
      description TEXT,
      unit TEXT NOT NULL DEFAULT 'kg',
      price_per_unit REAL NOT NULL,
      moq_units REAL NOT NULL DEFAULT 1,
      available_units REAL NOT NULL DEFAULT 0,
      grade TEXT DEFAULT 'A',
      availability_status TEXT DEFAULT 'AVAILABLE',
      harvest_date TEXT,
      traceability_status TEXT DEFAULT 'VERIFIED',
      image_url TEXT,
      published INTEGER NOT NULL DEFAULT 1,
      farmer_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      buyer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      total REAL NOT NULL DEFAULT 0,
      item_count INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id),
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      subtotal REAL NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS supply_submissions (
      id TEXT PRIMARY KEY,
      farmer_id TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      variety TEXT,
      estimated_quantity REAL,
      unit TEXT DEFAULT 'kg',
      harvest_date TEXT,
      asking_price REAL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS procurement_requests (
      id TEXT PRIMARY KEY,
      submission_id TEXT,
      farmer_id TEXT NOT NULL,
      crop_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT DEFAULT 'kg',
      offered_price REAL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS whatsapp_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      sender_phone TEXT,
      sender_name TEXT,
      recipient_phone TEXT,
      text TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DELIVERED',
      provider TEXT NOT NULL DEFAULT 'development',
      environment TEXT NOT NULL DEFAULT 'development',
      provider_reference TEXT,
      ai_draft TEXT,
      ai_risk_level TEXT,
      requires_human_approval INTEGER DEFAULT 1,
      is_prompt_injection INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS whatsapp_conversations (
      id TEXT PRIMARY KEY,
      contact_phone TEXT NOT NULL,
      contact_name TEXT,
      account_type TEXT DEFAULT 'UNKNOWN_CONTACT',
      linked_entity_id TEXT,
      status TEXT DEFAULT 'ACTIVE',
      ai_enabled INTEGER DEFAULT 1,
      last_message_text TEXT,
      last_activity_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      actor TEXT,
      actor_role TEXT,
      action TEXT NOT NULL,
      entity_ref TEXT,
      details TEXT,
      immutable INTEGER NOT NULL DEFAULT 0,
      hash TEXT
    );

    CREATE TABLE IF NOT EXISTS lots (
      id TEXT PRIMARY KEY,
      crop_name TEXT NOT NULL,
      variety TEXT,
      farmer_id TEXT,
      harvest_date TEXT,
      quantity REAL,
      unit TEXT DEFAULT 'kg',
      grade TEXT DEFAULT 'A',
      status TEXT DEFAULT 'AVAILABLE',
      traceability_status TEXT DEFAULT 'VERIFIED',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_published ON products(published);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_conv ON whatsapp_messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events(timestamp);
    CREATE INDEX IF NOT EXISTS idx_supply_farmer ON supply_submissions(farmer_id);
  `);
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function dbGetUser(id: string) {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
}

export function dbGetUserByEmail(email: string) {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
}

export function dbCreateUser(u: {
  id: string; email: string; role: string;
  organisation_name?: string; password_hash?: string;
}) {
  getDb().prepare(`
    INSERT INTO users (id, email, role, organisation_name, password_hash)
    VALUES (@id, @email, @role, @organisation_name, @password_hash)
  `).run({ password_hash: null, organisation_name: null, ...u });
  return dbGetUser(u.id);
}

export function dbGetAllUsers() {
  return getDb().prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
}

// ─── Farmer Profiles ──────────────────────────────────────────────────────────

export function dbCreateFarmerProfile(p: {
  id: string; user_id: string; full_name: string;
  farm_name?: string; location?: string; phone?: string;
}) {
  getDb().prepare(`
    INSERT INTO farmer_profiles (id, user_id, full_name, farm_name, location, phone)
    VALUES (@id, @user_id, @full_name, @farm_name, @location, @phone)
  `).run({ farm_name: null, location: null, phone: null, ...p });
}

export function dbGetFarmerProfile(userId: string) {
  return getDb().prepare('SELECT * FROM farmer_profiles WHERE user_id = ?').get(userId) as any;
}

export function dbGetAllFarmerProfiles() {
  return getDb().prepare('SELECT * FROM farmer_profiles ORDER BY created_at DESC').all() as any[];
}

// ─── Buyer Profiles ───────────────────────────────────────────────────────────

export function dbCreateBuyerProfile(p: {
  id: string; user_id: string; organisation_name: string;
  contact_name?: string; phone?: string; address?: string;
}) {
  getDb().prepare(`
    INSERT INTO buyer_profiles (id, user_id, organisation_name, contact_name, phone, address)
    VALUES (@id, @user_id, @organisation_name, @contact_name, @phone, @address)
  `).run({ contact_name: null, phone: null, address: null, ...p });
}

export function dbGetBuyerProfile(userId: string) {
  return getDb().prepare('SELECT * FROM buyer_profiles WHERE user_id = ?').get(userId) as any;
}

export function dbGetAllBuyerProfiles() {
  return getDb().prepare('SELECT * FROM buyer_profiles ORDER BY created_at DESC').all() as any[];
}

// ─── Products ─────────────────────────────────────────────────────────────────

export function dbGetPublishedProducts(filters?: { category?: string; grade?: string; search?: string }) {
  let sql = 'SELECT * FROM products WHERE published = 1';
  const params: any[] = [];
  if (filters?.category && filters.category !== 'ALL') {
    sql += ' AND category = ?'; params.push(filters.category);
  }
  if (filters?.grade && filters.grade !== 'ALL') {
    sql += ' AND grade = ?'; params.push(filters.grade);
  }
  if (filters?.search) {
    sql += ' AND (name LIKE ? OR variety LIKE ?)';
    params.push(`%${filters.search}%`, `%${filters.search}%`);
  }
  sql += ' ORDER BY created_at DESC';
  return getDb().prepare(sql).all(...params) as any[];
}

export function dbGetProduct(id: string) {
  return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as any;
}

export function dbUpsertProduct(p: {
  id: string; lot_id?: string; name: string; variety?: string;
  category?: string; description?: string; unit: string;
  price_per_unit: number; moq_units: number; available_units: number;
  grade?: string; availability_status?: string; harvest_date?: string;
  traceability_status?: string; image_url?: string; published?: number;
  farmer_id?: string;
}) {
  const row = {
    lot_id: null, variety: null, category: null, description: null,
    grade: 'A', availability_status: 'AVAILABLE', harvest_date: null,
    traceability_status: 'VERIFIED', image_url: null, published: 1, farmer_id: null,
    ...p,
  };
  getDb().prepare(`
    INSERT INTO products (id,lot_id,name,variety,category,description,unit,
      price_per_unit,moq_units,available_units,grade,availability_status,
      harvest_date,traceability_status,image_url,published,farmer_id)
    VALUES (@id,@lot_id,@name,@variety,@category,@description,@unit,
      @price_per_unit,@moq_units,@available_units,@grade,@availability_status,
      @harvest_date,@traceability_status,@image_url,@published,@farmer_id)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name, variety=excluded.variety, category=excluded.category,
      description=excluded.description, unit=excluded.unit,
      price_per_unit=excluded.price_per_unit, moq_units=excluded.moq_units,
      available_units=excluded.available_units, grade=excluded.grade,
      availability_status=excluded.availability_status,
      harvest_date=excluded.harvest_date,
      traceability_status=excluded.traceability_status,
      image_url=excluded.image_url, published=excluded.published,
      updated_at=datetime('now')
  `).run(row);
}

export function dbGetAllProducts() {
  return getDb().prepare('SELECT * FROM products ORDER BY created_at DESC').all() as any[];
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function dbCreateOrder(o: {
  id: string; buyer_id: string; total: number;
  item_count: number; notes?: string;
}) {
  getDb().prepare(`
    INSERT INTO orders (id, buyer_id, total, item_count, notes)
    VALUES (@id, @buyer_id, @total, @item_count, @notes)
  `).run(o);
}

export function dbGetOrder(id: string) {
  return getDb().prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
}

export function dbGetBuyerOrders(buyerId: string) {
  return getDb().prepare('SELECT * FROM orders WHERE buyer_id = ? ORDER BY created_at DESC').all(buyerId) as any[];
}

export function dbGetAllOrders() {
  return getDb().prepare('SELECT * FROM orders ORDER BY created_at DESC').all() as any[];
}

export function dbUpdateOrderStatus(id: string, status: string) {
  getDb().prepare('UPDATE orders SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, id);
}

export function dbAddOrderItem(item: {
  id: string; order_id: string; product_id: string; product_name: string;
  quantity: number; unit: string; price_per_unit: number; subtotal: number;
}) {
  getDb().prepare(`
    INSERT INTO order_items (id,order_id,product_id,product_name,quantity,unit,price_per_unit,subtotal)
    VALUES (@id,@order_id,@product_id,@product_name,@quantity,@unit,@price_per_unit,@subtotal)
  `).run(item);
}

export function dbGetOrderItems(orderId: string) {
  return getDb().prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId) as any[];
}

// ─── Supply Submissions ───────────────────────────────────────────────────────

export function dbCreateSupplySubmission(s: {
  id: string; farmer_id: string; crop_name: string; variety?: string;
  estimated_quantity?: number; unit?: string; harvest_date?: string;
  asking_price?: number; notes?: string;
}) {
  getDb().prepare(`
    INSERT INTO supply_submissions (id,farmer_id,crop_name,variety,estimated_quantity,unit,harvest_date,asking_price,notes)
    VALUES (@id,@farmer_id,@crop_name,@variety,@estimated_quantity,@unit,@harvest_date,@asking_price,@notes)
  `).run({ variety: null, estimated_quantity: null, unit: 'kg', harvest_date: null, asking_price: null, notes: null, ...s });
}

export function dbGetSupplySubmissions(farmerId?: string) {
  if (farmerId) {
    return getDb().prepare('SELECT * FROM supply_submissions WHERE farmer_id = ? ORDER BY created_at DESC').all(farmerId) as any[];
  }
  return getDb().prepare('SELECT * FROM supply_submissions ORDER BY created_at DESC').all() as any[];
}

export function dbUpdateSupplySubmissionStatus(id: string, status: string) {
  getDb().prepare('UPDATE supply_submissions SET status = ?, updated_at = datetime(\'now\') WHERE id = ?').run(status, id);
}

// ─── WhatsApp Persistence ────────────────────────────────────────────────────

export function dbSaveWhatsAppMessage(m: {
  id: string; conversation_id: string; direction: string;
  sender_phone?: string; sender_name?: string; recipient_phone?: string;
  text: string; status?: string; provider: string; environment: string;
  provider_reference?: string; ai_draft?: string; ai_risk_level?: string;
  requires_human_approval?: number; is_prompt_injection?: number;
}) {
  getDb().prepare(`
    INSERT INTO whatsapp_messages
      (id,conversation_id,direction,sender_phone,sender_name,recipient_phone,
       text,status,provider,environment,provider_reference,ai_draft,
       ai_risk_level,requires_human_approval,is_prompt_injection)
    VALUES
      (@id,@conversation_id,@direction,@sender_phone,@sender_name,@recipient_phone,
       @text,@status,@provider,@environment,@provider_reference,@ai_draft,
       @ai_risk_level,@requires_human_approval,@is_prompt_injection)
    ON CONFLICT(id) DO NOTHING
  `).run({ status: 'DELIVERED', ...m });
}

export function dbGetWhatsAppMessages(conversationId: string) {
  return getDb().prepare('SELECT * FROM whatsapp_messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId) as any[];
}

export function dbGetAllWhatsAppMessages() {
  return getDb().prepare('SELECT * FROM whatsapp_messages ORDER BY created_at DESC LIMIT 200').all() as any[];
}

export function dbUpsertWhatsAppConversation(c: {
  id: string; contact_phone: string; contact_name?: string;
  account_type?: string; linked_entity_id?: string;
  last_message_text?: string; last_activity_at?: string;
}) {
  getDb().prepare(`
    INSERT INTO whatsapp_conversations
      (id,contact_phone,contact_name,account_type,linked_entity_id,last_message_text,last_activity_at)
    VALUES
      (@id,@contact_phone,@contact_name,@account_type,@linked_entity_id,@last_message_text,@last_activity_at)
    ON CONFLICT(id) DO UPDATE SET
      contact_name=excluded.contact_name,
      account_type=excluded.account_type,
      last_message_text=excluded.last_message_text,
      last_activity_at=excluded.last_activity_at
  `).run(c);
}

export function dbGetWhatsAppConversations() {
  return getDb().prepare('SELECT * FROM whatsapp_conversations ORDER BY last_activity_at DESC').all() as any[];
}

// ─── Audit ────────────────────────────────────────────────────────────────────

export function dbAppendAuditEvent(e: {
  id: string; actor?: string; actor_role?: string;
  action: string; entity_ref?: string; details?: string;
  immutable?: number; hash?: string;
}) {
  getDb().prepare(`
    INSERT INTO audit_events (id,actor,actor_role,action,entity_ref,details,immutable,hash)
    VALUES (@id,@actor,@actor_role,@action,@entity_ref,@details,@immutable,@hash)
  `).run({ actor: null, actor_role: null, entity_ref: null, details: null, immutable: 0, hash: null, ...e });
}

export function dbGetAuditEvents(limit = 500) {
  return getDb().prepare('SELECT * FROM audit_events ORDER BY timestamp DESC LIMIT ?').all(limit) as any[];
}

// ─── Seed helpers ─────────────────────────────────────────────────────────────

export function dbGetSetting(key: string): string | null {
  const row = getDb().prepare('SELECT value FROM admin_settings WHERE key = ?').get(key) as any;
  return row ? row.value : null;
}

export function dbSetSetting(key: string, value: string): void {
  getDb().prepare(`
    INSERT INTO admin_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')
  `).run(key, value);
}

export function dbGetAllSettings(): Record<string, string> {
  const rows = getDb().prepare('SELECT key, value FROM admin_settings').all() as any[];
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
}

export function dbRowExists(table: string, id: string): boolean {
  const r = getDb().prepare(`SELECT id FROM ${table} WHERE id = ?`).get(id);
  return !!r;
}

export function dbCountRows(table: string): number {
  const r = getDb().prepare(`SELECT COUNT(*) as n FROM ${table}`).get() as any;
  return r.n;
}

export { getDb };
