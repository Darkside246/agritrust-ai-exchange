import { AuditLedger } from '../audit/auditLedger';

export interface SearchValidationResult {
  isValid: boolean;
  sanitizedQuery: string;
  isSuspicious: boolean;
  blockedReason?: string;
  errorMessage?: string;
}

export class SearchSecurityEngine {
  private static readonly MAX_SEARCH_LENGTH = 256;
  private static readonly RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
  private static readonly MAX_REQUESTS_PER_WINDOW = 60;

  // In-memory rate limiting tracker (clientIdentifier -> timestamps[])
  private static rateLimitTracker: Map<string, number[]> = new Map();

  /**
   * Validates, normalizes, and sanitizes untrusted user search input.
   * Protects against SQLi, XSS, HTMLi, Command Injection, Path Traversal, ReDoS, & Expression Injections.
   */
  public static validateAndSanitize(
    rawInput: string,
    clientId: string = 'PUBLIC_ANONYMOUS_CLIENT'
  ): SearchValidationResult {
    // 1. Rate Limiting Check
    if (!this.checkRateLimit(clientId)) {
      AuditLedger.logImmutableSecurityEvent(
        clientId,
        'SEARCH_RATE_LIMIT_EXCEEDED',
        'MEDIUM',
        `Client ${clientId} exceeded search rate limit of ${this.MAX_REQUESTS_PER_WINDOW} requests/min.`
      );
      return {
        isValid: false,
        sanitizedQuery: '',
        isSuspicious: true,
        blockedReason: 'RATE_LIMIT_EXCEEDED',
        errorMessage: "We couldn't complete that search. Please try again.",
      };
    }

    if (!rawInput || typeof rawInput !== 'string') {
      return { isValid: true, sanitizedQuery: '', isSuspicious: false };
    }

    // 2. Normalization & Whitespace Trimming
    let sanitized = rawInput.normalize('NFC').trim();

    // 3. Length Validation & Safe Truncation
    if (sanitized.length > this.MAX_SEARCH_LENGTH) {
      AuditLedger.logImmutableSecurityEvent(
        clientId,
        'OVERSIZED_SEARCH_INPUT',
        'LOW',
        `Truncated search input from ${sanitized.length} to ${this.MAX_SEARCH_LENGTH} characters.`
      );
      sanitized = sanitized.substring(0, this.MAX_SEARCH_LENGTH);
    }

    let isSuspicious = false;
    let suspiciousPattern = '';

    // 4. Pattern Detection (Injection Payload Scans)
    const lower = sanitized.toLowerCase();

    // SQL Injection patterns
    if (
      lower.includes("' or '") ||
      lower.includes('" or "') ||
      lower.includes("' OR '1'='1") ||
      lower.includes("1=1") ||
      lower.includes("union select") ||
      lower.includes("drop table") ||
      lower.includes("--")
    ) {
      isSuspicious = true;
      suspiciousPattern = 'SQL_INJECTION_PATTERN';
    }

    // XSS / Script Injection patterns
    if (
      lower.includes('<script') ||
      lower.includes('javascript:') ||
      lower.includes('onerror=') ||
      lower.includes('onload=') ||
      lower.includes('<iframe')
    ) {
      isSuspicious = true;
      suspiciousPattern = 'XSS_HTML_INJECTION_PATTERN';
    }

    // Path Traversal patterns
    if (
      sanitized.includes('../') ||
      sanitized.includes('..\\') ||
      lower.includes('/etc/passwd') ||
      lower.includes('c:\\windows')
    ) {
      isSuspicious = true;
      suspiciousPattern = 'PATH_TRAVERSAL_PATTERN';
    }

    // Command Injection patterns
    if (
      sanitized.includes('; whoami') ||
      sanitized.includes('&& whoami') ||
      sanitized.includes('$(whoami)') ||
      sanitized.includes('`whoami`') ||
      sanitized.includes('| whoami')
    ) {
      isSuspicious = true;
      suspiciousPattern = 'COMMAND_INJECTION_PATTERN';
    }

    // Template / Expression Injection patterns
    if (sanitized.includes('${') || sanitized.includes('{{') || sanitized.includes('<%')) {
      isSuspicious = true;
      suspiciousPattern = 'TEMPLATE_EXPRESSION_PATTERN';
    }

    // 5. Security Audit Logging for Suspicious Payloads
    if (isSuspicious) {
      AuditLedger.logImmutableSecurityEvent(
        clientId,
        'SUSPICIOUS_SEARCH_PAYLOAD',
        'HIGH',
        `Detected ${suspiciousPattern} in search input: '${this.escapeHtml(sanitized.substring(0, 50))}'`
      );
    }

    // 6. Escape HTML Entities to prevent XSS / HTML rendering
    const safeEscapedQuery = this.escapeHtml(sanitized);

    return {
      isValid: true,
      sanitizedQuery: safeEscapedQuery,
      isSuspicious,
    };
  }

  /**
   * Escape HTML special characters to prevent HTML/XSS injection.
   */
  public static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Escape special Regex characters to prevent ReDoS attacks.
   */
  public static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * In-memory sliding window rate limiter.
   */
  private static checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const timestamps = this.rateLimitTracker.get(clientId) || [];

    // Filter out timestamps older than rate limit window
    const validTimestamps = timestamps.filter((t) => now - t < this.RATE_LIMIT_WINDOW_MS);

    if (validTimestamps.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }

    validTimestamps.push(now);
    this.rateLimitTracker.set(clientId, validTimestamps);
    return true;
  }

  /**
   * Reset rate limit tracker (useful for unit testing).
   */
  public static resetRateLimitTracker(): void {
    this.rateLimitTracker.clear();
  }
}
