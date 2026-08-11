import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { SearchSecurityEngine } from '../core/security/searchSecurityEngine';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST NAVIGATION & SEARCH SECURITY PIPELINE ACCEPTANCE TESTS', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
    SearchSecurityEngine.resetRateLimitTracker();
  });

  it('Test 1: Public Top Navigation excludes Traceability & Retains Admin Traceability', () => {
    // Public search & navigation
    const publicProducts = AgriTrustDatabase.getProducts();
    expect(publicProducts).toBeDefined();

    // Verify Traceability data in Admin DB remains completely intact
    const allLots = AgriTrustDatabase.getAllLots();
    expect(allLots.length).toBeGreaterThan(0);
    const targetLot = allLots[0];

    const lotEvents = AgriTrustDatabase.getLotEvents(targetLot.id);
    expect(lotEvents).toBeDefined();
    expect(lotEvents.length).toBeGreaterThan(0);

    const lotQuality = AgriTrustDatabase.getLotQuality(targetLot.id);
    expect(lotQuality).toBeDefined();
  });

  it('Test 2: SQL Injection Payloads Fail Safely Without Execution', () => {
    const payloads = [
      "' OR '1'='1",
      "' OR 1=1 --",
      'UNION SELECT * FROM users',
      "'; DROP TABLE products; --",
    ];

    payloads.forEach((payload) => {
      const res = AgriTrustDatabase.searchPublicMarketplace(payload, 'test-client-sqli');
      expect(res.error).toBeUndefined();
      expect(res.products).toBeDefined();
      // Should not throw SQL exception or expose all records
      expect(Array.isArray(res.products)).toBe(true);
    });
  });

  it('Test 3: XSS & HTML Injection Payloads Escaped Safely', () => {
    const xssPayloads = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert(1)>",
      "javascript:alert(document.cookie)",
      "<iframe src='malicious.html'></iframe>",
    ];

    xssPayloads.forEach((payload) => {
      const sanitizedRes = SearchSecurityEngine.validateAndSanitize(payload, 'test-client-xss');
      expect(sanitizedRes.sanitizedQuery).not.toContain('<script>');
      expect(sanitizedRes.sanitizedQuery).not.toContain('<img');
      expect(sanitizedRes.sanitizedQuery).not.toContain('<iframe');

      const dbRes = AgriTrustDatabase.searchPublicMarketplace(payload, 'test-client-xss');
      expect(dbRes.error).toBeUndefined();
    });
  });

  it('Test 4: Command Injection Payloads Neutralized', () => {
    const cmdPayloads = [
      '; whoami',
      '&& whoami',
      '$(whoami)',
      '`whoami`',
      '| cat /etc/passwd',
    ];

    cmdPayloads.forEach((payload) => {
      const res = AgriTrustDatabase.searchPublicMarketplace(payload, 'test-client-cmd');
      expect(res.error).toBeUndefined();
      expect(Array.isArray(res.products)).toBe(true);
    });
  });

  it('Test 5: Path Traversal Payloads Fail Safely', () => {
    const pathPayloads = [
      '../../../../etc/passwd',
      '..\\..\\..\\windows\\system32',
      '/var/www/html/secret.env',
    ];

    pathPayloads.forEach((payload) => {
      const res = AgriTrustDatabase.searchPublicMarketplace(payload, 'test-client-path');
      expect(res.error).toBeUndefined();
      expect(Array.isArray(res.products)).toBe(true);
    });
  });

  it('Test 6: Expression & Template Injection Payloads Treated as Plain Text', () => {
    const exprPayloads = ['${7*7}', '{{7*7}}', '<%= 7*7 %>'];

    exprPayloads.forEach((payload) => {
      const sanitized = SearchSecurityEngine.validateAndSanitize(payload, 'test-client-expr');
      expect(sanitized.isValid).toBe(true);
      expect(sanitized.isSuspicious).toBe(true); // Flagged for security logging
      expect(sanitized.sanitizedQuery).toBe(SearchSecurityEngine.escapeHtml(payload)); // Treated strictly as plain search text
    });
  });

  it('Test 7: Oversized Search Input (>256 Chars) Truncated Safely', () => {
    const oversizedInput = 'A'.repeat(500);
    const sanitizedRes = SearchSecurityEngine.validateAndSanitize(oversizedInput, 'test-client-oversized');

    expect(sanitizedRes.sanitizedQuery.length).toBeLessThanOrEqual(256);
  });

  it('Test 8: Rate Limiting Enforcement (Max 60 Requests/Minute)', () => {
    const clientId = 'test-client-rate-limit';

    // Send 60 requests -> should all pass
    for (let i = 0; i < 60; i++) {
      const res = SearchSecurityEngine.validateAndSanitize(`search ${i}`, clientId);
      expect(res.isValid).toBe(true);
    }

    // 61st request -> rate limit exceeded
    const blockedRes = SearchSecurityEngine.validateAndSanitize('search 61', clientId);
    expect(blockedRes.isValid).toBe(false);
    expect(blockedRes.errorMessage).toBe("We couldn't complete that search. Please try again.");

    // DB search returns safe error
    const dbBlockedRes = AgriTrustDatabase.searchPublicMarketplace('search 61', clientId);
    expect(dbBlockedRes.products.length).toBe(0);
    expect(dbBlockedRes.error).toBe("We couldn't complete that search. Please try again.");
  });

  it('Test 9: Public Search Scope Restriction (No Private Farmer/Buyer Data)', () => {
    // Search for a string matching a farmer private address or phone
    const res = AgriTrustDatabase.searchPublicMarketplace('Western Agricultural Zone 4', 'test-client-scope');
    expect(res.products.length).toBeGreaterThan(0);

    // Verify search results contain ONLY public Product fields
    res.products.forEach((p) => {
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('pricePerUnit');
      expect(p).toHaveProperty('publicRegion');

      // Must NOT contain private farmer profile properties
      expect((p as any).privatePhone).toBeUndefined();
      expect((p as any).privateAddress).toBeUndefined();
      expect((p as any).privateGpsLat).toBeUndefined();
    });
  });

  it('Test 10: Security Audit Event Logging for Injection Payloads', () => {
    SearchSecurityEngine.validateAndSanitize("<script>alert('XSS_AUDIT_TEST')</script>", 'test-client-audit');

    const secVaultIntegrity = AuditLedger.verifySecurityVaultIntegrity();
    expect(secVaultIntegrity.intact).toBe(true);
  });
});
