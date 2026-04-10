import { baseApi } from './baseApi';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface CreateVideoRequest {
    title: string;
    storageKey: string;
    videoOrder: number;
    description?: string;
    durationSeconds?: number;
    thumbnailUrl?: string;
    isPublished?: boolean;
}

export type UpdateVideoRequest = Partial<CreateVideoRequest> & { status?: 'UPLOADING' | 'UPLOADED' | 'FAILED' };

// ─── API slice ────────────────────────────────────────────────────────────────

export const videoApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        /** POST /courses/:courseId/videos — add a video to a course */
        createVideo: builder.mutation<{ message: string; data: Video; url: string }, { courseId: string; body: CreateVideoRequest }>({
            query: ({ courseId, body }) => ({
                url: `courses/${courseId}/videos`,
                method: 'POST',
                data: body,
            }),
            invalidatesTags: (_result, _error, { courseId }) => [
                { type: 'Video', id: `COURSE_${courseId}` },
            ],
        }),

        /** GET /courses/:courseId/videos — list all videos for a course ordered by video_order */
        getCourseVideos: builder.query<{ data: Video[]; total: number }, string>({
            query: (courseId) => ({
                url: `courses/${courseId}/videos`,
                method: 'GET',
            }),
            providesTags: (result, _error, courseId) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Video' as const, id: _id })),
                        { type: 'Video', id: `COURSE_${courseId}` },
                    ]
                    : [{ type: 'Video', id: `COURSE_${courseId}` }],
        }),

        /** PATCH /videos/:id — partially update a video */
        updateVideo: builder.mutation<{ message: string; data: Video }, { id: string; body: UpdateVideoRequest }>({
            query: ({ id, body }) => ({
                url: `videos/${id}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (result, _error, { id }) => [
                { type: 'Video', id },
                // Invalidate the course list so video_order changes are reflected
                ...(result ? [{ type: 'Video' as const, id: `COURSE_${result.data.course_id}` }] : []),
            ],
        }),

        /** DELETE /videos/:id — soft-delete a video (204 No Content) */
        deleteVideo: builder.mutation<void, { id: string; courseId: string }>({
            query: ({ id }) => ({
                url: `videos/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { id, courseId }) => [
                { type: 'Video', id },
                { type: 'Video', id: `COURSE_${courseId}` },
            ],
        }),
    }),
    overrideExisting: false,
});

// Auto-generated hooks
export const {
    useCreateVideoMutation,
    useGetCourseVideosQuery,
    useUpdateVideoMutation,
    useDeleteVideoMutation,
} = videoApi;
