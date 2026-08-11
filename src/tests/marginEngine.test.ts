import { describe, it, expect } from 'vitest';
import { MarginEngine, CostBreakdownInput } from '../core/pricing/marginEngine';

describe('Minimum Margin Engine', () => {
  const sampleCosts: CostBreakdownInput = {
    farmerProcurementCost: 70,
    gradingCost: 5,
    packagingCost: 5,
    storageCost: 3,
    transportCost: 7,
    paymentProcessingCost: 2,
    platformCost: 3,
    expectedSpoilageLossCost: 3,
    riskReserveCost: 2,
    otherAllocatedCost: 0,
  };

  it('correctly calculates TRUE LANDED COST', () => {
    const trueCost = MarginEngine.calculateTrueLandedCost(sampleCosts);
    expect(trueCost).toBe(100.00);
  });

  it('correctly calculates Minimum Selling Price for a 20% target margin', () => {
    const trueCost = 100.00;
    // Minimum Selling Price = TRUE LANDED COST / (1 - 0.20) = 100 / 0.80 = 125.00
    const minPrice = MarginEngine.calculateMinimumSellingPrice(trueCost, 20);
    expect(minPrice).toBe(125.00);

    const profit = minPrice - trueCost;
    expect(profit).toBe(25.00);

    const marginPercent = (profit / minPrice) * 100;
    expect(marginPercent).toBe(20.00);
  });

  it('flags or refuses transactions below the target margin threshold', () => {
    const proposedPrice = 110.00; // Less than $125
    const validation = MarginEngine.validateTransactionMargin(sampleCosts, proposedPrice, 20);

    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('TRANSACTION REJECTED');
    expect(validation.minPriceRequired).toBe(125.00);
  });

  it('approves transactions meeting or exceeding the target margin threshold', () => {
    const proposedPrice = 130.00;
    const validation = MarginEngine.validateTransactionMargin(sampleCosts, proposedPrice, 20);

    expect(validation.valid).toBe(true);
    expect(validation.minPriceRequired).toBe(125.00);
  });
});
