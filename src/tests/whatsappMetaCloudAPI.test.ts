import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { MetaSecretVault } from '../core/security/metaSecretVault';
import { MetaWhatsAppService } from '../core/services/metaWhatsAppService';
import { MetaWebhookEngine } from '../core/security/metaWebhookEngine';
import { AuditLedger } from '../core/audit/auditLedger';

// Tests 3, 4, 8, 9 make REAL HTTP calls to graph.facebook.com and require a
// live WABA with valid credentials. They are skipped unless
// REAL_META_TEST=1 is set in the environment. Without it, asserting
// 'CONNECTED' here would be asserting a lie - we no longer fake Meta responses.
const RUN_LIVE_META = !!process.env.REAL_META_TEST;

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
    MetaSecretVault.updateCredentialsConfig({ accessToken: undefined, phoneNumberId: undefined }, 'sys-admin');
    expect(MetaSecretVault.isConfigured()).toBe(false);
  });

  it('Test 2: Secret Vault Credential Storage & AI Isolation Guardrail (Section 7 & 25)', () => {
    const aiVaultStatus = MetaSecretVault.getSanitizedVaultStatusForAI();
    expect(aiVaultStatus.isConfigured).toBe(true);
    expect(aiVaultStatus.hasAccessToken).toBe(true);
    expect((aiVaultStatus as any).accessToken).toBeUndefined();
    expect((aiVaultStatus as any).metaAppSecret).toBeUndefined();
  });

  it('Test 3: Real Meta Graph API v20.0 Connection Verification — requires REAL_META_TEST=1', async () => {
    if (!RUN_LIVE_META) {
      // Without live Meta credentials the real fetch to graph.facebook.com
      // will correctly return CONNECTION_ERROR or TOKEN_ERROR - not CONNECTED.
      // That is the correct, honest behavior. Skip rather than assert a lie.
      console.log('Skipped: set REAL_META_TEST=1 with real WABA credentials to run this test.');
      return;
    }
    const res = await MetaWhatsAppService.verifyMetaApiConnection();
    expect(res.isValid).toBe(true);
    expect(res.status).toBe('CONNECTED');
    expect(res.displayBusinessName).toBeTruthy();
  });

  it('Test 4: Meta Graph API returns non-CONNECTED status for invalid/test tokens', async () => {
    MetaSecretVault.updateCredentialsConfig({ accessToken: 'BAD_TOKEN' }, 'sys-admin');
    const res = await MetaWhatsAppService.verifyMetaApiConnection();
    expect(res.isValid).toBe(false);
    // Real Meta API returns 400 with error.code 190 for invalid token.
    // Our real fetch translates that to TOKEN_ERROR. In CI without network
    // access the fetch itself throws and we get CONNECTION_ERROR.
    // Either way, isValid must be false - the important assertion.
    expect(['TOKEN_ERROR', 'CONNECTION_ERROR']).toContain(res.status);
  });

  it('Test 5: Meta Webhook GET Verification Challenge (Section 13)', () => {
    const res = MetaWebhookEngine.verifyWebhookChallenge({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'agritrust_meta_verify_token_2026',
      'hub.challenge': 'CHALLENGE_STRING_12345',
    });
    expect(res.isValid).toBe(true);
    expect(res.challenge).toBe('CHALLENGE_STRING_12345');

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
    expect(MetaWebhookEngine.isDuplicateEvent(eventId)).toBe(false);
    expect(MetaWebhookEngine.isDuplicateEvent(eventId)).toBe(true);
  });

  it('Test 8: Outbound send correctly fails without real Meta credentials — requires REAL_META_TEST=1 for live test', async () => {
    if (RUN_LIVE_META) {
      const res = await AgriTrustDatabase.sendRealWhatsAppMessage('+12465550199', 'Test message payload');
      expect(res.success).toBe(true);
      expect(res.providerMessageId).toBeTruthy();
    } else {
      // Without real Meta credentials the send must fail, not fabricate success
      const res = await AgriTrustDatabase.sendRealWhatsAppMessage('+12465550199', 'Test message payload');
      expect(res.success).toBe(false);
      // sendRealWhatsAppMessage returns { status } not { deliveryStatus }
      expect(res.status).toBeDefined();
    }
  });

  it('Test 9: verifyAndConnectMetaWhatsApp returns non-CONNECTED without real credentials', async () => {
    if (RUN_LIVE_META) {
      const acc = await AgriTrustDatabase.verifyAndConnectMetaWhatsApp('admin-hasan');
      expect(acc.status).toBe('CONNECTED');
    } else {
      // Without real Meta credentials the account status must not be CONNECTED.
      // Any other status (CONNECTION_ERROR, NOT_CONNECTED) is acceptable and honest.
      const acc = await AgriTrustDatabase.verifyAndConnectMetaWhatsApp('admin-hasan');
      expect(acc.status).not.toBe('CONNECTED');
    }
  });

  it('Test 10: Security Vault Integrity Protection', () => {
    const vault = AuditLedger.verifySecurityVaultIntegrity();
    expect(vault.intact).toBe(true);
  });
});

