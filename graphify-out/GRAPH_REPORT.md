# Graph Report - video-upload  (2026-05-01)

## Corpus Check
- 162 files · ~37,647 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 455 nodes · 363 edges · 35 communities detected
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 33 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]

## God Nodes (most connected - your core abstractions)
1. `AppService` - 17 edges
2. `AuthService` - 10 edges
3. `LmsCoursesController` - 8 edges
4. `CourseService` - 8 edges
5. `StorageService` - 7 edges
6. `VideosService` - 7 edges
7. `VideosController` - 7 edges
8. `dispatch()` - 5 edges
9. `AuthController` - 5 edges
10. `Select()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `dispatch()` --calls--> `persistTokens()`  [INFERRED]
  packages/ui/src/hooks/use-toast.ts → apps/web/src/store/axio/axiosInstance.ts
- `dispatch()` --calls--> `clearStoredAuth()`  [INFERRED]
  packages/ui/src/hooks/use-toast.ts → apps/web/src/store/axio/axiosInstance.ts
- `RequireSession()` --calls--> `useAppDispatch()`  [INFERRED]
  apps/web/src/components/auth/RequireSession.tsx → apps/web/src/store/hooks.ts
- `formatLessonDuration()` --calls--> `formatDuration()`  [INFERRED]
  apps/web/src/pages/VideoPlayerPage.tsx → apps/web/src/utils/mock-data.ts
- `JwtLandingPage()` --calls--> `useAppDispatch()`  [INFERRED]
  apps/web/src/pages/auth/JwtLandingPage.tsx → apps/web/src/store/hooks.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (5): handleSaveVideo(), uploadFilesByUrls(), bootstrap(), VideosController, VideosService

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (4): CourseService, onSubmit(), LmsCoursesController, Select()

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (1): AppService

### Community 3 - "Community 3"
Cohesion: 0.19
Nodes (2): AuthController, AuthService

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (9): clearStoredAuth(), getStoredRefreshToken(), persistTokens(), refreshAccessToken(), addToRemoveQueue(), dispatch(), genId(), reducer() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (2): ProgressController, ProgressService

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (4): formatDuration(), getCourseProgress(), getVideosForCourse(), formatLessonDuration()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (2): SidebarMenuButton(), useSidebar()

### Community 13 - "Community 13"
Cohesion: 0.38
Nodes (1): StorageService

### Community 17 - "Community 17"
Cohesion: 0.33
Nodes (3): useAppDispatch(), JwtLandingPage(), RequireSession()

### Community 20 - "Community 20"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 23 - "Community 23"
Cohesion: 0.4
Nodes (1): AppController

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (1): LmsController

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (1): JwtStrategy

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (1): ConfigModule

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (1): CommonService

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): CommonModule

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (1): AppModule

### Community 47 - "Community 47"
Cohesion: 0.67
Nodes (1): CloudfrontService

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): DatabaseModule

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): Course

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): CourseAssignment

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): VideoProgress

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): Video

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): LmsModule

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): LmsService

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): CreateAssignmentDto

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): CreateCourseDto

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): UpdateCourseDto

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): ListCoursesQueryDto

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): UpdateProgressDto

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): UpdateVideoDto

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): CreateVideoDto

### Community 87 - "Community 87"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 88 - "Community 88"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

## Knowledge Gaps
- **16 isolated node(s):** `DatabaseModule`, `Course`, `CourseAssignment`, `VideoProgress`, `Video` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (18 nodes): `AppService`, `.buildPlaybackUrl()`, `.cleanupFiles()`, `.constructor()`, `.createMasterPlaylist()`, `.downloadFromS3()`, `.extractDuration()`, `.getHello()`, `.getMetadataFromS3()`, `.onModuleInit()`, `.pollQueue()`, `.processProcessedVideoKey()`, `.processVideo()`, `.resolveProcessingDir()`, `.runFFmpeg()`, `.uploadFolderToS3()`, `app.service.ts`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (17 nodes): `auth.controller.ts`, `auth.service.ts`, `AuthController`, `.constructor()`, `.logout()`, `.refresh()`, `.verifyToken()`, `AuthService`, `.constructor()`, `.createRefreshToken()`, `.issueAccessToken()`, `.normalizeMultilineKey()`, `.parseRefreshToken()`, `.revokeAllRefreshTokensForUser()`, `.revokeRefreshToken()`, `.rotateRefreshToken()`, `.verifyAsymmetricToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 7`** (9 nodes): `progress.controller.ts`, `progress.service.ts`, `ProgressController`, `.constructor()`, `.findMy()`, `.upsertProgress()`, `ProgressService`, `.constructor()`, `.getMyProgress()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (7 nodes): `sidebar.tsx`, `cn()`, `handleKeyDown()`, `SidebarMenu()`, `SidebarMenuButton()`, `SidebarMenuItem()`, `useSidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (7 nodes): `storage.service.ts`, `StorageService`, `.checkBucketExists()`, `.constructor()`, `.createGetPreSignedUrl()`, `.ensureBucketExists()`, `.onModuleInit()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (5 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `lms.controller.ts`, `LmsController`, `.constructor()`, `.healthCheck()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (4 nodes): `jwt.strategy.ts`, `JwtStrategy`, `.constructor()`, `.validate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `config.module.ts`, `config.module.ts`, `ConfigModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `common.service.ts`, `common.service.ts`, `CommonService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `common.module.ts`, `common.module.ts`, `CommonModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `AppModule`, `app.module.ts`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (3 nodes): `cloudfront.service.ts`, `CloudfrontService`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `database.module.ts`, `DatabaseModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `course.schema.ts`, `Course`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `course-assignment.schema.ts`, `CourseAssignment`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `video-progress.schema.ts`, `VideoProgress`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `video.schemas.ts`, `Video`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `lms.module.ts`, `LmsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `lms.service.ts`, `LmsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `create-assignment.dto.ts`, `CreateAssignmentDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `create-course.dto.ts`, `CreateCourseDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `update-course.dto.ts`, `UpdateCourseDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `list-courses-query.dto.ts`, `ListCoursesQueryDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `update-progress.dto.ts`, `UpdateProgressDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `update-video.dto.ts`, `UpdateVideoDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `create-video.dto.ts`, `CreateVideoDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Select()` connect `Community 1` to `Community 2`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `DatabaseModule`, `Course`, `CourseAssignment` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._