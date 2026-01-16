# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3001)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Overview

This is a demo application showcasing the Claude Agent SDK. Two AI assistant instances ("Hestia") coordinate on behalf of their respective users to plan a Friday night in NYC.

**Key concepts demonstrated:**
- Agent-to-agent interaction (two Hestia instances negotiating via turn-based coordination)
- AI as advocate (each Hestia advocates for their user's preferences, never speaking as the user)
- Intelligent context fetching (Hestia queries user profiles via MCP tools, sifting through relevant and irrelevant noise data)
- In-process MCP servers (each agent has its own MCP server for profile access)
- SSE streaming for real-time coordination updates

## Architecture

```
┌─────────────┐                           ┌─────────────┐
│  Person A   │                           │  Person B   │
│ (generated) │                           │ (generated) │
└──────┬──────┘                           └──────┬──────┘
       │ user context                            │ user context
       ▼                                         ▼
┌─────────────┐      coordinate           ┌─────────────┐
│   Hestia    │◄────────────────────────►│   Hestia    │
│(for Person A)│                          │(for Person B)│
└──────┬──────┘                           └──────┬──────┘
       │ MCP tools                               │ MCP tools
       ▼                                         ▼
┌─────────────┐                           ┌─────────────┐
│MCP Server A │                           │MCP Server B │
│(profile_a)  │                           │(profile_b)  │
└─────────────┘                           └─────────────┘
```

- User profiles are AI-generated at runtime with preferences, constraints, personality, and irrelevant noise data
- Both Hestia instances use `claude-sonnet-4-20250514` with identical system prompts but different user contexts
- The `CoordinationOrchestrator` manages turn-based conversation (max 20 turns)
- Agreement is detected when agents output "AGREEMENT REACHED:" after meaningful negotiation

## File Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── coordination/   # SSE endpoint for agent coordination
│   │   └── generate-profiles/  # Profile generation endpoint
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
│   ├── ConversationViewer.tsx  # Real-time message display
│   ├── DemoContainer.tsx       # Main app container
│   ├── FinalPlan.tsx           # Agreed plan display
│   ├── ProfileCard.tsx         # User profile display
│   └── ToolInvocation.tsx      # Tool call visualization
├── hooks/
│   ├── useCoordination.ts  # Coordination state management
│   └── useProfiles.ts      # Profile generation hook
└── lib/
    ├── agents/
    │   ├── coordinator.ts  # CoordinationOrchestrator class
    │   ├── hestia.ts       # System prompts and turn creation
    │   └── types.ts        # Agent and event types
    ├── mcp/
    │   ├── server.ts       # createProfileMcpServer factory
    │   └── tools/
    │       └── profile-tools.ts  # MCP tool definitions
    └── profiles/
        ├── generator.ts    # AI profile generation
        └── types.ts        # Profile type definitions
```

## Key Implementation Details

**Agent SDK Usage (`src/lib/agents/coordinator.ts`):**
- Uses `query()` from `@anthropic-ai/claude-agent-sdk` for streaming agent responses
- Each Hestia gets its own MCP server with restricted tool access (only their user's profile)
- Streaming events: `stream_event`, `assistant`, `result`

**MCP Tools (`src/lib/mcp/tools/profile-tools.ts`):**
- `get_user_preferences` - Cuisine, activities, neighborhoods, social style
- `get_user_constraints` - Availability, budget, mobility limitations
- `get_user_personality` - Communication style, priorities, dealbreakers
- `get_user_background` - Noise data (memories, anecdotes, random facts)
- `query_user_profile` - Comprehensive overview

**Coordination Events (`src/lib/agents/types.ts`):**
- `turn_start`, `text_delta`, `tool_start`, `tool_complete`, `turn_complete`
- `agreement_reached` - Contains parsed plan with activities and compromises
- `error` - Error handling

## Tech Stack

- Next.js 16.1.2 with App Router (`src/app/`)
- React 19.2.3
- TypeScript with strict mode
- Tailwind CSS 4
- `@anthropic-ai/claude-agent-sdk` ^0.2.7
- `@anthropic-ai/sdk` ^0.71.2
- Zod 4 for tool parameter validation
- Path alias: `@/*` maps to `./src/*`

## Reference Documentation

See `docs/CLAUDE_AGENT_SDK.md` for Claude Agent SDK documentation.
