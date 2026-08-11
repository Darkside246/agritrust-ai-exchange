import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST CMS & PAGE BUILDER ENGINE (SECTION 43 & 45 ACCEPTANCE TESTS)', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test 1 & 2: Draft Isolation and Preview Mode', () => {
    const publishedOriginal = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const originalHeroTitle = publishedOriginal.find((b) => b.type === 'HERO')?.title;

    expect(originalHeroTitle).toBe('Wholesale Produce. Ready for Business.');

    // Admin edits draft blocks
    const draftBlocks = AgriTrustDatabase.getDraftLandingPageBlocks();
    const updatedDraft = draftBlocks.map((b) => {
      if (b.type === 'HERO') {
        return { ...b, title: 'Fresh Produce. Delivered at Wholesale Scale.' };
      }
      return b;
    });

    // Save Draft
    AgriTrustDatabase.saveLandingPageDraft(updatedDraft, 'sys-admin');

    // 1. PUBLIC WEBSITE MUST REMAIN UNCHANGED
    const publicPublishedBlocks = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const publicHeroTitle = publicPublishedBlocks.find((b) => b.type === 'HERO')?.title;
    expect(publicHeroTitle).toBe('Wholesale Produce. Ready for Business.');

    // 2. PREVIEW MODE SHOWS DRAFT HEADING
    const previewDraftBlocks = AgriTrustDatabase.getDraftLandingPageBlocks();
    const previewHeroTitle = previewDraftBlocks.find((b) => b.type === 'HERO')?.title;
    expect(previewHeroTitle).toBe('Fresh Produce. Delivered at Wholesale Scale.');
  });

  it('Test 3: Publish Landing Page Workflow', () => {
    // Edit draft
    const draftBlocks = AgriTrustDatabase.getDraftLandingPageBlocks();
    const updatedDraft = draftBlocks.map((b) => {
      if (b.type === 'HERO') {
        return { ...b, title: 'Fresh Produce. Delivered at Wholesale Scale.' };
      }
      return b;
    });
    AgriTrustDatabase.saveLandingPageDraft(updatedDraft, 'sys-admin');

    // Publish changes
    const publishResult = AgriTrustDatabase.publishLandingPage('sys-admin', 'Updated hero headline for promotion.');
    expect(publishResult.version).toBeGreaterThanOrEqual(1);

    // Public website immediately displays updated published heading
    const publicPublishedBlocks = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const publicHeroTitle = publicPublishedBlocks.find((b) => b.type === 'HERO')?.title;
    expect(publicHeroTitle).toBe('Fresh Produce. Delivered at Wholesale Scale.');

    // Audit log entry must be present
    const logs = AuditLedger.getOperationalLogs();
    const publishLog = logs.find((l) => l.action === 'PUBLISH_LANDING_PAGE');
    expect(publishLog).toBeDefined();
  });

  it('Test 4: Dynamic Marketplace Integration (Lot Hiding & Re-publishing Sync)', () => {
    // Get initial published lots
    const availableLots = AgriTrustDatabase.getAvailableLots();
    expect(availableLots.length).toBeGreaterThan(0);
    const targetLot = availableLots[0];

    // 1. Admin hides the lot
    AgriTrustDatabase.updateLotPublicationStatus(targetLot.id, 'HIDDEN', 'sys-admin', 'Quality review check.');

    // 2. Lot MUST disappear automatically from published inventory query
    const afterHideLots = AgriTrustDatabase.getAvailableLots();
    const isPresentAfterHide = afterHideLots.some((l) => l.id === targetLot.id);
    expect(isPresentAfterHide).toBe(false);

    // 3. Admin re-publishes the lot
    AgriTrustDatabase.updateLotPublicationStatus(targetLot.id, 'PUBLISHED', 'sys-admin', 'Quality review passed.');

    // 4. Lot MUST reappear automatically
    const afterRepublishLots = AgriTrustDatabase.getAvailableLots();
    const isPresentAfterRepublish = afterRepublishLots.some((l) => l.id === targetLot.id);
    expect(isPresentAfterRepublish).toBe(true);
  });

  it('Test 5: Landing Page Revision History & Restoration', () => {
    // 1. Publish Version 1
    const draftV1 = AgriTrustDatabase.getDraftLandingPageBlocks();
    draftV1[0].title = 'V1 Heading';
    AgriTrustDatabase.saveLandingPageDraft(draftV1);
    const res1 = AgriTrustDatabase.publishLandingPage('sys-admin', 'V1 publish');

    // 2. Publish Version 2
    const draftV2 = AgriTrustDatabase.getDraftLandingPageBlocks();
    draftV2[0].title = 'V2 Heading';
    AgriTrustDatabase.saveLandingPageDraft(draftV2);
    const res2 = AgriTrustDatabase.publishLandingPage('sys-admin', 'V2 publish');

    expect(res2.version).toBeGreaterThan(res1.version);

    // Currently published should be V2 Heading
    const currentHero = AgriTrustDatabase.getPublishedLandingPageBlocks()[0].title;
    expect(currentHero).toBe('V2 Heading');

    // 3. Restore Version 1
    AgriTrustDatabase.restoreLandingPageRevision(res1.version, 'sys-admin');

    // Restored published should be V1 Heading
    const restoredHero = AgriTrustDatabase.getPublishedLandingPageBlocks()[0].title;
    expect(restoredHero).toBe('V1 Heading');
  });

  it('Test 6: Controlled Intermediary Section & End-to-End Visual Acceptance Workflow (Section 43)', () => {
    // 1. Verify initial Controlled Intermediary block exists in published blocks
    const published = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const intermediaryBlock = published.find((b) => b.type === 'CONTROLLED_INTERMEDIARY');
    expect(intermediaryBlock).toBeDefined();
    expect(intermediaryBlock?.title).toBe('How AgriTrust Secures Wholesale Agriculture');
    expect(intermediaryBlock?.content?.eyebrow).toBe('Controlled Intermediary Model');

    // 2. Admin edits Controlled Intermediary description & reorders section above product grid
    const draft = AgriTrustDatabase.getDraftLandingPageBlocks();
    const targetIdx = draft.findIndex((b) => b.type === 'CONTROLLED_INTERMEDIARY');
    expect(targetIdx).toBeGreaterThan(-1);

    draft[targetIdx].subtitle = 'Wholesale Agriculture, Made Simpler.';
    
    // Swap block position with preceding block
    const temp = draft[targetIdx];
    draft[targetIdx] = draft[targetIdx - 1];
    draft[targetIdx - 1] = temp;

    // Save Draft
    AgriTrustDatabase.saveLandingPageDraft(draft, 'sys-admin');

    // Public website MUST still reflect original published state
    const publicNow = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const publicIntermediary = publicNow.find((b) => b.type === 'CONTROLLED_INTERMEDIARY');
    expect(publicIntermediary?.subtitle).not.toBe('Wholesale Agriculture, Made Simpler.');

    // 3. Admin publishes changes
    const pubRes = AgriTrustDatabase.publishLandingPage('sys-admin', 'Updated controlled intermediary layout & subtitle.');
    expect(pubRes.version).toBeGreaterThan(0);

    // 4. Public website now EXACTLY matches the new published state
    const publicAfterPublish = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const publishedUpdatedIntermediary = publicAfterPublish.find((b) => b.type === 'CONTROLLED_INTERMEDIARY');
    expect(publishedUpdatedIntermediary?.subtitle).toBe('Wholesale Agriculture, Made Simpler.');
  });
});
