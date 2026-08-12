import type { CommunicationsAgentResult } from '../ai/communicationsAgent';

/**
 * Same reasoning as whatsappWebSessionRegistry.ts / whatsappWebProviderRegistry.ts:
 * db.ts -> whatsappMessagingGateway.ts is reachable from React components, so
 * it must never statically import communicationsAgent.ts (which pulls in
 * @anthropic-ai/sdk and reads process.env.ANTHROPIC_API_KEY). The real
 * generateCommunicationsAgentDraft is registered once from
 * src/server/server.ts, which only ever runs under Node.
 */

export type GenerateDraftFn = (params: {
  conversationId: string;
  fromPhone: string;
  rawText: string;
  contactType: 'BUYER' | 'SELLER' | 'ADMIN' | 'STAFF' | 'UNKNOWN_CONTACT';
  linkedEntityId: string | null;
}) => Promise<CommunicationsAgentResult>;

const unconfigured: GenerateDraftFn = async () => ({
  draftText: '',
  riskLevel: 'MEDIUM',
  requiresHumanApproval: true,
  isPromptInjectionAttempt: false,
  toolCalls: [],
  modelUsed: 'none',
  blocked: true,
  blockReason:
    'Communications Agent is not registered in this runtime (expected in the browser). This must be called from the Node server, never client-side.',
});

let activeGenerateDraft: GenerateDraftFn = unconfigured;

export function registerCommunicationsAgent(fn: GenerateDraftFn): void {
  activeGenerateDraft = fn;
}

export function getCommunicationsAgent(): GenerateDraftFn {
  return activeGenerateDraft;
}
