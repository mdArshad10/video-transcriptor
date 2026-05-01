import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, RefreshCcw } from 'lucide-react';

import { Button } from '@workspace/ui/components/button';
import { Skeleton } from '@workspace/ui/components/skeleton';
import {
  CourseCard,
  type CourseProgressState,
} from '@/components/CourseCard';
import { CourseFormPanel } from '@/components/CourseFormPanel';
import { useGetMyCoursesQuery, type Course } from '@/store/api/courseApi';
import {
  useGetMyProgressQuery,
  type VideoProgress,
} from '@/store/api/progressApi';

type ProgressTab = 'all' | CourseProgressState;

interface CourseLearningSummary {
  course: Course;
  completedLessons: number;
  progressPercentage: number;
  state: CourseProgressState;
  totalTrackedLessons: number;
  lastActivityAt: string | null;
}

const progressTabs: { label: string; value: ProgressTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Not Started', value: 'not-started' },
  { label: 'Completed', value: 'completed' },
];

function getCourseState(progressItems: VideoProgress[]): CourseProgressState {
  if (progressItems.length === 0) {
    return 'not-started';
  }

  if (progressItems.every((item) => item.completed)) {
    return 'completed';
  }

  return 'in-progress';
}

function getLastActivity(progressItems: VideoProgress[]) {
  return progressItems.reduce<string | null>((latest, item) => {
    if (!latest) return item.updated_at;

    return new Date(item.updated_at).getTime() > new Date(latest).getTime()
      ? item.updated_at
      : latest;
  }, null);
}

function formatRelativeActivity(value: string | null) {
  if (!value) return undefined;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));

  if (diffDays === 0) return 'Active today';
  if (diffDays === 1) return 'Active yesterday';
  if (diffDays < 7) return `Active ${diffDays} days ago`;

  return `Active ${new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date)}`;
}

function buildCourseSummaries(
  courses: Course[],
  progressItems: VideoProgress[],
): CourseLearningSummary[] {
  return courses.map((course) => {
    const courseProgress = progressItems.filter(
      (item) => item.course_id === course._id,
    );
    const completedLessons = courseProgress.filter((item) => item.completed).length;
    const totalTrackedLessons = courseProgress.length;
    const progressPercentage =
      totalTrackedLessons > 0
        ? Math.round((completedLessons / totalTrackedLessons) * 100)
        : 0;

    return {
      course,
      completedLessons,
      progressPercentage,
      state: getCourseState(courseProgress),
      totalTrackedLessons,
      lastActivityAt: getLastActivity(courseProgress),
    };
  });
}

function CourseListSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-4 h-7 w-2/3" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-6 h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="mt-4 h-5 w-4/5" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-5 h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const CoursesPage = () => {
  const [activeTab, setActiveTab] = useState<ProgressTab>('all');
  const [formOpen, setFormOpen] = useState(false);
  const {
    data: coursesResponse,
    isLoading: isCoursesLoading,
    isFetching: isCoursesFetching,
    isError: isCoursesError,
    refetch: refetchCourses,
  } = useGetMyCoursesQuery();
  const {
    data: progressResponse,
    isLoading: isProgressLoading,
    isError: isProgressError,
    refetch: refetchProgress,
  } = useGetMyProgressQuery();

  const summaries = useMemo(
    () =>
      buildCourseSummaries(
        coursesResponse?.data ?? [],
        progressResponse?.data ?? [],
      ),
    [coursesResponse?.data, progressResponse?.data],
  );

  const filteredSummaries =
    activeTab === 'all'
      ? summaries
      : summaries.filter((item) => item.state === activeTab);

  const resumeCourse =
    summaries
      .filter((item) => item.state === 'in-progress')
      .sort((a, b) => {
        const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
        const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;

        return bTime - aTime;
      })[0] ?? null;

  const firstAvailableCourse = summaries[0] ?? null;
  const featuredCourse = resumeCourse ?? firstAvailableCourse;
  const isLoading = isCoursesLoading || isProgressLoading;
  const isError = isCoursesError || isProgressError;
  const completedCount = summaries.filter((item) => item.state === 'completed').length;
  const inProgressCount = summaries.filter(
    (item) => item.state === 'in-progress',
  ).length;

  const handleRetry = () => {
    void refetchCourses();
    void refetchProgress();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                CourseHub
              </p>
              <p className="truncate text-xs text-muted-foreground">
                Assigned learning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              id="add-course-btn"
              type="button"
              size="sm"
              onClick={() => setFormOpen((prev) => !prev)}
              aria-expanded={formOpen}
              aria-controls="course-create-form"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add course
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              disabled={isCoursesFetching}
            >
              <RefreshCcw className="size-4" aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          <CourseFormPanel
            open={formOpen}
            onClose={() => setFormOpen(false)}
          />
          <section className="max-w-3xl">
            <p className="text-sm font-medium text-muted-foreground">
              Your learning
            </p>
            <h1 className="mt-2 text-3xl font-bold leading-tight text-foreground">
              Continue your assigned courses
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Pick up where you left off, review completed work, or start the
              next course in your list.
            </p>
          </section>

          {isLoading ? (
            <CourseListSkeleton />
          ) : isError ? (
            <section className="rounded-xl border border-border bg-card p-6">
              <div className="max-w-xl">
                <h2 className="text-lg font-semibold text-foreground">
                  Courses could not be loaded
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Your assigned courses are temporarily unavailable. Try again
                  to reload your learning list.
                </p>
                <Button type="button" className="mt-5" onClick={handleRetry}>
                  <RefreshCcw className="size-4" aria-hidden="true" />
                  Retry
                </Button>
              </div>
            </section>
          ) : summaries.length === 0 ? (
            <section className="rounded-xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <BookOpen className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No assigned courses yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                When a course is assigned to you, it will appear here with your
                progress and a clear next step.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-6"
                onClick={handleRetry}
              >
                <RefreshCcw className="size-4" aria-hidden="true" />
                Check again
              </Button>
            </section>
          ) : (
            <>
              {featuredCourse && (
                <section aria-labelledby="resume-heading">
                  <div className="mb-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {resumeCourse ? 'Resume learning' : 'Start learning'}
                      </p>
                      <h2
                        id="resume-heading"
                        className="mt-1 text-xl font-semibold text-foreground"
                      >
                        {resumeCourse
                          ? 'Your next course is ready'
                          : 'Start with your first assigned course'}
                      </h2>
                    </div>
                  </div>
                  <CourseCard
                    course={featuredCourse.course}
                    completedLessons={featuredCourse.completedLessons}
                    progressPercentage={featuredCourse.progressPercentage}
                    state={featuredCourse.state}
                    totalTrackedLessons={featuredCourse.totalTrackedLessons}
                    lastActivityLabel={formatRelativeActivity(
                      featuredCourse.lastActivityAt,
                    )}
                    variant="resume"
                  />
                </section>
              )}

              <section aria-labelledby="courses-heading" className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2
                      id="courses-heading"
                      className="text-xl font-semibold text-foreground"
                    >
                      Course library
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {summaries.length} assigned courses, {inProgressCount} in
                      progress, {completedCount} completed.
                    </p>
                  </div>

                  <div
                    className="flex flex-wrap gap-2"
                    role="tablist"
                    aria-label="Filter courses by progress"
                  >
                    {progressTabs.map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={activeTab === tab.value}
                        onClick={() => setActiveTab(tab.value)}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          activeTab === tab.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredSummaries.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <h3 className="text-base font-semibold text-foreground">
                      No courses in this view
                    </h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                      Try another progress tab to see the courses currently
                      assigned to you.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredSummaries.map((item, index) => (
                      <motion.div
                        key={item.course._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: index * 0.03 }}
                      >
                        <CourseCard
                          course={item.course}
                          completedLessons={item.completedLessons}
                          progressPercentage={item.progressPercentage}
                          state={item.state}
                          totalTrackedLessons={item.totalTrackedLessons}
                          lastActivityLabel={formatRelativeActivity(
                            item.lastActivityAt,
                          )}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default CoursesPage;
