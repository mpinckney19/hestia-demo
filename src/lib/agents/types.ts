/**
 * Agent types for Hestia coordination
 */

import type { ProfilePair } from '@/lib/profiles/types';

export type AgentRole = 'hestia_a' | 'hestia_b';

export interface ToolInvocation {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export interface AgentMessage {
  id: string;
  role: AgentRole;
  content: string;
  timestamp: number;
  toolInvocations?: ToolInvocation[];
}

export interface PlannedActivity {
  time: string;
  activity: string;
  location: string;
  notes?: string;
}

export interface AgreedPlan {
  scenarioId: string;
  scenarioLabel: string;
  summary: string;
  rawPlanText: string;
  activities: PlannedActivity[];
  compromises: string[];
}

export interface CoordinationState {
  status: 'idle' | 'generating_profiles' | 'coordinating' | 'agreed' | 'error';
  profiles?: ProfilePair;
  messages: AgentMessage[];
  currentSpeaker?: AgentRole;
  currentMessage?: AgentMessage;
  finalPlan?: AgreedPlan;
  error?: string;
}

// SSE Event types for streaming coordination updates
export type CoordinationEvent =
  | { type: 'profiles_generated'; data: ProfilePair }
  | { type: 'turn_start'; data: { speaker: AgentRole } }
  | { type: 'text_delta'; data: { speaker: AgentRole; content: string } }
  | { type: 'tool_start'; data: { speaker: AgentRole; tool: ToolInvocation } }
  | { type: 'tool_complete'; data: { speaker: AgentRole; toolId: string; output: string } }
  | { type: 'turn_complete'; data: { speaker: AgentRole; fullMessage: string } }
  | { type: 'agreement_reached'; data: AgreedPlan }
  | { type: 'error'; data: { message: string } };
