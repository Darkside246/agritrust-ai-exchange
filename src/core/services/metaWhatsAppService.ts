import { MetaSecretVault } from '../security/metaSecretVault';
import { AuditLedger } from '../audit/auditLedger';

export interface MetaOutboundPayload {
  messaging_product: 'whatsapp';
  recipient_type?: 'individual';
  to: string;
  type: 'text' | 'template' | 'document' | 'image';
  text?: {
    preview_url?: boolean;
    body: string;
  };
  template?: {
    name: string;
    language: { code: string };
    components?: any[];
  };
}

export interface MetaOutboundResponse {
  success: boolean;
  providerMessageId?: string;
  deliveryStatus: 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  errorCode?: number;
  errorMessage?: string;
  rawResponseBody?: any;
}

export interface MetaVerificationResult {
  isValid: boolean;
  status:
    | 'CONNECTED'
    | 'NOT_CONNECTED'
    | 'TOKEN_ERROR'
    | 'PERMISSION_ERROR'
    | 'WEBHOOK_VERIFICATION_REQUIRED'
    | 'CONNECTION_ERROR';
  phoneNumber?: string;
  displayBusinessName?: string;
  wabaId?: string;
  errorMessage?: string;
}

export class MetaWhatsAppService {
  /**
   * Section 8 & 49: Live Meta Graph API Connection Verification
   * Issues actual verification payload check against Meta Graph API endpoint v20.0
   */
  public static async verifyMetaApiConnection(): Promise<MetaVerificationResult> {
    const phoneNumberId = MetaSecretVault.getPhoneNumberId();
    const accessToken = MetaSecretVault.getAccessToken();
    const wabaId = MetaSecretVault.getWabaId();

    if (!phoneNumberId || !accessToken) {
      return {
        isValid: false,
        status: 'NOT_CONNECTED',
        errorMessage: 'Meta Phone Number ID or Access Token is missing from Vault configuration.',
      };
    }

    try {
      const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=display_phone_number,verified_name,code_verification_status,quality_rating`;

      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });
      const body = await response.json() as any;

      if (!response.ok) {
        const code = body?.error?.code;
        const status = (code === 190 || code === 102) ? 'TOKEN_ERROR'
          : code === 200 ? 'PERMISSION_ERROR'
          : 'CONNECTION_ERROR';
        return {
          isValid: false,
          status,
          errorMessage: body?.error?.message || `Meta API HTTP ${response.status}`,
        };
      }

      AuditLedger.logOperationalEvent(
        'sys-admin',
        'SYSTEM',
        'VERIFY_META_GRAPH_API',
        `GRAPH_API:${phoneNumberId}`,
        `Verified Meta Graph API v20.0 connection for Phone ID ${phoneNumberId}.`
      );

      return {
        isValid: true,
        status: 'CONNECTED',
        phoneNumber: body.display_phone_number,
        displayBusinessName: body.verified_name,
        wabaId: wabaId || undefined,
      };
    } catch (err: any) {
      return {
        isValid: false,
        status: 'CONNECTION_ERROR',
        errorMessage: err?.message || 'Network failure connecting to Meta Graph API.',
      };
    }
  }

  /**
   * Section 18 & 27: Send Outbound Message via Meta Cloud API
   */
  public static async sendOutboundWhatsAppMessage(
    recipientPhone: string,
    messageText: string,
    templateName?: string
  ): Promise<MetaOutboundResponse> {
    const phoneNumberId = MetaSecretVault.getPhoneNumberId();
    const accessToken = MetaSecretVault.getAccessToken();

    if (!phoneNumberId || !accessToken) {
      return {
        success: false,
        deliveryStatus: 'FAILED',
        errorCode: 401,
        errorMessage: 'Cannot send message: Meta Cloud API credentials not configured in vault.',
      };
    }

    const payload: MetaOutboundPayload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: recipientPhone.replace(/[^0-9]/g, ''),
      type: templateName ? 'template' : 'text',
    };

    if (templateName) {
      payload.template = {
        name: templateName,
        language: { code: 'en_US' },
      };
    } else {
      payload.text = {
        preview_url: false,
        body: messageText,
      };
    }

    try {
      const endpoint = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await response.json() as any;

      if (!response.ok) {
        const errMsg = body?.error?.message || `Meta API HTTP ${response.status}`;
        AuditLedger.logOperationalEvent(
          'ai-comm-agent', 'ADMIN', 'SEND_META_WHATSAPP_FAILED',
          `RECIPIENT:${recipientPhone}`, `Meta Cloud API send failed: ${errMsg}`
        );
        return {
          success: false,
          deliveryStatus: 'FAILED',
          errorCode: response.status,
          errorMessage: errMsg,
        };
      }

      const providerMessageId = body?.messages?.[0]?.id || `meta-${Date.now()}`;
      AuditLedger.logOperationalEvent(
        'ai-comm-agent', 'ADMIN', 'SEND_META_WHATSAPP_MESSAGE',
        `RECIPIENT:${recipientPhone}`,
        `Meta Cloud API message dispatched. Provider ID: ${providerMessageId}`
      );

      return {
        success: true,
        providerMessageId,
        deliveryStatus: 'SENT',
        rawResponseBody: body,
      };
    } catch (err: any) {
      AuditLedger.logOperationalEvent(
        'ai-comm-agent', 'ADMIN', 'SEND_META_WHATSAPP_ERROR',
        `RECIPIENT:${recipientPhone}`, `Meta Cloud API network error: ${err?.message}`
      );
      return {
        success: false,
        deliveryStatus: 'FAILED',
        errorCode: 503,
        errorMessage: `Meta Cloud API network error: ${err?.message}`,
      };
    }
  }
}
