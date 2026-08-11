import { AgriTrustDatabase } from '../database/db';
import { MarketingSubscriber, MarketingAudienceType, SubscriptionStatus, MarketingMetrics } from '../database/schema';

export interface SubscribeParams {
  email: string;
  audienceType?: MarketingAudienceType;
  source?: string;
  sourcePage?: string;
  firstName?: string;
  lastName?: string;
}

export class MarketingService {
  /**
   * Subscribe an email to AgriTrust marketing list with explicit consent and normalization.
   */
  public static async subscribe(params: SubscribeParams): Promise<{
    subscriber: MarketingSubscriber;
    isNew: boolean;
    resubscribed?: boolean;
    alreadySubscribed?: boolean;
  }> {
    return AgriTrustDatabase.subscribeToMarketing(params);
  }

  /**
   * Unsubscribe using a secure, single-purpose unsubscribe token (no login required).
   */
  public static async unsubscribe(token: string): Promise<MarketingSubscriber> {
    return AgriTrustDatabase.unsubscribeByToken(token);
  }

  /**
   * Fetch all subscribers for authorized administrative users.
   */
  public static async getSubscribers(adminUserId: string = 'sys-admin'): Promise<MarketingSubscriber[]> {
    return AgriTrustDatabase.getMarketingSubscribers(adminUserId);
  }

  /**
   * Fetch high-level marketing metrics.
   */
  public static async getMetrics(adminUserId: string = 'sys-admin'): Promise<MarketingMetrics> {
    return AgriTrustDatabase.getMarketingMetrics(adminUserId);
  }

  /**
   * Export subscriber database to CSV format (permission-checked and audited).
   */
  public static async exportSubscribersCSV(adminUserId: string = 'sys-admin'): Promise<string> {
    return AgriTrustDatabase.exportMarketingSubscribersCSV(adminUserId);
  }

  /**
   * Update subscriber status.
   */
  public static async updateStatus(
    subscriberId: string,
    status: SubscriptionStatus,
    adminUserId: string = 'sys-admin'
  ): Promise<MarketingSubscriber> {
    return AgriTrustDatabase.updateMarketingSubscriberStatus(subscriberId, status, adminUserId);
  }

  /**
   * Delete subscriber where legally appropriate.
   */
  public static async deleteSubscriber(
    subscriberId: string,
    adminUserId: string = 'sys-admin'
  ): Promise<boolean> {
    return AgriTrustDatabase.deleteMarketingSubscriber(subscriberId, adminUserId);
  }
}
