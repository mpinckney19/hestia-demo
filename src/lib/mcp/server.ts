/**
 * In-process MCP server for serving user profile data to Hestia agents
 */

import { createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import type { UserProfile } from '@/lib/profiles/types';
import { createProfileTools } from './tools/profile-tools';

/**
 * Creates an MCP server configured with tools for querying a specific user profile
 * @param profile - The user profile this server will serve
 * @param serverName - Unique name for this server (e.g., 'profile_a' or 'profile_b')
 */
export function createProfileMcpServer(profile: UserProfile, serverName: string) {
  const tools = createProfileTools(profile);

  return createSdkMcpServer({
    name: serverName,
    version: '1.0.0',
    tools,
  });
}
