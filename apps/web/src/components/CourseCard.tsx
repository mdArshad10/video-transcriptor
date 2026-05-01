import { useNavigate } from 'react-router';
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Play } from 'lucide-react';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Progress } from '@workspace/ui/components/progress';
import { type Course } from '@/store/api/courseApi';

export type CourseProgressState = 'not-started' | 'in-progress' | 'completed';

interface CourseCardProps {
  course: Course;
  completedLessons?: number;
  progressPercentage?: number;
  state: CourseProgressState;
  totalTrackedLessons?: number;
  lastActivityLabel?: string;
  variant?: 'default' | 'resume';
}

const stateConfig: Record<
  CourseProgressState,
  { label: string; action: string; icon: typeof BookOpen }
> = {
  'not-started': {
    label: 'Not started',
    action: 'Start course',
    icon: BookOpen,
  },
  'in-progress': {
    label: 'In progress',
    action: 'Continue',
    icon: Play,
  },
  completed: {
    label: 'Completed',
    action: 'Review',
    icon: CheckCircle2,
  },
};

function formatUpdatedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export const CourseCard = ({
  course,
  completedLessons = 0,
  progressPercentage = 0,
  state,
  totalTrackedLessons = 0,
  lastActivityLabel,
  variant = 'default',
}: CourseCardProps) => {
  const navigate = useNavigate();
  const config = stateConfig[state];
  const StateIcon = config.icon;
  const updatedLabel = formatUpdatedDate(course.updated_at);
  const hasProgress = totalTrackedLessons > 0;
  const progressLabel = hasProgress
    ? `${completedLessons}/${totalTrackedLessons} tracked lessons`
    : 'No saved progress yet';

  return (
    <article
      className={`group flex h-full flex-col rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-ring/60 ${
        variant === 'resume' ? 'md:flex-row' : ''
      }`}
    >
      <button
        type="button"
        className={`flex min-h-36 items-center justify-center rounded-t-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
          variant === 'resume' ? 'md:w-56 md:rounded-l-xl md:rounded-tr-none' : ''
        }`}
        onClick={() => navigate(`/courses/${course._id}`)}
        aria-label={`${config.action}: ${course.title}`}
      >
        <span className="flex size-14 items-center justify-center rounded-full border border-border bg-background">
          <StateIcon className="size-6" aria-hidden="true" />
        </span>
      </button>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={state === 'completed' ? 'secondary' : 'outline'}>
            <StateIcon className="size-3" aria-hidden="true" />
            {config.label}
          </Badge>
          {lastActivityLabel ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" aria-hidden="true" />
              {lastActivityLabel}
            </span>
          ) : updatedLabel ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3" aria-hidden="true" />
              Updated {updatedLabel}
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {course.description || 'Course details will appear here when they are available.'}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{progressLabel}</span>
            <span className="font-medium text-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} aria-label={`${progressPercentage}% complete`} />
        </div>

        <Button
          type="button"
          variant={state === 'not-started' ? 'outline' : 'default'}
          className="mt-5 w-full justify-between"
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          {config.action}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
};
