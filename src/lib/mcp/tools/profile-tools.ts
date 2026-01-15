/**
 * MCP tools for querying user profile data
 * Hestia uses these to learn about their assigned user
 */

import { z } from 'zod/v4';
import { tool } from '@anthropic-ai/claude-agent-sdk';
import type { UserProfile } from '@/lib/profiles/types';

/**
 * Creates MCP tools bound to a specific user profile
 */
export function createProfileTools(profile: UserProfile) {
  const getUserPreferences = tool(
    'get_user_preferences',
    "Get the user's preferences for dining, activities, and social style. Returns structured preference data.",
    {
      category: z
        .enum(['cuisine', 'activities', 'neighborhoods', 'social_style', 'dietary', 'price', 'all'])
        .describe('Which preference category to retrieve'),
    },
    async ({ category }) => {
      if (category === 'all') {
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(profile.preferences, null, 2) }],
        };
      }

      const categoryMap: Record<string, unknown> = {
        cuisine: { cuisines: profile.preferences.cuisines },
        activities: { activityTypes: profile.preferences.activityTypes },
        neighborhoods: { neighborhoods: profile.preferences.neighborhoods },
        social_style: { socialStyle: profile.preferences.socialStyle },
        dietary: { dietaryRestrictions: profile.preferences.dietaryRestrictions },
        price: { priceRange: profile.preferences.priceRange },
      };

      const result = categoryMap[category] || { error: `Unknown category: ${category}` };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
      };
    }
  );

  const getUserConstraints = tool(
    'get_user_constraints',
    "Get the user's constraints including availability, budget, and any limitations.",
    {},
    async () => {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(profile.constraints, null, 2) }],
      };
    }
  );

  const getUserPersonality = tool(
    'get_user_personality',
    "Get information about the user's personality, priorities, and dealbreakers.",
    {},
    async () => {
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(profile.personality, null, 2) }],
      };
    }
  );

  const getUserBackground = tool(
    'get_user_background',
    "Get background information about the user. Note: This includes various personal details - you may need to determine what is relevant to planning.",
    {
      topic: z
        .string()
        .optional()
        .describe('Optional topic to filter background info (e.g., "food", "activities")'),
    },
    async () => {
      // Return ALL background info - agent must sift through
      // This is intentional to test intelligent context fetching
      const background = profile.background;
      const allInfo = [
        ...background.childhoodMemories.map((m) => `[Memory] ${m}`),
        ...background.workAnecdotes.map((a) => `[Work] ${a}`),
        ...background.randomFacts.map((f) => `[Fact] ${f}`),
        ...background.recentEvents.map((e) => `[Recent] ${e}`),
      ];

      return {
        content: [{ type: 'text' as const, text: allInfo.join('\n\n') }],
      };
    }
  );

  const queryUserProfile = tool(
    'query_user_profile',
    "Get a comprehensive overview of the user including name, preferences, constraints, and personality.",
    {},
    async () => {
      const overview = {
        name: profile.name,
        preferences: profile.preferences,
        constraints: profile.constraints,
        personality: profile.personality,
        // Include a couple random facts as noise
        additionalContext: profile.background.randomFacts.slice(0, 2),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(overview, null, 2) }],
      };
    }
  );

  return [
    getUserPreferences,
    getUserConstraints,
    getUserPersonality,
    getUserBackground,
    queryUserProfile,
  ];
}
