'use client';

import type { ToolInvocation as ToolInvocationType } from '@/lib/agents/types';

interface ToolInvocationProps {
  tool: ToolInvocationType;
  variant: 'a' | 'b';
}

const TOOL_LABELS: Record<string, string> = {
  get_user_preferences: 'Checking preferences',
  get_user_constraints: 'Reviewing constraints',
  get_user_personality: 'Understanding personality',
  get_user_background: 'Reading background',
  query_user_profile: 'Querying profile',
};

export function ToolInvocation({ tool, variant }: ToolInvocationProps) {
  const toolBaseName = tool.toolName.split('__').pop() || tool.toolName;
  const label = TOOL_LABELS[toolBaseName] || toolBaseName;
  const isRunning = tool.status === 'running' || tool.status === 'pending';

  return (
    <div
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono
        backdrop-blur-sm border transition-all duration-300
        ${
          variant === 'a'
            ? 'bg-terracotta-500/10 border-terracotta-500/20 text-terracotta-300'
            : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
        }
        ${isRunning ? 'animate-pulse' : 'opacity-70'}
      `}
    >
      {isRunning ? (
        <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      <span>{label}</span>
    </div>
  );
}
