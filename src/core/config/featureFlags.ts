import { FeatureFlags } from '../database/schema';

export class FeatureFlagManager {
  private static flags: FeatureFlags = {
    AI_GRADING: true,
    GOOGLE_LOGIN: false, // CONFIGURATION REQUIRED
    APPLE_LOGIN: false,  // CONFIGURATION REQUIRED
    ADVANCED_LOGISTICS: true,
    PUBLIC_TRACEABILITY: true,
    AUTO_PROCUREMENT: false,
    WHATSAPP_AI_ASSIST: true,
    WHATSAPP_AI_AUTONOMOUS_SEND: false,
    WHATSAPP_AI_NEGOTIATION: false,
    WHATSAPP_AI_ORDER_CREATION: false,
  };

  public static getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  public static isEnabled(flag: keyof FeatureFlags): boolean {
    return Boolean(this.flags[flag]);
  }

  public static setFlag(flag: keyof FeatureFlags, enabled: boolean): FeatureFlags {
    this.flags[flag] = enabled;
    return this.getFlags();
  }
}
