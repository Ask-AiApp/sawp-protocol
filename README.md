# sawp-protocol
SAWP (Spatial Agentic Workflow Protocol) — an open protocol for governed agentic orchestration where interfaces emerge from workflow state, enabling persistent, inspectable, recoverable AI execution from natural language intent.

# SAWP — Spatial Agentic Workflow Protocol

**Artiligenz IP · Artiligenz Ltd (UK) · 2025**

SAWP is an open protocol for governed agentic workflow orchestration.

It defines the layer that sits between user intent and agent execution — turning natural language into persistent, inspectable, recoverable workflow topologies where tasks, agents, outputs, failures, and human interventions remain structurally connected throughout execution.

## What SAWP is

SAWP is not a UI library. It is not a workflow builder. It is not a chat interface.

SAWP is the substrate that lets any agent produce a coherent, inspectable, human-readable surface without a designer in the loop.

The interface is not designed first. The interface is generated from workflow state.

## The core primitive

Every entity in a SAWP system is a Node:

```typescript
type SAWPNode = {
  id: string
  tier: 'core' | 'task' | 'agent' | 'tool' | 'output' | 'failure' | 'recovery'
  label: string
  sub: string
  status: 'pending' | 'active' | 'complete' | 'blocked' | 'review' | 'failed' | 'recovered' | 'archived'
  orbit: number
  payload: Record<string, unknown>
  render_hints: SAWPRenderHints
  execution_contract: SAWPExecutionContract
  intervention: SAWPInterventionPayload | null
}
```

## The renderer contract

The renderer reads node state and generates the appropriate surface automatically:

| Condition | Renderer |
|-----------|----------|
| Any node blocked or review | Intervention surface |
| All work nodes complete | Archive |
| More than one active node | Board |
| Default | Timeline |

No human decides which surface appears. The protocol decides.

## The seven axioms

SAWP governance is enforced by seven non-overridable axioms. See [AXIOMS.md](./AXIOMS.md).

## Files in this repository

| File | Purpose |
|------|---------|
| `README.md` | This file |
| `SPEC.md` | Full protocol specification |
| `node-schema.ts` | TypeScript node type definitions |
| `renderer-contract.md` | Renderer grammar rules |
| `AXIOMS.md` | The seven governance axioms |

## The proof of concept

The Artiligenz Agentic OS at [artiligenz.ai](https://artiligenz.ai) is the reference implementation of SAWP.

The blank screen comes alive when you type. The surface generates from workflow state. Nothing is pre-designed.

## Intellectual property

SAWP protocol specification, node schema, renderer contract, and governance axioms are intellectual property of Artiligenz Ltd (UK).

The specification is published under Creative Commons Attribution 4.0. You may implement the protocol freely. You may not claim authorship of the protocol itself.

Implementation code (edge functions, database schema, artifact executor) remains proprietary.

---

*Artiligenz Ltd (UK) · contact@artiligenz.com · artiligenz.ai*
