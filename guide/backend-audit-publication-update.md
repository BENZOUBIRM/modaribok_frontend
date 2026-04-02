# Backend Audit: Publication Update

Audit date: 2026-03-29
Scope: owner update flow for publication content, visibility, and media mutation.

## Source files reviewed
- MODARIBOK_Backend/src/main/java/com/example/modaribok/controller/PublicationController.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/PublicationService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/dto/publication/UpdatePublicationRequest.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/repository/PublicationMediaRepository.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/repository/PublicationRepository.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/FileStorageService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/exception/ErrorCode.java

## Update endpoints

### 1) JSON update
- Endpoint: PUT /api/publications/{id}
- Content-Type: application/json
- Request body:
```json
{
  "content": "optional string, max 5000",
  "visibility": "PUBLIC | FRIENDS | PRIVATE",
  "mediaIdsToRemove": [1, 2]
}
```

### 2) Multipart update (with new media)
- Endpoint: PUT /api/publications/{id}
- Content-Type: multipart/form-data
- Parts:
  - publication: UpdatePublicationRequest JSON
  - media: optional repeated files to add

## Authorization and ownership
- JWT required.
- Publication must exist and must not be deleted.
- Only the publication owner can update.
- Unauthorized update throws PUBLICATION_UNAUTHORIZED_009.

## What can be updated
- content (if provided)
- visibility (if provided)
- media set:
  - remove existing media via mediaIdsToRemove
  - add new media files via multipart media part

## Media update rules

### A) Input normalization
- mediaIdsToRemove is sanitized to positive distinct ids.
- new media files are normalized to non-empty files and validated.

### B) Max media cap enforced after mutation
- finalMediaCount = current - removed + added
- if finalMediaCount > 10 => PUBLICATION_MAX_MEDIA_EXCEEDED_003

### C) Shared publication protection
When updating a shared post:
- removing media from the original shared publication is forbidden.
- backend throws PUBLICATION_SHARED_MEDIA_MODIFICATION_FORBIDDEN.

### D) Storage and cleanup behavior
- Added files are stored with generated thumbnail and display order.
- Rollback cleanup is registered for newly stored files.
- Removed files are deleted from filesystem after commit.

## Response contract
- Success code: PUBLICATION_UPDATED_SUCCESS
- Response data: updated PublicationResponse

## Important implementation notes

### 1) Two update modes are available on same path
- Choose request Content-Type based on whether new files are added.

### 2) Update is partial, not full replace
- Null fields are ignored.
- Only provided fields are mutated.

### 3) content can be updated to empty string
- Validation enforces max length, not non-empty.
- This is currently allowed by service logic.

### 4) Non-owner media ids are rejected
- If media ids do not belong to the target publication, backend raises unauthorized.

## Frontend integration guidance
- Use JSON update when changing only text or visibility (and optional mediaIdsToRemove).
- Use multipart update when adding media.
- Preserve owner-only edit UI, since backend enforces owner check.
- Handle specific backend code PUBLICATION_SHARED_MEDIA_MODIFICATION_FORBIDDEN to show a clear message for shared-post media restrictions.

## Related visibility caveat outside update endpoint
- Separate read endpoints still need careful handling:
  - GET /api/publications/{id}
  - GET /api/publications/user/{userId}
- Their service paths currently do not enforce complete visibility rules for all viewer contexts.

## Error code references (most relevant)
- PUBLICATION_UPDATED_SUCCESS
- PUBLICATION_NOT_FOUND_004
- PUBLICATION_UNAUTHORIZED_009
- PUBLICATION_MAX_MEDIA_EXCEEDED_003
- PUBLICATION_SHARED_MEDIA_MODIFICATION_FORBIDDEN
- FILE_EMPTY
- FILE_TOO_LARGE
- FILE_TYPE_NOT_ALLOWED
