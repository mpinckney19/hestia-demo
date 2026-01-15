'use client';

import { useEffect, useRef } from 'react';
import type { AgentMessage, AgentRole } from '@/lib/agents/types';
import { ToolInvocation } from './ToolInvocation';

interface ConversationViewerProps {
  messages: AgentMessage[];
  currentMessage?: AgentMessage;
  currentSpeaker?: AgentRole;
}

export function ConversationViewer({
  messages,
  currentMessage,
  currentSpeaker,
}: ConversationViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentMessage?.content]);

  // Only include currentMessage if it's not already in the messages array
  const allMessages = currentMessage && !messages.some(m => m.id === currentMessage.id)
    ? [...messages, currentMessage]
    : messages;

  if (allMessages.length === 0 && !currentSpeaker) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-terracotta-500/20 to-cyan-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-stone-400 font-medium">No conversation yet</p>
            <p className="text-stone-600 text-sm mt-1">Click &quot;Start Planning&quot; to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scroll-smooth">
      {allMessages.map((message, index) => {
        const isA = message.role === 'hestia_a';
        const isCurrentlyTyping = currentMessage?.id === message.id;

        return (
          <div
            key={message.id}
            className={`flex ${isA ? 'justify-start' : 'justify-end'}`}
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <div
              className={`
                max-w-[85%] space-y-3
                animate-in fade-in slide-in-from-bottom-2 duration-300
              `}
            >
              {/* Agent Label */}
              <div className={`flex items-center gap-2 ${isA ? '' : 'justify-end'}`}>
                <div
                  className={`
                    w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold
                    ${isA ? 'bg-terracotta-500/20 text-terracotta-400' : 'bg-cyan-500/20 text-cyan-400'}
                  `}
                >
                  {isA ? 'A' : 'B'}
                </div>
                <span className="text-xs font-mono text-stone-500">
                  Hestia for Person {isA ? 'A' : 'B'}
                </span>
                {isCurrentlyTyping && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500/80">typing</span>
                  </span>
                )}
              </div>

              {/* Tool Invocations */}
              {message.toolInvocations && message.toolInvocations.length > 0 && (
                <div className={`flex flex-wrap gap-2 ${isA ? '' : 'justify-end'}`}>
                  {message.toolInvocations.map((tool) => (
                    <ToolInvocation key={tool.id} tool={tool} variant={isA ? 'a' : 'b'} />
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`
                  relative px-5 py-4 rounded-2xl backdrop-blur-sm border
                  ${isA
                    ? 'bg-gradient-to-br from-terracotta-900/50 to-terracotta-950/50 border-terracotta-700/30 rounded-tl-sm'
                    : 'bg-gradient-to-br from-cyan-900/50 to-cyan-950/50 border-cyan-700/30 rounded-tr-sm'
                  }
                `}
              >
                {/* Message content */}
                <div className="text-sm text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {message.content || (
                    <span className="inline-flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>

                {/* Decorative corner */}
                <div
                  className={`
                    absolute w-3 h-3 -bottom-px
                    ${isA
                      ? '-left-px border-l border-b border-terracotta-700/30 rounded-br-lg bg-gradient-to-br from-terracotta-900/50 to-transparent'
                      : '-right-px border-r border-b border-cyan-700/30 rounded-bl-lg bg-gradient-to-bl from-cyan-900/50 to-transparent'
                    }
                  `}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Typing indicator when starting a new turn */}
      {currentSpeaker && !currentMessage && (
        <div className={`flex ${currentSpeaker === 'hestia_a' ? 'justify-start' : 'justify-end'}`}>
          <div className="flex items-center gap-2 px-4 py-3 rounded-full bg-stone-800/50 border border-stone-700/50">
            <div
              className={`
                w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold
                ${currentSpeaker === 'hestia_a' ? 'bg-terracotta-500/20 text-terracotta-400' : 'bg-cyan-500/20 text-cyan-400'}
              `}
            >
              {currentSpeaker === 'hestia_a' ? 'A' : 'B'}
            </div>
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-stone-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
