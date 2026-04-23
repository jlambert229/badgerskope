# Work log: Calm library redesign

**Started:** 2026-04-23
**Branch:** `redesign-calm-library`
**Goal:** Make BadgerSkope feel simple, intuitive, and feature-rich by simplifying the design and consolidating navigation patterns.

## Context

User feedback: site is cluttered, difficult to use, not feature-rich, not intuitive. Applies across all surfaces (marketing page, library browse, detail modal, compare, stats, navigation). Core tensions: "cluttered" pulls toward simplification; "not feature-rich" pulls toward addition. Resolution: consolidate navigation patterns, strip cards to essentials, expose existing features through a single command surface rather than parallel tabs.

## Sub-project decomposition

1. Design system pass — token consolidation, visual noise removal, unified voice (in progress)
2. Library shell redesign — collapse Browse/Compare/Stats tabs into one surface with command bar
3. Detail view redesign — two-column on desktop, sticky sources/interactions panel
4. Compare-as-mode — multi-select in Browse, compare opens as drawer
5. Marketing page simplification — cut density, keep voice
6. Feature discoverability — Cmd+K palette surfacing notes/bookmarks/share/stats/help

Each sub-project gets its own spec → plan → build cycle.

## Phase 1: Design system pass

Spec: `docs/superpowers/specs/2026-04-23-design-system-pass-design.md`
