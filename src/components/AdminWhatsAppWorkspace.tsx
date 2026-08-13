import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, Phone, Users, Search, Send, Plus, ArrowLeft,
  Smartphone, Bot, UserCheck, AlertTriangle, ShieldCheck,
  PauseCircle, PlayCircle, RefreshCw, Clock, Video,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Check, CheckCheck,
  ChevronDown, Circle, MoreVertical, X, Mic, Image, Paperclip
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WaChat {
  id: string; name: string; phone: string; isGroup: boolean;
  isArchived: boolean; isPinned: boolean; isMuted: boolean;
  unreadCount: number; lastMessage: string; lastMessageType: string;
  lastMessageFromMe: boolean; timestamp: number; profilePicUrl?: string;
}
interface WaContact {
  id: string; phone: string; name: string; pushname: string;
  isBusiness: boolean; isMyContact: boolean; isBlocked: boolean;
  profilePicUrl?: string;
}
interface WaMessage {
  id: string; chat_id: string; body: string; type: string;
  fromMe: boolean; fromPhone: string; fromName: string;
  timestamp: number; hasMedia: boolean; ack: number;
}
interface WaCall {
  id: string; fromPhone: string; fromName: string;
  fromMe: boolean; isVideo: boolean; isGroup: boolean;
  timestamp: number; durationSeconds: number; status: string;
}
interface SyncStats { chats: number; contacts: number; messages: number; calls: number; }
interface SessionMeta {
  status: string; provider: string; environment: string;
  accountName?: string; maskedPhone?: string; connectedAt?: string;
  qrCodeDataUrl?: string; errorMessage?: string;
}

type Tab = 'chats' | 'contacts' | 'calls' | 'ai';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(ts: number): string {
  if (!ts) return '';
  const d = new Date(ts * 1000);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
}

function Avatar({ name, pic, size = 40, isGroup }: { name: string; pic?: string; size?: number; isGroup?: boolean }) {
  if (pic) return <img src={pic} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  const colors = ['#25D366', '#128C7E', '#075E54', '#34B7F1', '#ECE5DD'];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>
      {isGroup ? '👥' : initials(name)}
    </div>
  );
}

function AckIcon({ ack, fromMe }: { ack: number; fromMe: boolean }) {
  if (!fromMe) return null;
  if (ack >= 3) return <CheckCheck size={14} style={{ color: '#34B7F1' }} />;
  if (ack >= 2) return <CheckCheck size={14} style={{ color: '#667781' }} />;
  return <Check size={14} style={{ color: '#667781' }} />;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ConnectionBanner({ session, onConnect, onDisconnect, onSync, syncing }: {
  session: SessionMeta;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  syncing: boolean;
}) {
  const connected = session.status === 'CONNECTED';
  const qr = session.status === 'QR_REQUIRED';
  const starting = session.status === 'STARTING' || session.status === 'AUTHENTICATING';

  if (connected) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', backgroundColor: '#e7f8ee', borderBottom: '1px solid #b7e4c7' }}>
      <Circle size={8} fill="#25D366" color="#25D366" />
      <span style={{ fontSize: '0.8rem', color: '#155724', fontWeight: 600 }}>{session.accountName || 'Connected'}</span>
      <span style={{ fontSize: '0.75rem', color: '#6c757d' }}>{session.maskedPhone}</span>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
        <button onClick={onSync} disabled={syncing} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: '1px solid #25D366', borderRadius: 99, background: 'transparent', color: '#25D366', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <RefreshCw size={12} className={syncing ? 'spin' : ''} /> {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
        <button onClick={onDisconnect} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', border: '1px solid #dc3545', borderRadius: 99, background: 'transparent', color: '#dc3545', cursor: 'pointer' }}>Disconnect</button>
      </div>
    </div>
  );

  if (qr && session.qrCodeDataUrl) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', gap: '1rem' }}>
      <div style={{ fontWeight: 700, fontSize: '1rem' }}>Scan with WhatsApp on your phone</div>
      <img src={session.qrCodeDataUrl} alt="QR Code" style={{ width: 200, height: 200, border: '3px solid #25D366', borderRadius: 12 }} />
      <div style={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center' }}>Open WhatsApp → ⋮ → Linked Devices → Link a Device</div>
    </div>
  );

  if (starting) return (
    <div style={{ padding: '1rem', textAlign: 'center', color: '#3b82f6', fontSize: '0.875rem' }}>
      ⏳ {session.status === 'STARTING' ? 'Launching browser session (15–30s on first run)…' : 'Authenticating…'}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', gap: '1rem', flex: 1 }}>
      <Smartphone size={48} color="#25D366" />
      <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>Connect WhatsApp</div>
      <div style={{ color: '#6c757d', fontSize: '0.875rem', textAlign: 'center', maxWidth: 280 }}>Link your WhatsApp account to see chats, contacts, calls and use AI agents.</div>
      <button onClick={onConnect} style={{ padding: '0.75rem 2rem', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.9375rem' }}>
        Connect WhatsApp Web
      </button>
    </div>
  );
}

function ChatList({ chats, selected, onSelect, search, onSearch }: {
  chats: WaChat[]; selected: string | null;
  onSelect: (id: string) => void;
  search: string; onSearch: (q: string) => void;
}) {
  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0.5rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0f2f5', borderRadius: 8, padding: '0.4rem 0.75rem' }}>
          <Search size={16} color="#667781" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search chats…"
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.875rem', color: '#111b21' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#667781', fontSize: '0.8125rem' }}>No chats yet. Connect WhatsApp to load them.</div>}
        {filtered.map(chat => (
          <div key={chat.id} onClick={() => onSelect(chat.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', cursor: 'pointer', backgroundColor: selected === chat.id ? '#f0f2f5' : 'transparent', borderBottom: '1px solid #f0f2f5', transition: 'background 0.1s' }}>
            <Avatar name={chat.name} pic={chat.profilePicUrl} isGroup={chat.isGroup} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111b21', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>{chat.name}</span>
                <span style={{ fontSize: '0.7rem', color: chat.unreadCount > 0 ? '#25D366' : '#667781', flexShrink: 0 }}>{fmtTime(chat.timestamp)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.15rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', overflow: 'hidden' }}>
                  {chat.lastMessageFromMe && <AckIcon ack={2} fromMe />}
                  <span style={{ fontSize: '0.8125rem', color: '#667781', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {chat.lastMessageType === 'image' ? '📷 Photo' : chat.lastMessageType === 'audio' ? '🎵 Audio' : chat.lastMessageType === 'video' ? '📹 Video' : chat.lastMessage || ' '}
                  </span>
                </div>
                {chat.unreadCount > 0 && (
                  <span style={{ backgroundColor: '#25D366', color: '#fff', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, padding: '0.1rem 0.4rem', flexShrink: 0 }}>{chat.unreadCount}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatWindow({ chat, messages, onSend, onBack, aiPaused }: {
  chat: WaChat; messages: WaMessage[];
  onSend: (text: string) => Promise<void>;
  onBack: () => void;
  aiPaused: boolean;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try { await onSend(text.trim()); setText(''); } finally { setSending(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#efeae2' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1rem', backgroundColor: '#f0f2f5', borderBottom: '1px solid #d9dbdf' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}><ArrowLeft size={20} color="#54656f" /></button>
        <Avatar name={chat.name} pic={chat.profilePicUrl} size={38} isGroup={chat.isGroup} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#111b21' }}>{chat.name}</div>
          <div style={{ fontSize: '0.75rem', color: '#667781' }}>{chat.isGroup ? 'Group' : chat.phone}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Phone size={20} color="#54656f" style={{ cursor: 'pointer' }} />
          <Video size={20} color="#54656f" style={{ cursor: 'pointer' }} />
          <MoreVertical size={20} color="#54656f" style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#667781', fontSize: '0.8125rem', marginTop: '2rem' }}>No messages yet.</div>
        )}
        {messages.map(msg => {
          const isMine = msg.fromMe;
          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '65%', padding: '0.5rem 0.75rem 0.3rem',
                backgroundColor: isMine ? '#d9fdd3' : '#fff',
                borderRadius: isMine ? '8px 2px 8px 8px' : '2px 8px 8px 8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}>
                {!isMine && msg.chat_id?.endsWith('@g.us') && (
                  <div style={{ fontSize: '0.75rem', color: '#25D366', fontWeight: 600, marginBottom: '0.2rem' }}>{msg.fromName || msg.fromPhone}</div>
                )}
                {msg.type === 'image' ? (
                  <div style={{ fontSize: '0.8125rem', color: '#667781' }}>📷 Photo</div>
                ) : msg.type === 'audio' ? (
                  <div style={{ fontSize: '0.8125rem', color: '#667781' }}>🎵 Audio message</div>
                ) : msg.type === 'video' ? (
                  <div style={{ fontSize: '0.8125rem', color: '#667781' }}>📹 Video</div>
                ) : msg.type === 'document' ? (
                  <div style={{ fontSize: '0.8125rem', color: '#667781' }}>📎 Document</div>
                ) : (
                  <div style={{ fontSize: '0.9375rem', color: '#111b21', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.body}</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                  <span style={{ fontSize: '0.675rem', color: '#667781' }}>{fmtTime(msg.timestamp)}</span>
                  <AckIcon ack={msg.ack} fromMe={msg.fromMe} />
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {aiPaused && <div style={{ fontSize: '0.7rem', color: '#dc3545', padding: '0.2rem 0.5rem', backgroundColor: 'rgba(220,53,69,0.1)', borderRadius: 99 }}>AI Paused</div>}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fff', borderRadius: 24, padding: '0.5rem 1rem' }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message"
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9375rem', color: '#111b21' }}
          />
        </div>
        <button onClick={handleSend} disabled={!text.trim() || sending}
          style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: text.trim() ? '#25D366' : '#aaa', border: 'none', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
          {sending ? <RefreshCw size={18} color="#fff" /> : <Send size={18} color="#fff" />}
        </button>
      </div>
    </div>
  );
}

function ContactsList({ contacts, search, onSearch, onNewChat }: {
  contacts: WaContact[]; search: string;
  onSearch: (q: string) => void;
  onNewChat: (phone: string) => void;
}) {
  const filtered = contacts.filter(c =>
    c.isMyContact &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  );
  const groups: Record<string, WaContact[]> = {};
  filtered.forEach(c => { const l = (c.name[0] || '#').toUpperCase(); groups[l] = [...(groups[l] || []), c]; });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '0.5rem 0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f0f2f5', borderRadius: 8, padding: '0.4rem 0.75rem' }}>
          <Search size={16} color="#667781" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search contacts…"
            style={{ border: 'none', background: 'transparent', outline: 'none', flex: 1, fontSize: '0.875rem', color: '#111b21' }} />
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {contacts.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#667781', fontSize: '0.8125rem' }}>No contacts. Sync after connecting WhatsApp.</div>}
        {Object.keys(groups).sort().map(letter => (
          <div key={letter}>
            <div style={{ padding: '0.3rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#25D366', backgroundColor: '#f8f8f8' }}>{letter}</div>
            {groups[letter].map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', borderBottom: '1px solid #f0f2f5', cursor: 'pointer' }}
                onClick={() => onNewChat(c.phone)}>
                <Avatar name={c.name} pic={c.profilePicUrl} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111b21' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#667781' }}>+{c.phone}</div>
                </div>
                {c.isBusiness && <span style={{ marginLeft: 'auto', fontSize: '0.65rem', backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '0.1rem 0.4rem', borderRadius: 99 }}>Business</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function CallLogsList({ calls }: { calls: WaCall[] }) {
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {calls.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#667781', fontSize: '0.8125rem' }}>No call logs yet.</div>}
      {calls.map(call => {
        const Icon = call.fromMe ? PhoneOutgoing : call.status === 'missed' ? PhoneMissed : PhoneIncoming;
        const color = call.status === 'missed' ? '#dc3545' : call.fromMe ? '#25D366' : '#128C7E';
        return (
          <div key={call.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid #f0f2f5' }}>
            <Avatar name={call.fromName || call.fromPhone} size={42} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111b21' }}>{call.fromName || `+${call.fromPhone}`}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <Icon size={13} color={color} />
                <span style={{ fontSize: '0.75rem', color }}>
                  {call.isVideo ? 'Video' : 'Voice'} {call.fromMe ? 'call' : call.status === 'missed' ? 'missed' : 'call'}
                </span>
                {call.durationSeconds > 0 && <span style={{ fontSize: '0.75rem', color: '#667781' }}>· {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#667781' }}>{fmtTime(call.timestamp)}</div>
              {call.isVideo ? <Video size={14} color="#667781" /> : <Phone size={14} color="#667781" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function NewChatModal({ onSend, onClose }: { onSend: (phone: string, text: string) => Promise<void>; onClose: () => void }) {
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('Hello!');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handle = async () => {
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 7) { setError('Enter a valid phone number with country code'); return; }
    setSending(true);
    try { await onSend(clean, text); onClose(); }
    catch (err: any) { setError(err.message); }
    finally { setSending(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '1.5rem', width: 360, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>New Chat</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#667781', display: 'block', marginBottom: '0.3rem' }}>Phone Number (with country code)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 12465550199"
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d9dbdf', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#667781', display: 'block', marginBottom: '0.3rem' }}>First Message</label>
          <input value={text} onChange={e => setText(e.target.value)} placeholder="Hello!"
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #d9dbdf', borderRadius: 8, fontSize: '0.9rem', boxSizing: 'border-box' }} />
        </div>
        {error && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{error}</div>}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem', border: '1px solid #d9dbdf', borderRadius: 8, background: 'none', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handle} disabled={sending || !phone.trim()} style={{ padding: '0.5rem 1.25rem', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>
            {sending ? 'Sending…' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminWhatsAppWorkspace: React.FC = () => {
  const [tab, setTab] = useState<Tab>('chats');
  const [session, setSession] = useState<SessionMeta>({ status: 'NOT_CONNECTED', provider: 'whatsapp_web', environment: 'development' });
  const [chats, setChats] = useState<WaChat[]>([]);
  const [contacts, setContacts] = useState<WaContact[]>([]);
  const [calls, setCalls] = useState<WaCall[]>([]);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [aiPaused, setAiPaused] = useState(false);
  const [stats, setStats] = useState<SyncStats>({ chats: 0, contacts: 0, messages: 0, calls: 0 });
  const [showNewChat, setShowNewChat] = useState(false);
  const [polling, setPolling] = useState(false);

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;

  // ── Data loaders ──────────────────────────────────────────────────────────

  const loadSession = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/status');
      const d = await r.json();
      if (d.success) setSession(d.session);
    } catch {}
  }, []);

  const loadChats = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/chats');
      const d = await r.json();
      if (d.success) setChats(d.chats || []);
    } catch {}
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/contacts');
      const d = await r.json();
      if (d.success) setContacts(d.contacts || []);
    } catch {}
  }, []);

  const loadCalls = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/call-logs');
      const d = await r.json();
      if (d.success) setCalls(d.calls || []);
    } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/sync-stats');
      const d = await r.json();
      if (d.success) setStats(d.stats);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      const r = await fetch(`/api/admin/whatsapp/chats/${encodeURIComponent(chatId)}/messages`);
      const d = await r.json();
      if (d.success) setMessages(d.messages || []);
    } catch {}
  }, []);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    loadSession();
    loadChats();
    loadContacts();
    loadCalls();
    loadStats();
  }, []);

  // Poll session status while not connected or QR shown
  useEffect(() => {
    if (session.status === 'CONNECTED') { setPolling(false); return; }
    if (!['STARTING', 'QR_REQUIRED', 'AUTHENTICATING'].includes(session.status)) return;
    setPolling(true);
    const iv = setInterval(loadSession, 2000);
    return () => clearInterval(iv);
  }, [session.status]);

  // When just connected, auto-sync
  useEffect(() => {
    if (session.status === 'CONNECTED') {
      loadChats(); loadContacts(); loadCalls(); loadStats();
    }
  }, [session.status]);

  // Poll for new messages in selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    loadMessages(selectedChatId);
    const iv = setInterval(() => loadMessages(selectedChatId), 3000);
    return () => clearInterval(iv);
  }, [selectedChatId]);

  // Poll chat list for unread counts
  useEffect(() => {
    if (session.status !== 'CONNECTED') return;
    const iv = setInterval(loadChats, 5000);
    return () => clearInterval(iv);
  }, [session.status]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleConnect = async () => {
    try {
      const r = await fetch('/api/admin/whatsapp/connect', { method: 'POST', headers: { 'x-admin-id': 'sys-admin' } });
      const d = await r.json();
      if (d.success) { setSession(d.session); setPolling(true); }
    } catch { alert('Backend server not running on port 5000'); }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect WhatsApp?\n\nAll synced data is kept.')) return;
    const r = await fetch('/api/admin/whatsapp/disconnect', { method: 'POST', headers: { 'x-admin-id': 'sys-admin' } });
    const d = await r.json();
    if (d.success) setSession(d.session);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const r = await fetch('/api/admin/whatsapp/sync', { method: 'POST' });
      const d = await r.json();
      if (d.success) { await loadChats(); await loadContacts(); await loadCalls(); await loadStats(); }
    } catch { alert('Sync failed. Is the session connected?'); }
    finally { setSyncing(false); }
  };

  const handleSend = async (text: string) => {
    if (!selectedChatId) return;
    await fetch(`/api/admin/whatsapp/chats/${encodeURIComponent(selectedChatId)}/send`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }),
    });
    await loadMessages(selectedChatId);
    await loadChats();
  };

  const handleNewChat = async (phone: string, text: string) => {
    const r = await fetch('/api/admin/whatsapp/new-chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, text }),
    });
    const d = await r.json();
    if (!d.success) throw new Error(d.error);
    await loadChats();
    // Find or create the chat in our list
    const chatId = `${phone}@c.us`;
    setSelectedChatId(chatId);
    setTab('chats');
  };

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setSearch('');
  };

  const handleEmergencyToggle = async () => {
    const route = aiPaused ? '/api/admin/whatsapp/resume-ai' : '/api/admin/whatsapp/emergency-stop';
    const r = await fetch(route, { method: 'POST', headers: { 'x-admin-id': 'sys-admin' } });
    const d = await r.json();
    setAiPaused(d.aiSystemPaused ?? !aiPaused);
  };

  // ── Layout ────────────────────────────────────────────────────────────────

  const isConnected = session.status === 'CONNECTED';
  const hasData = chats.length > 0 || stats.chats > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.25rem', backgroundColor: '#128C7E', color: '#fff', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Smartphone size={22} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem' }}>WhatsApp</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>DEVELOPMENT MODE · {session.status}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isConnected && (
            <>
              <div style={{ fontSize: '0.7rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 99, padding: '0.2rem 0.6rem' }}>
                💬 {stats.chats} · 👥 {stats.contacts} · 📨 {stats.messages}
              </div>
              <button onClick={handleEmergencyToggle}
                style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.5)', background: aiPaused ? 'rgba(255,255,255,0.2)' : 'transparent', color: '#fff', cursor: 'pointer' }}>
                {aiPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                {aiPaused ? ' Resume AI' : ' Pause AI'}
              </button>
              <button onClick={() => setShowNewChat(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: 99, border: '1px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer' }}>
                <Plus size={14} /> New Chat
              </button>
            </>
          )}
        </div>
      </div>

      {/* Connection banner / QR */}
      {(!isConnected || (!hasData && isConnected)) && (
        <ConnectionBanner session={session} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} syncing={syncing} />
      )}

      {/* Main content - only show when connected and has data */}
      {(isConnected || hasData) && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left sidebar */}
          <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #d9dbdf', overflow: 'hidden' }}>

            {/* Connection banner if connected */}
            {isConnected && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', backgroundColor: '#e7f8ee', borderBottom: '1px solid #b7e4c7', flexShrink: 0 }}>
                <Circle size={7} fill="#25D366" color="#25D366" />
                <span style={{ fontSize: '0.75rem', color: '#155724', fontWeight: 600 }}>{session.accountName}</span>
                <span style={{ fontSize: '0.7rem', color: '#6c757d' }}>{session.maskedPhone}</span>
                <button onClick={handleSync} disabled={syncing} style={{ marginLeft: 'auto', fontSize: '0.7rem', padding: '0.15rem 0.5rem', border: '1px solid #25D366', borderRadius: 99, background: 'none', color: '#25D366', cursor: 'pointer' }}>
                  <RefreshCw size={11} /> {syncing ? '…' : 'Sync'}
                </button>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f2f5', flexShrink: 0 }}>
              {([
                { id: 'chats', icon: <MessageSquare size={18} />, label: 'Chats' },
                { id: 'contacts', icon: <Users size={18} />, label: 'Contacts' },
                { id: 'calls', icon: <Phone size={18} />, label: 'Calls' },
                { id: 'ai', icon: <Bot size={18} />, label: 'AI' },
              ] as const).map(t => (
                <button key={t.id} onClick={() => setTab(t.id as Tab)}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', padding: '0.6rem 0', border: 'none', background: 'none', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid #25D366' : '2px solid transparent', color: tab === t.id ? '#25D366' : '#667781', fontSize: '0.65rem', fontWeight: tab === t.id ? 700 : 400, transition: 'all 0.15s' }}>
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {tab === 'chats' && (
                <ChatList chats={chats} selected={selectedChatId} onSelect={handleSelectChat} search={search} onSearch={setSearch} />
              )}
              {tab === 'contacts' && (
                <ContactsList contacts={contacts} search={contactSearch} onSearch={setContactSearch}
                  onNewChat={(phone) => { setShowNewChat(true); }} />
              )}
              {tab === 'calls' && (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.875rem', color: '#111b21', borderBottom: '1px solid #f0f2f5' }}>Recent Calls</div>
                  <CallLogsList calls={calls} />
                </div>
              )}
              {tab === 'ai' && (
                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#111b21' }}>AI Agent Status</div>
                  <div style={{ padding: '0.75rem', backgroundColor: aiPaused ? '#fff3cd' : '#e7f8ee', borderRadius: 8, border: `1px solid ${aiPaused ? '#ffc107' : '#25D366'}` }}>
                    <div style={{ fontWeight: 700, color: aiPaused ? '#856404' : '#155724', fontSize: '0.875rem' }}>
                      {aiPaused ? '⚠ AI PAUSED' : '● AI ACTIVE'}
                    </div>
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: '#667781' }}>
                      {aiPaused ? 'AI drafts are blocked. Human messaging still works.' : 'AI is generating reply drafts. Human approval required before sending.'}
                    </div>
                  </div>
                  <button onClick={handleEmergencyToggle} style={{ padding: '0.5rem', borderRadius: 8, border: `1px solid ${aiPaused ? '#25D366' : '#dc3545'}`, background: 'none', color: aiPaused ? '#25D366' : '#dc3545', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                    {aiPaused ? '▶ Resume AI' : '⏸ Emergency Stop AI'}
                  </button>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: 8, fontSize: '0.8rem', color: '#667781' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Sync Stats</div>
                    <div>💬 Chats: {stats.chats}</div>
                    <div>👥 Contacts: {stats.contacts}</div>
                    <div>📨 Messages: {stats.messages}</div>
                    <div>📞 Call logs: {stats.calls}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: chat window or placeholder */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {selectedChat ? (
              <ChatWindow
                chat={selectedChat}
                messages={messages}
                onSend={handleSend}
                onBack={() => setSelectedChatId(null)}
                aiPaused={aiPaused}
              />
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: '#f0f2f5' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#d9dbdf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={36} color="#667781" />
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.25rem', color: '#41525d' }}>AgriTrust WhatsApp</div>
                <div style={{ color: '#667781', fontSize: '0.875rem', textAlign: 'center', maxWidth: 340 }}>
                  Select a chat to start messaging, or click <strong>New Chat</strong> to begin a conversation.
                </div>
                {isConnected && (
                  <button onClick={() => setShowNewChat(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, marginTop: '0.5rem' }}>
                    <Plus size={18} /> New Chat
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <NewChatModal onSend={handleNewChat} onClose={() => setShowNewChat(false)} />
      )}
    </div>
  );
};

export default AdminWhatsAppWorkspace;
