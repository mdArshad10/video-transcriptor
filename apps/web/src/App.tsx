import { BrowserRouter, Routes, Route } from "react-router"
import CoursesPage from "./pages/CoursesPage"
import VideoPlayerPage from "./pages/VideoPlayerPage"
import NotFound from "./pages/NotFound"
import { Toaster } from "@workspace/ui/components/sonner"
import { Toaster as Sonner } from "@workspace/ui/components/sonner";
import CourseDetailPage from "./pages/CourseDetailPage"

export function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/videos/:videoId" element={<VideoPlayerPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </>
  )
}
