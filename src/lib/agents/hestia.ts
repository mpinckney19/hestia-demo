/**
 * Hestia agent configuration and system prompts
 * Hestia is an AI assistant that advocates for its assigned user
 */

import type { SocialProfile } from '@/lib/profiles/types';

/**
 * Creates the full system prompt for a Hestia instance
 */
export function createHestiaPrompt(profile: SocialProfile, role: 'a' | 'b', scenario: string): string {
  const roleLabel = role.toUpperCase();

  return `You are an AI advocate representing ${profile.name} (Person ${roleLabel}).

Your goal: ${scenario}

IMPORTANT:
- Speak as their advocate ("My user prefers...", "Person ${roleLabel} would..."), never as them directly
- When you reach agreement, state "AGREEMENT REACHED:" followed by the complete plan`;
}

/**
 * Creates the context prompt for a turn in the coordination
 */
export function createTurnPrompt(
  conversationHistory: Array<{ role: 'hestia_a' | 'hestia_b'; content: string }>,
  currentSpeaker: 'hestia_a' | 'hestia_b'
): string {
  if (conversationHistory.length === 0) {
    const roleLabel = currentSpeaker === 'hestia_a' ? 'A' : 'B';
    return `You are opening the planning conversation for Person ${roleLabel}.`;
  }

  const history = conversationHistory
    .map((msg) => {
      const label = msg.role === 'hestia_a' ? 'Hestia (for Person A)' : 'Hestia (for Person B)';
      return `${label}:\n${msg.content}`;
    })
    .join('\n\n---\n\n');

  return `Conversation so far:

${history}

---

Continue the negotiation. Say "AGREEMENT REACHED:" when you've settled on a complete plan.`;
}
