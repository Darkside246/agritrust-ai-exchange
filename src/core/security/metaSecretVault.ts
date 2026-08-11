import { AuditLedger } from '../audit/auditLedger';

export interface MetaCredentialsConfig {
  metaAppId?: string;
  metaAppSecret?: string;
  whatsappBusinessAccountId?: string;
  phoneNumberId?: string;
  accessToken?: string;
  webhookVerifyToken?: string;
  webhookAppSecret?: string;
  updatedAt?: string;
  updatedByUserId?: string;
}

export class MetaSecretVault {
  private static config: MetaCredentialsConfig = {};

  public static getCredentialsConfig(): MetaCredentialsConfig {
    return { ...this.config };
  }

  public static updateCredentialsConfig(
    newConfig: Partial<MetaCredentialsConfig>,
    adminUserId: string = 'sys-admin'
  ): MetaCredentialsConfig {
    this.config = {
      ...this.config,
      ...newConfig,
      updatedAt: new Date().toISOString(),
      updatedByUserId: adminUserId,
    };

    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'UPDATE_META_WHATSAPP_CREDENTIALS',
      'VAULT:META_WHATSAPP',
      'Updated Meta WhatsApp Business Cloud API secret credentials configuration.'
    );

    return { ...this.config };
  }

  public static isConfigured(): boolean {
    return Boolean(
      this.config.phoneNumberId &&
      this.config.accessToken &&
      this.config.whatsappBusinessAccountId
    );
  }

  public static getAccessToken(): string | undefined {
    return this.config.accessToken;
  }

  public static getPhoneNumberId(): string | undefined {
    return this.config.phoneNumberId;
  }

  public static getWabaId(): string | undefined {
    return this.config.whatsappBusinessAccountId;
  }

  public static getWebhookVerifyToken(): string | undefined {
    return this.config.webhookVerifyToken;
  }

  public static getMetaAppSecret(): string | undefined {
    return this.config.metaAppSecret;
  }

  /**
   * AI Governance Security Guardrail:
   * AI Agents receive ZERO raw Meta access tokens or secrets.
   */
  public static getSanitizedVaultStatusForAI(): {
    isConfigured: boolean;
    hasAccessToken: boolean;
    hasPhoneNumberId: boolean;
    hasWabaId: boolean;
    hasWebhookToken: boolean;
  } {
    return {
      isConfigured: this.isConfigured(),
      hasAccessToken: Boolean(this.config.accessToken),
      hasPhoneNumberId: Boolean(this.config.phoneNumberId),
      hasWabaId: Boolean(this.config.whatsappBusinessAccountId),
      hasWebhookToken: Boolean(this.config.webhookVerifyToken),
    };
  }
}
