# Backend Re-Audit Index

Audit date: 2026-03-29
Requested focus areas:
- comments and replies reactions
- other users profile behavior
- publication update by owner

## Documents
- backend-audit-comments-reactions.md
- backend-audit-other-user-profile.md
- backend-audit-publication-update.md

## Quick status snapshot

### Comments and replies reactions
- Reaction toggle endpoint exists and works for both root comments and replies.
- Toggle response returns status, currentUserReaction, and grouped counts.
- Missing read/list APIs for comment reactions.
- Missing comment report endpoint.

### Other users profile
- GET /api/users/{id} exists and returns filtered data based on account type.
- DTO is limited and does not include follow relationship metadata.
- Publications included in PUBLIC profile are not filtered by publication visibility.

### Publication update
- Owner-only update is implemented and stable.
- Supports JSON and multipart update modes.
- Supports media add and remove with max-10 enforcement and rollback-safe cleanup.
- Shared publication media protection error is implemented.

## Suggested next backend hardening priorities
1. Add visibility enforcement to user profile publication mapping and publication-by-user retrieval.
2. Add read endpoints for comment reactions (counts and users).
3. Add report endpoint for comments and replies.
4. Add relationship metadata to other-user profile response.
