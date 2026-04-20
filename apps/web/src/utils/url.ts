
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const AWS_S3_DESTINATION_BUCKET = import.meta.env.VITE_AWS_DESTINATION_BUCKET;
export const VITE_ENVIRONMENT = import.meta.env.VITE_ENVIRONMENT ?? "dev";

export const API = {
  COURSE: {
    ROUTE: "courses",
    GET_MY_COURSE: "courses/my",
    ASSIGN_COURSE: "courses/:id/assign",
  },
  VIDEO: {
    ROUTE: "videos",
    GET_COURSE_VIDEOS: "courses/:courseId/videos",
  },
  PROGRESS: {
    MY_PROCESS: "progress/my",
    UPSERT_PROGRESS: "videos/:videoId/progress",
  },
  TOKEN: {
    VERIFY_TOKEN: "auth/verify-token",
    REFRESH_TOKEN: "auth/refresh",
  },
} as const

export const ROUTES = {
  JWT_LANDING_PAGE: "/jwt/:token",
  COURSE: {
    ROUTE: "/",
    COURSE_DETAILS: "/courses/:courseId",
    COURSE_VIDEO_DETAILS: "/courses/:courseId/videos/:videoId",
  },
  ERROR: {
    AUTH_ERROR: "/auth-error",
    NOT_FOUND: "*",
  },
} as const