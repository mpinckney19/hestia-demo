import { NextRequest } from 'next/server';
import { CoordinationOrchestrator } from '@/lib/agents/coordinator';
import type { ProfilePair } from '@/lib/profiles/types';
import type { CoordinationEvent } from '@/lib/agents/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_SCENARIO = 'Plan a Friday night out in NYC that works for both people.';
const DEFAULT_SCENARIO_ID = 'friday_night';
const DEFAULT_SCENARIO_LABEL = 'Friday Night';

export async function POST(request: NextRequest) {
  let profiles: ProfilePair;
  let scenario: string;
  let scenarioId: string;
  let scenarioLabel: string;

  try {
    const body = await request.json();
    profiles = body.profiles as ProfilePair;
    scenario = body.scenario || DEFAULT_SCENARIO;
    scenarioId = body.scenarioId || DEFAULT_SCENARIO_ID;
    scenarioLabel = body.scenarioLabel || DEFAULT_SCENARIO_LABEL;

    if (!profiles?.personA || !profiles?.personB) {
      return new Response(JSON.stringify({ error: 'Invalid profiles data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: CoordinationEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(encoder.encode(data));
      };

      try {
        const orchestrator = new CoordinationOrchestrator(profiles, scenario, scenarioId, scenarioLabel);

        for await (const event of orchestrator.coordinate()) {
          sendEvent(event);
        }

        controller.close();
      } catch (error) {
        const errorEvent: CoordinationEvent = {
          type: 'error',
          data: { message: error instanceof Error ? error.message : 'Unknown error' },
        };
        sendEvent(errorEvent);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
