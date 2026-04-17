import { BrowserRouter, Routes, Route } from "react-router"
import CoursesPage from "./pages/CoursesPage"
import VideoPlayerPage from "./pages/VideoPlayerPage"
import NotFound from "./pages/NotFound"
import { Toaster } from "@workspace/ui/components/sonner"
import { Toaster as Sonner } from "@workspace/ui/components/sonner";
import CourseDetailPage from "./pages/CourseDetailPage"
import JwtLandingPage from "./pages/auth/JwtLandingPage";
import AuthErrorPage from "./pages/auth/AuthErrorPage";
import RequireSession from "./components/auth/RequireSession";
import { ROUTES } from "./utils/url"

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.JWT_LANDING_PAGE} element={<JwtLandingPage />} />
          <Route element={<RequireSession />}>
            <Route path={ROUTES.COURSE.ROUTE} element={<CoursesPage />} />
            <Route
              path={ROUTES.COURSE.COURSE_DETAILS}
              element={<CourseDetailPage />}
            />
            <Route path={ROUTES.COURSE.COURSE_VIDEO_DETAILS} element={<VideoPlayerPage />} />
          </Route>
          <Route path={ROUTES.ERROR.AUTH_ERROR} element={<AuthErrorPage />} />
          <Route path={ROUTES.ERROR.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </>
  )
}
