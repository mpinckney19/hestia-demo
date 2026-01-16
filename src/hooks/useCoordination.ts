import { useState, useCallback, useRef } from 'react';
import type { ProfilePair } from '@/lib/profiles/types';
import type {
  CoordinationState,
  CoordinationEvent,
  AgentMessage,
} from '@/lib/agents/types';

const initialState: CoordinationState = {
  status: 'idle',
  messages: [],
};

export function useCoordination() {
  const [state, setState] = useState<CoordinationState>(initialState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentMessageRef = useRef<AgentMessage | null>(null);

  // Define handleEvent first so it can be used in startCoordination
  const handleEvent = useCallback((event: CoordinationEvent) => {
    switch (event.type) {
      case 'turn_start': {
        const newMessage: AgentMessage = {
          id: crypto.randomUUID(),
          role: event.data.speaker,
          content: '',
          timestamp: Date.now(),
          toolInvocations: [],
        };
        currentMessageRef.current = newMessage;
        setState((prev) => ({
          ...prev,
          currentSpeaker: event.data.speaker,
          currentMessage: newMessage,
        }));
        break;
      }

      case 'text_delta': {
        const msg = currentMessageRef.current;
        if (msg) {
          msg.content += event.data.content;
          setState((prev) => ({
            ...prev,
            currentMessage: { ...msg },
          }));
        }
        break;
      }

      case 'tool_start': {
        const msg = currentMessageRef.current;
        if (msg) {
          const tools = msg.toolInvocations || [];
          tools.push(event.data.tool);
          msg.toolInvocations = tools;
          setState((prev) => ({
            ...prev,
            currentMessage: { ...msg },
          }));
        }
        break;
      }

      case 'tool_complete': {
        const msg = currentMessageRef.current;
        if (msg) {
          const tools = msg.toolInvocations || [];
          const tool = tools.find((t) => t.id === event.data.toolId);
          if (tool) {
            tool.status = 'completed';
            tool.output = event.data.output;
          }
          setState((prev) => ({
            ...prev,
            currentMessage: { ...msg },
          }));
        }
        break;
      }

      case 'turn_complete': {
        const completedMessage = currentMessageRef.current;
        if (completedMessage) {
          completedMessage.content = event.data.fullMessage;
          currentMessageRef.current = null;
          setState((prev) => ({
            ...prev,
            messages: [...prev.messages, { ...completedMessage }],
            currentMessage: undefined,
          }));
        }
        break;
      }

      case 'agreement_reached': {
        setState((prev) => ({
          ...prev,
          status: 'agreed',
          finalPlan: event.data,
          currentMessage: undefined,
        }));
        break;
      }

      case 'error': {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: event.data.message,
          currentMessage: undefined,
        }));
        break;
      }
    }
  }, []);

  const startCoordination = useCallback(async (
    profiles: ProfilePair,
    scenario: string,
    scenarioId: string,
    scenarioLabel: string
  ) => {
    // Cancel any existing coordination
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setState({
      status: 'coordinating',
      profiles,
      messages: [],
      currentSpeaker: 'hestia_a',
    });

    try {
      const response = await fetch('/api/coordination', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profiles, scenario, scenarioId, scenarioLabel }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to start coordination');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6)) as CoordinationEvent;
              handleEvent(event);
            } catch {
              console.error('Failed to parse event:', line);
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [handleEvent]);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setState((prev) => ({
      ...prev,
      status: 'idle',
      currentMessage: undefined,
    }));
  }, []);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setState(initialState);
    currentMessageRef.current = null;
  }, []);

  return {
    state,
    startCoordination,
    stop,
    reset,
  };
}
