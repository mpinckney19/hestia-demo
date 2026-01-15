# Agent SDK Social Planning Demo

## Concept
Two instances of the same AI assistant ("Hestia") coordinate on behalf of their respective users to plan a Friday night in NYC.

## What This Demonstrates

1. **Agent-to-agent interaction**
   - Two Hestia instances negotiating with each other
   - Same AI system, different user contexts

2. **AI as advocate**
   - Each Hestia advocates for their user's preferences and needs
   - Not roleplay - Hestia speaks as an assistant, not as the user

3. **Intelligent context fetching**
   - Hestia doesn't get all user info upfront
   - Queries relevant details as the conversation requires them
   - Must sift through a large pool of info (relevant + irrelevant) to find what matters

---

## The Players

### The Users (AI-generated each run)
- **Person A** - Rich profile generated at runtime with preferences, constraints, personality, backstory, and random irrelevant facts
- **Person B** - Different profile with some compatible and some conflicting traits
- Profiles are generated with guaranteed tension points to make negotiation interesting

### The AI Assistants
- **Hestia for Person A** - Same Hestia system, loaded with Person A's context
- **Hestia for Person B** - Same Hestia system, loaded with Person B's context

---

## How It Works

```
┌─────────────┐                           ┌─────────────┐
│  Person A   │                           │  Person B   │
│ (generated) │                           │ (generated) │
└──────┬──────┘                           └──────┬──────┘
       │                                         │
       │ user context                            │ user context
       ▼                                         ▼
┌─────────────┐      coordinate           ┌─────────────┐
│   Hestia    │◄────────────────────────►│   Hestia    │
│(for Person A)│                          │(for Person B)│
└─────────────┘                           └─────────────┘
```

1. User clicks "Start Planning"
2. AI generates two rich user profiles (Person A and Person B)
3. Both Hestia instances begin a conversation
4. Each Hestia fetches info about their user as needed (sifting through relevant and irrelevant data)
5. They negotiate, compromise, and advocate
6. They arrive at a plan both users would enjoy

---

## Build Phases

### Phase 1: Setup
- Next.js app with Tailwind
- Install Agent SDK and MCP SDK

### Phase 2: User Profile Generation & Context Server
- AI generates rich profiles for both users at runtime (not hardcoded)
- Each profile includes:
  - Relevant info (preferences, constraints, personality)
  - Irrelevant info (childhood memories, work anecdotes, random facts)
  - Guaranteed tension points for interesting negotiation
- Build MCP server that serves user info to Hestia instances
- Hestia must sift through the noise to find what matters

### Phase 3: Agent Orchestration
- Set up two Hestia subagents
- Wire up context-fetching tools
- Create streaming API

### Phase 4: Frontend
- Display both users
- Show live Hestia-to-Hestia conversation
- Display final agreed plan

### Phase 5: Polish
- Make tool calls visible ("Checking Marcus's food preferences...")
- Styling and UX

---

## Key Design Decisions

- **Hestia is NOT the user** - It speaks as an advocate ("Person A would enjoy..."), not as the person
- **Same system, different context** - Both Hestias have identical capabilities, just different user data
- **Profiles are AI-generated** - Rich, varied data with relevant + irrelevant info each run
- **Context is fetched, not dumped** - Hestia must sift through noise to find what matters
