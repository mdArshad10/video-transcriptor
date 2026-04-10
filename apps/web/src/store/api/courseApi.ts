import { baseApi } from './baseApi';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Request shapes ───────────────────────────────────────────────────────────

export interface CreateCourseRequest {
    title: string;
    description: string;
    status?: CourseStatus;
    thumbnailUrl?: string;
}

export interface UpdateCourseRequest {
    title?: string;
    description?: string;
    status?: CourseStatus;
    thumbnailUrl?: string;
}

export interface ListCoursesQuery {
    ownedByMe?: boolean;
    assignedToMe?: boolean;
    status?: CourseStatus;
    page?: number;
    limit?: number;
    sort?: string;
}

export type AssignmentTargetType = 'user' | 'group' | 'organisation';

export interface CreateAssignmentRequest {
    targetType: AssignmentTargetType;
    targetId: string;
}

// ─── Response shapes ──────────────────────────────────────────────────────────

export interface CourseAssignment {
    _id: string;
    course_id: string;
    target_type: AssignmentTargetType;
    target_id: string;
    assigned_by: string | null;
    created_at: string;
    updated_at: string;
}

// ─── API slice ────────────────────────────────────────────────────────────────

export const courseApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        /** POST /courses — create a new course */
        createCourse: builder.mutation<{ message: string; data: Course }, CreateCourseRequest>({
            query: (body) => ({
                url: 'courses',
                method: 'POST',
                data: body,
            }),
            invalidatesTags: ['Course'],
        }),

        /** GET /courses/my — list courses relevant to the current user */
        getMyCourses: builder.query<{ data: Course[]; meta: PaginationMeta }, ListCoursesQuery | void>({
            query: (params) => ({
                url: 'courses/my',
                method: 'GET',
                params: params ?? {},
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ _id }) => ({ type: 'Course' as const, id: _id })),
                        { type: 'Course', id: 'LIST' },
                    ]
                    : [{ type: 'Course', id: 'LIST' }],
        }),

        /** PATCH /courses/:id — partially update a course */
        updateCourse: builder.mutation<{ message: string; data: Course }, { id: string; body: UpdateCourseRequest }>({
            query: ({ id, body }) => ({
                url: `courses/${id}`,
                method: 'PATCH',
                data: body,
            }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' },
            ],
        }),

        // GET /courses/:id - get a particular course
        getCourseById: builder.query<{ data: Course }, string>({
            query: (id) => ({
                url: `courses/${id}`,
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Course', id }],
        }),

        /** POST /courses/:id/assign — assign a course to a user/group/organisation */
        assignCourse: builder.mutation<{ message: string; data: CourseAssignment }, { id: string; body: CreateAssignmentRequest }>({
            query: ({ id, body }) => ({
                url: `courses/${id}/assign`,
                method: 'POST',
                data: body,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Course', id }],
        }),

        /** DELETE /courses/:id — soft-delete a course */
        deleteCourse: builder.mutation<{ message: string; id: string }, string>({
            query: (id) => ({
                url: `courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' },
            ],
        }),
    }),
    overrideExisting: false,
});

// Auto-generated hooks
export const {
    useCreateCourseMutation,
    useGetMyCoursesQuery,
    useUpdateCourseMutation,
    useAssignCourseMutation,
    useDeleteCourseMutation,
    useGetCourseByIdQuery,
} = courseApi;
