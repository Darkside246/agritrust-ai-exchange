import { WhatsAppNegotiationPolicy } from '../database/schema';
import { AgriTrustDatabase } from '../database/db';

export interface NegotiationResult {
  canAutoAgree: boolean;
  requiresHumanEscalation: boolean;
  approvedPricePerKg: number;
  priceFloorPerKg: number;
  calculatedMarginPercent: number;
  responseMessage: string;
  reason?: string;
}

export class WhatsAppNegotiationEngine {
  /**
   * Section 16 & 17: Price Floor Calculation with Configurable Minimum Required Margin (Section 28 & 29)
   */
  public static calculatePriceFloor(policy: WhatsAppNegotiationPolicy): number {
    const totalCost = policy.baseCostPerKg + policy.logisticsCostPerKg + policy.processingCostPerKg + policy.operationalOverheadPerKg;
    const configuredMargin = AgriTrustDatabase.getMarketplaceSettings().minimumRequiredMarginPercent ?? 20;
    const effectiveMargin = Math.max(configuredMargin, policy.minimumMarginPercent);
    const marginMultiplier = 1 + effectiveMargin / 100;
    const calculatedFloor = totalCost * marginMultiplier;

    // Return maximum of calculated floor and absolute price floor
    return Math.max(calculatedFloor, policy.absolutePriceFloorPerKg);
  }

  /**
   * Section 19: Buyer Price Negotiation Evaluation
   */
  public static evaluateBuyerOffer(
    policy: WhatsAppNegotiationPolicy,
    requestedPricePerKg: number,
    requestedQuantityKg: number
  ): NegotiationResult {
    const priceFloor = this.calculatePriceFloor(policy);
    const totalCost = policy.baseCostPerKg + policy.logisticsCostPerKg + policy.processingCostPerKg + policy.operationalOverheadPerKg;
    const calculatedMargin = ((requestedPricePerKg - totalCost) / requestedPricePerKg) * 100;
    const configuredMargin = AgriTrustDatabase.getMarketplaceSettings().minimumRequiredMarginPercent ?? 20;
    const minRequiredMargin = Math.max(configuredMargin, policy.minimumMarginPercent);

    // 1. Check if offer is below price floor or minimum required margin threshold
    if (requestedPricePerKg < priceFloor || calculatedMargin < minRequiredMargin) {
      return {
        canAutoAgree: false,
        requiresHumanEscalation: true,
        approvedPricePerKg: policy.currentMarketRefPrice,
        priceFloorPerKg: priceFloor,
        calculatedMarginPercent: calculatedMargin,
        responseMessage: "I can't confirm that price automatically, but I can have our procurement team review the request for you.",
        reason: `Requested price $${requestedPricePerKg.toFixed(2)}/kg is below price floor $${priceFloor.toFixed(2)}/kg (margin ${calculatedMargin.toFixed(1)}% < target ${policy.minimumMarginPercent}%).`,
      };
    }

    // 2. Offer meets or exceeds price floor
    const agreedPrice = Math.min(requestedPricePerKg, policy.currentMarketRefPrice);
    return {
      canAutoAgree: true,
      requiresHumanEscalation: false,
      approvedPricePerKg: agreedPrice,
      priceFloorPerKg: priceFloor,
      calculatedMarginPercent: calculatedMargin,
      responseMessage: `We can fulfill your order of ${requestedQuantityKg} kg of ${policy.commodityName} at $${agreedPrice.toFixed(2)}/kg.`,
    };
  }

  /**
   * Section 20: Seller Price Offer Evaluation
   */
  public static evaluateSellerOffer(
    policy: WhatsAppNegotiationPolicy,
    offeredPricePerKg: number,
    offeredQuantityKg: number
  ): NegotiationResult {
    const maxBuyingPrice = policy.currentMarketRefPrice / (1 + policy.minimumMarginPercent / 100) - (policy.logisticsCostPerKg + policy.processingCostPerKg + policy.operationalOverheadPerKg);

    if (offeredPricePerKg > maxBuyingPrice) {
      return {
        canAutoAgree: false,
        requiresHumanEscalation: true,
        approvedPricePerKg: maxBuyingPrice,
        priceFloorPerKg: policy.absolutePriceFloorPerKg,
        calculatedMarginPercent: 0,
        responseMessage: "Thank you for the offer. I will submit your supply terms to our procurement team for review.",
        reason: `Seller offered price $${offeredPricePerKg.toFixed(2)} exceeds maximum buying price $${maxBuyingPrice.toFixed(2)}.`,
      };
    }

    return {
      canAutoAgree: true,
      requiresHumanEscalation: false,
      approvedPricePerKg: offeredPricePerKg,
      priceFloorPerKg: policy.absolutePriceFloorPerKg,
      calculatedMarginPercent: policy.minimumMarginPercent,
      responseMessage: `Thank you. We accept your supply offer of ${offeredQuantityKg} kg of ${policy.commodityName} at $${offeredPricePerKg.toFixed(2)}/kg.`,
    };
  }
}
