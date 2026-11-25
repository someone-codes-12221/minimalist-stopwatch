# Chrono / Chrono Obsidian — Project Context

Living handoff for future contributors and AI coding agents. Read before proposing features or editing code. Update this file when architecture, storage, behavior, or shipped features change.

**Reviewed:** 2026-11-26  
**Main branch commit reviewed:** `8b28ec346f2877df2fd93136ade37843b7cfa722`  
**Repository:** `someone-codes-12221/minimalist-stopwatch`

## 1. Product overview

Chrono Obsidian is a mobile-first, offline-first focus timer and study log with an integrated fantasy progression game called ChronoRealm. The timer is the core product. ChronoRealm turns saved study activity into resources, skill progression, quests, achievements, unlocks, and turn-based encounters.

The project is intentionally built with vanilla HTML, CSS, and JavaScript. It is packaged for Android using Capacitor in CI and deployed as a web app through GitHub Pages.

## 2. Non-negotiable development rule

**Protect the timer and existing user data above all else.**

Before editing, trace how the change affects:
- Timer start, pause/resume, finish, breaks, sprint/countdown, overtime, and notifications.
- Saved study sessions, history, manual entries, edits, and deletions.
- Local-storage keys and backup/restore.
- Realm resources, claims, map/combat state, inventory, and progression.

Do not rename storage keys, reset data, replace save objects with partial objects, or change session formats casually. Prefer additive, backward-compatible changes with defensive defaults and idempotent migrations. Do not award the same activity twice through separate event paths.

## 3. Repository structure (verified)

```
.
├── .github/
│   └── workflows/
│       ├── build.yml
│       └── deploy-pages.yml
└── www/
    ├── index.html
    ├── gamify.js
    ├── gamify.css
    └── visual-polish.css
```

There is no framework source tree, package manifest, or automated test directory in the checked-in tree reviewed.

### File ownership

- **`www/index.html`** — Main app shell, timer logic, markup, large inline style block, subjects, study sessions, history, manual entries, edit/delete, settings, and backup/restore.
- **`www/gamify.js`** — ChronoRealm IIFE: state, progression, combat, dynamically injected overlay/modals, tab rendering, and integration bridge.
- **`www/gamify.css`** — Realm layout and component styling.
- **`www/visual-polish.css`** — Later visual refinement layer loaded after the Realm stylesheet.
- **`.github/workflows/build.yml`** — Android APK build. Installs Node 22, Java 21, Capacitor 7, bundles offline fonts, creates app icon/theme resources, and packages `www`.
- **`.github/workflows/deploy-pages.yml`** — Publishes `www` to GitHub Pages, verifies `www/index.html`, and retries deployment.

## 4. Main timer and persistent data

The timer lives in `index.html`, not in a separate module. The UI/settings include:
- Orbital, dot-matrix, and typographic dial styles.
- Mono, editorial, Outfit, and Space Grotesk font choices.
- Subject selection and subject colors.
- Amber tint, fullscreen/immersive mode, auto-dim, haptics, sound mix.
- Break ratio, hold duration, and milestone interval.
- Daily goal progress, saved sessions, notes/energy metadata, history, manual entries, editing/deletion, and a parking lot.

### Storage keys — compatibility contracts

| Key | Owner | Purpose |
|---|---|---|
| `chrono_obsidian_v2` | Main app | Study records, subjects, goal, parking lot, settings |
| `chrono_active_v3` | Main app | Active timer/session state |
| `chrono_realm_v1` | ChronoRealm | Realm resources, map/combat, inventory, skills, claims, unlocks |

Backup format: `chrono-obsidian-backup`, version `2`. Export captures local-storage entries. Restore validates the main study store and Realm payload before replacing local storage. Preserve this behavior and contract.

### Main-to-Realm study snapshot

The main app derives `window.ChronoStudyData` from saved records:
- `dateKey`: today's local date key.
- `sessions`: today's saved sessions, with duration in milliseconds and subject.
- `weekStart`, `weekEnd`: Monday-to-Sunday local date boundaries.
- `weekSessions`: saved sessions in that date range, each with date, duration, and subject.
- `allTimeSessions`: all saved sessions, each with date, duration, and subject.

Daily missions, weekly quests, achievements, profile stats, and relic unlocks derive from these records. This is intentional: editing/deleting a session should recalculate progress rather than leave increment-only counters stale.

## 5. ChronoRealm — existing functionality

**These systems already exist. Do not recommend or rebuild them as missing features.**

### Main navigation

Realm overlay with resource bar (Charges, Drafts, Shards, Run HP), tab navigation, and content entrance transition.

Eight top-level tabs:
1. Map
2. 3×3 Grid
3. Constellations
4. Journal
5. Profile
6. Relics
7. Events
8. Atlas

Journal sub-tabs:
- Daily missions
- Weekly quests
- Achievements

### Study-driven progression

Saved study time feeds:
- Battle Charges.
- Cube Drafts.
- Obsidian Shards.
- Overcharge for longer sessions.
- Five skill tracks: Endurance, Depth, Momentum, Versatility, Overclock.
- Perk points on skill level-ups.
- Selected study-session and streak milestone celebrations.

The Realm applies defensive defaults for older saves (claims, combat wins, boss wins, drafted cube count, equipped relics, optional map nodes). Keep migrations additive.

### Daily missions

Progress is derived from today's saved sessions. Existing objectives include:
- 45 minutes of study.
- 2 saved sessions.
- 2 different subjects.
- 90-minute bonus objective.

Rewards are claimed once and grant Shards and skill XP. Claims are stored by date; old claim entries are pruned.

### Weekly quests

Progress uses the local Monday-to-Sunday week. Existing objectives cover:
- Total weekly study minutes.
- Number of sessions.
- Distinct study days.
- Distinct subjects.

A sequential study-day quest chain unlocks later steps only after the previous step has been claimed. Claims are stored by week start.

### Achievements

Already grouped into Scholarship, Consistency, Mastery, and The Realm. Metrics cover study time, session count, longest session, days/streaks, subject variety, and Realm milestones (combat, bosses, zones, skills, perks, drafts, grid completion). Each has one-time claim state and Shard reward.

### Profile and player progression

Already includes calculated player level/XP, study/session/battle/boss/streak/zone stats, unlockable and equippable player titles, and profile frame tiers.

### Relics

Relic Vault already has unlock requirements based on study/Realm progress, discovered/undiscovered collection cards, two equip slots, equip/unequip actions, and combat bonuses (strike damage, ward strength, overall cube power, critical chance, healing).

### Combat, cubes, and map

Already includes:
- 3×3 Cube-grid auto-clash combat; ChronoRealm visual motion remains disabled.
- Strike, Ward, and Synergy cube roles.
- Core cubes: Spike, Ember, Shatter, Aegis, Reflect, Mend, Prism, Echo, and Catalyst.
- Study-unlocked cubes: Frost (180 saved study minutes), Rupture (600 saved study minutes), Siphon (20 saved sessions), and Conduit (3 distinct saved subjects).
- Inventory, placement, swapping, removal, tier upgrades, and grid synergy.
- Free Test Grid action and Shard Forge purchases for Charges/Drafts.
- Enemy-specific tactics with rotating guarded cells, telegraphed attack intent, and archetype-specific counterattacks.
- Boss phase transitions at 55% HP, with phase-specific behavior.
- Free real encounters; study-earned Charges are optional Surge fuel (+30% to one volley).
- Branching zone maps with hostile nodes, shrines, vaults, bosses, and optional secret boss route.
- Five region themes: Ashen March, Drowned Archive, Thornwild, Hollow Crown, Starfall Citadel.
- Zone progression and boss rewards.

### World Atlas and events

World Atlas displays the five regions, their unlock state, and the hidden optional boss route. Daily World Events rotate by local date and have a separate encounter/reward state so they do not overwrite normal map progress.

## 6. Integration API

`gamify.js` exposes:

```js
window.ChronoRealm = {
  open: openRealm,
  onSessionSaved,
  updateBadge: updateRealmBadge,
  syncDailyStudySnapshot(snapshot)
};
```

- `open()`: opens Realm.
- `onSessionSaved(info)`: grants Realm progress for a genuinely saved completed session. Do not double-call for edits/imports.
- `updateBadge()`: refreshes Realm badge.
- `syncDailyStudySnapshot(snapshot)`: supplies derived study data to Realm.

Keep this bridge small. Timer code should not call Realm's private rendering or combat functions.

## 7. Visual direction

Dark, restrained, cinematic fantasy:
- Obsidian / near-black base.
- Soft violet, antique-gold, and subject-color accents.
- Glass-like panels, fine borders, subtle glow, atmospheric gradients.
- Compact uppercase labels and monospaced timer typography.
- Deliberate, polished motion; avoid noisy arcade styling.
- Respect `prefers-reduced-motion`.

## 8. Recent merged work on main

- **PR #33 — Smooth transitions between Realm tabs:** fade, upward glide, slight de-blur, restrained stagger, reduced-motion support.
- **PR #32 — Illustrated field atlas:** biome palettes, terrain contours, compass marker, route glow, progress indicator, legend. PR description says map graph, unlock rules, rewards, combat, and local saves are preserved.
- **PR #31 — Cinematic visual overhaul:** obsidian visual layer, atmospheric lighting, glass treatment, interaction feedback, reduced-motion support.
- **PR #30 — Pages deployment link retry fix.**
- **PR #29 — Removed Exam Board and syllabus tracker.** It is not current functionality; do not reintroduce unless explicitly requested.
- **PR #28 — Earlier syllabus tracker implementation.** Historical only; later removed by PR #29.

The current main branch includes the Atlas and tab-transition work.

## 9. Development rules

1. **Inspect current main first.** Conversation history is not a substitute for reading current source.
2. **Check for existing functionality.** Search tabs, render functions, state fields, claim ledgers, unlock conditions, rewards, and event handlers before proposing a new system.
3. **Edit the owning file.** Timer/data in `index.html`; Realm logic in `gamify.js`; Realm styles in `gamify.css`; shared overrides in `visual-polish.css`.
4. **Trace full data flow.** Follow UI action → state mutation → persistence → snapshot/render.
5. **Preserve saves.** Add safe defaults for new fields. Make migrations idempotent; preserve unknown fields.
6. **Keep timer independent.** A Realm error must not break timer operation or session saving.
7. **Prevent duplicate rewards.** Derive goals from saved records and guard one-time claims.
8. **Mobile first.** Check narrow layouts, vertical scrolling, safe-area insets, touch targets, and modal behavior.
9. **Reduced motion.** Provide `prefers-reduced-motion` handling for new animation.
10. **Cache bust.** If changing a CSS/JS asset loaded with a query-string version, update its reference in `index.html`.
11. **Check both delivery paths.** Pages deploys `www`; APK workflow packages `www` through Capacitor.
12. **Do not claim tests/deployment passed without checking actual results.**

Implementation patterns:
- Vanilla JS and DOM rendering; no framework assumptions.
- Realm state is held in in-memory `R` and persisted through `saveR()`.
- Realm is an IIFE; keep internals private.
- UI is injected dynamically; attach listeners after rendering relevant markup.
- Use trusted internal constants or escape user-provided values before inserting into `innerHTML`.
- Block duplicate actions/tab changes while a clash is active.
- Local date keys and local Monday-to-Sunday week boundaries are used.

## 10. Validation checklist

### Timer and study log
- Start, pause/resume, finish, break, countdown/sprint, overtime.
- Subject selection/colors.
- Save a session and verify today's log/history.
- Manual entry, edit, delete.
- Daily totals and goal progress recalculate.

### Storage
- Existing keys remain stable.
- Older saves load with new fields absent.
- Backup export/import still works.
- No accidental local-storage clearing or partial Realm object replacement.

### Realm
- Open/close overlay.
- All eight top-level tabs and three Journal tabs render.
- Daily/weekly/achievement progress reflects saved records; claims are one-time.
- Profile title and relic equipment persist.
- Cube placement/upgrades, Forge, test clash, real combat.
- Map unlocks, shrine/vault rewards, boss progression, secret route, Atlas, daily event.
- Transitions work and reduced-motion is respected.

### Delivery
- Correct asset references/cache keys in `index.html`.
- Pages deploys the `www` directory.
- Android workflow builds and includes required assets/fonts.

No automated test suite was visible in the reviewed repository tree. Do not say tests passed unless a test or workflow was actually run and checked.

## 11. Constraints and assumptions to avoid

- Do not migrate to React/Vue/TypeScript or introduce a bundler as an incidental feature change.
- No server-side account/cloud-sync layer is visible; app data is local-storage based.
- Timer and Realm are coupled through the small global bridge and derived study snapshot.
- Current checked-in source is authoritative; do not infer missing features from old chat plans.
- Exam Board/syllabus tracker is removed.
- A merged commit is not proof of successful deployment; inspect workflow runs or the deployed site.

## 12. How future agents should work

At the start of every Chrono task:
1. Read this file.
2. Inspect the current implementation relevant to the request.
3. Compare the request against existing features above.
4. If it already exists, explain where/how instead of rebuilding it.
5. For new work, document new state fields, integration points, migration behavior, and validation here.



## 11. Realm feedback polish (in progress)

Branch: `feat/realm-feedback-polish`.

This pass is deliberately presentation-only:
- Delegated pointer feedback and short synthesized UI tones are attached only to controls inside the Realm overlay.
- Rare milestone/reward reveals use a distinct synthesized chime and a brief haptic pulse.
- Visual refinements add responsive hover/press states, keyboard focus rings, restrained content entrance, reward-card sheen/aura, and toast arrival.
- The existing combat sound engine is extended; no new audio files or network assets are required.
- Timer controls, study records, reward amounts, claim ledgers, Realm state, and storage keys are not changed.
- Reduced-motion preferences disable the added decorative animations.


## 12. Cinematic Realm arrival (in progress)

- Opening ChronoRealm now plays a short portal-style reveal: an expanding atmospheric bloom, a vertical scan/light pass, and staggered entrance of the header, resources, tabs, and main content.
- The sequence restarts on each open and removes its temporary animation class after completion; it does not change Realm state or timer behavior.
- The effect is CSS-only, uses no external assets, and is disabled under `prefers-reduced-motion`.


## 13. Realm arrival visibility fix (in progress)

- Replaced pseudo-element-only portal effects with a dedicated, absolute VFX layer injected into the overlay. This keeps the bloom and scan visibly above the overlay background and below the Realm UI.
- Opening now reveals the overlay before restarting the animation, with a stronger bloom, scan sweep, and staggered content entrance.
- No game state, combat, timer, or persistence behavior is changed. Reduced-motion preferences remain respected.


## 14. Immediate enemy selection

- Selecting a map node now updates the selected encounter immediately without replaying the Realm content entrance/stagger animation.
- Tab switches and other Realm content transitions retain their existing entrance motion.
- The selected-node atlas highlight and all combat hit/shake effects remain unchanged.


## 15. GitHub Pages deployment link

- The Pages deployment environment now uses the canonical live-site URL directly, so each deployment is associated with a stable clickable URL even if the deploy action's page_url output is missing.
- Every successful deployment also writes a direct live-site link into the GitHub Actions job summary.
- Canonical URL: https://someone-codes-12221.github.io/minimalist-stopwatch/


## 16. Enemy-selection transition fix

- The Realm tab entrance animation in visual-polish.css is scoped to .realm-body.tab-enter, matching the renderRealm() one-shot transition flag.
- Map-node selection sets skipNextRealmEntrance before rerendering, so selecting an enemy no longer triggers the content stagger from the global visual-polish stylesheet.
- The visual-polish stylesheet cache key is bumped so deployed browsers fetch the corrected selector rules.
- Ordinary Realm tab changes retain their entrance animation; the selected-node highlight remains a static visual state.


## 17. Static selected enemy highlight

- The remaining map-node animation was the selected-node atlas pulse (atlasNodePulse), separate from the Realm content stagger.
- Selected nodes now keep their highlighted border/glow but do not pulse or animate.
- The Realm content stagger remains scoped to explicit tab transitions only; map-node selection bypasses it.
- Bumped the gamify.css cache key so deployed browsers fetch the static selected-node styling.


## 18. Hard-stop enemy selection motion

- Map-node selection now marks the rendered Realm body with `enemy-selection-static`.
- A high-specificity CSS override disables animations throughout the selected encounter content, including the enemy idle-float animation and any child entrance animations.
- The static-selection class is cleared when switching tabs or before combat starts, so normal tab transitions and combat hit effects remain available.
- Bumped the gamify.css cache key to `enemy-selection-hard-stop-v4`.


## 19. ChronoRealm motion-free mode

- All CSS animations and transitions inside `.realm-overlay` are globally disabled, including nested elements and pseudo-elements.
- This removes Realm entrance effects, tab transitions, selected-node pulses, enemy idle motion, combat shakes/hit effects, reward reveals, and toast motion.
- Stopwatch UI outside ChronoRealm keeps its existing animations.
- Cache-busted visual-polish.css with `realm-motion-free-v1`.


## 20. Cube combat overhaul

- Preserves the 3×3 board, inventory, placement, upgrades, role formations, relics, Constellations, and existing enemy/map data.
- Adds four study-history unlocks: Frost at 180 saved minutes, Rupture at 600 saved minutes, Siphon at 20 saved sessions, and Conduit after 3 distinct saved subjects. Each is granted once into inventory and remains available in future drafts.
- Frost reduces the next enemy counterattack by 25% per Frost cube (capped at 50%); Rupture permanently removes 2 Armor per cube for the current encounter; Siphon heals 30% of its damage; Conduit empowers the next Strike or Ward cube by 25%.
- Fully occupied mixed-role rows/columns grant a Tactical Triad (+12%) in addition to existing same-role formations.
- Encounters no longer consume entry Charges. Charges are now optional Surge resources: arm one before a fight for +30% volley power; cancellation refunds the charge.
- Enemy guard cells rotate for selected archetypes. Counterattacks include Monolith slams, Phantom surges, Reaver shield bypass, and existing Swarm/Thorn/Leech/Hexcaller traits.
- Zone bosses have two phases; Phase II begins at 55% HP and changes their attack/guard behavior.
- Defeat returns the player to camp at 65% HP and restores 15% enemy HP. Camp offers a full rest for 12 Shards or an emergency recovery to 75% HP when the player cannot afford it.
- First victories against each enemy archetype or named boss add a Bestiary record and one bonus Cube Draft. Repeat victories increase the recorded count without repeating the first-trophy reward.
- Study-derived cube unlocks read saved study snapshots and cumulative Realm study/session counters. Existing study save/import/session pathways remain unchanged.
- New combat UI uses static intent, phase, unlock-progress, Surge, and Bestiary panels. No ChronoRealm animation or transition was added.
