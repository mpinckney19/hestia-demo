/**
 * AI-powered profile generation using Claude API
 * Uses tool use to guarantee valid JSON output
 */

import Anthropic from '@anthropic-ai/sdk';
import type { ProfilePair, SocialProfile, Post } from './types';

const PROFILE_GENERATION_PROMPT = `Generate two distinct NYC-based people with realistic social media profiles.

For each person, create:
1. A short bio (like a real social media bio - punchy, indirect signals only)
2. 20 realistic social media posts spanning the last few months

REQUIREMENTS:
- Each person should have a consistent voice and lifestyle that comes through their posts
- Posts should feel authentic - the mix of mundane, interesting, personal, and random that real people post
- Include a variety: food, work, friends, complaints, jokes, photos, life updates, shared articles
- Posts should pass the "would a real person post this?" test
- Each post is ~30-50 words describing what was posted plus any caption
- The two people should have naturally different lifestyles (not forced opposites, just different)

DO NOT:
- Create artificially opposed preferences
- Signal specific categories (budget, dietary, etc.) explicitly
- Make posts that feel like data points rather than authentic content

Call the save_profiles tool with the two generated profiles. Generate exactly 20 posts per person with timestamps from October 2024 to January 2025.`;

// Tool definition for structured output
const profileTool: Anthropic.Tool = {
  name: 'save_profiles',
  description: 'Save the generated social media profiles for both people',
  input_schema: {
    type: 'object' as const,
    properties: {
      personA: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique identifier, use "person-a"' },
          name: { type: 'string', description: 'Full name of the person' },
          bio: { type: 'string', description: 'Short social media bio' },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique post ID' },
                timestamp: { type: 'string', description: 'ISO 8601 timestamp' },
                content: { type: 'string', description: 'Description of the post content and caption' },
                location: { type: 'string', description: 'Optional location tag' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Optional hashtags or tags' },
              },
              required: ['id', 'timestamp', 'content'],
            },
          },
        },
        required: ['id', 'name', 'bio', 'posts'],
      },
      personB: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Unique identifier, use "person-b"' },
          name: { type: 'string', description: 'Full name of the person' },
          bio: { type: 'string', description: 'Short social media bio' },
          posts: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Unique post ID' },
                timestamp: { type: 'string', description: 'ISO 8601 timestamp' },
                content: { type: 'string', description: 'Description of the post content and caption' },
                location: { type: 'string', description: 'Optional location tag' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Optional hashtags or tags' },
              },
              required: ['id', 'timestamp', 'content'],
            },
          },
        },
        required: ['id', 'name', 'bio', 'posts'],
      },
    },
    required: ['personA', 'personB'],
  },
};

interface ProfileToolInput {
  personA: SocialProfile;
  personB: SocialProfile;
}

export async function generateProfiles(): Promise<ProfilePair> {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    tools: [profileTool],
    tool_choice: { type: 'tool', name: 'save_profiles' },
    messages: [{ role: 'user', content: PROFILE_GENERATION_PROMPT }],
  });

  // Find the tool use block
  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
  );

  if (!toolUse) {
    throw new Error('No tool use in response - generation failed');
  }

  const input = toolUse.input as ProfileToolInput;

  // Validate the structure
  if (!input.personA || !input.personB) {
    throw new Error('Invalid profile structure: missing personA or personB');
  }

  if (!input.personA.posts?.length || !input.personB.posts?.length) {
    throw new Error('Invalid profile structure: missing posts');
  }

  // Ensure posts have all required fields with defaults
  const normalizePost = (post: Partial<Post>, index: number, prefix: string): Post => ({
    id: post.id || `${prefix}${index + 1}`,
    timestamp: post.timestamp || new Date().toISOString(),
    content: post.content || '',
    location: post.location,
    tags: post.tags,
  });

  const profiles: ProfilePair = {
    personA: {
      ...input.personA,
      posts: input.personA.posts.map((p, i) => normalizePost(p, i, 'a')),
    },
    personB: {
      ...input.personB,
      posts: input.personB.posts.map((p, i) => normalizePost(p, i, 'b')),
    },
  };

  return profiles;
}
