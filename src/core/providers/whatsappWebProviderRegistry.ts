import { IWhatsAppProvider, ProviderHealthStatus } from './whatsappProviderInterface';

/**
 * Same reasoning as whatsappWebSessionRegistry.ts: db.ts -> whatsappMessagingGateway.ts
 * is reachable from React components, so it must never statically import
 * whatsapp-web.js. The real WhatsAppWebDevelopmentProvider is registered once
 * from src/server/server.ts (Node-only).
 */

class UnconfiguredWebProvider implements IWhatsAppProvider {
  getProviderType() {
    return 'whatsapp_web' as const;
  }
  isMetaConnected() {
    return false;
  }
  getProviderHealth(): ProviderHealthStatus {
    return {
      provider: 'whatsapp_web',
      environment: 'development',
      healthy: false,
      metaConnected: false,
      statusMessage:
        'WhatsApp Web provider is not registered in this runtime (expected in the browser). Use the /api/admin/whatsapp/* endpoints.',
      lastCheckedAt: new Date().toISOString(),
    };
  }
  async sendMessage() {
    return {
      success: false,
      providerMessageId: '',
      deliveryStatus: 'FAILED' as const,
      environment: 'development' as const,
      provider: 'whatsapp_web' as const,
      simulated: false,
      errorCode: 500,
      errorMessage: 'WhatsApp Web provider not registered in this runtime.',
    };
  }
  async receiveMessage(fromPhone: string, text: string) {
    return {
      messageId: `unconfigured.${Date.now()}`,
      fromPhone,
      text,
      timestamp: new Date().toISOString(),
      isUntrustedExternalInput: true,
      environment: 'development' as const,
      provider: 'whatsapp_web' as const,
      simulated: false,
    };
  }
  async getMessageStatus(providerMessageId: string) {
    return {
      success: false,
      providerMessageId,
      deliveryStatus: 'FAILED' as const,
      environment: 'development' as const,
      provider: 'whatsapp_web' as const,
      simulated: false,
      errorMessage: 'WhatsApp Web provider not registered in this runtime.',
    };
  }
}

let activeWebProvider: IWhatsAppProvider = new UnconfiguredWebProvider();

export function registerWhatsAppWebProvider(provider: IWhatsAppProvider): void {
  activeWebProvider = provider;
}

export function getWhatsAppWebProvider(): IWhatsAppProvider {
  return activeWebProvider;
}
