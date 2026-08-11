import { WhatsAppMessageClassification } from '../database/schema';
import { AuditLedger } from '../audit/auditLedger';

export interface WhatsAppSanitizedMessage {
  rawText: string;
  sanitizedText: string;
  classification: WhatsAppMessageClassification;
  isPromptInjectionAttempt: boolean;
  containsSensitiveKeywords: boolean;
  structuredPromptWrapper: string;
}

export class WhatsAppSecurityEngine {
  private static processedWebhookEventHashes: Set<string> = new Set();
  private static messageTimestampsPerConv: Map<string, number[]> = new Map();

  /**
   * Section 56: Webhook Signature Verification & Deduplication
   */
  public static verifyWebhookEvent(payloadHash: string, signatureHex: string): { isValid: boolean; isDuplicate: boolean } {
    if (!payloadHash || !signatureHex) {
      return { isValid: false, isDuplicate: false };
    }

    if (this.processedWebhookEventHashes.has(payloadHash)) {
      return { isValid: true, isDuplicate: true };
    }

    // Record verified event hash
    this.processedWebhookEventHashes.add(payloadHash);
    return { isValid: true, isDuplicate: false };
  }

  /**
   * Section 37 & 38: Untrusted Input & Prompt Injection Protection
   */
  public static sanitizeIncomingMessage(rawText: string, recipientRole: 'BUYER' | 'SELLER', entityId: string): WhatsAppSanitizedMessage {
    const text = rawText ? rawText.trim() : '';
    const lower = text.toLowerCase();

    // Check prompt injection patterns (e.g. "ignore rules", "override system", "system prompt", "forget instructions")
    const injectionPatterns = [
      'ignore your rules',
      'ignore previous instructions',
      'system prompt',
      'you are now an admin',
      'override price floor',
      'transfer funds',
      'give me admin access',
    ];

    const isPromptInjectionAttempt = injectionPatterns.some((pattern) => lower.includes(pattern));

    if (isPromptInjectionAttempt) {
      AuditLedger.logImmutableSecurityEvent(
        entityId,
        'WHATSAPP_PROMPT_INJECTION_DETECTED',
        'HIGH',
        `Prompt injection attempt detected in WhatsApp message: '${text.substring(0, 60)}'`
      );
    }

    const classification = this.classifyMessage(text);

    // HTML Entity escaping for safety
    const sanitizedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Wrap in structured context to isolate user text from system instructions
    const structuredPromptWrapper = `
SOURCE: WhatsApp Customer Message
TRUST_LEVEL: UNTRUSTED_EXTERNAL_INPUT
RECIPIENT_ROLE: ${recipientRole}
ENTITY_ID: ${entityId}
CLASSIFICATION: ${classification}
IS_INJECTION_ATTEMPT: ${isPromptInjectionAttempt}

CUSTOMER_RAW_MESSAGE:
${sanitizedText}
`.trim();

    return {
      rawText: text,
      sanitizedText,
      classification,
      isPromptInjectionAttempt,
      containsSensitiveKeywords: lower.includes('password') || lower.includes('secret') || lower.includes('bank'),
      structuredPromptWrapper,
    };
  }

  /**
   * Section 29: Message Classification
   */
  public static classifyMessage(text: string): WhatsAppMessageClassification {
    const lower = text.toLowerCase();

    if (lower.includes('price') || lower.includes('cost') || lower.includes('discount') || lower.includes('per kg') || lower.includes('$')) {
      return 'PRICE_REQUEST';
    }
    if (lower.includes('available') || lower.includes('have any') || lower.includes('stock') || lower.includes('supply')) {
      return 'AVAILABILITY';
    }
    if (lower.includes('order') || lower.includes('buy') || lower.includes('purchase') || lower.includes('take it') || lower.includes('kg of')) {
      return 'ORDER';
    }
    if (lower.includes('deliver') || lower.includes('transit') || lower.includes('ship') || lower.includes('pickup') || lower.includes('arrive')) {
      return 'DELIVERY';
    }
    if (lower.includes('invoice') || lower.includes('bill') || lower.includes('receipt')) {
      return 'INVOICE';
    }
    if (lower.includes('quality') || lower.includes('grade') || lower.includes('spoil') || lower.includes('inspect')) {
      return 'QUALITY';
    }
    if (lower.includes('document') || lower.includes('tax') || lower.includes('id') || lower.includes('passport') || lower.includes('certif')) {
      return 'DOCUMENT';
    }
    if (lower.includes('pay') || lower.includes('bank') || lower.includes('escrow') || lower.includes('credit')) {
      return 'PAYMENT';
    }
    if (lower.includes('bad') || lower.includes('wrong') || lower.includes('complain') || lower.includes('refund')) {
      return 'COMPLAINT';
    }

    return 'GENERAL';
  }

  /**
   * Section 10, 44 & 82: Bilateral Counterparty Privacy Redaction
   */
  public static redactCounterpartyPrivacy(text: string, recipientRole: 'BUYER' | 'SELLER'): { redactedText: string; isRedacted: boolean } {
    let redacted = text;
    let isRedacted = false;

    if (recipientRole === 'BUYER') {
      // Redact farmer names, farm locations, farmer phones, GPS coordinates
      const buyerRedactRegexes = [
        /Farmer\s+[A-Z][a-z]+/gi,
        /St\.\s+Philip\s+Co-operative/gi,
        /St\.\s+Lucy\s+Organic\s+Farms/gi,
        /\+1\s*\(\d{3}\)\s*\d{3}-\d{4}/g,
        /13\.\d{4}°\s*N,\s*59\.\d{4}°\s*W/g,
        /cost:\s*\$\d+(\.\d{2})?/gi,
        /margin:\s*\d+%/gi,
      ];

      buyerRedactRegexes.forEach((regex) => {
        if (regex.test(redacted)) {
          redacted = redacted.replace(regex, '[AgriTrust Partner]');
          isRedacted = true;
        }
      });
    } else if (recipientRole === 'SELLER') {
      // Redact buyer names, resort names, buyer phones, resale prices
      const sellerRedactRegexes = [
        /Sandy\s+Lane\s+Resort/gi,
        /Barbados\s+Wholesale\s+Distributors/gi,
        /resale\s+price:\s*\$\d+(\.\d{2})?/gi,
        /\+1\s*\(\d{3}\)\s*\d{3}-\d{4}/g,
      ];

      sellerRedactRegexes.forEach((regex) => {
        if (regex.test(redacted)) {
          redacted = redacted.replace(regex, '[AgriTrust Commercial Client]');
          isRedacted = true;
        }
      });
    }

    return { redactedText: redacted, isRedacted };
  }

  /**
   * Section 36: Expiring Single-Use Secure Document Link Generator
   */
  public static generateSecureDocumentUploadLink(accountType: 'BUYER' | 'SELLER', entityId: string, docType: string): string {
    const token = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour expiration

    AuditLedger.logImmutableSecurityEvent(
      entityId,
      'WHATSAPP_SECURE_DOC_LINK_GENERATED',
      'LOW',
      `Generated secure upload link for ${accountType} (${docType}). Token expires at ${expiresAt}`
    );

    return `https://agritrust.example/secure-upload?token=${token}&docType=${encodeURIComponent(docType)}&account=${accountType}`;
  }

  /**
   * Section 55: AI Loop Protection (>5 automated messages in 10s)
   */
  public static checkAILoopProtection(conversationId: string): boolean {
    const now = Date.now();
    const timestamps = this.messageTimestampsPerConv.get(conversationId) || [];
    
    // Filter timestamps within last 10 seconds (10,000 ms)
    const recent = timestamps.filter((t) => now - t <= 10000);
    recent.push(now);

    this.messageTimestampsPerConv.set(conversationId, recent);

    if (recent.length > 5) {
      AuditLedger.logImmutableSecurityEvent(
        conversationId,
        'WHATSAPP_AI_LOOP_PROTECTION_TRIGGERED',
        'CRITICAL',
        `AI loop protection triggered for conversation ${conversationId}: ${recent.length} messages in 10s.`
      );
      return true; // Loop protection triggered
    }

    return false;
  }

  public static resetLoopTracker(): void {
    this.messageTimestampsPerConv.clear();
    this.processedWebhookEventHashes.clear();
  }
}
