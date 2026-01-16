/**
 * MCP tools for querying user social media profile data
 * Hestia uses these to learn about their assigned user from their posts
 */

import { z } from 'zod/v4';
import { tool } from '@anthropic-ai/claude-agent-sdk';
import type { SocialProfile, Post } from '@/lib/profiles/types';

/**
 * Creates MCP tools bound to a specific social profile
 */
export function createProfileTools(profile: SocialProfile) {
  const getProfile = tool(
    'get_profile',
    "Get the user's name and bio.",
    {},
    async () => {
      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ name: profile.name, bio: profile.bio }, null, 2),
          },
        ],
      };
    }
  );

  const getPosts = tool(
    'get_posts',
    "Browse the user's social media posts. Returns posts in reverse chronological order.",
    {
      count: z
        .number()
        .optional()
        .describe('Number of posts to return (default 10, max 50)'),
      offset: z
        .number()
        .optional()
        .describe('Number of posts to skip for pagination'),
      before: z
        .string()
        .optional()
        .describe('Return posts before this ISO date'),
      after: z
        .string()
        .optional()
        .describe('Return posts after this ISO date'),
    },
    async ({ count = 10, offset = 0, before, after }) => {
      // Sort posts by timestamp descending
      let posts = [...profile.posts].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply date filters
      if (before) {
        const beforeDate = new Date(before).getTime();
        posts = posts.filter((p) => new Date(p.timestamp).getTime() < beforeDate);
      }
      if (after) {
        const afterDate = new Date(after).getTime();
        posts = posts.filter((p) => new Date(p.timestamp).getTime() > afterDate);
      }

      // Apply pagination
      const clampedCount = Math.min(Math.max(count, 1), 50);
      const result = posts.slice(offset, offset + clampedCount);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                posts: result,
                total: posts.length,
                returned: result.length,
                offset,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  const searchPosts = tool(
    'search_posts',
    "Search through the user's posts by content, location, or tags.",
    {
      query: z.string().describe('Search query to match against post content, location, and tags'),
      limit: z
        .number()
        .optional()
        .describe('Maximum number of results to return (default 10)'),
    },
    async ({ query, limit = 10 }) => {
      const queryLower = query.toLowerCase();

      const matchingPosts: Post[] = profile.posts.filter((post) => {
        // Search in content
        if (post.content.toLowerCase().includes(queryLower)) {
          return true;
        }
        // Search in location
        if (post.location?.toLowerCase().includes(queryLower)) {
          return true;
        }
        // Search in tags
        if (post.tags?.some((tag) => tag.toLowerCase().includes(queryLower))) {
          return true;
        }
        return false;
      });

      // Sort by timestamp descending and limit
      const sortedPosts = matchingPosts
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, Math.min(limit, 50));

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              {
                query,
                matches: sortedPosts.length,
                posts: sortedPosts,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  return [getProfile, getPosts, searchPosts];
}
