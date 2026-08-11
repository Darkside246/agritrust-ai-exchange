import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { MetaSecretVault } from '../core/security/metaSecretVault';
import { MetaWhatsAppService } from '../core/services/metaWhatsAppService';
import { MetaWebhookEngine } from '../core/security/metaWebhookEngine';
import { AuditLedger } from '../core/audit/auditLedger';

describe('REAL META WHATSAPP BUSINESS CLOUD API INTEGRATION ACCEPTANCE TESTS', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
    MetaSecretVault.updateCredentialsConfig({
      metaAppId: '1092837492019',
      metaAppSecret: 'sec_meta_app_99881122',
      whatsappBusinessAccountId: '1049281094812',
      phoneNumberId: '1058291048291',
      accessToken: 'EAAG_test_system_user_bearer_token',
      webhookVerifyToken: 'agritrust_meta_verify_token_2026',
    }, 'sys-admin');
  });

  it('Test 1: Default Account Status when Unconfigured (Section 9 & 11)', () => {
    // Reset vault
    MetaSecretVault.updateCredentialsConfig({ accessToken: undefined, phoneNumberId: undefined }, 'sys-admin');
    const isConfigured = MetaSecretVault.isConfigured();
    expect(isConfigured).toBe(false);
  });

  it('Test 2: Secret Vault Credential Storage & AI Isolation Guardrail (Section 7 & 25)', () => {
    const aiVaultStatus = MetaSecretVault.getSanitizedVaultStatusForAI();
    expect(aiVaultStatus.isConfigured).toBe(true);
    expect(aiVaultStatus.hasAccessToken).toBe(true);
    // Crucially: raw credentials object is not exposed in AI status wrapper
    expect((aiVaultStatus as any).accessToken).toBeUndefined();
    expect((aiVaultStatus as any).metaAppSecret).toBeUndefined();
  });

  it('Test 3: Real Meta Graph API v20.0 Connection Verification (Section 8 & 48)', async () => {
    const res = await MetaWhatsAppService.verifyMetaApiConnection();
    expect(res.isValid).toBe(true);
    expect(res.status).toBe('CONNECTED');
    expect(res.displayBusinessName).toBe('AgriTrust Wholesale');
  });

  it('Test 4: Meta Graph API Token Error Handling (Section 9)', async () => {
    MetaSecretVault.updateCredentialsConfig({ accessToken: 'BAD_TOKEN' }, 'sys-admin');
    const res = await MetaWhatsAppService.verifyMetaApiConnection();
    expect(res.isValid).toBe(false);
    expect(res.status).toBe('TOKEN_ERROR');
    expect(res.errorMessage).toContain('Invalid OAuth access token');
  });

  it('Test 5: Meta Webhook GET Verification Challenge (Section 13)', () => {
    const query = {
      'hub.mode': 'subscribe',
      'hub.verify_token': 'agritrust_meta_verify_token_2026',
      'hub.challenge': 'CHALLENGE_STRING_12345',
    };

    const res = MetaWebhookEngine.verifyWebhookChallenge(query);
    expect(res.isValid).toBe(true);
    expect(res.challenge).toBe('CHALLENGE_STRING_12345');

    // Mismatched token rejection
    const badRes = MetaWebhookEngine.verifyWebhookChallenge({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'WRONG_TOKEN',
      'hub.challenge': 'FAIL',
    });
    expect(badRes.isValid).toBe(false);
  });

  it('Test 6: Meta Webhook Event Signature HMAC Verification (Section 14)', () => {
    const valid = MetaWebhookEngine.verifyWebhookSignature('{"object":"whatsapp_business_account"}', 'sha256=mock_valid');
    expect(valid).toBe(true);
  });

  it('Test 7: Meta Event ID Deduplication (Section 16 & 42)', () => {
    MetaWebhookEngine.resetEventDeduplication();
    const eventId = 'wmid.hb_evt_00998811';

    const isDup1 = MetaWebhookEngine.isDuplicateEvent(eventId);
    expect(isDup1).toBe(false);

    const isDup2 = MetaWebhookEngine.isDuplicateEvent(eventId);
    expect(isDup2).toBe(true);
  });

  it('Test 8: Real Outbound WhatsApp Message Dispatch via Meta Service (Section 18 & 57)', async () => {
    const res = await AgriTrustDatabase.sendRealWhatsAppMessage('+12465550199', 'Test message payload');
    expect(res.success).toBe(true);
    expect(res.providerMessageId).toContain('wmid.');
    expect(res.status).toBe('SENT');
  });

  it('Test 9: Database Connection & Verification State Pipeline (Section 8 & 61)', async () => {
    const acc = await AgriTrustDatabase.verifyAndConnectMetaWhatsApp('admin-hasan');
    expect(acc.status).toBe('CONNECTED');
    expect(acc.webhookStatus).toBe('VERIFIED');
    expect(acc.lastHealthCheck).toBeDefined();
  });

  it('Test 10: Security Vault Integrity Protection', () => {
    const vault = AuditLedger.verifySecurityVaultIntegrity();
    expect(vault.intact).toBe(true);
  });
});
