/**
 * This file exists purely to keep `core/database/db.ts` importable by the
 * browser bundle. `db.ts` is imported directly by many React components
 * (see App.tsx, AdminWhatsAppWorkspace.tsx, etc.) - there is no HTTP
 * boundary for most of this app yet. The real WhatsAppWebSessionManager
 * pulls in whatsapp-web.js -> puppeteer, which needs Node built-ins
 * (fs, child_process, ...) that don't exist in a browser and will break
 * `vite build` if anything reachable from a component imports it statically.
 *
 * So: db.ts depends only on this small interface + registry (no Node-only
 * code). The real implementation is registered exactly once, from
 * src/server/server.ts, which only ever runs under Node - never bundled
 * for the browser.
 */

export type WhatsAppWebSessionState =
  | 'NOT_CONNECTED'
  | 'STARTING'
  | 'QR_REQUIRED'
  | 'AUTHENTICATING'
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'SESSION_EXPIRED'
  | 'BROWSER_ERROR'
  | 'CONNECTION_ERROR'
  | 'STOPPED';

export interface WhatsAppWebSessionMetadata {
  connectionId: string;
  provider: 'whatsapp_web';
  environment: 'development';
  status: WhatsAppWebSessionState;
  qrCodeDataUrl?: string;
  connectedAt?: string;
  lastSeenAt?: string;
  accountName?: string;
  maskedPhone?: string;
  errorMessage?: string;
}

export interface IWhatsAppWebSessionController {
  startSession(adminUserId?: string): WhatsAppWebSessionMetadata;
  disconnectSession(adminUserId?: string): Promise<WhatsAppWebSessionMetadata>;
  getSessionMetadata(): WhatsAppWebSessionMetadata;
}

const UNCONFIGURED_METADATA: WhatsAppWebSessionMetadata = {
  connectionId: 'wa-web-session-dev-01',
  provider: 'whatsapp_web',
  environment: 'development',
  status: 'NOT_CONNECTED',
  errorMessage:
    'WhatsApp Web session controller is not registered in this runtime. This is expected in the browser - the real session only exists inside the Node server process. Use the /api/admin/whatsapp/* HTTP endpoints instead of calling this directly from client code.',
};

class UnconfiguredController implements IWhatsAppWebSessionController {
  startSession(): WhatsAppWebSessionMetadata {
    return { ...UNCONFIGURED_METADATA };
  }
  async disconnectSession(): Promise<WhatsAppWebSessionMetadata> {
    return { ...UNCONFIGURED_METADATA, status: 'DISCONNECTED' };
  }
  getSessionMetadata(): WhatsAppWebSessionMetadata {
    return { ...UNCONFIGURED_METADATA };
  }
}

let activeController: IWhatsAppWebSessionController = new UnconfiguredController();

export function registerWhatsAppWebSessionController(controller: IWhatsAppWebSessionController): void {
  activeController = controller;
}

export function getWhatsAppWebSessionController(): IWhatsAppWebSessionController {
  return activeController;
}
