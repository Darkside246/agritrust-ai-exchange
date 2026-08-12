import {
  IWhatsAppProvider,
  WhatsAppProviderType,
  ProviderHealthStatus,
  WhatsAppProviderMessageResult,
  WhatsAppIncomingMessageResult,
} from './whatsappProviderInterface';
import { WhatsAppWebSessionManager } from './whatsappWebSessionManager';
import { AuditLedger } from '../audit/auditLedger';

export class WhatsAppWebDevelopmentProvider implements IWhatsAppProvider {
  public getProviderType(): WhatsAppProviderType {
    return 'whatsapp_web';
  }

  public isMetaConnected(): boolean {
    return false; // Explicit: WhatsApp Web is NOT Meta Cloud API
  }

  public getProviderHealth(): ProviderHealthStatus {
    const meta = WhatsAppWebSessionManager.getSessionMetadata();
    const isConnected = meta.status === 'CONNECTED';
    return {
      provider: 'whatsapp_web',
      environment: 'development',
      healthy: isConnected,
      metaConnected: false,
      statusMessage: isConnected
        ? `WhatsApp Web Development Session Active (${meta.accountName || 'Connected'})`
        : `WhatsApp Web Disconnected: Status is '${meta.status}'.${meta.errorMessage ? ` (${meta.errorMessage})` : ''}`,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  /**
   * Really sends through the connected browser session via
   * WhatsAppWebSessionManager.sendRealMessage(). No fabricated success:
   * if the session isn't connected or the send throws, this returns
   * success: false with the real error.
   */
  public async sendMessage(
    recipientPhone: string,
    text: string,
    _templateName?: string
  ): Promise<WhatsAppProviderMessageResult> {
    const meta = WhatsAppWebSessionManager.getSessionMetadata();

    if (meta.status !== 'CONNECTED') {
      return {
        success: false,
        providerMessageId: '',
        deliveryStatus: 'FAILED',
        environment: 'development',
        provider: 'whatsapp_web',
        simulated: false,
        errorCode: 503,
        errorMessage: `Cannot send message: WhatsApp Web browser session is not connected (${meta.status}).`,
      };
    }

    try {
      const result = await WhatsAppWebSessionManager.sendRealMessage(recipientPhone, text);

      AuditLedger.logOperationalEvent(
        'sys-admin',
        'ADMIN',
        'WHATSAPP_WEB_DISPATCH_MESSAGE',
        `RECIPIENT:${recipientPhone}`,
        `Dispatched real message '${result.id}' via connected WhatsApp Web session to ${recipientPhone}.`
      );

      return {
        success: true,
        providerMessageId: result.id,
        deliveryStatus: 'SENT',
        environment: 'development',
        provider: 'whatsapp_web',
        simulated: false,
        rawPayload: {
          provider: 'whatsapp_web',
          recipientPhone,
          text,
          dispatchedAt: new Date().toISOString(),
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      AuditLedger.logOperationalEvent(
        'sys-admin',
        'ADMIN',
        'WHATSAPP_WEB_DISPATCH_FAILED',
        `RECIPIENT:${recipientPhone}`,
        `Real WhatsApp Web send failed: ${errorMessage}`
      );
      return {
        success: false,
        providerMessageId: '',
        deliveryStatus: 'FAILED',
        environment: 'development',
        provider: 'whatsapp_web',
        simulated: false,
        errorCode: 500,
        errorMessage,
      };
    }
  }

  /**
   * This method exists to satisfy IWhatsAppProvider for callers that already
   * have a (fromPhone, text) pair - e.g. the messaging gateway, which is
   * invoked BY the real inbound handler registered in server startup
   * (see server.ts: WhatsAppWebSessionManager.onInboundMessage(...)).
   * It does not itself listen for messages - it just wraps whatever real
   * pair it's given into the standard result shape.
   */
  public async receiveMessage(
    fromPhone: string,
    text: string
  ): Promise<WhatsAppIncomingMessageResult> {
    const waWebInboundId = `waweb.inbound.${Date.now()}.${Math.floor(Math.random() * 10000)}`;

    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'WHATSAPP_WEB_INBOUND_MESSAGE',
      `SENDER:${fromPhone}`,
      `Received real inbound message '${waWebInboundId}' from ${fromPhone} via WhatsApp Web session.`
    );

    return {
      messageId: waWebInboundId,
      fromPhone,
      text,
      timestamp: new Date().toISOString(),
      isUntrustedExternalInput: true,
      environment: 'development',
      provider: 'whatsapp_web',
      simulated: false,
    };
  }

  public async getMessageStatus(
    providerMessageId: string
  ): Promise<WhatsAppProviderMessageResult> {
    // whatsapp-web.js exposes delivery/read receipts via the 'message_ack'
    // event, not a pollable-by-ID status endpoint. We report SENT (the only
    // thing we can honestly confirm synchronously) rather than fabricating
    // DELIVERED/READ. Wiring 'message_ack' into a per-message store is the
    // next step if delivery/read tracking becomes a real requirement.
    return {
      success: true,
      providerMessageId,
      deliveryStatus: 'SENT',
      environment: 'development',
      provider: 'whatsapp_web',
      simulated: false,
    };
  }
}
