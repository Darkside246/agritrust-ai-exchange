import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';

describe('AGRITRUST LANDING PAGE CATALOG SECTION & CONTENT REVISION', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test Step 1: Dynamic Product Retrieval & Admin Visibility Rules', () => {
    const products = AgriTrustDatabase.getProducts();
    expect(products.length).toBeGreaterThan(0);

    // Ensure all returned products correspond to published, visible lots
    const allLots = AgriTrustDatabase.getAllLots();
    products.forEach((product) => {
      const lot = allLots.find((l) => l.id === product.lotId);
      expect(lot).toBeDefined();
      expect(lot?.publicationStatus).toBe('PUBLISHED');
      expect(lot?.publicVisibility).toBe(true);
    });
  });

  it('Test Step 2: Hidden and Draft Products are Excluded from Public Catalog', () => {
    // Approve supply submission -> creates HIDDEN lot
    const submissions = AgriTrustDatabase.getSupplySubmissions();
    const pendingSub = submissions.find((s) => s.status === 'UNDER_REVIEW' || s.status === 'SUBMITTED') || submissions[0];
    const createdHiddenLot = AgriTrustDatabase.approveSupplySubmissionAndCreateLot(pendingSub.id, 'sys-admin');

    expect(createdHiddenLot.publicationStatus).toBe('HIDDEN');
    expect(createdHiddenLot.publicVisibility).toBe(false);

    // Verify it is NOT returned in public getProducts()
    const publicProducts = AgriTrustDatabase.getProducts();
    const foundInPublic = publicProducts.find((p) => p.lotId === createdHiddenLot.id);
    expect(foundInPublic).toBeUndefined();
  });

  it('Test Step 3: Admin Can Publish Product to Become Available in Catalog', () => {
    // Create a manual product (starts HIDDEN)
    const newProduct = AgriTrustDatabase.createProductManual({
      name: 'Test Heirloom Tomatoes',
      variety: 'Heirloom Organic',
      category: 'Fresh Vegetables',
      pricePerUnit: 3.20,
      moqUnits: 20,
      availableUnits: 150,
      grade: 'Grade A',
    }, 'sys-admin');

    // Initially hidden
    let publicProducts = AgriTrustDatabase.getProducts();
    expect(publicProducts.find((p) => p.id === newProduct.id)).toBeUndefined();

    // Admin publishes lot
    AgriTrustDatabase.updateLotPublicationStatus(newProduct.lotId, 'PUBLISHED', 'sys-admin');

    // Now available in public catalog
    publicProducts = AgriTrustDatabase.getProducts();
    const publishedProduct = publicProducts.find((p) => p.id === newProduct.id);
    expect(publishedProduct).toBeDefined();
    expect(publishedProduct?.name).toBe('Test Heirloom Tomatoes');
  });

  it('Test Step 4: CMS Landing Page Block Structure & CTA Configuration', () => {
    const blocks = AgriTrustDatabase.getPublishedLandingPageBlocks();
    const gridBlock = blocks.find((b) => b.type === 'PRODUCT_GRID');

    expect(gridBlock).toBeDefined();
    expect(gridBlock?.title).toBe('Fresh Produce. Ready for Wholesale.');
    expect(gridBlock?.subtitle).toContain('Browse currently available produce from the AgriTrust wholesale marketplace');
    expect(gridBlock?.settings.primaryButtonText).toBe('Browse Wholesale Catalog');
  });

  it('Test Step 5: Prohibition of Internal Architecture Jargon in Public CMS Content', () => {
    const cmsContent = AgriTrustDatabase.getCMSContent();
    const publicString = JSON.stringify(cmsContent);

    // Public CMS strings must NOT expose internal jargon
    expect(publicString.includes('Bilateral Privacy')).toBe(false);
    expect(publicString.includes('Controlled Intermediary Model')).toBe(false);
  });
});
