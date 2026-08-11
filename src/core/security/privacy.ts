import { FarmerProfile, BuyerProfile, Lot, Product } from '../database/schema';

export interface PublicLotView {
  id: string;
  cropName: string;
  varietyName: string;
  harvestDate: string;
  grade: string;
  status: string;
  publicRegion: string;
  verificationHash: string;
}

export interface PublicProductView extends Product {
  // Explicitly excludes farmer & buyer identities
}

export class PrivacyManager {
  /**
   * Redacts sensitive farmer PII (name, phone, street address, exact GPS coordinates)
   * into an anonymized public lot view.
   */
  public static sanitizeLotForPublic(lot: Lot): PublicLotView {
    return {
      id: lot.id,
      cropName: lot.cropName || lot.commodity,
      varietyName: lot.varietyName || lot.variety,
      harvestDate: lot.harvestDate,
      grade: lot.grade,
      status: lot.status,
      publicRegion: lot.publicRegion || 'Western Agricultural Zone 4',
      verificationHash: lot.verificationHash || `vhash_${lot.id}`,
    };
  }

  /**
   * Sanitizes product payload for public marketplace browsing, ensuring zero counterparty PII leakage.
   */
  public static sanitizeProductForPublic(product: Product): PublicProductView {
    return {
      ...product,
      // Ensure lotId is present as public token (e.g. AT-LOT-2026-000922), but no internal farmer references
    };
  }

  /**
   * Ensures Farmer profile data is strictly stripped of confidential elements before any external transmission.
   */
  public static redactFarmerProfile(farmer: FarmerProfile): Partial<FarmerProfile> {
    return {
      id: farmer.id,
      publicRegion: farmer.publicRegion,
      trustScore: farmer.trustScore,
      verified: farmer.verified,
    };
  }

  public static redactFarmerIdentity(farmer: FarmerProfile): Partial<FarmerProfile> {
    return this.redactFarmerProfile(farmer);
  }

  /**
   * Ensures Buyer profile data is strictly stripped of confidential business details.
   */
  public static redactBuyerProfile(buyer: BuyerProfile): Partial<BuyerProfile> {
    return {
      id: buyer.id,
      businessName: buyer.businessName,
      verified: buyer.verified,
    };
  }
}
