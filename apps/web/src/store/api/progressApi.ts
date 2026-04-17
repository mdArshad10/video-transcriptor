import { API } from '@/utils/url';
import { baseApi } from './baseApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VideoProgress {
    _id: string;
    video_id: string;
    course_id: string;
    user_id: string;
    last_position_seconds: number;
    completed: boolean;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface UpdateProgressRequest {
    lastPositionSeconds?: number;
    completed?: boolean;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const progressApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        /** POST /videos/:videoId/progress — upsert user progress for a video */
        upsertProgress: builder.mutation<{ message: string; data: VideoProgress }, { videoId: string; body: UpdateProgressRequest }>({
            query: ({ videoId, body }) => ({
                // url: `videos/${videoId}/progress`,
                url:API.PROGRESS.UPSERT_PROGRESS.replace(':videoId',videoId),
                method: 'POST',
                data: body,
            }),
            invalidatesTags: (result) => [
                { type: 'Progress', id: 'LIST' },
                ...(result ? [{ type: 'Progress' as const, id: `COURSE_${result.data.course_id}` }] : []),
            ],
        }),

        /** GET /progress/my — list all video progress for current user (optionally filtered by course) */
        getMyProgress: builder.query<{ data: VideoProgress[]; total: number }, string | void>({
            query: (courseId) => ({
                url: API.PROGRESS.MY_PROCESS,
                method: 'GET',
                params: courseId ? { courseId } : {},
            }),
            providesTags: (result, _error, courseId) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Progress' as const, id: _id })),
                        { type: 'Progress', id: courseId ? `COURSE_${courseId}` : 'LIST' },
                    ]
                    : [{ type: 'Progress', id: courseId ? `COURSE_${courseId}` : 'LIST' }],
        }),
    }),
    overrideExisting: false,
});

// Auto-generated hooks
export const {
    useUpsertProgressMutation,
    useGetMyProgressQuery,
} = progressApi;