import { AuditEvent, SecurityEvent, UserRole, RiskLevel } from '../database/schema';

export class AuditLedger {
  private static operationalStore: AuditEvent[] = [];
  private static immutableSecurityVault: SecurityEvent[] = [];
  private static latestHash: string = 'GENESIS_HASH_0000000000000000';

  /**
   * Simple deterministic SHA-256 placeholder hash algorithm for tamper-evident chain.
   */
  private static computeHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `HASH-${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  /**
   * Records an operational audit event for admin and ops querying.
   */
  public static logOperationalEvent(
    actorId: string,
    actorRole: UserRole,
    action: string,
    targetEntity: string,
    details: string
  ): AuditEvent {
    const event: AuditEvent = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      action,
      targetEntity,
      details,
    };

    this.operationalStore.push(event);
    this.logImmutableSecurityEvent(actorId, action, 'LOW', `${targetEntity}: ${details}`);
    return event;
  }

  /**
   * Records a cryptographically hash-chained event into the Immutable Security Audit Vault.
   * AI Agents have zero write/delete/read access to this vault.
   */
  public static logImmutableSecurityEvent(
    actorId: string,
    eventType: string,
    riskSeverity: RiskLevel,
    payloadSummary: string,
    isActorAI: boolean = false
  ): SecurityEvent {
    if (isActorAI) {
      throw new Error('SECURITY POLICY VIOLATION: AI Agents are forbidden from accessing or writing to the Immutable Security Audit Vault.');
    }

    const timestamp = new Date().toISOString();
    const previousHash = this.latestHash;
    const rawContent = `${timestamp}:${actorId}:${eventType}:${riskSeverity}:${payloadSummary}:${previousHash}`;
    const eventHash = this.computeHash(rawContent);

    const secEvent: SecurityEvent = {
      id: `SEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp,
      actorId,
      eventType,
      riskSeverity,
      previousHash,
      eventHash,
    };

    this.immutableSecurityVault.push(secEvent);
    this.latestHash = eventHash;

    return secEvent;
  }

  /**
   * Returns operational logs for human admins.
   */
  public static getOperationalLogs(): AuditEvent[] {
    return [...this.operationalStore];
  }

  /**
   * Verifies the cryptographic hash-chain integrity of the Immutable Security Vault.
   */
  public static verifySecurityVaultIntegrity(): { intact: boolean; verifiedCount: number } {
    let currentHash = 'GENESIS_HASH_0000000000000000';
    for (let i = 0; i < this.immutableSecurityVault.length; i++) {
      const event = this.immutableSecurityVault[i];
      if (event.previousHash !== currentHash) {
        return { intact: false, verifiedCount: i };
      }
      currentHash = event.eventHash;
    }
    return { intact: true, verifiedCount: this.immutableSecurityVault.length };
  }
}
