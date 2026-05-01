# Graph Report - video-upload  (2026-05-01)

## Corpus Check
- 161 files · ~34,851 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 442 nodes · 347 edges · 34 communities detected
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
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

## God Nodes (most connected - your core abstractions)
1. `AppService` - 15 edges
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
- `JwtLandingPage()` --calls--> `useAppDispatch()`  [INFERRED]
  apps/web/src/pages/auth/JwtLandingPage.tsx → apps/web/src/store/hooks.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.1
Nodes (5): handleSaveVideo(), uploadFilesByUrls(), StorageService, VideosController, VideosService

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (3): CourseService, LmsCoursesController, bootstrap()

### Community 2 - "Community 2"
Cohesion: 0.19
Nodes (2): AuthController, AuthService

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (1): AppService

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (3): ProgressController, ProgressService, Select()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (9): clearStoredAuth(), getStoredRefreshToken(), persistTokens(), refreshAccessToken(), addToRemoveQueue(), dispatch(), genId(), reducer() (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.33
Nodes (2): SidebarMenuButton(), useSidebar()

### Community 15 - "Community 15"
Cohesion: 0.33
Nodes (3): useAppDispatch(), JwtLandingPage(), RequireSession()

### Community 18 - "Community 18"
Cohesion: 0.5
Nodes (2): CarouselNext(), useCarousel()

### Community 21 - "Community 21"
Cohesion: 0.4
Nodes (1): AppController

### Community 22 - "Community 22"
Cohesion: 0.5
Nodes (2): getCourseProgress(), getVideosForCourse()

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (1): LmsController

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (1): JwtStrategy

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (1): ConfigModule

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (1): CommonService

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (1): CommonModule

### Community 45 - "Community 45"
Cohesion: 0.67
Nodes (1): AppModule

### Community 46 - "Community 46"
Cohesion: 0.67
Nodes (1): CloudfrontService

### Community 71 - "Community 71"
Cohesion: 1.0
Nodes (1): DatabaseModule

### Community 72 - "Community 72"
Cohesion: 1.0
Nodes (1): Course

### Community 73 - "Community 73"
Cohesion: 1.0
Nodes (1): CourseAssignment

### Community 74 - "Community 74"
Cohesion: 1.0
Nodes (1): VideoProgress

### Community 75 - "Community 75"
Cohesion: 1.0
Nodes (1): Video

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (1): LmsModule

### Community 77 - "Community 77"
Cohesion: 1.0
Nodes (1): LmsService

### Community 78 - "Community 78"
Cohesion: 1.0
Nodes (1): CreateAssignmentDto

### Community 79 - "Community 79"
Cohesion: 1.0
Nodes (1): CreateCourseDto

### Community 80 - "Community 80"
Cohesion: 1.0
Nodes (1): UpdateCourseDto

### Community 81 - "Community 81"
Cohesion: 1.0
Nodes (1): ListCoursesQueryDto

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (1): UpdateProgressDto

### Community 83 - "Community 83"
Cohesion: 1.0
Nodes (1): UpdateVideoDto

### Community 84 - "Community 84"
Cohesion: 1.0
Nodes (1): CreateVideoDto

### Community 85 - "Community 85"
Cohesion: 1.0
Nodes (1): AuthModule

### Community 86 - "Community 86"
Cohesion: 1.0
Nodes (1): JwtAuthGuard

## Knowledge Gaps
- **16 isolated node(s):** `DatabaseModule`, `Course`, `CourseAssignment`, `VideoProgress`, `Video` (+11 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 2`** (17 nodes): `auth.controller.ts`, `auth.service.ts`, `AuthController`, `.constructor()`, `.logout()`, `.refresh()`, `.verifyToken()`, `AuthService`, `.constructor()`, `.createRefreshToken()`, `.issueAccessToken()`, `.normalizeMultilineKey()`, `.parseRefreshToken()`, `.revokeAllRefreshTokensForUser()`, `.revokeRefreshToken()`, `.rotateRefreshToken()`, `.verifyAsymmetricToken()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 3`** (16 nodes): `AppService`, `.buildPlaybackUrl()`, `.cleanupFiles()`, `.constructor()`, `.createMasterPlaylist()`, `.downloadFromS3()`, `.getHello()`, `.onModuleInit()`, `.pollQueue()`, `.processProcessedVideoKey()`, `.processVideo()`, `.resolveProcessingDir()`, `.runFFmpeg()`, `.uploadFolderToS3()`, `app.service.ts`, `app.service.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 10`** (7 nodes): `sidebar.tsx`, `cn()`, `handleKeyDown()`, `SidebarMenu()`, `SidebarMenuButton()`, `SidebarMenuItem()`, `useSidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (5 nodes): `Carousel()`, `CarouselNext()`, `cn()`, `useCarousel()`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (5 nodes): `AppController`, `.constructor()`, `.getHello()`, `app.controller.ts`, `app.controller.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (5 nodes): `mock-data.ts`, `formatDuration()`, `getCourseProgress()`, `getProgressForVideo()`, `getVideosForCourse()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (4 nodes): `lms.controller.ts`, `LmsController`, `.constructor()`, `.healthCheck()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `jwt.strategy.ts`, `JwtStrategy`, `.constructor()`, `.validate()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (3 nodes): `config.module.ts`, `config.module.ts`, `ConfigModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (3 nodes): `common.service.ts`, `common.service.ts`, `CommonService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (3 nodes): `common.module.ts`, `common.module.ts`, `CommonModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (3 nodes): `AppModule`, `app.module.ts`, `app.module.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (3 nodes): `cloudfront.service.ts`, `CloudfrontService`, `.constructor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (2 nodes): `database.module.ts`, `DatabaseModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 72`** (2 nodes): `course.schema.ts`, `Course`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 73`** (2 nodes): `course-assignment.schema.ts`, `CourseAssignment`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 74`** (2 nodes): `video-progress.schema.ts`, `VideoProgress`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 75`** (2 nodes): `video.schemas.ts`, `Video`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (2 nodes): `lms.module.ts`, `LmsModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 77`** (2 nodes): `lms.service.ts`, `LmsService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 78`** (2 nodes): `create-assignment.dto.ts`, `CreateAssignmentDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 79`** (2 nodes): `create-course.dto.ts`, `CreateCourseDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (2 nodes): `update-course.dto.ts`, `UpdateCourseDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (2 nodes): `list-courses-query.dto.ts`, `ListCoursesQueryDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (2 nodes): `update-progress.dto.ts`, `UpdateProgressDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 83`** (2 nodes): `update-video.dto.ts`, `UpdateVideoDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (2 nodes): `create-video.dto.ts`, `CreateVideoDto`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 85`** (2 nodes): `auth.module.ts`, `AuthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 86`** (2 nodes): `jwt-auth.guard.ts`, `JwtAuthGuard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Select()` connect `Community 4` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `VideosController` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **What connects `DatabaseModule`, `Course`, `CourseAssignment` to the rest of the system?**
  _16 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._