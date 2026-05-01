import { useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  PlayCircle,
  RefreshCcw,
} from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';
import { useGetCourseByIdQuery } from '@/store/api/courseApi';
import { useGetMyProgressQuery, useUpsertProgressMutation } from '@/store/api/progressApi';
import {
  type Video,
  useGetCourseVideoByIdQuery,
  useGetCourseVideosQuery,
} from '@/store/api/videoApi';
import { MyPlayer } from '@/components/MyPlayer';

export function formatLessonDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '0:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  const mm = m.toString();
  const ss = s.toString().padStart(2, '0');

  return `${mm}:${ss}`;
}


function getPlaybackUnavailableCopy(status: Video['status']) {
  if (status === 'FAILED') {
    return {
      title: 'Video could not be prepared',
      description:
        'This lesson is unavailable because processing failed. Check back after the course owner uploads it again.',
    };
  }

  if (status === 'UPLOADING' || status === 'UPLOADED') {
    return {
      title: 'Video is still being prepared',
      description:
        'This lesson has been uploaded and will be playable after processing finishes.',
    };
  }

  return {
    title: 'Video is not ready yet',
    description:
      'This lesson is part of the course, but playback is not available right now.',
  };
}

function VideoPlayerPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Skeleton className="size-9 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-5 w-24 sm:block" />
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="min-w-0 flex-1">
          <Skeleton className="aspect-video w-full rounded-none" />
          <div className="space-y-4 p-5 sm:p-6 lg:p-8">
            <Skeleton className="h-8 w-full max-w-2xl" />
            <Skeleton className="h-4 w-full max-w-3xl" />
            <Skeleton className="h-4 w-56" />
          </div>
        </section>

        <aside className="border-t border-border bg-card/30 lg:w-88 lg:border-l lg:border-t-0">
          <div className="border-b border-border p-4">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="space-y-0">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex gap-3 border-b border-border p-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}

const VideoPlayerPage = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const navigate = useNavigate();
  const {
    data: courseResponse,
    isLoading: isCourseLoading,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useGetCourseByIdQuery(courseId || '', { skip: !courseId });
  const {
    data: videoResponse,
    isLoading: isVideoLoading,
    isError: isVideoError,
    refetch: refetchVideo,
  } = useGetCourseVideoByIdQuery(
    { courseId: courseId || '', videoId: videoId || '' },
    { skip: !courseId || !videoId },
  );
  const {
    data: videosResponse,
    isLoading: isVideosLoading,
    isError: isVideosError,
    refetch: refetchVideos,
  } = useGetCourseVideosQuery(courseId || '', { skip: !courseId });
  const {
    data: progressResponse,
    isLoading: isProgressLoading,
    isError: isProgressError,
    refetch: refetchProgress,
  } = useGetMyProgressQuery(courseId || '', { skip: !courseId });
  const [upsertProgress] = useUpsertProgressMutation();

  const course = courseResponse?.data;
  const video = videoResponse?.data;
  const courseVideos = videosResponse?.data ?? [];
  const progressItems = progressResponse?.data ?? [];
  const progress = progressItems.find((item) => item.video_id === videoId);
  const lastSyncedPositionRef = useRef(0);
  const isLoading = isCourseLoading || isVideoLoading || isVideosLoading || isProgressLoading;
  const isError = isCourseError || isVideoError || isVideosError || isProgressError;

  useEffect(() => {
    lastSyncedPositionRef.current = progress?.last_position_seconds ?? 0;
  }, [videoId, progress?.last_position_seconds]);

  const persistProgress = useCallback(
    async (
      positionSeconds: number,
      options?: { completed?: boolean; force?: boolean },
    ) => {
      if (!videoId) return;

      const safePosition = Math.max(0, Math.floor(positionSeconds));
      const completed = options?.completed ?? false;
      const force = options?.force ?? false;
      const secondsDelta = Math.abs(safePosition - lastSyncedPositionRef.current);

      if (!force && !completed && secondsDelta < 3) {
        return;
      }

      try {
        await upsertProgress({
          videoId,
          body: {
            lastPositionSeconds: safePosition,
            ...(completed ? { completed: true } : {}),
          },
        }).unwrap();
        lastSyncedPositionRef.current = safePosition;
      } catch (error) {
        console.error('Failed to persist video progress', error);
      }
    },
    [upsertProgress, videoId],
  );

  const handlePausePosition = useCallback(
    (seconds: number) => {
      void persistProgress(seconds);
    },
    [persistProgress],
  );

  const handleCompleted = useCallback(
    (seconds: number) => {
      void persistProgress(seconds, { completed: true, force: true });
    },
    [persistProgress],
  );

  const handleRetry = useCallback(() => {
    if (courseId) {
      void refetchCourse();
      void refetchVideos();
      void refetchProgress();
    }

    if (courseId && videoId) {
      void refetchVideo();
    }
  }, [courseId, videoId, refetchCourse, refetchProgress, refetchVideo, refetchVideos]);

  const handleBackToCourse = useCallback(() => {
    navigate(courseId ? `/courses/${courseId}` : '/');
  }, [courseId, navigate]);

  if (isLoading) {
    return <VideoPlayerPageSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl">
          <Alert className="border-border bg-card">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>Video could not be loaded</AlertTitle>
            <AlertDescription>
              The lesson, course details, or your progress could not be reached. Try again
              or return to the course.
            </AlertDescription>
          </Alert>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={handleRetry}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Retry
            </Button>
            <Button type="button" variant="outline" onClick={handleBackToCourse}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to course
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!video || !course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-xl rounded-xl border border-border bg-card p-6">
          <div className="flex size-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-5" aria-hidden="true" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Video not found
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This lesson may have been removed, or you may not have access to it.
            Return to the course to choose another video.
          </p>
          <Button type="button" className="mt-5" onClick={handleBackToCourse}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to course
          </Button>
        </div>
      </div>
    );
  }

  const playbackUnavailable = getPlaybackUnavailableCopy(video.status);
  const completedCount = progressItems.filter((item) => item.completed).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleBackToCourse}
            aria-label="Back to course"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              {course.title}
            </p>
            <h1 className="truncate text-sm font-semibold text-foreground">
              {video.title}
            </h1>
          </div>
          {progress?.completed && (
            <Badge variant="secondary" className="hidden sm:inline-flex">
              <CheckCircle2 className="size-3" aria-hidden="true" />
              Completed
            </Badge>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col lg:flex-row">
        <section className="min-w-0 flex-1">
          <div className="aspect-video w-full overflow-hidden bg-card">
            {video.hls_Master_Url ? (
              <MyPlayer
                src={video.hls_Master_Url}
                thumbnail_url={video?.thumbnail_url ?? undefined}
                title={video.title}
                initialPositionSeconds={progress?.last_position_seconds ?? 0}
                onPausePosition={handlePausePosition}
                onCompleted={handleCompleted}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary px-6">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-background text-foreground">
                    {video.status === 'FAILED' ? (
                      <AlertTriangle className="size-6" aria-hidden="true" />
                    ) : (
                      <PlayCircle className="size-6" aria-hidden="true" />
                    )}
                  </div>
                  <h2 className="mt-4 text-base font-semibold text-foreground">
                    {playbackUnavailable.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {playbackUnavailable.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                {progress?.completed && (
                  <Badge variant="secondary">
                    <CheckCircle2 className="size-3" aria-hidden="true" />
                    Completed
                  </Badge>
                )}
                {!video.hls_Master_Url && (
                  <Badge variant={video.status === 'FAILED' ? 'destructive' : 'outline'}>
                    {video.status === 'FAILED' ? 'Unavailable' : 'Preparing'}
                  </Badge>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground">
                {video.title}
              </h2>
              {video.description ? (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {video.description}
                </p>
              ) : (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                  No lesson description is available.
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-4" aria-hidden="true" />
                  {formatLessonDuration(video.duration_seconds)}
                </span>
                <span>{video.status.toLowerCase()}</span>
                {progress?.last_position_seconds ? (
                  <span>Last watched {formatLessonDuration(progress.last_position_seconds)}</span>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <aside className="border-t border-border bg-card/30 lg:w-88 lg:border-l lg:border-t-0">
          <div className="border-b border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">Course videos</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {completedCount}/{courseVideos.length} completed
            </p>
          </div>

          <div className="max-h-[60vh] overflow-y-auto lg:max-h-[calc(100vh-73px)]">
            {courseVideos.map((v) => {
              const vProg = progressItems.find((item) => item.video_id === v._id);
              const isActive = v._id === videoId;

              return (
                <button
                  key={v._id}
                  type="button"
                  onClick={() => navigate(`/courses/${courseId}/videos/${v._id}`)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-16 w-full items-center gap-3 border-b border-border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${isActive
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-transparent hover:bg-muted/70'
                    }`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-medium ${isActive
                      ? 'border-primary bg-background text-foreground'
                      : 'border-border bg-secondary text-muted-foreground'
                      }`}
                  >
                    {vProg?.completed ? (
                      <CheckCircle2 className="size-4" aria-hidden="true" />
                    ) : (
                      v.video_order
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm ${isActive ? 'font-semibold text-foreground' : 'font-medium text-foreground'
                        }`}
                    >
                      {v.title}
                    </p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                      <span>{formatLessonDuration(v.duration_seconds)}</span>
                      {vProg?.completed ? <span>Completed</span> : null}
                      {!v.hls_Master_Url ? (
                        <span>{v.status === 'FAILED' ? 'Unavailable' : 'Preparing'}</span>
                      ) : null}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default VideoPlayerPage;
