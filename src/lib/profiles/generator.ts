/**
 * AI-powered profile generation using Claude API
 * Generates rich user profiles with guaranteed tension points
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ProfilePair } from './types';

const PROFILE_GENERATION_PROMPT = `Generate two detailed user profiles for a Friday night planning scenario in NYC.

REQUIREMENTS:
1. Create two distinct personalities with different preferences
2. Include 3-5 GUARANTEED TENSION POINTS where their preferences conflict:
   - Different cuisine preferences (one loves sushi, other is vegetarian)
   - Different price expectations (one wants upscale, other is budget-conscious)
   - Different activity styles (one wants quiet dinner, other wants nightlife)
   - Different neighborhood preferences (one loves Brooklyn, other prefers Manhattan)
   - Different timing constraints (one available early, other works late)

3. For each profile, include NOISE DATA that an AI agent would need to sift through:
   - 3-4 irrelevant childhood memories
   - 2-3 random work anecdotes
   - Random facts about their life
   - This tests the agent's ability to find relevant info

4. Make personalities feel real and three-dimensional

Return ONLY valid JSON (no markdown, no code blocks) matching this exact structure:
{
  "personA": {
    "id": "person-a",
    "name": "First Last",
    "preferences": {
      "cuisines": ["cuisine1", "cuisine2"],
      "dietaryRestrictions": [],
      "priceRange": "moderate",
      "activityTypes": ["activity1", "activity2"],
      "neighborhoods": ["neighborhood1"],
      "socialStyle": "intimate"
    },
    "constraints": {
      "availability": { "start": "6:00 PM", "end": "11:00 PM" },
      "budget": 100,
      "mobilityLimitations": null,
      "mustAvoid": []
    },
    "personality": {
      "communicationStyle": "description",
      "priorities": ["priority1", "priority2"],
      "dealbreakers": ["dealbreaker1"]
    },
    "background": {
      "childhoodMemories": ["memory1", "memory2", "memory3"],
      "workAnecdotes": ["anecdote1", "anecdote2"],
      "randomFacts": ["fact1", "fact2"],
      "recentEvents": ["event1"]
    }
  },
  "personB": { ... same structure ... },
  "tensionPoints": [
    {
      "category": "cuisine",
      "personAPosition": "Loves authentic Japanese omakase",
      "personBPosition": "Strict vegetarian, dislikes raw fish",
      "resolutionHint": "Japanese restaurants with strong vegetarian options"
    }
  ]
}`;

export async function generateProfiles(): Promise<ProfilePair> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: PROFILE_GENERATION_PROMPT }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonText = content.text.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  try {
    const profiles = JSON.parse(jsonText) as ProfilePair;

    // Validate required fields
    if (!profiles.personA || !profiles.personB || !profiles.tensionPoints) {
      throw new Error('Invalid profile structure: missing required fields');
    }

    return profiles;
  } catch (error) {
    console.error('Failed to parse profile JSON:', jsonText.slice(0, 500));
    throw new Error(
      `Failed to parse generated profiles: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
