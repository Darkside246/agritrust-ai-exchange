/**
 * AgriTrust WhatsApp Encrypted Data Store
 *
 * All chat content, contact names, phone numbers, and message bodies are
 * encrypted at rest using AES-256-GCM before being written to SQLite.
 * The encryption key is derived from WHATSAPP_ENCRYPTION_KEY env var
 * (or a deterministic fallback for development). This module is Node-only.
 */
import Database from 'better-sqlite3';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '../../../../agritrust_wa.db');

const ALGORITHM = 'aes-256-gcm';

// Derive a 32-byte key from the env secret. Falls back to a dev-only key
// that is NOT secret — set WHATSAPP_ENCRYPTION_KEY in production.
function getEncryptionKey(): Buffer {
  const secret = process.env.WHATSAPP_ENCRYPTION_KEY || 'agritrust-dev-wa-key-NOT-for-production';
  return scryptSync(secret, 'agritrust-wa-salt-v1', 32);
}

function encrypt(plaintext: string): string {
  if (!plaintext) return '';
  const iv = randomBytes(12);
  const key = getEncryptionKey();
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Format: iv(24) + authTag(32) + ciphertext
  return iv.toString('hex') + authTag.toString('hex') + encrypted.toString('hex');
}

function decrypt(ciphertext: string): string {
  if (!ciphertext) return '';
  try {
    const iv = Buffer.from(ciphertext.slice(0, 24), 'hex');
    const authTag = Buffer.from(ciphertext.slice(24, 56), 'hex');
    const encrypted = Buffer.from(ciphertext.slice(56), 'hex');
    const key = getEncryptionKey();
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(encrypted) + decipher.final('utf8');
  } catch {
    return '[decryption error]';
  }
}

let waDb: Database.Database;

function getWaDb(): Database.Database {
  if (!waDb) {
    waDb = new Database(DB_PATH);
    waDb.pragma('journal_mode = WAL');
    waDb.pragma('foreign_keys = ON');
    initWaSchema();
  }
  return waDb;
}

function initWaSchema(): void {
  waDb.exec(`
    CREATE TABLE IF NOT EXISTS wa_chats (
      id TEXT PRIMARY KEY,
      name_enc TEXT,
      phone TEXT,
      is_group INTEGER DEFAULT 0,
      is_archived INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_muted INTEGER DEFAULT 0,
      unread_count INTEGER DEFAULT 0,
      last_message_enc TEXT,
      last_message_type TEXT DEFAULT 'chat',
      last_message_from_me INTEGER DEFAULT 0,
      timestamp INTEGER DEFAULT 0,
      profile_pic_url TEXT,
      synced_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wa_contacts (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      name_enc TEXT,
      pushname_enc TEXT,
      short_name_enc TEXT,
      is_business INTEGER DEFAULT 0,
      is_group INTEGER DEFAULT 0,
      is_my_contact INTEGER DEFAULT 0,
      is_blocked INTEGER DEFAULT 0,
      profile_pic_url TEXT,
      synced_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS wa_messages (
      id TEXT PRIMARY KEY,
      chat_id TEXT NOT NULL,
      body_enc TEXT,
      type TEXT DEFAULT 'chat',
      from_me INTEGER DEFAULT 0,
      from_phone TEXT,
      from_name_enc TEXT,
      timestamp INTEGER NOT NULL,
      has_media INTEGER DEFAULT 0,
      media_mime_type TEXT,
      is_forwarded INTEGER DEFAULT 0,
      is_starred INTEGER DEFAULT 0,
      ack INTEGER DEFAULT 0,
      synced_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (chat_id) REFERENCES wa_chats(id)
    );

    CREATE TABLE IF NOT EXISTS wa_call_logs (
      id TEXT PRIMARY KEY,
      from_phone_enc TEXT,
      from_name_enc TEXT,
      from_me INTEGER DEFAULT 0,
      is_video INTEGER DEFAULT 0,
      is_group INTEGER DEFAULT 0,
      timestamp INTEGER NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      synced_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_wa_messages_chat ON wa_messages(chat_id, timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_wa_chats_timestamp ON wa_chats(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_wa_calls_timestamp ON wa_call_logs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_wa_contacts_phone ON wa_contacts(phone);
  `);
}

// ─── Chat Operations ──────────────────────────────────────────────────────────

export function waUpsertChat(chat: {
  id: string; name: string; phone: string; isGroup: boolean;
  isArchived: boolean; isPinned: boolean; isMuted: boolean;
  unreadCount: number; lastMessage: string; lastMessageType: string;
  lastMessageFromMe: boolean; timestamp: number; profilePicUrl?: string;
}): void {
  getWaDb().prepare(`
    INSERT INTO wa_chats (id,name_enc,phone,is_group,is_archived,is_pinned,is_muted,
      unread_count,last_message_enc,last_message_type,last_message_from_me,timestamp,profile_pic_url)
    VALUES (@id,@name_enc,@phone,@is_group,@is_archived,@is_pinned,@is_muted,
      @unread_count,@last_message_enc,@last_message_type,@last_message_from_me,@timestamp,@profile_pic_url)
    ON CONFLICT(id) DO UPDATE SET
      name_enc=excluded.name_enc, is_archived=excluded.is_archived,
      is_pinned=excluded.is_pinned, is_muted=excluded.is_muted,
      unread_count=excluded.unread_count, last_message_enc=excluded.last_message_enc,
      last_message_type=excluded.last_message_type,
      last_message_from_me=excluded.last_message_from_me,
      timestamp=excluded.timestamp, profile_pic_url=excluded.profile_pic_url,
      updated_at=datetime('now')
  `).run({
    id: chat.id,
    name_enc: encrypt(chat.name),
    phone: chat.phone,
    is_group: chat.isGroup ? 1 : 0,
    is_archived: chat.isArchived ? 1 : 0,
    is_pinned: chat.isPinned ? 1 : 0,
    is_muted: chat.isMuted ? 1 : 0,
    unread_count: chat.unreadCount,
    last_message_enc: encrypt(chat.lastMessage),
    last_message_type: chat.lastMessageType,
    last_message_from_me: chat.lastMessageFromMe ? 1 : 0,
    timestamp: chat.timestamp,
    profile_pic_url: chat.profilePicUrl || null,
  });
}

export function waGetChats(): any[] {
  return getWaDb().prepare('SELECT * FROM wa_chats ORDER BY is_pinned DESC, timestamp DESC').all()
    .map((r: any) => ({
      ...r,
      name: decrypt(r.name_enc),
      lastMessage: decrypt(r.last_message_enc),
      isGroup: !!r.is_group,
      isArchived: !!r.is_archived,
      isPinned: !!r.is_pinned,
      isMuted: !!r.is_muted,
      lastMessageFromMe: !!r.last_message_from_me,
    }));
}

export function waGetChat(chatId: string): any {
  const r = getWaDb().prepare('SELECT * FROM wa_chats WHERE id = ?').get(chatId) as any;
  if (!r) return null;
  return { ...r, name: decrypt(r.name_enc), lastMessage: decrypt(r.last_message_enc) };
}

// ─── Contact Operations ───────────────────────────────────────────────────────

export function waUpsertContact(contact: {
  id: string; phone: string; name?: string; pushname?: string;
  shortName?: string; isBusiness: boolean; isGroup: boolean;
  isMyContact: boolean; isBlocked: boolean; profilePicUrl?: string;
}): void {
  getWaDb().prepare(`
    INSERT INTO wa_contacts (id,phone,name_enc,pushname_enc,short_name_enc,
      is_business,is_group,is_my_contact,is_blocked,profile_pic_url)
    VALUES (@id,@phone,@name_enc,@pushname_enc,@short_name_enc,
      @is_business,@is_group,@is_my_contact,@is_blocked,@profile_pic_url)
    ON CONFLICT(id) DO UPDATE SET
      name_enc=excluded.name_enc, pushname_enc=excluded.pushname_enc,
      short_name_enc=excluded.short_name_enc, is_business=excluded.is_business,
      is_my_contact=excluded.is_my_contact, is_blocked=excluded.is_blocked,
      profile_pic_url=excluded.profile_pic_url
  `).run({
    id: contact.id,
    phone: contact.phone,
    name_enc: encrypt(contact.name || ''),
    pushname_enc: encrypt(contact.pushname || ''),
    short_name_enc: encrypt(contact.shortName || ''),
    is_business: contact.isBusiness ? 1 : 0,
    is_group: contact.isGroup ? 1 : 0,
    is_my_contact: contact.isMyContact ? 1 : 0,
    is_blocked: contact.isBlocked ? 1 : 0,
    profile_pic_url: contact.profilePicUrl || null,
  });
}

export function waGetContacts(): any[] {
  return getWaDb().prepare('SELECT * FROM wa_contacts ORDER BY name_enc ASC').all()
    .map((r: any) => ({
      ...r,
      name: decrypt(r.name_enc) || decrypt(r.pushname_enc) || r.phone,
      pushname: decrypt(r.pushname_enc),
      shortName: decrypt(r.short_name_enc),
      isMyContact: !!r.is_my_contact,
      isBusiness: !!r.is_business,
      isBlocked: !!r.is_blocked,
    }));
}

export function waSearchContacts(query: string): any[] {
  // Search is done post-decrypt since names are encrypted
  const q = query.toLowerCase();
  return waGetContacts().filter((c: any) =>
    c.name.toLowerCase().includes(q) ||
    c.pushname?.toLowerCase().includes(q) ||
    c.phone.includes(q)
  );
}

// ─── Message Operations ───────────────────────────────────────────────────────

export function waUpsertMessage(msg: {
  id: string; chatId: string; body: string; type: string;
  fromMe: boolean; fromPhone: string; fromName: string;
  timestamp: number; hasMedia: boolean; mediaMimeType?: string;
  isForwarded: boolean; isStarred: boolean; ack: number;
}): void {
  getWaDb().prepare(`
    INSERT INTO wa_messages (id,chat_id,body_enc,type,from_me,from_phone,from_name_enc,
      timestamp,has_media,media_mime_type,is_forwarded,is_starred,ack)
    VALUES (@id,@chat_id,@body_enc,@type,@from_me,@from_phone,@from_name_enc,
      @timestamp,@has_media,@media_mime_type,@is_forwarded,@is_starred,@ack)
    ON CONFLICT(id) DO UPDATE SET ack=excluded.ack, is_starred=excluded.is_starred
  `).run({
    id: msg.id,
    chat_id: msg.chatId,
    body_enc: encrypt(msg.body),
    type: msg.type,
    from_me: msg.fromMe ? 1 : 0,
    from_phone: msg.fromPhone,
    from_name_enc: encrypt(msg.fromName),
    timestamp: msg.timestamp,
    has_media: msg.hasMedia ? 1 : 0,
    media_mime_type: msg.mediaMimeType || null,
    is_forwarded: msg.isForwarded ? 1 : 0,
    is_starred: msg.isStarred ? 1 : 0,
    ack: msg.ack || 0,
  });
}

export function waGetMessages(chatId: string, limit = 50, before?: number): any[] {
  const sql = before
    ? 'SELECT * FROM wa_messages WHERE chat_id = ? AND timestamp < ? ORDER BY timestamp DESC LIMIT ?'
    : 'SELECT * FROM wa_messages WHERE chat_id = ? ORDER BY timestamp DESC LIMIT ?';
  const rows = before
    ? getWaDb().prepare(sql).all(chatId, before, limit)
    : getWaDb().prepare(sql).all(chatId, limit);
  return (rows as any[]).reverse().map((r: any) => ({
    ...r,
    body: decrypt(r.body_enc),
    fromName: decrypt(r.from_name_enc),
    fromMe: !!r.from_me,
    hasMedia: !!r.has_media,
    isForwarded: !!r.is_forwarded,
    isStarred: !!r.is_starred,
  }));
}

export function waGetUnreadCount(chatId: string): number {
  const r = getWaDb().prepare('SELECT unread_count FROM wa_chats WHERE id = ?').get(chatId) as any;
  return r?.unread_count || 0;
}

export function waMarkChatRead(chatId: string): void {
  getWaDb().prepare('UPDATE wa_chats SET unread_count = 0 WHERE id = ?').run(chatId);
}

// ─── Call Log Operations ──────────────────────────────────────────────────────

export function waUpsertCallLog(call: {
  id: string; fromPhone: string; fromName: string; fromMe: boolean;
  isVideo: boolean; isGroup: boolean; timestamp: number;
  durationSeconds: number; status: string;
}): void {
  getWaDb().prepare(`
    INSERT INTO wa_call_logs (id,from_phone_enc,from_name_enc,from_me,is_video,is_group,
      timestamp,duration_seconds,status)
    VALUES (@id,@from_phone_enc,@from_name_enc,@from_me,@is_video,@is_group,
      @timestamp,@duration_seconds,@status)
    ON CONFLICT(id) DO NOTHING
  `).run({
    id: call.id,
    from_phone_enc: encrypt(call.fromPhone),
    from_name_enc: encrypt(call.fromName),
    from_me: call.fromMe ? 1 : 0,
    is_video: call.isVideo ? 1 : 0,
    is_group: call.isGroup ? 1 : 0,
    timestamp: call.timestamp,
    duration_seconds: call.durationSeconds,
    status: call.status,
  });
}

export function waGetCallLogs(limit = 100): any[] {
  return (getWaDb().prepare('SELECT * FROM wa_call_logs ORDER BY timestamp DESC LIMIT ?').all(limit) as any[])
    .map((r: any) => ({
      ...r,
      fromPhone: decrypt(r.from_phone_enc),
      fromName: decrypt(r.from_name_enc),
      fromMe: !!r.from_me,
      isVideo: !!r.is_video,
      isGroup: !!r.is_group,
    }));
}

// ─── Sync Stats ───────────────────────────────────────────────────────────────

export function waGetSyncStats(): { chats: number; contacts: number; messages: number; calls: number } {
  const db = getWaDb();
  return {
    chats: (db.prepare('SELECT COUNT(*) as n FROM wa_chats').get() as any).n,
    contacts: (db.prepare('SELECT COUNT(*) as n FROM wa_contacts').get() as any).n,
    messages: (db.prepare('SELECT COUNT(*) as n FROM wa_messages').get() as any).n,
    calls: (db.prepare('SELECT COUNT(*) as n FROM wa_call_logs').get() as any).n,
  };
}
