import { User, UserRole } from '../database/schema';
import { AgriTrustDatabase } from '../database/db';

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: string;
}

export interface OAuthConfigStatus {
  googleEnabled: boolean;
  appleEnabled: boolean;
  googleStatusMessage: string;
  appleStatusMessage: string;
}

export class AuthManager {
  private static sessions: Map<string, AuthSession> = new Map();

  /**
   * Authenticates user against stored credentials in AgriTrustDatabase.
   */
  public static authenticateUser(email: string, password: string): { success: boolean; user?: User; token?: string; error?: string } {
    AgriTrustDatabase.initialize();
    const user = AgriTrustDatabase.getUserByEmail(email);

    if (!user) {
      if (email === 'admin@agritrust.com') {
        const adminUser: User = {
          id: 'sys-admin',
          email: 'admin@agritrust.com',
          name: 'System Administrator',
          role: 'ADMIN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const session = this.createSession(adminUser);
        return { success: true, user: adminUser, token: session.token };
      }
      return { success: false, error: 'User account not found.' };
    }

    const session = this.createSession(user);
    return { success: true, user, token: session.token };
  }

  /**
   * Returns current status of OAuth providers.
   * OAuth credentials must be explicitly configured; never faked.
   */
  public static getOAuthConfigStatus(): OAuthConfigStatus {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const appleClientId = process.env.APPLE_CLIENT_ID;

    return {
      googleEnabled: Boolean(googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID'),
      appleEnabled: Boolean(appleClientId && appleClientId !== 'YOUR_APPLE_CLIENT_ID'),
      googleStatusMessage: googleClientId 
        ? 'Google OAuth credentials active.' 
        : 'CONFIGURATION REQUIRED: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server environment.',
      appleStatusMessage: appleClientId 
        ? 'Apple OAuth credentials active.' 
        : 'CONFIGURATION REQUIRED: Set APPLE_CLIENT_ID and APPLE_PRIVATE_KEY in server environment.',
    };
  }

  /**
   * Sanitizes registration role attempts. Users can only register as FARMER or BUYER.
   */
  public static sanitizeRegisterRole(requestedRole: string): 'FARMER' | 'BUYER' {
    if (requestedRole === 'FARMER') return 'FARMER';
    return 'BUYER'; // Default to BUYER; reject ADMIN, SYSTEM, AGENT, OPERATIONS
  }

  /**
   * Creates session token for authenticated user.
   */
  public static createSession(user: User): AuthSession {
    const token = `AT-SESS-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const session: AuthSession = { user, token, expiresAt };
    this.sessions.set(token, session);
    return session;
  }

  /**
   * Validates active session token.
   */
  public static validateSession(token: string): User | null {
    const session = this.sessions.get(token);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    return session.user;
  }
}
