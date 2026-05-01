import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCcw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { VideoFormDialog } from '@/components/VideoFormDialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert';
import { useGetCourseByIdQuery } from '@/store/api/courseApi';
import {
  type Video,
  useCreateVideoMutation,
  useGetCourseVideosQuery,
  useUpdateVideoMutation,
} from '@/store/api/videoApi';
import {
  type VideoProgress,
  useGetMyProgressQuery,
} from '@/store/api/progressApi';

export interface FileProgress {
  progress: number;
  isComplete: boolean;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '0:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  const mm = m.toString();
  const ss = s.toString().padStart(2, '0');

  return `${mm}:${ss}`;
}

function getVideoStatus(video: Video) {
  if (!video.is_published) {
    return {
      label: 'Draft',
      description: 'Not visible to learners',
      variant: 'outline' as const,
    };
  }

  if (video.status === 'READY') {
    return {
      label: 'Ready',
      description: 'Playable',
      variant: 'secondary' as const,
    };
  }

  if (video.status === 'FAILED') {
    return {
      label: 'Unavailable',
      description: 'Processing failed',
      variant: 'destructive' as const,
    };
  }

  return {
    label: 'Preparing',
    description: 'Processing video',
    variant: 'outline' as const,
  };
}

function getWatchedPercent(video: Video, progress?: VideoProgress) {
  if (progress?.completed) return 100;

  if (!video.duration_seconds || !progress?.last_position_seconds) {
    return 0;
  }

  return Math.min(
    99,
    Math.max(
      0,
      Math.round((progress.last_position_seconds / video.duration_seconds) * 100),
    ),
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Skeleton className="size-9 rounded-md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-5 w-64 max-w-full" />
          </div>
          <Skeleton className="hidden h-9 w-28 sm:block" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-4 h-8 w-full max-w-xl" />
          <Skeleton className="mt-3 h-4 w-full max-w-3xl" />
          <Skeleton className="mt-6 h-2 w-full" />
          <Skeleton className="mt-5 h-9 w-36" />
        </section>

        <section className="space-y-3">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex gap-3">
                <Skeleton className="size-10 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-5 w-full max-w-lg" />
                  <Skeleton className="h-4 w-full max-w-2xl" />
                  <Skeleton className="h-2 w-full max-w-md" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [fileProgress, setFileProgress] = useState<Record<string, FileProgress>>({});
  const [createVideo] = useCreateVideoMutation();
  const [updateVideo] = useUpdateVideoMutation();
  const {
    data: videosResponse,
    isLoading: isVideosLoading,
    isError: isVideosError,
    refetch: refetchVideos,
  } = useGetCourseVideosQuery(courseId || '', { skip: !courseId });
  const {
    data: courseResponse,
    isLoading: isCourseLoading,
    isError: isCourseError,
    refetch: refetchCourse,
  } = useGetCourseByIdQuery(courseId || '', { skip: !courseId });
  const {
    data: progressResponse,
    isLoading: isProgressLoading,
    isError: isProgressError,
    refetch: refetchProgress,
  } = useGetMyProgressQuery(courseId || '', { skip: !courseId });

  const course = courseResponse?.data;
  const videos = useMemo(
    () =>
      [...(videosResponse?.data ?? [])].sort(
        (a, b) => a.video_order - b.video_order,
      ),
    [videosResponse?.data],
  );
  const progressItems = useMemo(
    () => progressResponse?.data ?? [],
    [progressResponse?.data],
  );
  const progressByVideoId = useMemo(
    () =>
      new Map(progressItems.map((item) => [item.video_id, item] as const)),
    [progressItems],
  );
  const totalLessons = videos.length;
  const completedCount = videos.filter((video) =>
    progressByVideoId.get(video._id)?.completed,
  ).length;
  const progressPercentage =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const nextVideo =
    videos.find((video) => video.is_published && !progressByVideoId.get(video._id)?.completed) ??
    videos.find((video) => video.is_published) ??
    videos[0] ??
    null;
  const uploadProgressItems = Object.entries(fileProgress);
  const isLoading = isCourseLoading || isVideosLoading || isProgressLoading;
  const isError = isCourseError || isVideosError || isProgressError;

  const handleRetry = () => {
    void refetchCourse();
    void refetchVideos();
    void refetchProgress();
  };

  const openCreateVideo = () => {
    setEditingVideo(null);
    setDialogOpen(true);
  };

  const uploadFilesByUrls = async (
    presignedUrls: string[],
    filesToUpload: File[],
  ): Promise<void> => {
    const uploadPromises = filesToUpload.map((file, index) => (
      new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setFileProgress((prev) => ({
              ...prev,
              [file.name]: { progress, isComplete: false },
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setFileProgress((prev) => ({
              ...prev,
              [file.name]: { progress: 100, isComplete: true },
            }));
            resolve();
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error('Upload failed'));
        };

        xhr.open('PUT', presignedUrls[index]);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      })
    ));

    await Promise.all(uploadPromises);
  };

  const handleSaveVideo = async (data: Partial<Video>, file: File | null = null) => {
    try {
      if (file) {
        setFileProgress({
          [file.name]: { progress: 0, isComplete: false }
        });
      }
      console.log(file)
      console.log(data)
      debugger;


      if (editingVideo) {
        await updateVideo({
          id: editingVideo._id,
          body: {
            title: data.title,
            description: data.description || undefined,
            storageKey: data.raw_storage_key || editingVideo.raw_storage_key,
            durationSeconds: data.duration_seconds || undefined,
            thumbnailUrl: data.thumbnail_url || undefined,
            videoOrder: data.video_order,
            isPublished: data.is_published,
          },
        }).unwrap();
        toast.success('Video updated successfully');
      } else {
        const res = await createVideo({
          courseId: courseId!,
          body: {
            title: data.title || '',
            description: data.description || undefined,
            storageKey: data.raw_storage_key || '',
            durationSeconds: data.duration_seconds || undefined,
            thumbnailUrl: undefined,
            videoOrder: totalLessons + 1,
            isPublished: data.is_published || false,
            originalFilename: file?.name,
            fileSize: file?.size,
            fileOriginalType: file?.type,

          },
        }).unwrap();

        if (file && res.url) {
          await uploadFilesByUrls([res.url], [file]);
          await updateVideo({
            id: res.data._id,
            body: { status: 'UPLOADED' },
          }).unwrap();
        }
        toast.success('Video created successfully');
      }

      setEditingVideo(null);
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Video could not be saved');
    }
  };

  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              aria-label="Back to courses"
            >
              <ArrowLeft className="size-5" aria-hidden="true" />
            </Button>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Course details</p>
              <p className="text-xs text-muted-foreground">Assigned learning</p>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Alert className="max-w-2xl">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertTitle>Course could not be loaded</AlertTitle>
            <AlertDescription>
              The course, lessons, or progress data could not be reached. Try
              again to reload this course.
            </AlertDescription>
          </Alert>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={handleRetry}>
              <RefreshCcw className="size-4" aria-hidden="true" />
              Retry
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to courses
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            aria-label="Back to courses"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted-foreground">
              Course details
            </p>
            <h1 className="truncate text-sm font-semibold text-foreground">
              {course.title}
            </h1>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCreateVideo}
          >
            <Plus className="size-4" aria-hidden="true" />
            Add video
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={course.status === 'published' ? 'secondary' : 'outline'}>
                  {course.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-foreground">
                {course.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {course.description || 'Course details will appear here when they are available.'}
              </p>
            </div>

            {nextVideo ? (
              <Button
                type="button"
                className="w-full sm:w-auto"
                onClick={() => navigate(`/courses/${course._id}/videos/${nextVideo._id}`)}
              >
                <PlayCircle className="size-4" aria-hidden="true" />
                {completedCount > 0 ? 'Resume course' : 'Start course'}
              </Button>
            ) : null}
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Course progress</span>
              <span className="font-medium text-foreground">
                {completedCount}/{totalLessons} completed
              </span>
            </div>
            <Progress value={progressPercentage} aria-label={`${progressPercentage}% complete`} />
          </div>

          {uploadProgressItems.length > 0 ? (
            <div className="mt-5 rounded-lg border border-border bg-secondary p-3">
              {uploadProgressItems.map(([fileName, item]) => (
                <div
                  key={fileName}
                  className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="truncate font-medium text-foreground">
                    {fileName}
                  </span>
                  <span className="text-muted-foreground">
                    {item.isComplete ? 'Upload complete' : `${item.progress}% uploaded`}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section aria-labelledby="course-videos-heading" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="course-videos-heading"
                className="text-xl font-semibold text-foreground"
              >
                Lessons
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Watch in order, or edit lesson details when course content changes.
              </p>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Upload className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                No videos yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add the first video to make this course useful for learners.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={openCreateVideo}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add video
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {videos.map((video) => {
                const videoProgress = progressByVideoId.get(video._id);
                const watchedPercent = getWatchedPercent(video, videoProgress);
                const isCompleted = Boolean(videoProgress?.completed);
                const status = getVideoStatus(video);

                return (
                  <article
                    key={video._id}
                    className="rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-ring/60"
                  >
                    <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:p-4">
                      <button
                        type="button"
                        className="flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        onClick={() => navigate(`/courses/${course._id}/videos/${video._id}`)}
                        aria-label={`${isCompleted ? 'Review' : 'Watch'} ${video.title}`}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary text-sm font-medium text-secondary-foreground">
                          {isCompleted ? (
                            <CheckCircle2 className="size-5" aria-hidden="true" />
                          ) : (
                            video.video_order
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold text-foreground">
                              {video.title}
                            </span>
                            <Badge variant={status.variant}>
                              {status.label}
                            </Badge>
                            {isCompleted ? (
                              <Badge variant="secondary">Completed</Badge>
                            ) : null}
                          </span>
                          {video.description ? (
                            <span className="mt-1 block truncate text-sm text-muted-foreground">
                              {video.description}
                            </span>
                          ) : null}
                          <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="size-3" aria-hidden="true" />
                              {formatDuration(video.duration_seconds)}
                            </span>
                            <span>{status.description}</span>
                            {watchedPercent > 0 && !isCompleted ? (
                              <span>{watchedPercent}% watched</span>
                            ) : null}
                          </span>
                        </span>
                      </button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="self-start text-muted-foreground hover:text-foreground sm:self-center"
                        onClick={() => {
                          setEditingVideo(video);
                          setDialogOpen(true);
                        }}
                        aria-label={`Edit ${video.title}`}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                        Edit
                      </Button>
                    </div>

                    {watchedPercent > 0 && !isCompleted ? (
                      <div className="px-4 pb-4">
                        <Progress
                          value={watchedPercent}
                          aria-label={`${watchedPercent}% watched`}
                          className="h-1"
                        />
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <VideoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        video={editingVideo}
        onSave={handleSaveVideo}
      />
    </div>
  );
};

export default CourseDetailPage;
