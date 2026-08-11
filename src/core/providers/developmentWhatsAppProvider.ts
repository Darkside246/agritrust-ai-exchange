import {
  IWhatsAppProvider,
  WhatsAppProviderType,
  ProviderHealthStatus,
  WhatsAppProviderMessageResult,
  WhatsAppIncomingMessageResult,
} from './whatsappProviderInterface';
import { AuditLedger } from '../audit/auditLedger';

export class DevelopmentWhatsAppProvider implements IWhatsAppProvider {
  public getProviderType(): WhatsAppProviderType {
    return 'development';
  }

  public isMetaConnected(): boolean {
    return false; // Explicit: Development provider is NOT Meta Cloud API
  }

  public getProviderHealth(): ProviderHealthStatus {
    return {
      provider: 'development',
      environment: 'development',
      healthy: true,
      metaConnected: false,
      statusMessage: 'Development Adapter Active (Meta Cloud API NOT CONNECTED)',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  public async sendMessage(
    recipientPhone: string,
    text: string,
    templateName?: string
  ): Promise<WhatsAppProviderMessageResult> {
    const devMessageId = `dev.msg.${Date.now()}.${Math.floor(Math.random() * 10000)}`;

    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'DEV_WHATSAPP_SEND_MESSAGE',
      `RECIPIENT:${recipientPhone}`,
      `[DEVELOPMENT EVENT] Dispatched simulated test message '${devMessageId}' to ${recipientPhone}.`
    );

    return {
      success: true,
      providerMessageId: devMessageId,
      deliveryStatus: 'SENT',
      environment: 'development',
      provider: 'development',
      simulated: true,
      rawPayload: {
        messaging_product: 'whatsapp_development_adapter',
        recipientPhone,
        text,
        templateName,
        simulatedAt: new Date().toISOString(),
      },
    };
  }

  public async receiveMessage(
    fromPhone: string,
    text: string
  ): Promise<WhatsAppIncomingMessageResult> {
    const devInboundId = `dev.inbound.${Date.now()}.${Math.floor(Math.random() * 10000)}`;

    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'DEV_WHATSAPP_RECEIVE_MESSAGE',
      `SENDER:${fromPhone}`,
      `[DEVELOPMENT EVENT] Received simulated inbound message '${devInboundId}' from ${fromPhone}.`
    );

    return {
      messageId: devInboundId,
      fromPhone,
      text,
      timestamp: new Date().toISOString(),
      isUntrustedExternalInput: true,
      environment: 'development',
      provider: 'development',
      simulated: true,
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
      provider: 'development',
      simulated: true,
    };
  }
}
