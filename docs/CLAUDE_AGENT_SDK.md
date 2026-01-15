# Claude Agent SDK Documentation

A comprehensive reference guide for building autonomous AI agents with Anthropic's Claude Agent SDK.

## Overview

The Claude Agent SDK is a framework for building autonomous AI agents that can operate within computational environments. Originally developed as the Claude Code SDK for internal development workflows at Anthropic, it has been reconceptualized to reflect its broader applicability beyond coding tasks.

**Core Philosophy**: Give Claude access to a computer-like environment where it can operate as developers do, rather than treating the language model as a black box requiring external tool orchestration.

**Key Features**:
- Packaged agent loop
- Built-in tools
- Context management capabilities
- Available for Python and TypeScript

---

## Installation

### Python

```bash
pip install claude-agent-sdk
```

- Requires Python 3.10+
- Claude Code CLI comes bundled with the package

### TypeScript/JavaScript

```bash
npm install @anthropic-ai/claude-agent-sdk
```

Then install Claude Code CLI separately:

```bash
npm install -g @anthropic-ai/claude-code
```

- Requires Node.js 18+

---

## Authentication

### API Key (Recommended)

Set the `ANTHROPIC_API_KEY` environment variable:

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### Cloud Provider Authentication

| Provider | Environment Variable |
|----------|---------------------|
| AWS Bedrock | `CLAUDE_CODE_USE_BEDROCK=1` |
| Google Vertex | `CLAUDE_CODE_USE_VERTEX=1` |
| Azure Foundry | `CLAUDE_CODE_USE_FOUNDRY=1` |

**Important**: Third-party developers are not permitted to offer Claude.ai login or implement rate limiting for SDK-based products without Anthropic approval.

---

## Built-in Tools

| Tool | Description | Use Case |
|------|-------------|----------|
| **Read** | Examine file contents | Code analysis, configuration review |
| **Write** | Create new files | Code generation, file creation |
| **Edit** | Modify existing files | Bug fixes, targeted improvements |
| **Bash** | Execute shell commands | System operations, scripts |
| **Glob** | Pattern-based file discovery | Find files matching criteria |
| **Grep** | Content search with regex | Find patterns in files |
| **Task** | Delegate to subagents | Parallel processing, context isolation |
| **WebSearch** | Search the web | Access current information |
| **TodoRead/TodoWrite** | Task list management | Track progress across sessions |

---

## Basic Usage

### Python

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"])
    ):
        print(message)

asyncio.run(main())
```

### TypeScript

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
    prompt: "Find and fix the bug in auth.py",
    options: {
        allowedTools: ["Read", "Edit", "Bash"]
    }
})) {
    console.log(message);
}
```

---

## Streaming

The SDK returns an async iterator that yields messages as the agent works:

- **Text blocks**: Claude's written responses and reasoning
- **Tool use blocks**: Tool invocations and parameters
- **Result blocks**: Task completion and final outputs

### Input Modes

| Mode | Description |
|------|-------------|
| **Streaming Input** | Preferred mode - agents operate as long-lived processes, can accept user input, handle interruptions, manage session state |
| **Single Message** | Simpler interface for one-off queries, no conversation context |

---

## Session Management

Sessions persist conversation history and state across multiple interactions.

### Session ID

The SDK creates a session and returns a session ID in the initial system message. Store this ID for later resumption.

### Continuation Modes

| Mode | Description |
|------|-------------|
| **Default** | Appends new messages to existing conversation history |
| **Fork** | Creates new session ID branching from resumption point |

### Multi-Turn Conversations

```python
# Python - using ClaudeSDKClient for persistent sessions
from claude_agent_sdk import ClaudeSDKClient

client = ClaudeSDKClient()
# Multiple query() calls maintain session state
```

---

## Subagents

Subagents enable parallel processing and context isolation by spawning specialized agent instances.

### Benefits

1. **Parallelization**: Multiple subagents work concurrently on independent tasks
2. **Context Management**: Each subagent has isolated context, preventing window exhaustion

### Definition

```python
options = ClaudeAgentOptions(
    agents=[
        {
            "description": "Security code reviewer",
            "prompt": "Analyze code for security vulnerabilities",
            "allowed_tools": ["Read", "Grep", "Glob"]
        },
        {
            "description": "Test coverage analyzer",
            "prompt": "Analyze test coverage and identify gaps",
            "allowed_tools": ["Read", "Grep", "Glob", "Bash"]
        }
    ]
)
```

Claude automatically invokes subagents via the **Task** tool based on task requirements.

---

## Custom Tools (MCP)

The SDK supports custom tools through Model Context Protocol (MCP) servers.

### Approaches

| Type | Description |
|------|-------------|
| **External MCP Server** | Runs as separate process - offers isolation, independent scaling |
| **In-process SDK MCP Server** | Executes within agent process - simpler, lower latency |

### Tool Naming Convention

Tools are referenced as `mcp__{server_name}__{tool_name}`

### Creating Custom Tools

```python
from claude_agent_sdk import createSdkMcpServer, tool

@tool(
    name="my_custom_tool",
    description="Does something useful",
    input_schema={...}
)
async def my_custom_tool(params):
    # Implementation
    return result
```

### Pre-built MCP Integrations

- Slack
- GitHub
- Google Drive
- Asana
- Playwright
- And more...

---

## Hooks

Hooks are callback functions that execute at specific events during agent operation.

### Hook Types

| Hook | Timing | Use Case |
|------|--------|----------|
| **PreToolUse** | Before tool invocation | Validate, modify, or block operations |
| **PostToolUse** | After successful completion | Observe results, add context |
| **PostToolUseFailure** | After tool failure | Error handling, recovery |
| **PermissionRequest** | On permission prompts | Automated approval/denial |
| **SessionStart/End** | Session lifecycle | Setup/cleanup |
| **Stop** | When Claude finishes | Final processing |
| **SubagentStart/Stop** | Subagent lifecycle | Track subagent events |
| **PreCompact** | Before context compaction | Observe/modify compaction |

### Hook Response Options

- `permissionDecision`: Allow, deny, or ask for tool execution
- `updatedInput`: Modified parameters for the tool

### Hook Matchers

Use regex patterns to selectively apply hooks:

```python
# Only apply to Edit and Write tools
hook_matcher = "Edit|Write"
```

---

## Permissions

### Permission Modes

| Mode | Description |
|------|-------------|
| **Default** | Requires approval for most tools (safest) |
| **acceptEdits** | Auto-approves file ops, requires approval for network/dangerous bash |
| **dontAsk** | Auto-denies all unless explicitly permitted (for CI/CD) |
| **bypassPermissions** | No approval needed (only for sandboxed environments) |

### Permission Rules (settings.json)

```json
{
  "permissions": {
    "allow": ["Read", "Glob", "Grep"],
    "deny": ["Bash"],
    "ask": ["Edit", "Write"]
  }
}
```

Rules evaluated in order: deny > allow > ask

### canUseTool Callback

Programmatic permission logic with 60-second timeout:

```python
def can_use_tool(tool_name, input_params):
    # Custom authorization logic
    return True  # or False
```

---

## Sandboxing

OS-level isolation that constrains agent access at the kernel level.

### Platforms

- **Linux**: bubblewrap
- **macOS**: seatbelt

### Dual-Isolation Architecture

Both filesystem AND network sandboxing are required for genuine security:

- Without network isolation: compromised agent could exfiltrate files
- Without filesystem isolation: agent could access files outside scope

### Benefits

Agents can work autonomously within defined directories and network endpoints without permission prompts.

---

## Context Management

### Automatic Context Compaction

When token usage approaches limits, the SDK summarizes conversation history.

### Threshold Configuration

| Threshold | Tokens | Use Case |
|-----------|--------|----------|
| Low | 5,000-20,000 | Iterative processing with clear checkpoints |
| Medium | 50,000-100,000 | Multi-phase workflows |

### File System as External Memory

- Store progress files, analysis artifacts, state information
- Retrieve only what's needed at each step
- Enables month-long projects through multi-session workflows

---

## Configuration

### Configuration Hierarchy

1. **User settings**: Apply globally
2. **Project settings**: Apply within specific project directory
3. **Local settings**: Apply to specific machine

### Settings File Location

`.claude/settings.json`

### Key Configuration Options

```json
{
  "allowedTools": ["Read", "Edit", "Bash"],
  "permissionMode": "acceptEdits",
  "customSystemPrompt": "You are a helpful coding assistant...",
  "mcpServers": [...],
  "hooks": [...],
  "sandboxing": {
    "filesystem": [...],
    "network": [...]
  }
}
```

---

## Skills

Packaged expertise providing instructions, code examples, and reference materials.

### Progressive Disclosure Model

1. **Metadata**: Always available
2. **Full instructions**: Load when triggered
3. **Detailed resources**: Load only when needed

This enables unlimited skill content without context window penalty.

---

## Best Practices

### Context Management
- Don't dump entire codebases into context
- Structure information access for on-demand discovery

### Tool Design
- Use clear, specific names and descriptions
- Tools should represent primary actions the agent should consider

### Prompt Engineering
- Define clear success criteria and execution constraints
- Include examples demonstrating expected behavior

### Testing
- Test edge cases and error conditions
- Build representative test sets for programmatic evaluation

### Permissions
- Start restrictive, relax based on observed safe patterns
- Balance security with usability

### Long-Running Agents
- Write progress files and git commits
- Enable agents to understand work history across sessions

---

## Common Patterns

### Code Review Agent

```python
options = ClaudeAgentOptions(
    allowed_tools=["Read", "Glob", "Grep"],
    permission_mode="acceptEdits"
)

async for message in query(
    prompt="Review this codebase for bugs, security issues, and improvements",
    options=options
):
    process(message)
```

### Initializer + Coding Agent Pattern

For long-running projects spanning multiple sessions:

1. **Initializer Agent** (runs once):
   - Creates initialization script
   - Sets up progress file
   - Creates initial git commit

2. **Coding Agents** (subsequent sessions):
   - Read progress file and git history
   - Make incremental progress
   - Update progress tracking

---

## Links and Resources

- **Overview**: https://platform.claude.com/docs/en/agent-sdk/overview
- **Quickstart**: https://platform.claude.com/docs/en/agent-sdk/quickstart
- **Python SDK**: https://platform.claude.com/docs/en/agent-sdk/python
- **TypeScript SDK**: https://platform.claude.com/docs/en/agent-sdk/typescript
- **GitHub (Python)**: https://github.com/anthropics/claude-agent-sdk-python
- **GitHub (TypeScript)**: https://github.com/anthropics/claude-agent-sdk-typescript
- **Demo Repository**: https://github.com/anthropics/claude-agent-sdk-demos
- **Sessions**: https://platform.claude.com/docs/en/agent-sdk/sessions
- **Subagents**: https://platform.claude.com/docs/en/agent-sdk/subagents
- **Hooks**: https://platform.claude.com/docs/en/agent-sdk/hooks
- **Permissions**: https://platform.claude.com/docs/en/agent-sdk/permissions
- **Custom Tools (MCP)**: https://platform.claude.com/docs/en/agent-sdk/custom-tools
- **Secure Deployment**: https://platform.claude.com/docs/en/agent-sdk/secure-deployment
- **Sandboxing**: https://code.claude.com/docs/en/sandboxing
- **Building Agents Guide**: https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk
- **Long-Running Agents**: https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
