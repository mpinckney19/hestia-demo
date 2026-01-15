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
- Agent-to-agent interaction (two Hestia instances negotiating)
- AI as advocate (each Hestia advocates for their user's preferences)
- Intelligent context fetching (Hestia queries user details as needed, sifting through relevant and irrelevant data)

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
└─────────────┘                           └─────────────┘
```

- User profiles are AI-generated at runtime with preferences, constraints, personality, and irrelevant noise data
- Both Hestia instances have identical capabilities but different user contexts
- Hestia speaks as an advocate ("Person A would enjoy..."), not as the user

## Tech Stack

- Next.js 16 with App Router (`src/app/`)
- TypeScript with strict mode
- Tailwind CSS 4
- Path alias: `@/*` maps to `./src/*`

## Reference Documentation

See `docs/CLAUDE_AGENT_SDK.md` for Claude Agent SDK documentation.
