export type WhatsAppProviderType = 'development' | 'whatsapp_web' | 'meta_cloud';

export interface ProviderHealthStatus {
  provider: WhatsAppProviderType;
  environment: 'development' | 'production' | 'test';
  healthy: boolean;
  metaConnected: boolean;
  statusMessage: string;
  lastCheckedAt: string;
}

export interface WhatsAppProviderMessageResult {
  success: boolean;
  providerMessageId: string;
  deliveryStatus: 'RECEIVED' | 'PROCESSING' | 'DRAFTED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'REJECTED';
  environment: 'development' | 'production' | 'test';
  provider: WhatsAppProviderType;
  simulated: boolean;
  errorCode?: number;
  errorMessage?: string;
  rawPayload?: any;
}

export interface WhatsAppIncomingMessageResult {
  messageId: string;
  fromPhone: string;
  text: string;
  timestamp: string;
  isUntrustedExternalInput: boolean;
  environment: 'development' | 'production' | 'test';
  provider: WhatsAppProviderType;
  simulated: boolean;
}

export interface IWhatsAppProvider {
  getProviderType(): WhatsAppProviderType;
  getProviderHealth(): ProviderHealthStatus;
  isMetaConnected(): boolean;

  sendMessage(
    recipientPhone: string,
    text: string,
    templateName?: string
  ): Promise<WhatsAppProviderMessageResult>;

  receiveMessage(
    fromPhone: string,
    text: string
  ): Promise<WhatsAppIncomingMessageResult>;

  getMessageStatus(
    providerMessageId: string
  ): Promise<WhatsAppProviderMessageResult>;
}
