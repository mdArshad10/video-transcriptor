import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle2, Loader, Play } from 'lucide-react';

import { formatDuration } from "@/utils/mock-data";
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { useGetCourseByIdQuery } from '@/store/api/courseApi';
import { useGetMyProgressQuery } from '@/store/api/progressApi';
import { useGetCourseVideoByIdQuery, useGetCourseVideosQuery } from '@/store/api/videoApi';
import { MyPlayer } from '@/components/MyPlayer';

const VideoPlayerPage = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const navigate = useNavigate();
  const { data: courseResponse, isLoading: isCourseLoading } = useGetCourseByIdQuery(courseId || '', {
    skip: !courseId,
  });
  const { data: videoResponse, isLoading: isVideoLoading } = useGetCourseVideoByIdQuery(
    { courseId: courseId || '', videoId: videoId || '' },
    { skip: !courseId || !videoId },
  );
  const { data: videosResponse, isLoading: isVideosLoading } = useGetCourseVideosQuery(courseId || '', {
    skip: !courseId,
  });
  const { data: progressResponse, isLoading: isProgressLoading } = useGetMyProgressQuery(courseId || '', {
    skip: !courseId,
  });

  const course = courseResponse?.data;
  const video = videoResponse?.data;
  const courseVideos = videosResponse?.data ?? [];
  const progress = progressResponse?.data.find((item) => item.video_id === videoId);
  const duration = video?.duration_seconds || 300;

  if (isCourseLoading || isVideoLoading || isVideosLoading || isProgressLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!video || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-display">Video not found</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/courses/${courseId}`)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{course.title}</p>
            <h1 className="text-sm font-display font-bold text-foreground truncate">{video.title}</h1>
          </div>
          {progress?.completed && (
            <Badge className="bg-success/20 text-success border-success/30">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
            </Badge>
          )}
        </div>
      </header>

      {/* Video Player Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1">
          <div className="bg-card aspect-video w-full overflow-hidden">
            {video.hls_Master_Url ? (
              <MyPlayer src={video.hls_Master_Url} thumbnail_url={video?.thumbnail_url ?? undefined} />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-secondary to-card flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 glow-primary">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <p className="text-sm text-muted-foreground font-display">
                    Video not processed yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    raw: {video.raw_storage_key}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video info */}
          <div className="p-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{video.title}</h2>
            {video.description && <p className="text-secondary-foreground">{video.description}</p>}
            <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDuration(duration)}</span>
              <span>{video.status}</span>
            </div>
            {video.hls_Master_Url && (
              <p className="mt-2 text-xs text-muted-foreground break-all">
                hls: {video.hls_Master_Url}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar: course videos list */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/30">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground text-sm">Course Videos</h3>
          </div>
          <div className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-120px)]">
            {courseVideos.map(v => {
              const vProg = progressResponse?.data.find((item) => item.video_id === v._id);
              const isActive = v._id === videoId;
              return (
                <button
                  key={v._id}
                  onClick={() => { navigate(`/courses/${courseId}/videos/${v._id}`); }}
                  className={`w-full text-left p-3 flex items-center gap-3 transition-colors border-b border-border ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-secondary/50'
                    }`}
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-secondary text-xs font-medium text-muted-foreground">
                    {vProg?.completed ? <CheckCircle2 className="w-4 h-4 text-success" /> : v.video_order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>{v.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDuration(v.duration_seconds)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
