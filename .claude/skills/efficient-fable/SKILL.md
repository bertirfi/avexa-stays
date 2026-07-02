---
name: efficient-fable
description: Efficient orchestration for ANY advanced orchestrator model (Fable 5, Opus 4.8, or whatever the user selects — it changes over time). Use on codebase-heavy or token-heavy work; the orchestrator keeps judgment (planning, reviews, architecture, integration, final review) and delegates implementation aggressively to cheaper subagents (Sonnet 5 for moderate work, Haiku for simple/repetitive) split into many small self-contained tasks.
---

# Efficient Orchestration (model-agnostic)

The orchestrator is **whatever advanced model the user has selected** (Fable 5,
Opus 4.8, or a future model — the user's choice, it changes over time; never
assume a specific one). Use the orchestrator as architect, synthesizer, and
final judge. Use cheaper subagents for token-heavy research, coding, testing,
and summarization that do not require the orchestrator's full judgment.

## Model Routing

- **Orchestrator (the selected advanced model):** keeps ONLY high-value work —
  planning, codebase review, systems review, architecture, code structure,
  integration design, final review.
- **Sonnet 5:** moderate implementation — bounded edits, feature slices,
  component wiring, test writing.
- **Haiku:** simple/repetitive — mechanical edits, log reduction, inventory
  scans, format conversions.
- Split delegated work into **many small self-contained tasks** so no agent
  overflows its context.
- Subagent models are set via the `CLAUDE_CODE_SUBAGENT_MODEL` env var, or
  per-agent `model:` frontmatter (`.claude/agents/*.md`), or the Agent tool's
  model option. A `.md` instruction alone does NOT change subagent models —
  it's the env var/frontmatter plus aggressive delegation that make this work.

## Where the Orchestrator Shines

Reserve the orchestrator for:

- Decomposing ambiguous work into clean parallel slices.
- Architecture, product, and safety tradeoffs.
- Reading conflicting subagent reports and deciding what matters.
- Integrating partial implementations into one coherent plan.
- Final review, risk assessment, and user-facing synthesis.

## Delegation Pattern

1. Name the expensive-token risk: large repo search, long logs, broad docs, or
   repetitive edits.
2. Split independent work into subagents before reading everything yourself.
3. Use cheaper models for research scans, inventory, search summaries, narrow
   bug hunts, browser/testing passes, test output reduction, and bounded code
   edits.
4. Ask subagents for concise evidence: files, line references, commands run,
   diffs, uncertainties, and stop conditions they hit.
5. Spend orchestrator tokens on the decision layer: compare results, resolve
   conflicts, choose the implementation path, and review the final patch.

Prefer parallel subagents when the slices do not depend on each other. Keep
blocking or highly coupled work local.

## Handoff Packets

Write delegated prompts as if the subagent has no useful chat context. Include
only the context it needs:

- The repo path and exact objective.
- The files, packages, or surfaces in scope and anything explicitly out of
  scope.
- The evidence format to return: files, line refs, commands, diffs, failures,
  screenshots, and uncertainty.
- The verification commands or browser flows to run, plus what success should
  look like when that is knowable.
- Stop conditions: if the code does not match the prompt, a command fails after
  a reasonable retry, or the task needs out-of-scope files, stop and report
  instead of improvising.

## Vetting Delegated Work

Treat subagent reports as leads, not facts. Before using a high-impact finding,
opening a PR, or telling the user the work is done, the orchestrator should
reopen the important cited files, confirm the relevant line refs or failures,
and review the final diff against the task. Let lighter agents gather signal;
keep truth-judgment with the orchestrator.

## Common Scenarios

Treat these as soft defaults, not rigid rules:

- Research: ask lighter agents to scan docs, prior art, APIs, and repo surfaces;
  the orchestrator decides what evidence changes the plan.
- Coding: give cheaper agents bounded edits or candidate patches; the
  orchestrator owns shared-file coordination, integration, and final review.
- Testing: have the orchestrator suggest the validation direction and the
  scripts or browser checks that matter. Let lighter agents run targeted tests,
  browser flows, screenshots, and log reduction, then report exact commands,
  failures, likely causes, and whether failures look flaky, environmental, or
  real.
- Debugging: use cheaper agents to cluster logs, reproduce issues, and try
  small fixes; the orchestrator decides which diagnosis is most trustworthy.

If a task is tiny or the validation itself needs delicate judgment, keep it
with the orchestrator.

## Diagram

Use `assets/fable-orchestrator.excalidraw` when a visual explanation helps.

## Claims

For codebase-heavy work, it is reasonable to describe this as up to 3-5x more
cost-efficient and 2-4x faster when independent research, coding, or testing
slices can run in parallel. Treat those as workload-dependent estimates, not
guarantees.

Good launch copy:

> Make your orchestrator model more efficient by using cheaper subagents for
> token-heavy research, coding, and testing — saving the advanced model for
> judgment, architecture, synthesis, and final review.
