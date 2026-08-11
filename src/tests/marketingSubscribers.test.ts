import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { MarketingService } from '../core/marketing/marketingService';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST MARKETING SUBSCRIBERS & LEAD GENERATION ARCHITECTURE', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test Step 1: Valid Subscriber Creation, Email Normalization & Explicit Consent', async () => {
    const res = await MarketingService.subscribe({
      email: '  Hasan.Alkins@Example.com ',
      audienceType: 'BUYER',
      source: 'landing_page',
      sourcePage: 'homepage',
      firstName: 'Hasan',
      lastName: 'Alkins',
    });

    expect(res.isNew).toBe(true);
    expect(res.subscriber.email).toBe('Hasan.Alkins@Example.com');
    expect(res.subscriber.emailNormalized).toBe('hasan.alkins@example.com');
    expect(res.subscriber.audienceType).toBe('BUYER');
    expect(res.subscriber.consentStatus).toBe('GRANTED');
    expect(res.subscriber.consentVersion).toBe('v1.0');
    expect(res.subscriber.subscriptionStatus).toBe('SUBSCRIBED');
    expect(res.subscriber.unsubscribeToken).toBeTruthy();
  });

  it('Test Step 2: Duplicate Handling & Casing Insensitivity', async () => {
    const initialSubs = await MarketingService.getSubscribers('sys-admin');
    const initialCount = initialSubs.length;

    // First submission
    await MarketingService.subscribe({
      email: 'test.duplicate@agritrust.example',
      audienceType: 'FARMER',
    });

    // Second submission with different casing
    const dupRes = await MarketingService.subscribe({
      email: '  TEST.DUPLICATE@AGRITRUST.EXAMPLE ',
      audienceType: 'FARMER',
    });

    expect(dupRes.isNew).toBe(false);
    expect(dupRes.alreadySubscribed).toBe(true);

    const finalSubs = await MarketingService.getSubscribers('sys-admin');
    expect(finalSubs.length).toBe(initialCount + 1);
  });

  it('Test Step 3: One-Click Token-Based Unsubscribe Flow', async () => {
    const subRes = await MarketingService.subscribe({
      email: 'unsub.test@agritrust.example',
      audienceType: 'INTERESTED',
    });

    const token = subRes.subscriber.unsubscribeToken;
    expect(token).toBeTruthy();

    const unsubscribed = await MarketingService.unsubscribe(token);
    expect(unsubscribed.subscriptionStatus).toBe('UNSUBSCRIBED');
    expect(unsubscribed.consentStatus).toBe('WITHDRAWN');
    expect(unsubscribed.unsubscribedAt).toBeTruthy();
  });

  it('Test Step 4: Resubscription Flow for Unsubscribed User', async () => {
    const email = 'resubscribe.user@agritrust.example';

    // 1. Subscribe
    const sub = await MarketingService.subscribe({ email });
    const token = sub.subscriber.unsubscribeToken;

    // 2. Unsubscribe
    await MarketingService.unsubscribe(token);

    // 3. Resubscribe
    const resub = await MarketingService.subscribe({ email, audienceType: 'BUYER' });
    expect(resub.isNew).toBe(false);
    expect(resub.resubscribed).toBe(true);
    expect(resub.subscriber.subscriptionStatus).toBe('SUBSCRIBED');
    expect(resub.subscriber.consentStatus).toBe('GRANTED');
  });

  it('Test Step 5: Admin Marketing Workspace Data, Search & Filtering', async () => {
    const subs = await MarketingService.getSubscribers('sys-admin');
    expect(subs.length).toBeGreaterThan(0);

    const metrics = await MarketingService.getMetrics('sys-admin');
    expect(metrics.totalSubscribers).toBeGreaterThan(0);
    expect(metrics.activeSubscribers).toBeGreaterThan(0);
  });

  it('Test Step 6: Audited CSV Export', async () => {
    const csv = await MarketingService.exportSubscribersCSV('sys-admin');
    expect(csv).toContain('ID,Email,Normalized Email,Audience');
    expect(csv).toContain('procurement@hiltonbarbados.com');

    // Verify audit ledger entry
    const auditLogs = AuditLedger.getOperationalLogs().filter((e: any) => e.action === 'EXPORT_MARKETING_SUBSCRIBERS');
    expect(auditLogs.length).toBeGreaterThan(0);
  });

  it('Test Step 7: Role-Based Access Control (RBAC) Enforcement', async () => {
    // Non-admin users (Buyer / Farmer) must be denied access to subscriber lists
    await expect(MarketingService.getSubscribers('usr-buyer-001')).rejects.toThrow('FORBIDDEN_ACCESS');
    await expect(MarketingService.getSubscribers('usr-farmer-001')).rejects.toThrow('FORBIDDEN_ACCESS');
  });

  it('Test Step 8: Generic Error Handling (No Stack Traces Exposed)', async () => {
    await expect(MarketingService.subscribe({ email: 'malformed-email' })).rejects.toThrow(
      "We couldn't complete your subscription right now. Please try again."
    );
  });
});
