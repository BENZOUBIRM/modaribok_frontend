# Backend Audit: Comments, Replies, and Reactions

Audit date: 2026-03-29
Scope: latest backend additions focused on comment and reply reactions.

## Source files reviewed
- MODARIBOK_Backend/src/main/java/com/example/modaribok/controller/CommentController.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/CommentService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/CommentReactionService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/repository/PublicationCommentRepository.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/repository/CommentReactionRepository.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/model/entity/CommentReaction.java
- MODARIBOK_Backend/src/main/resources/db/migration/V10__create_comment_reactions.sql

## API contract

### 1) Create comment or reply
- Endpoint: POST /api/publications/{publicationId}/comments
- Auth: required (JWT)
- Request body:
```json
{
  "content": "string, max 5000",
  "parentCommentId": 123
}
```
- Behavior:
  - parentCommentId omitted or null => root comment
  - parentCommentId provided => reply
  - parent comment must belong to same publication
  - parent comment must not be deleted

### 2) Get root comments (paginated)
- Endpoint: GET /api/publications/{publicationId}/comments?page=0&size=10
- Returns only root comments (parentComment is null) and only non-deleted comments.
- Default order in repository: createdAt DESC.

### 3) Get replies for a comment
- Endpoint: GET /api/comments/{commentId}/replies
- Returns only non-deleted replies.
- Order in repository: createdAt ASC.

### 4) Delete comment
- Endpoint: DELETE /api/comments/{commentId}
- Auth: required (JWT)
- Only the comment owner can delete.
- Delete mode is soft delete:
  - isDeleted is set to true
  - mapper returns content as [Commentaire supprime]

### 5) Toggle reaction on comment or reply
- Endpoint: POST /api/comments/{commentId}/reactions
- Auth: required (JWT)
- Request body:
```json
{
  "type": "LIKE"
}
```
- Works for both root comments and replies (same table/entity).
- Toggle logic:
  - no previous reaction => added
  - same reaction again => removed
  - different reaction => updated
- Response shape:
```json
{
  "status": "added | removed | updated",
  "currentUserReaction": "like | love | ... | null",
  "reactionsCount": {
    "like": 2,
    "fire": 1
  }
}
```

## Supported reaction types
- LIKE
- LOVE
- HAHA
- STRONG
- FIRE
- CLAP
- MUSCLE
- HEALTHY
- MOTIVATION
- GOAL
- PROGRESS
- CHAMPION

Invalid type throws REACTION_INVALID_TYPE_001.

## Data model and DB constraints
- Table: comment_reactions
- Unique constraint: one reaction per user per comment (user_id, comment_id)
- Foreign keys use ON DELETE CASCADE to users and publication_comments.

## Important backend behavior and gaps

### A) No comment reaction data in comment list payloads
- CommentResponse does not include:
  - current user reaction
  - reaction counts by type
- Frontend cannot fully hydrate reaction UI from GET comments/replies alone.

### B) No dedicated read endpoints for comment reactions
- There is no endpoint like:
  - GET /api/comments/{id}/reactions
  - GET /api/comments/{id}/reactions/users
- Only toggle endpoint exists.

### C) No comment report endpoint
- No backend endpoint found for reporting comments/replies.
- Comment report action in frontend must remain static placeholder until backend adds an API.

### D) Visibility checks are missing in comment flows
- Current comment create/list/reply/reaction services validate existence/deletion, but do not enforce publication visibility access.
- This means comment operations are not explicitly tied to publication-level privacy checks.

## Frontend integration guidance
- Keep optimistic UI for reaction toggles based on toggle response payload.
- Do not expect reaction aggregates in comment list responses.
- Keep report action disabled/static until a comment report API is introduced.
- Keep local-state immediate removal for deleted comments/replies for UX consistency.

## Error code references (most relevant)
- COMMENT_CREATED_SUCCESS
- COMMENT_DELETED_SUCCESS
- COMMENT_NOT_FOUND_001
- COMMENT_CONTENT_REQUIRED_002
- COMMENT_PARENT_MISMATCH_003
- COMMENT_UNAUTHORIZED_004
- REACTION_TOGGLED_SUCCESS
- REACTION_INVALID_TYPE_001
