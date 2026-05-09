/**
 * SAWP Node Schema — TypeScript definitions
 * Artiligenz Ltd (UK) · ARTL-SAWP-001 · May 2026
 * Creative Commons Attribution 4.0 International
 */

// ── NODE TIERS ────────────────────────────────────────────────────────────────

export type SAWPNodeTier =
  | 'core'       // Workflow intent container — status derived from children
  | 'task'       // Discrete executable unit of work
  | 'agent'      // Specialist agent execution node
  | 'tool'       // External tool or API call
  | 'output'     // Artifact generation — must produce renderable content
  | 'failure'    // Created on node failure — contains failure context
  | 'recovery';  // Recovery execution — sibling to failed node

// ── NODE STATUSES ─────────────────────────────────────────────────────────────

export type SAWPNodeStatus =
  | 'pending'    // Not yet started
  | 'active'     // Currently executing
  | 'complete'   // Successfully completed
  | 'blocked'    // Cannot proceed — missing dependency or tool failure
  | 'review'     // Requires human approval
  | 'failed'     // Terminal failure
  | 'recovered'  // Failed but recovered via alternate path
  | 'archived';  // Skipped or superseded

// ── EXECUTION PHASE ───────────────────────────────────────────────────────────

export type SAWPExecutionPhase =
  | 'planning'    // Topology being created
  | 'executing'   // Agents running
  | 'waiting'     // Human input required
  | 'recovering'  // Failure recovery in progress
  | 'finalising'  // Output generation
  | 'complete';   // All nodes resolved

// ── RENDERER TYPES ────────────────────────────────────────────────────────────

export type SAWPRenderer =
  | 'timeline'       // Sequential task display — default
  | 'board'          // Parallel agent columns
  | 'intervention'   // Human input required — workflow paused
  | 'archive';       // Workflow complete — artifact delivery

// ── ARTIFACT TYPES ────────────────────────────────────────────────────────────

export type SAWPArtifactType =
  | 'html_component'    // UI component, header card, widget
  | 'svg'               // Map, diagram, chart, illustration
  | 'markdown'          // Document, report, article
  | 'code_bundle'       // Script, function, module
  | 'json_data'         // Structured data, config, schema
  | 'csv_data'          // Table, spreadsheet, dataset
  | 'plain_text'        // Email draft, message, simple text
  | 'workflow_template'; // Reusable workflow definition

export type SAWPRenderStrategy =
  | 'iframe'           // Sandboxed HTML/SVG render
  | 'code_highlight'   // Syntax highlighted code block
  | 'markdown_render'  // Rendered markdown
  | 'table'            // Tabular data display
  | 'text_panel';      // Plain text display

// ── INTERVENTION TYPES ────────────────────────────────────────────────────────

export type SAWPInterventionType =
  | 'missing_information'
  | 'approval_required'
  | 'ambiguity'
  | 'authentication'
  | 'tool_failure'
  | 'resource_limit';

// ── CORE CONTRACTS ────────────────────────────────────────────────────────────

export interface SAWPRenderHints {
  user_action_required: boolean;
  user_prompt: string | null;
  affordances: SAWPAffordance[];
}

export type SAWPAffordance =
  | 'approve' | 'reject' | 'confirm' | 'skip'
  | 'type_items' | 'use_voice' | 'upload_file'
  | 'view_result' | 'provide_input'
  | 'edit' | 'retry' | 'export' | 'share';

export interface SAWPExecutionContract {
  intent: string;
  requires: string[];
  accepts: string[];
  completion_condition: string;
  output_schema: Record<string, unknown>;
  user_action_required: boolean;
  user_prompt: string | null;
  affordances: SAWPAffordance[];
  next_transition: string | null;
  recoverable: boolean;
  retryable: boolean;
}

export interface SAWPInterventionPayload {
  type: SAWPInterventionType;
  question: string;
  result: string;
  requested_input: { format: 'text' | 'choice' | 'file' | 'voice' };
  options: string[];
  recoverable: boolean;
  retryable: boolean;
  suggested_action: string;
}

export interface SAWPArtifact {
  id: string;
  workflow_id: string;
  node_id: string;
  type: SAWPArtifactType;
  title: string;
  artifact_content: string;
  preview_html: string | null;
  render_strategy: SAWPRenderStrategy;
  export_payload: string;
  created_at: string;
}

// ── CORE NODE TYPE ────────────────────────────────────────────────────────────

export interface SAWPNode {
  id: string;
  workflow_id: string;
  tier: SAWPNodeTier;
  label: string;                              // 2–4 words
  sub: string;                               // Plain-English description
  status: SAWPNodeStatus;
  orbit: number;                             // Depth in topology (0 = core)
  payload: Record<string, unknown>;          // Execution outputs and artifacts
  render_hints: SAWPRenderHints;
  execution_contract: SAWPExecutionContract;
  intervention: SAWPInterventionPayload | null;
  created_at: string;
  updated_at: string;
}

// ── WORKFLOW TYPE ─────────────────────────────────────────────────────────────

export interface SAWPWorkflow {
  id: string;
  user_id: string;
  intent: string;
  status: 'active' | 'paused' | 'complete' | 'archived';
  renderer: SAWPRenderer;
  execution_phase: SAWPExecutionPhase;
  coherence: number;                         // 0–100. Below 60 → intervention
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ── RENDERER DERIVATION ───────────────────────────────────────────────────────
// The renderer is never manually set. It is always derived from node state.

export function deriveRenderer(
  nodes: SAWPNode[],
  workflow: SAWPWorkflow
): SAWPRenderer {
  // Completion takes absolute precedence
  if (workflow.execution_phase === 'complete' || workflow.status === 'complete') {
    return 'archive';
  }

  // Coherence failure
  if (workflow.coherence < 60) return 'intervention';

  // Blocked or review nodes
  const hasIntervention = nodes.some(n =>
    n.status === 'blocked' || n.status === 'review'
  );
  if (hasIntervention) return 'intervention';

  // Parallel execution
  const activeCount = nodes.filter(n => n.status === 'active').length;
  if (activeCount > 1) return 'board';

  return 'timeline';
}

// ── ORCHESTRATION REDUCER ─────────────────────────────────────────────────────
// Workflow status is always derived from aggregate node state. Never manually set.

export function reduceWorkflowState(nodes: SAWPNode[]): {
  status: SAWPWorkflow['status'];
  renderer: SAWPRenderer;
  execution_phase: SAWPExecutionPhase;
} {
  const workNodes = nodes.filter(n => n.tier !== 'core');
  const statuses = workNodes.map(n => n.status);

  if (statuses.includes('blocked') || statuses.includes('review')) {
    return { status: 'active', renderer: 'intervention', execution_phase: 'waiting' };
  }
  if (statuses.includes('failed')) {
    return { status: 'active', renderer: 'intervention', execution_phase: 'recovering' };
  }
  if (workNodes.length > 0 && workNodes.every(n =>
    ['complete', 'recovered', 'archived'].includes(n.status)
  )) {
    return { status: 'complete', renderer: 'archive', execution_phase: 'complete' };
  }
  if (statuses.filter(s => s === 'active').length > 1) {
    return { status: 'active', renderer: 'board', execution_phase: 'executing' };
  }
  return { status: 'active', renderer: 'timeline', execution_phase: 'executing' };
}
