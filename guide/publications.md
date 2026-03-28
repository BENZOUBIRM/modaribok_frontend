# Publications Integration Guide

This guide summarizes the backend publication contract from:
- `MODARIBOK_Backend/src/main/java/com/example/modaribok/controller/PublicationController.java`
- `MODARIBOK_Backend/src/main/java/com/example/modaribok/service/PublicationService.java`
- `MODARIBOK_Backend/src/main/java/com/example/modaribok/dto/publication/CreatePublicationRequest.java`
- `MODARIBOK_Backend/src/main/java/com/example/modaribok/config/FileStorageConfig.java`

## 1) Base endpoint
- Backend controller base: `/api/publications`
- Frontend `apiClient` base URL already ends with `/api`
- Frontend service should call: `/publications`

## 2) Create publication (CRITICAL CONTRACT)
### Endpoint
- `POST /api/publications`
- `Content-Type: multipart/form-data`

### Required multipart parts
1. **`publication`** (required)
   - JSON part (not plain text fields)
   - Maps to backend `CreatePublicationRequest`

2. **`media`** (optional, repeated)
   - file list (`List<MultipartFile>`)
   - each file appended with key `media`

### `publication` JSON shape
```json
{
  "content": "optional string (max 5000)",
  "visibility": "PUBLIC | FRIENDS | PRIVATE",
  "sharedPublicationId": null
}
```

### Business rules (backend)
- At least one of these must exist:
  - text content, OR
  - media files, OR
  - sharedPublicationId
- Max media count: **10 files**
- Visibility allowed values: `PUBLIC`, `FRIENDS`, `PRIVATE`

### Common create errors
- `PUBLICATION_CONTENT_OR_MEDIA_REQUIRED_002`
- `PUBLICATION_MAX_MEDIA_EXCEEDED_003`
- `PUBLICATION_INVALID_VISIBILITY_010`
- Missing `publication` part causes:
  - `MissingServletRequestPartException: Required part 'publication' is not present`

## 3) Media validation rules
From `FileStorageConfig` + `FileStorageService`:
- Max file size: **5MB** per file (default)
- Allowed extensions:
  - `png`, `jpg`, `jpeg`, `mp4`, `mov`, `avi`, `webm`
- Allowed content types:
  - `image/png`, `image/jpeg`, `image/jpg`
  - `video/mp4`, `video/quicktime`, `video/x-msvideo`, `video/webm`

## 4) Backend media storage behavior
- Originals: `/uploads/publications/original/`
- Thumbnails: `/uploads/publications/thumbnails/`
- Base URL: `/api/images`
- Backend auto-generates thumbnail URL and original URL for each media item

## 5) Feed and related endpoints
- `GET /api/publications` (paginated feed)
- `GET /api/publications/{id}`
- `GET /api/publications/user/{userId}`
- `DELETE /api/publications/{id}` (soft delete)
- `PUT /api/publications/{id}` (update content/visibility)
- `POST /api/publications/{id}/reactions`
- `GET /api/publications/{id}/reactions/users`
- `POST /api/publications/{id}/report`

## 6) Frontend implementation notes
### Correct FormData creation
```ts
const formData = new FormData()

formData.append(
  "publication",
  new Blob([
    JSON.stringify({ content, visibility, sharedPublicationId: null })
  ], { type: "application/json" })
)

for (const file of mediaFiles) {
  formData.append("media", file)
}
```

### Important
- Do **not** send `content`/`visibility` as standalone form fields when creating publication.
- Backend expects a JSON `publication` part.

## 7) Current frontend files to keep aligned
- `services/api/publication.service.ts`
- `components/features/publication/create-publication/CreatePublication.tsx`
- `components/features/publication/publication-feed/PublicationFeed.tsx`

## 8) Quick troubleshooting checklist
If create publication fails:
1. Confirm request is `multipart/form-data`
2. Confirm `publication` part exists and is valid JSON
3. Confirm media key is exactly `media` (not `mediaFiles`)
4. Confirm visibility is uppercase enum value
5. Confirm files count <= 10
6. Confirm file size/type allowed
7. Check returned backend `code` for exact reason
