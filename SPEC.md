# SAWP Protocol Specification

**Version 1.0 · Artiligenz Ltd (UK) · May 2026**
**Reference: ARTL-SAWP-001**

---

## 1. Overview

SAWP (Spatial Agentic Workflow Protocol) is a protocol for governed agentic workflow orchestration. It defines the structural contracts between user intent, agent execution, workflow state, and interface generation.

SAWP solves a specific unsolved problem: when agents execute dynamically branching, failure-prone workflows, existing interfaces cannot represent the execution topology in a human-legible way. SAWP defines a node schema, an execution contract system, a renderer grammar, and a governance layer that together allow any agent to produce a coherent, inspectable, recoverable surface without a designer in the loop.

---

## 2. Architecture

SAWP operates on four layers:

### 2.1 Intent layer
The user expresses intent in natural language. The protocol does not constrain intent format. Intent is the input to the decomposition engine.

### 2.2 Execution topology layer
Intent is decomposed into a structured workflow topology — a directed graph of typed nodes. Each node has a tier, a status, an execution contract, and a set of connections. The topology persists across the entire execution lifecycle.

### 2.3 Semantic routing layer
Each node is routed to the most appropriate agent or model based on its task type. The orchestrator validates all agent outputs before they become node state. Workers never write directly to the topology.

### 2.4 Renderer layer
The renderer reads the current topology state and generates the appropriate surface. The renderer is not authored. It is derived from node state according to the renderer grammar defined in Section 5.

---

## 3. Node Schema

### 3.1 Core node type

```typescript
type SAWPNode = {
  id: string                              // UUID
  workflow_id: string                     // Parent workflow UUID
  tier: SAWPNodeTier                      // Structural role
  label: string                           // Short human-readable label (2–4 words)
  sub: string                             // Plain-English description
  status: SAWPNodeStatus                  // Current execution state
  orbit: number                           // Depth in topology (0 = core)
  payload: Record<string, unknown>        // Execution outputs and artifacts
  render_hints: SAWPRenderHints           // Instructions for the renderer
  execution_contract: SAWPExecutionContract // What this node requires and produces
  intervention: SAWPInterventionPayload | null // Populated when human input required
  created_at: string                      // ISO 8601
  updated_at: string                      // ISO 8601
}
```

### 3.2 Node tiers

| Tier | Role |
|------|------|
| `core` | Workflow intent container. Status derived from children. |
| `task` | Discrete executable unit of work. |
| `agent` | Specialist agent execution node. |
| `tool` | External tool or API call node. |
| `output` | Artifact generation node. Must produce renderable content. |
| `failure` | Created when a node fails. Contains failure context. |
| `recovery` | Recovery execution node. Sibling to the failed node. |

### 3.3 Node statuses

| Status | Meaning |
|--------|---------|
| `pending` | Not yet started. Awaiting dependency completion. |
| `active` | Currently executing. |
| `complete` | Successfully completed. Payload populated. |
| `blocked` | Cannot proceed. Missing dependency or tool failure. |
| `review` | Requires human approval before continuing. |
| `failed` | Terminal failure. Recovery node may be created. |
| `recovered` | Failed but successfully recovered via alternate path. |
| `archived` | Skipped or superseded. Not counted as failed. |

### 3.4 Core node status derivation

The core node status is never manually set. It is always derived from child node aggregate state:

```
if all work nodes are complete/recovered/archived → core = complete
if any work node is blocked or review → core = waiting
if any work node is active → core = active
otherwise → core = pending
```

---

## 4. Execution Contract

Every node carries an execution contract that defines what it requires, what it produces, and what constitutes completion.

```typescript
type SAWPExecutionContract = {
  intent: string                          // What this node achieves
  requires: string[]                      // Dependencies: 'user_input' | 'upstream_node_results' | 'none'
  accepts: string[]                       // Input formats: 'text' | 'voice' | 'file' | 'agent_output' | 'user_approval'
  completion_condition: string            // What marks this node done
  output_schema: Record<string, unknown>  // Shape of the expected payload
  user_action_required: boolean           // Whether human input is needed
  user_prompt: string | null              // What to ask the user if action required
  affordances: string[]                   // Action slugs: 'approve' | 'skip' | 'type_items' | etc.
  next_transition: string | null          // Label of the next node
  recoverable: boolean
  retryable: boolean
}
```

Execution contracts must be generated at decomposition time — not at execution time. The system must know what each node requires before the workflow begins executing.

---

## 5. Renderer Grammar

The renderer is derived from topology state. No human sets the renderer. The protocol derives it.

### 5.1 Derivation rules (applied in order)

```
1. If workflow.execution_phase === 'complete' → archive
2. If workflow.status === 'complete' → archive
3. If coherence_score < 60 → intervention
4. If any node status === 'blocked' or 'review' → intervention
5. If count(nodes where status === 'active') > 1 → board
6. Default → timeline
```

### 5.2 Renderer surfaces

**Timeline** — sequential task display. Nodes stacked vertically with status indicators. Default surface for single-thread execution.

**Board** — parallel agent columns: Active / Pending / Done / Needs Attention. Appears when multiple agents run simultaneously.

**Intervention** — human input required. Shows blocked/review nodes with their intervention contracts. Workflow paused. No autonomous action may proceed.

**Archive** — workflow complete. Shows artifact delivery panel as primary element. Completion stats secondary. New workflow affordance.

### 5.3 Renderer transition rule

Renderer may only change after a 200ms debounce. This prevents flicker during node state reconciliation. The renderer is never swapped until workflow state is fully applied locally.

---

## 6. Intervention Contract

Every non-terminal node state must emit a structured intervention payload. The renderer cannot infer meaning from execution state alone.

```typescript
type SAWPInterventionPayload = {
  type: 'missing_information' | 'approval_required' | 'ambiguity' | 'authentication' | 'tool_failure' | 'resource_limit'
  question: string                        // What to ask the human
  result: string                          // What the agent produced so far
  requested_input: { format: 'text' | 'choice' | 'file' | 'voice' }
  options: string[]                       // If format === 'choice'
  recoverable: boolean
  retryable: boolean
  suggested_action: string
}
```

An intervention surface must never render without a populated intervention payload. The system must not switch to intervention renderer unless at least one node has a non-null intervention field.

---

## 7. Artifact Contract

Output nodes (tier === 'output') must produce real renderable artifacts. Narrative summaries are not acceptable as primary deliverables.

```typescript
type SAWPArtifact = {
  id: string
  type: 'html_component' | 'svg' | 'markdown' | 'code_bundle' | 'json_data' | 'csv_data' | 'plain_text' | 'workflow_template'
  title: string
  artifact_content: string               // The raw deliverable content
  preview_html: string | null            // HTML for iframe rendering
  render_strategy: 'iframe' | 'code_highlight' | 'markdown_render' | 'table' | 'text_panel'
  export_payload: string                 // Content for download
}
```

An output node may not reach status 'complete' unless artifact_content is non-null and non-empty. Workflow may not reach archive renderer unless at least one output node has a valid artifact.

---

## 8. Orchestration Reducer

Workflow status is always derived from aggregate node state. It is never manually set.

```
if any node === 'blocked' or 'review' → workflow = active, renderer = intervention
if any node === 'failed' → workflow = active, renderer = intervention  
if all work nodes are complete/recovered/archived → workflow = complete, renderer = archive
if count(active nodes) > 1 → workflow = active, renderer = board
if any node === 'active' → workflow = active, renderer = timeline
```

This reducer runs after every state mutation. Manual workflow status assignment is an integrity violation.

---

## 9. Execution Phase

Execution phase is separate from workflow status and renderer. It is the persistent cognitive continuity signal that survives renderer transitions.

| Phase | Meaning |
|-------|---------|
| `planning` | Topology being created |
| `executing` | Agents running |
| `waiting` | Human input required |
| `recovering` | Failure recovery in progress |
| `finalising` | Output generation |
| `complete` | All nodes resolved |

The execution strip visible to the user always shows the current phase. It never disappears during a renderer transition.

---

## 10. Governance Layer

SAWP is governed by the Artiligenz Ontology — seven non-overridable axioms applied to every event in the system. See AXIOMS.md.

The governance layer intercepts every message, classifies it as a typed relation, runs axiom checks, logs violations, and updates the coherence score. When coherence drops below 60, the renderer switches to intervention automatically.

---

*SAWP Protocol Specification v1.0 · Artiligenz Ltd (UK) · May 2026*
*Creative Commons Attribution 4.0 International*
