# Reaction Control Guide (RTL + LTR)

Last updated: 2026-04-02

## 1) Purpose

This guide documents the shared reaction control system used in publication cards, comments, and replies.

It covers:
- component architecture
- props and data contract
- interaction behavior
- responsive behavior
- RTL/LTR scrolling internals
- backend wiring for comment/reply reactions
- the Arabic mobile arrow-direction issue we encountered
- the exact final solution and validation checklist

## 2) Source Map

Core shared module:
- [SharedReactionControl](../components/features/publication/shared-reaction-control/SharedReactionControl.tsx)
- [SharedReactionControl types](../components/features/publication/shared-reaction-control/SharedReactionControl.types.ts)
- [Reaction config constants](../components/features/publication/shared-reaction-control/reaction-config.ts)
- [SharedReactionControl exports](../components/features/publication/shared-reaction-control/index.ts)

Publication usage:
- [PublicationActions](../components/features/publication/publication-actions/PublicationActions.tsx)

Comment/reply usage:
- [CommentItem](../components/features/publication/comments/comment-item/CommentItem.tsx)
- [CommentSection](../components/features/publication/comments/comment-section/CommentSection.tsx)
- [PublicationCard](../components/features/publication/publication-card/PublicationCard.tsx)

Reaction API and state wiring:
- [Publication API service](../services/api/publication.service.ts)
- [PublicationFeed](../components/features/publication/publication-feed/PublicationFeed.tsx)
- [ProfileViews](../components/pages/profile/profile-overview-page/ProfileViews.tsx)
- [Publication types](../types/publication.ts)

## 3) High-Level Architecture

The reaction UX is centralized in one reusable component:
- `SharedReactionControl`

It supports two variants:
- `publication`: full-width action button behavior used in publication actions row
- `comment`: compact inline behavior used in comment and reply metadata row

This keeps reaction behavior consistent while allowing layout differences per context.

## 4) Data Contract

### 4.1 Shared props

From [SharedReactionControl types](../components/features/publication/shared-reaction-control/SharedReactionControl.types.ts):
- `entityId`: numeric target id (publication id for posts, comment id for comments/replies)
- `likesCount`: numeric aggregate fallback
- `reactionsCountByType`: optional per-reaction counts map
- `currentUserReaction`: optional current user reaction type
- `onReact(entityId, reactionType)`: callback on toggle/select
- `variant`: `publication | comment`
- optional style override class props for z-index/side/width/container

### 4.2 Reaction model

From [Publication types](../types/publication.ts):
- `ReactionType`: LIKE, LOVE, HAHA, STRONG, FIRE, CLAP, MUSCLE, HEALTHY, MOTIVATION, GOAL, PROGRESS, CHAMPION
- `ReactionCountsByType`: `Partial<Record<ReactionType, number>>`

### 4.3 Feed comment extension

`FeedComment` includes:
- `reactionsCountByType?`
- `currentUserReaction?`

This allows comments and replies to render the same rich reaction UI as publications.

## 5) UI Behavior by Variant

### 5.1 Publication variant

From [PublicationActions](../components/features/publication/publication-actions/PublicationActions.tsx):
- uses shared trigger as the first action button
- preserves publication action row structure (like/comment/share)
- shows publication stats row with per-reaction chips

### 5.2 Comment variant

From [CommentItem](../components/features/publication/comments/comment-item/CommentItem.tsx):
- inline compact trigger in comment metadata row
- same reaction picker content and ordering as publication
- renders per-reaction chips for comment counts (icon + count per type)

From [CommentSection](../components/features/publication/comments/comment-section/CommentSection.tsx):
- comment list container uses `overflow-x-hidden`
- container provides `data-comment-reaction-boundary` for picker boundary clamping

## 6) Interaction Lifecycle

From [SharedReactionControl](../components/features/publication/shared-reaction-control/SharedReactionControl.tsx):
- hover enter opens picker
- hover leave closes picker with short delay (`120ms`) to avoid accidental close while moving pointer
- trigger click performs default like/toggle behavior
- selecting reaction in picker closes picker and calls callback
- burst animation plays when current user reaction changes

## 7) Overflow, Arrows, and Scrolling

### 7.1 Overflow detection

`hasHorizontalOverflow` is computed from scroll container dimensions.

### 7.2 Arrow enable states

`canScrollLeft` and `canScrollRight` are computed using geometry:
- compare track bounds vs container bounds
- this is visual/physical detection and is robust across RTL/LTR

### 7.3 Scroll step

Each arrow click scrolls by a distance based on reaction item width (about 2.25 items, with minimum step).

## 8) RTL + LTR Scrolling Internals

This is the most sensitive area.

### 8.1 Browser RTL scroll models

Browsers can expose RTL `scrollLeft` in different models:
- `default`
- `negative`
- `reverse`

The module detects model using a dummy RTL scroller in [SharedReactionControl](../components/features/publication/shared-reaction-control/SharedReactionControl.tsx).

### 8.2 Normalized conversion layer

Helpers:
- `getNormalizedScrollLeft(...)`
- `setNormalizedScrollLeft(...)`

Purpose:
- abstract browser model differences so internal logic can work with consistent coordinates

### 8.3 Additional runtime calibration for Arabic mobile edge case

Final robust fix in [SharedReactionControl](../components/features/publication/shared-reaction-control/SharedReactionControl.tsx):
- adds `rtlPositiveRawMovesTrackRightRef`
- adds `detectRtlRawDirection(container, track)`
- probes raw `scrollLeft +1 / -1` and measures track physical movement (`trackRect.left` delta)
- maps left/right arrow clicks to physical direction based on measured runtime behavior

Why this was needed:
- some Arabic mobile environments can still behave unexpectedly with model assumptions alone
- runtime geometry-based calibration guarantees physical direction correctness for arrows

## 9) Comment Area Positioning and Layering

### 9.1 Portal behavior

Comment picker uses `createPortal(..., document.body)` so it is not clipped by comment scroll containers.

### 9.2 Boundary-clamped positioning

Comment picker anchor and boundary are computed from:
- trigger wrapper rect
- nearest ancestor marked with `data-comment-reaction-boundary`

This prevents picker overflow outside comment frame.

### 9.3 Responsive sizing

Comment picker width behavior:
- small viewport: bounded full width inside comment boundary
- larger viewport: content-sized with max width constrained by boundary

## 10) Backend Wiring for Comment and Reply Reactions

Important backend constraint (verified by code audit in CommentController/CommentService/CommentMapper):
- backend exposes only toggle endpoint for comment reactions
- root comments and replies read payloads do not include reaction counts or current user reaction
- there is no dedicated read endpoint for comment reaction hydration

Practical impact:
- after full refresh, backend alone cannot restore comment/reply reaction UI state
- frontend must preserve known state locally when backend read contract is incomplete

### 10.1 API endpoint

From [Publication API service](../services/api/publication.service.ts):
- `toggleCommentReaction(commentId, type)`
- calls `POST /comments/{commentId}/reactions`

### 10.2 Feed path

From [PublicationFeed](../components/features/publication/publication-feed/PublicationFeed.tsx):
- `handleReactComment(publicationId, commentId, reactionType)` calls API
- maps counts and current user reaction
- updates nested comment tree via recursive helper
- persists latest known comment reaction state per user in local cache
- rehydrates root comments and loaded replies from cache during load/fetch

### 10.3 Profile modal path

From [ProfileViews](../components/pages/profile/profile-overview-page/ProfileViews.tsx):
- same behavior as feed path
- same recursive nested update strategy
- same local-cache persistence and hydration strategy

### 10.5 Frontend persistence fallback

From [Comment reaction cache util](../lib/comment-reaction-cache.ts):
- stores comment/reply reaction snapshots in localStorage per user key
- snapshot contains:
  - `reactionsCountByType`
  - `currentUserReaction`
  - `likesCount`
  - `updatedAt`
- hydration is recursive and applies to both root comments and nested replies

Why this fallback exists:
- backend currently does not send comment reaction read state in comment/reply payloads
- backend currently does not expose comment reaction read endpoint

### 10.4 Reply support

Comments and replies both use same `FeedComment` node shape.
Recursive update helpers traverse nested `replies` and update targeted node by id.

## 11) Incident Postmortem: Arabic Mobile Arrow Direction Bug

## 11.1 User-visible symptom

In Arabic small-screen overflow picker:
- left arrow moved right
- in some states both arrows appeared to move right
- English behavior stayed correct

## 11.2 Why this happened

The issue was not in API wiring.
The issue was in scroll-direction behavior under RTL mobile runtime conditions.

The final diagnosis:
- raw `scrollLeft` direction-to-physical movement relationship can vary by runtime model/engine behavior
- assumptions based only on static model conversion were not always enough for this edge case

## 11.3 Final solution that stabilized behavior

A runtime physical calibration step was added:
1. probe raw movement with `scrollLeft + 1` and `scrollLeft - 1`
2. measure physical track movement from `trackRect.left`
3. infer whether positive raw scroll moves track right or left
4. map arrow click to physical direction using that inferred behavior

This keeps user semantics consistent:
- left arrow always moves visually left
- right arrow always moves visually right

## 11.4 Why this is safer

It uses actual runtime geometry, not assumptions.
That makes behavior robust across browsers and mobile engines.

## 12) Validation Matrix

Run all checks after touching reaction scroll logic.

### 12.1 Direction checks

- Arabic mobile (small viewport):
  - left arrow -> moves track left
  - right arrow -> moves track right
- Arabic desktop:
  - same behavior if arrows appear
- English mobile/desktop:
  - unchanged correct behavior

### 12.2 Variant checks

- publication variant
- comment variant
- nested reply variant

All must behave the same for arrow direction semantics.

### 12.3 Overflow and state checks

- arrows appear only when overflow exists
- arrow enable/disable states update correctly after each move
- manual scrollbar drag then arrow click remains consistent

### 12.4 Comment container checks

- no horizontal scrollbar leak in comment list
- comment vertical scroll ownership remains stable
- picker appears above neighboring UI elements

### 12.5 Data checks

- comment reaction toggle calls backend endpoint
- updates reflect in both root comment and reply nodes
- refresh keeps known comment/reply reaction state for current user session history via local cache hydration

## 13) Maintenance Rules

If you touch reaction scrolling code in [SharedReactionControl](../components/features/publication/shared-reaction-control/SharedReactionControl.tsx):
- do not remove runtime calibration without full cross-device RTL validation
- keep geometry-based `canScrollLeft/canScrollRight` checks
- rerun Arabic mobile matrix before merge

If you add new reaction types:
- update all maps in [Reaction config constants](../components/features/publication/shared-reaction-control/reaction-config.ts)
- verify chip rendering and labels in both variants

If you adjust comment layout:
- preserve `data-comment-reaction-boundary` in [CommentSection](../components/features/publication/comments/comment-section/CommentSection.tsx)
- preserve portal behavior in shared control

## 14) Quick Troubleshooting

If arrows behave wrong in Arabic:
1. confirm latest shared control code is loaded (hard refresh)
2. confirm runtime calibration logic is present
3. confirm picker is in overflow state (arrows visible)
4. test both publication and comment variants
5. compare manual drag direction vs arrow direction

If comment reactions do not persist:
1. verify `toggleCommentReaction` exists in service
2. verify callback chain from card -> section -> item
3. verify recursive update helper updates target comment id

## 15) Summary

The reaction system is now unified and production-safe across:
- publication, comment, and reply contexts
- RTL and LTR languages
- desktop and mobile viewports

The most critical hardening was the Arabic mobile arrow-direction fix, which now uses runtime physical calibration to enforce consistent user-facing behavior.

For comment/reply reaction persistence specifically, frontend now applies a cache-based hydration fallback until backend ships a dedicated read contract (either fields on CommentResponse or dedicated read endpoint).