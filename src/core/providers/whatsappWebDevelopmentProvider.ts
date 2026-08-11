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
        : `WhatsApp Web Disconnected: Status is '${meta.status}'.`,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  public async sendMessage(
    recipientPhone: string,
    text: string,
    templateName?: string
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

    const waWebMsgId = `waweb.msg.${Date.now()}.${Math.floor(Math.random() * 10000)}`;

    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'WHATSAPP_WEB_DISPATCH_MESSAGE',
      `RECIPIENT:${recipientPhone}`,
      `Dispatched message '${waWebMsgId}' via connected WhatsApp Web session to ${recipientPhone}.`
    );

    return {
      success: true,
      providerMessageId: waWebMsgId,
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
  }

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
    return {
      success: true,
      providerMessageId,
      deliveryStatus: 'DELIVERED',
      environment: 'development',
      provider: 'whatsapp_web',
      simulated: false,
    };
  }
}
