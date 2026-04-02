# Backend Audit: Other User Profiles

Audit date: 2026-03-29
Scope: profile data for users other than the authenticated user.

## Source files reviewed
- MODARIBOK_Backend/src/main/java/com/example/modaribok/controller/UserController.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/UserService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/dto/user/UserProfileDTO.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/dto/user/UserProfileResponse.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/controller/FollowController.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/service/FollowService.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/repository/PublicationRepository.java
- MODARIBOK_Backend/src/main/java/com/example/modaribok/config/SecurityConfig.java
- MODARIBOK_Backend/src/main/resources/db/migration/V7__add_account_type_to_users.sql
- MODARIBOK_Backend/src/main/resources/db/migration/V8__create_follows_table.sql

## API contract

### 1) My profile
- Endpoint: GET /api/users/me
- Auth: required
- Returns UserProfileResponse (full profile fields), including:
  - email, phone, role
  - accountType
  - profileImageUrl
  - sports

### 2) Other user profile
- Endpoint: GET /api/users/{id}
- Auth: required (global security + method preauthorize)
- Returns UserProfileDTO filtered by target account type.

#### If target account is PRIVATE
Returned fields are limited to:
- id
- firstName
- lastName
- city
- country

#### If target account is PUBLIC
Returned fields include:
- id, firstName, lastName, city, country
- gender, birthday, createdAt
- sports
- publications

### 3) Change my account type
- Endpoint: PATCH /api/users/me/account-type
- Auth: required
- Request body:
```json
{
  "accountType": "PUBLIC"
}
```
- Allowed values: PUBLIC, PRIVATE

### 4) Follow system endpoints
- POST /api/users/{id}/follow
- DELETE /api/users/{id}/follow
- GET /api/users/{id}/followers
- GET /api/users/{id}/following
- GET /api/users/me/follow-requests
- POST /api/follow-requests/{id}/accept
- POST /api/follow-requests/{id}/reject

## Current behavior details that affect profile pages

### A) Privacy model is account-type based only in profile DTO
- PRIVATE account returns a reduced profile DTO.
- PUBLIC account returns more fields plus publications.
- There is no viewer-relationship decision inside getUserProfileById (no follow status check in this method).

### B) Publications embedded in PUBLIC profile are only filtered by deleted and hidden
- UserService.mapPublications currently does:
  - findByUserIdOrderByCreatedAtDesc(userId)
  - filter !isDeleted && !isHidden
- It does not filter by publication visibility (PUBLIC, FRIENDS, PRIVATE).

### C) Profile DTO lacks relationship and image context for other user
UserProfileDTO does not contain:
- profileImageUrl
- isFollowing / followsYou / followRequestPending

These must be derived from separate endpoints or are currently unavailable.

### D) Auth requirement is global for all non-public routes
SecurityConfig uses:
- permitAll only for auth, images, swagger, oauth routes
- anyRequest().authenticated() for the rest

So profile and follow APIs require authenticated requests.

## Risks and limitations
- A public account profile can include publication entries regardless of publication visibility value.
- No single endpoint returns full other-user profile with relationship context and privacy-aware post filtering.

## Frontend integration guidance
- Treat GET /api/users/{id} as a limited profile contract, not a full social profile aggregate.
- Use follow endpoints for actions and follower/following lists.
- If publication visibility correctness is required on other-user pages, apply client-side filtering as a temporary safety layer until backend hardens server-side filtering.
- Keep UI resilient when profileImageUrl is missing from other-user DTO.

## Error code references (most relevant)
- USER_PROFILE_RETRIEVED_SUCCESS
- ACCOUNT_TYPE_CHANGED_SUCCESS
- INVALID_ACCOUNT_TYPE
- FOLLOW_SUCCESS
- UNFOLLOW_SUCCESS
- FOLLOW_ALREADY_EXISTS
- FOLLOW_NOT_FOUND
- FOLLOW_REQUEST_ACCEPTED
- FOLLOW_REQUEST_REJECTED
- FOLLOW_REQUEST_NOT_FOUND
- FOLLOW_REQUEST_NOT_PENDING
- FOLLOW_ACCOUNT_NOT_PRIVATE
