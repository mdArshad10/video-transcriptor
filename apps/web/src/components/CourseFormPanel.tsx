import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import {
  useCreateCourseMutation,
  type CourseStatus,
} from '@/store/api/courseApi';

// ─── Schema ───────────────────────────────────────────────────────────────────

const TITLE_MAX = 100;
const DESC_MAX = 500;

const schema = yup.object({
  title: yup
    .string()
    .required('Title is required.')
    .min(3, 'Title must be at least 3 characters.')
    .max(TITLE_MAX, `Title must be ${TITLE_MAX} characters or fewer.`),
  description: yup
    .string()
    .max(DESC_MAX, `Description must be ${DESC_MAX} characters or fewer.`)
    .default(''),
  status: yup
    .mixed<CourseStatus>()
    .oneOf(['draft', 'published', 'archived'] as const)
    .required()
    .default('draft'),
});

type FormValues = yup.InferType<typeof schema>;

// ─── Status pill group ─────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: CourseStatus }[] = [
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
];

interface StatusGroupProps {
  value: CourseStatus;
  onChange: (v: CourseStatus) => void;
}

function StatusGroup({ value, onChange }: StatusGroupProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Course status"
      className="inline-flex rounded-full border border-border bg-secondary p-0.5"
    >
      {STATUS_OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1',
              selected
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface CourseFormPanelProps {
  open: boolean;
  onClose: () => void;
}

export function CourseFormPanel({ open, onClose }: CourseFormPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { title: '', description: '', status: 'draft' },
  });

  const titleValue = watch('title') ?? '';
  const descValue = watch('description') ?? '';

  // Reset when panel opens
  useEffect(() => {
    if (open) {
      reset({ title: '', description: '', status: 'draft' });
    }
  }, [open, reset]);

  // Auto-focus the title field when panel opens
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        panelRef.current?.querySelector<HTMLInputElement>('#course-title')?.focus();
      }, 180);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const onSubmit = async (values: FormValues) => {
    try {
      await createCourse({
        title: values.title,
        description: values.description ?? '',
        status: values.status,
      }).unwrap();

      toast.success('Course created.');
      onClose();
    } catch {
      toast.error('Course could not be created. Please try again.');
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.section
          ref={panelRef}
          aria-label="Create a new course"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-xl border border-border bg-secondary"
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <p className="text-sm font-semibold text-foreground">New course</p>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="Close form"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form
            id="course-create-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5 px-5 py-5"
          >
            {/* Title */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Label
                  htmlFor="course-title"
                  className="text-sm font-medium text-foreground"
                >
                  Title
                </Label>
                <span
                  aria-live="polite"
                  aria-label={`${titleValue.length} of ${TITLE_MAX} characters used`}
                  className={[
                    'text-xs tabular-nums',
                    titleValue.length > TITLE_MAX * 0.9
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {titleValue.length}/{TITLE_MAX}
                </span>
              </div>
              <Input
                id="course-title"
                type="text"
                autoComplete="off"
                placeholder="e.g. Introduction to React"
                aria-describedby={errors.title ? 'course-title-error' : undefined}
                aria-invalid={!!errors.title}
                className="bg-card"
                {...register('title')}
              />
              {errors.title && (
                <p
                  id="course-title-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between gap-2">
                <Label
                  htmlFor="course-description"
                  className="text-sm font-medium text-foreground"
                >
                  Description
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    optional
                  </span>
                </Label>
                <span
                  aria-live="polite"
                  aria-label={`${descValue.length} of ${DESC_MAX} characters used`}
                  className={[
                    'text-xs tabular-nums',
                    (descValue?.length ?? 0) > DESC_MAX * 0.9
                      ? 'text-destructive'
                      : 'text-muted-foreground',
                  ].join(' ')}
                >
                  {descValue?.length ?? 0}/{DESC_MAX}
                </span>
              </div>
              <Textarea
                id="course-description"
                rows={3}
                placeholder="What will learners get from this course?"
                aria-describedby={
                  errors.description ? 'course-description-error' : undefined
                }
                aria-invalid={!!errors.description}
                className="resize-none bg-card leading-relaxed"
                {...register('description')}
              />
              {errors.description && (
                <p
                  id="course-description-error"
                  role="alert"
                  className="text-xs text-destructive"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Status
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <StatusGroup
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                aria-disabled={isLoading}
              >
                {isLoading && (
                  <Loader2
                    className="mr-1.5 size-3.5 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {isLoading ? 'Creating…' : 'Create course'}
              </Button>
            </div>
          </form>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
