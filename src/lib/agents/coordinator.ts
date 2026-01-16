/**
 * Turn-based coordination orchestrator for Hestia agents
 * Manages the conversation between two Hestia instances
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import type { ProfilePair } from '@/lib/profiles/types';
import type { AgentRole, CoordinationEvent, AgreedPlan, ToolInvocation } from './types';
import { createHestiaPrompt, createTurnPrompt } from './hestia';
import { createProfileMcpServer } from '@/lib/mcp/server';

const MAX_TURNS = 20;
const AGREEMENT_SIGNAL = 'AGREEMENT REACHED:';

export class CoordinationOrchestrator {
  private profiles: ProfilePair;
  private scenario: string;
  private scenarioId: string;
  private scenarioLabel: string;
  private conversationHistory: Array<{ role: AgentRole; content: string }> = [];
  private mcpServerA: ReturnType<typeof createProfileMcpServer>;
  private mcpServerB: ReturnType<typeof createProfileMcpServer>;
  private abortController: AbortController;

  constructor(profiles: ProfilePair, scenario: string, scenarioId: string, scenarioLabel: string) {
    this.profiles = profiles;
    this.scenario = scenario;
    this.scenarioId = scenarioId;
    this.scenarioLabel = scenarioLabel;
    this.mcpServerA = createProfileMcpServer(profiles.personA, 'profile_a');
    this.mcpServerB = createProfileMcpServer(profiles.personB, 'profile_b');
    this.abortController = new AbortController();
  }

  /**
   * Run the coordination loop, yielding events as they occur
   */
  async *coordinate(): AsyncGenerator<CoordinationEvent> {
    let currentSpeaker: AgentRole = 'hestia_a';
    let turnCount = 0;

    while (turnCount < MAX_TURNS) {
      yield { type: 'turn_start', data: { speaker: currentSpeaker } };

      const isAgentA = currentSpeaker === 'hestia_a';
      const profile = isAgentA ? this.profiles.personA : this.profiles.personB;
      const mcpServer = isAgentA ? this.mcpServerA : this.mcpServerB;
      const serverName = isAgentA ? 'profile_a' : 'profile_b';

      // Build the prompt for this turn
      const systemPrompt = createHestiaPrompt(profile, isAgentA ? 'a' : 'b', this.scenario);
      const turnPrompt = createTurnPrompt(this.conversationHistory, currentSpeaker);

      let fullResponse = '';
      const toolInvocations: ToolInvocation[] = [];
      let assistantMessageCount = 0;

      console.log(`\n[Coordinator] === Turn ${turnCount + 1}: ${currentSpeaker} ===`);
      console.log(`[Coordinator] Conversation history length: ${this.conversationHistory.length}`);

      try {
        // Run the agent for this turn
        for await (const message of query({
          prompt: turnPrompt,
          options: {
            abortController: this.abortController,
            model: 'claude-opus-4-5-20251101',
            systemPrompt,
            mcpServers: {
              [serverName]: mcpServer,
            },
            // Only allow the profile tools for this agent's user
            allowedTools: [
              `mcp__${serverName}__get_profile`,
              `mcp__${serverName}__get_posts`,
              `mcp__${serverName}__search_posts`,
              'WebSearch',
            ],
            maxTurns: 10, // Allow enough internal turns for tool use + response
            persistSession: false,
          },
        })) {
          // Handle tool start events for UI feedback
          if (message.type === 'stream_event') {
            const event = message.event;
            if (event.type === 'content_block_start') {
              const block = event.content_block;
              if (block.type === 'tool_use') {
                const toolInvocation: ToolInvocation = {
                  id: block.id,
                  toolName: block.name,
                  input: {},
                  status: 'running',
                };
                toolInvocations.push(toolInvocation);
                yield {
                  type: 'tool_start',
                  data: { speaker: currentSpeaker, tool: toolInvocation },
                };
              }
            }
          } else if (message.type === 'assistant') {
            assistantMessageCount++;
            console.log(`[Coordinator] Assistant message #${assistantMessageCount}, blocks: ${message.message.content.length}`);
            // Emit all text content from assistant messages
            for (const block of message.message.content) {
              if (block.type === 'text') {
                console.log(`[Coordinator] Text block (${block.text.length} chars): "${block.text.slice(0, 100)}..."`);
                fullResponse += block.text;
                yield {
                  type: 'text_delta',
                  data: { speaker: currentSpeaker, content: block.text },
                };
              } else if (block.type === 'tool_use') {
                // Handle tools not caught by stream_event
                if (!toolInvocations.some((t) => t.id === block.id)) {
                  const toolInvocation: ToolInvocation = {
                    id: block.id,
                    toolName: block.name,
                    input: block.input as Record<string, unknown>,
                    status: 'running',
                  };
                  toolInvocations.push(toolInvocation);
                  yield {
                    type: 'tool_start',
                    data: { speaker: currentSpeaker, tool: toolInvocation },
                  };
                }
              }
            }
          } else if (message.type === 'result') {
            // Log the result message structure for debugging
            console.log('[Coordinator] Result message:', JSON.stringify(message, null, 2));
            console.log('[Coordinator] Full response captured:', fullResponse.slice(0, 200) + '...');
            // Mark any pending tool invocations as completed
            for (const tool of toolInvocations) {
              if (tool.status === 'running') {
                tool.status = 'completed';
                yield {
                  type: 'tool_complete',
                  data: {
                    speaker: currentSpeaker,
                    toolId: tool.id,
                    output: 'Completed',
                  },
                };
              }
            }
          }
        }
      } catch (error) {
        yield {
          type: 'error',
          data: { message: error instanceof Error ? error.message : 'Unknown error' },
        };
        return;
      }

      // Record the turn
      this.conversationHistory.push({ role: currentSpeaker, content: fullResponse });
      yield {
        type: 'turn_complete',
        data: { speaker: currentSpeaker, fullMessage: fullResponse },
      };

      // Check for agreement
      if (fullResponse.includes(AGREEMENT_SIGNAL)) {
        // Check if both agents have signaled agreement or this is a final agreement
        const otherAgentAgreed = this.conversationHistory
          .filter((m) => m.role !== currentSpeaker)
          .some((m) => m.content.includes(AGREEMENT_SIGNAL));

        // If other agent agreed previously, or we've had enough turns for meaningful negotiation
        if (otherAgentAgreed || turnCount >= 3) {
          const plan = this.parseAgreedPlan(fullResponse);
          yield { type: 'agreement_reached', data: plan };
          return;
        }
      }

      // Switch speakers
      currentSpeaker = currentSpeaker === 'hestia_a' ? 'hestia_b' : 'hestia_a';
      turnCount++;
    }

    // Max turns reached without agreement
    yield {
      type: 'error',
      data: { message: 'Maximum turns reached without agreement' },
    };
  }

  /**
   * Stop the coordination
   */
  stop() {
    this.abortController.abort();
  }

  /**
   * Parse the agreed plan from the response text
   */
  private parseAgreedPlan(response: string): AgreedPlan {
    const planText = response.split(AGREEMENT_SIGNAL)[1] || response;
    const lines = planText.trim().split('\n').filter((l) => l.trim());

    // Extract activities from the plan text
    const activities = this.extractActivities(planText);

    // Extract compromises
    const compromises = this.extractCompromises(response);

    return {
      scenarioId: this.scenarioId,
      scenarioLabel: this.scenarioLabel,
      summary: lines[0]?.replace(/^[-*#\s]+/, '').trim() || 'Plan agreed',
      rawPlanText: planText.trim(),
      activities,
      compromises,
    };
  }

  /**
   * Extract activities from plan text
   */
  private extractActivities(text: string): Array<{ time: string; activity: string; location: string }> {
    const activities: Array<{ time: string; activity: string; location: string }> = [];

    // Strip markdown formatting from text
    const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '');

    // Look for time patterns
    const timePatterns = [
      /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\s*[-:]\s*(.+)/gi,
      /(\d{1,2}(?::\d{2})?)\s*[-:]\s*(.+)/gi,
    ];

    for (const pattern of timePatterns) {
      const matches = cleanText.matchAll(pattern);
      for (const match of matches) {
        activities.push({
          time: match[1].trim(),
          activity: match[2].trim().replace(/^[-*]\s*/, ''),
          location: 'NYC',
        });
      }
      if (activities.length > 0) break;
    }

    // If no time-based activities found, create a generic one
    if (activities.length === 0) {
      activities.push({
        time: 'As planned',
        activity: 'Activities as agreed',
        location: 'NYC',
      });
    }

    return activities;
  }

  /**
   * Extract compromises from the conversation
   */
  private extractCompromises(text: string): string[] {
    const compromises: string[] = [];

    const compromisePatterns = [
      /compromise[d]?\s+(?:on|by)\s+([^.!?\n]+)/gi,
      /agreed to\s+([^.!?\n]+)/gi,
      /meeting (?:in the middle|halfway)\s*(?:on|by)?\s*([^.!?\n]+)/gi,
      /(?:both|we)\s+(?:can\s+)?agree\s+(?:on|to)\s+([^.!?\n]+)/gi,
    ];

    for (const pattern of compromisePatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const compromise = match[1].trim();
        if (compromise && !compromises.includes(compromise)) {
          compromises.push(compromise);
        }
      }
    }

    return compromises;
  }
}
