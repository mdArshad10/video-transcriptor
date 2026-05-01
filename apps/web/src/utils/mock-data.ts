export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  _id: string;
  title: string;
  description: string;
  status: CourseStatus;
  thumbnail_url: string | null;
  owner_id: string;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Video {
  _id: string;
  course_id: string;
  title: string;
  description: string | null;
  storage_key: string;
  duration_seconds: number | null;
  thumbnail_url: string | null;
  video_order: number;
  is_published: boolean;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface VideoProgress {
  id: string;
  video_id: string;
  course_id: string;
  user_id: string;
  last_position_seconds: number;
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
  created_at: string;
}

const MOCK_USER_ID = 'user-001';

export const mockCourses: Course[] = [
  {
    _id: 'course-1',
    title: 'Mastering React & TypeScript',
    description: 'A comprehensive course covering modern React patterns, TypeScript best practices, and building production-ready applications.',
    status: 'published',
    thumbnail_url: null,
    owner_id: MOCK_USER_ID,
    created_by: MOCK_USER_ID,
    updated_by: MOCK_USER_ID,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-03-20T14:30:00Z',
  },
  {
    _id: 'course-2',
    title: 'Advanced CSS & Animation',
    description: 'Deep dive into CSS Grid, Flexbox, custom properties, and creating stunning animations with pure CSS and Framer Motion.',
    status: 'published',
    thumbnail_url: null,
    owner_id: MOCK_USER_ID,
    created_by: MOCK_USER_ID,
    updated_by: MOCK_USER_ID,
    created_at: '2025-02-10T09:00:00Z',
    updated_at: '2025-04-01T11:00:00Z',
  },
  {
    _id: 'course-3',
    title: 'Backend with Supabase',
    description: 'Learn to build full-stack applications using Supabase for authentication, database, storage, and edge functions.',
    status: 'draft',
    thumbnail_url: null,
    owner_id: MOCK_USER_ID,
    created_by: MOCK_USER_ID,
    updated_by: MOCK_USER_ID,
    created_at: '2025-03-05T08:00:00Z',
    updated_at: '2025-03-05T08:00:00Z',
  },
  {
    _id: 'course-4',
    title: 'Design Systems with Tailwind',
    description: 'Build scalable, maintainable design systems using Tailwind CSS, shadcn/ui, and modern component architecture.',
    status: 'archived',
    thumbnail_url: null,
    owner_id: MOCK_USER_ID,
    created_by: MOCK_USER_ID,
    updated_by: MOCK_USER_ID,
    created_at: '2024-11-20T12:00:00Z',
    updated_at: '2025-01-10T16:00:00Z',
  },
];

export const mockVideos: Video[] = [
  { _id: 'vid-1', course_id: 'course-1', title: 'Introduction to React 18', description: 'Overview of the course and React 18 features.', storage_key: 'courses/course-1/intro.mp4', duration_seconds: 480, thumbnail_url: null, video_order: 1, is_published: true, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-01-15T10:00:00Z', updated_at: '2025-01-15T10:00:00Z', deleted_at: null },
  { _id: 'vid-2', course_id: 'course-1', title: 'TypeScript Fundamentals', description: 'Types, interfaces, generics, and utility types.', storage_key: 'courses/course-1/ts-fundamentals.mp4', duration_seconds: 1200, thumbnail_url: null, video_order: 2, is_published: true, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-01-16T10:00:00Z', updated_at: '2025-01-16T10:00:00Z', deleted_at: null },
  { _id: 'vid-3', course_id: 'course-1', title: 'Hooks Deep Dive', description: 'useState, useEffect, useCallback, useMemo, and custom hooks.', storage_key: 'courses/course-1/hooks.mp4', duration_seconds: 900, thumbnail_url: null, video_order: 3, is_published: true, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-01-17T10:00:00Z', updated_at: '2025-01-17T10:00:00Z', deleted_at: null },
  { _id: 'vid-4', course_id: 'course-1', title: 'State Management Patterns', description: 'Context, Zustand, and React Query for data fetching.', storage_key: 'courses/course-1/state.mp4', duration_seconds: 1500, thumbnail_url: null, video_order: 4, is_published: false, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-01-18T10:00:00Z', updated_at: '2025-01-18T10:00:00Z', deleted_at: null },
  { _id: 'vid-5', course_id: 'course-2', title: 'CSS Grid Masterclass', description: 'Complete guide to CSS Grid layout.', storage_key: 'courses/course-2/grid.mp4', duration_seconds: 1100, thumbnail_url: null, video_order: 1, is_published: true, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-02-10T10:00:00Z', updated_at: '2025-02-10T10:00:00Z', deleted_at: null },
  { _id: 'vid-6', course_id: 'course-2', title: 'Framer Motion Animations', description: 'Building fluid animations with Framer Motion.', storage_key: 'courses/course-2/framer.mp4', duration_seconds: 800, thumbnail_url: null, video_order: 2, is_published: true, created_by: MOCK_USER_ID, updated_by: MOCK_USER_ID, created_at: '2025-02-11T10:00:00Z', updated_at: '2025-02-11T10:00:00Z', deleted_at: null },
];

export const mockProgress: VideoProgress[] = [
  { id: 'prog-1', video_id: 'vid-1', course_id: 'course-1', user_id: MOCK_USER_ID, last_position_seconds: 480, completed: true, completed_at: '2025-02-01T14:00:00Z', updated_at: '2025-02-01T14:00:00Z', created_at: '2025-01-20T10:00:00Z' },
  { id: 'prog-2', video_id: 'vid-2', course_id: 'course-1', user_id: MOCK_USER_ID, last_position_seconds: 750, completed: false, completed_at: null, updated_at: '2025-02-05T11:00:00Z', created_at: '2025-02-03T09:00:00Z' },
  { id: 'prog-3', video_id: 'vid-5', course_id: 'course-2', user_id: MOCK_USER_ID, last_position_seconds: 1100, completed: true, completed_at: '2025-03-01T16:00:00Z', updated_at: '2025-03-01T16:00:00Z', created_at: '2025-02-20T10:00:00Z' },
];

export function getVideosForCourse(courseId: string): Video[] {
  return mockVideos.filter(v => v.course_id === courseId).sort((a, b) => a.video_order - b.video_order);
}

export function getProgressForVideo(videoId: string): VideoProgress | undefined {
  return mockProgress.find(p => p.video_id === videoId);
}

export function getCourseProgress(courseId: string): { completed: number; total: number; percentage: number } {
  const videos = getVideosForCourse(courseId);
  const completedVideos = videos.filter(v => {
    const progress = getProgressForVideo(v._id);
    return progress?.completed;
  });
  const total = videos.length;
  const completed = completedVideos.length;
  return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return '0:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  const mm = m.toString();
  const ss = s.toString().padStart(2, '0');

  return `${mm}:${ss}`;
}
