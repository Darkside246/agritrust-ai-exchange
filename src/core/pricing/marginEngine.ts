import { CostEntry, MarginCalculation } from '../database/schema';

export interface CostBreakdownInput {
  farmerProcurementCost: number;
  gradingCost: number;
  packagingCost: number;
  storageCost: number;
  transportCost: number;
  paymentProcessingCost: number;
  platformCost: number;
  expectedSpoilageLossCost: number;
  riskReserveCost: number;
  otherAllocatedCost: number;
}

export class MarginEngine {
  private static defaultTargetMarginPercent = 20; // 20% minimum contribution margin

  /**
   * Calculates True Landed Cost by summing all itemized procurement, operational, risk & handling costs.
   */
  public static calculateTrueLandedCost(costs: CostBreakdownInput): number {
    const total = 
      costs.farmerProcurementCost +
      costs.gradingCost +
      costs.packagingCost +
      costs.storageCost +
      costs.transportCost +
      costs.paymentProcessingCost +
      costs.platformCost +
      costs.expectedSpoilageLossCost +
      costs.riskReserveCost +
      costs.otherAllocatedCost;

    return Number(total.toFixed(2));
  }

  /**
   * Calculates Minimum Selling Price using the formula:
   * Minimum Selling Price = TRUE LANDED COST / (1 - TARGET_MARGIN)
   * Where targetMarginPercent is e.g. 20 (meaning 20% or 0.20).
   */
  public static calculateMinimumSellingPrice(
    trueLandedCost: number, 
    targetMarginPercent: number = MarginEngine.defaultTargetMarginPercent
  ): number {
    if (targetMarginPercent >= 100 || targetMarginPercent < 0) {
      throw new Error(`Invalid target margin percent: ${targetMarginPercent}. Must be between 0 and 99.9%.`);
    }

    const marginDecimal = targetMarginPercent / 100;
    const minSellingPrice = trueLandedCost / (1 - marginDecimal);
    return Number(minSellingPrice.toFixed(2));
  }

  /**
   * Evaluates a complete cost breakdown against a proposed selling price and target margin.
   */
  public static evaluateMargin(
    costEntryId: string,
    costs: CostBreakdownInput,
    proposedSellingPrice: number,
    targetMarginPercent: number = MarginEngine.defaultTargetMarginPercent
  ): MarginCalculation {
    const trueLandedCost = this.calculateTrueLandedCost(costs);
    const minimumSellingPrice = this.calculateMinimumSellingPrice(trueLandedCost, targetMarginPercent);

    const calculatedProfit = Number((proposedSellingPrice - trueLandedCost).toFixed(2));
    const calculatedMarginPercent = proposedSellingPrice > 0 
      ? Number(((calculatedProfit / proposedSellingPrice) * 100).toFixed(2))
      : 0;

    const isMarginSatisfied = proposedSellingPrice >= minimumSellingPrice;

    return {
      id: `MC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      costEntryId,
      trueLandedCost,
      targetMarginPercent,
      minimumSellingPrice,
      calculatedProfit,
      calculatedMarginPercent,
      isMarginSatisfied,
    };
  }

  /**
   * Refuses or flags transactions that fall below configured minimum margin thresholds.
   */
  public static validateTransactionMargin(
    costs: CostBreakdownInput,
    proposedPrice: number,
    configuredTargetMargin: number = MarginEngine.defaultTargetMarginPercent
  ): { valid: boolean; reason?: string; minPriceRequired: number; trueLandedCost: number } {
    const trueCost = this.calculateTrueLandedCost(costs);
    const minPriceRequired = this.calculateMinimumSellingPrice(trueCost, configuredTargetMargin);

    if (proposedPrice < minPriceRequired) {
      return {
        valid: false,
        reason: `TRANSACTION REJECTED: Proposed selling price ($${proposedPrice}) fails configured minimum margin threshold of ${configuredTargetMargin}%. Required minimum price is $${minPriceRequired} (True Landed Cost: $${trueCost}).`,
        minPriceRequired,
        trueLandedCost: trueCost,
      };
    }

    return {
      valid: true,
      minPriceRequired,
      trueLandedCost: trueCost,
    };
  }
}
