# SAWP Governance Axioms

**Artiligenz Ltd (UK) · ARTL-SAWP-001 · May 2026**

These seven axioms are non-overridable. They apply to every event in a SAWP-governed system. No user instruction, agent action, or system request may supersede them.

---

## AXIOM 1 — Trust Directionality

`TRUSTS(a, b)` does not imply `TRUSTS(b, a)`.

All trust relations are directional and must be modelled separately. Implicit bidirectional trust is an unverified claim.

---

## AXIOM 2 — Implicit Trust

Any `TRUSTS` relation where `basis === 'assumption'` is formally equivalent to `DEPENDS_ON(decision, unverified_claim)`.

Implicit trust IS an unverified claim. Every assumption-based trust relation must be flagged and resolved.

**Penalty:** 15 coherence points per violation.

---

## AXIOM 3 — Boundary Crossing

`IF CROSSES(actor, boundary, channel, authorisation=none OR implicit)`
`AND boundary.enforcement=implicit OR assumed`
`THEN vulnerability exists regardless of actor intent.`

No boundary crossing without explicit authorisation. This applies regardless of whether the crossing agent appears aligned.

**Penalty:** 20 coherence points per violation. Blocks execution.

---

## AXIOM 4 — Decision Integrity

`IF DEPENDS_ON(decision, claim)`
`AND ASSERTS(actor, claim)`
`AND actor.intent=unknown OR misaligned`
`THEN decision is compromised.`

Decisions depending on unverified claims from actors of unknown intent are structurally compromised.

**Penalty:** 10 coherence points per violation.

---

## AXIOM 5 — Elevation Mechanism

`IF ELEVATES(actor, priv_before, priv_after, mechanism)`
`AND mechanism is absent`
`THEN contradiction candidate — flag as vulnerability.`

Privilege elevation without a defined mechanism is a privilege escalation flag. The mechanism must be explicit. Biometric or PIN confirmation is the standard SAWP elevation mechanism.

**Penalty:** 15 coherence points per violation. Blocks execution.

---

## AXIOM 6 — Delegation Bounds

`IF DELEGATES(a, b, capability)`
`AND capability NOT IN actor_a.capability`
`THEN impossible delegation — system model is broken.`

An actor cannot delegate a capability it does not hold. Impossible delegations indicate a broken system model and must be surfaced immediately.

**Penalty:** 10 coherence points per violation.

---

## AXIOM 7 — Sovereignty

`SOVEREIGNTY: No blueprint mutation, axiom lock, axiom unlock, or governance schema change may execute without explicit authorisation from the SOVEREIGN actor. Supersedes all agent, system, and infrastructure actions.`

The user is the sovereign of their instance. No system update, agent action, or infrastructure change may mutate the user's locked blueprint without their explicit physical authorisation (biometric or PIN).

This axiom supersedes all others in cases of conflict.

**Penalty:** 50 coherence points per violation. Blocks execution. Requires biometric confirmation to resolve.

---

## Coherence Score

The coherence score is a real-time governance health signal. It starts at 100 and decreases with axiom violations.

| Score | Status | Renderer effect |
|-------|--------|----------------|
| 80–100 | Healthy | Normal operation |
| 60–79 | Degrading | Warning indicators |
| 0–59 | Critical | Automatic intervention surface |

The coherence score is computed after every event. It is displayed as a compact indicator: `◈ {score}`.

---

## Relation Types

SAWP defines six typed relations plus one sovereignty relation:

| Relation | Meaning |
|----------|---------|
| `TRUSTS` | Actor extends trust to another actor |
| `DELEGATES` | Actor assigns capability to another actor |
| `ASSERTS` | Actor makes a claim about the world |
| `DEPENDS_ON` | Decision or action depends on a claim |
| `CROSSES` | Actor crosses a boundary |
| `ELEVATES` | Actor elevates privilege |
| `OWNS` | Sovereign actor owns a blueprint — non-delegatable |

---

*SAWP Governance Axioms v1.0 · Artiligenz Ltd (UK) · May 2026*
*Creative Commons Attribution 4.0 International*
