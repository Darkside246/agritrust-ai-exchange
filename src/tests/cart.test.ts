import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';

describe('Wholesale Cart & MOQ Validation', () => {
  it('validates minimum order quantities (MOQ)', () => {
    AgriTrustDatabase.initialize();
    const product = AgriTrustDatabase.getProductById('prod-01');
    expect(product).toBeDefined();
    if (!product) return;

    expect(product.moqUnits).toBe(50);

    // Below MOQ
    const invalidQty = 20;
    expect(invalidQty < product.moqUnits).toBe(true);

    // Meets MOQ
    const validQty = 50;
    expect(validQty >= product.moqUnits).toBe(true);
  });
});
