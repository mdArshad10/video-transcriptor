import { useParams, useNavigate } from 'react-router';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, CheckCircle2 } from 'lucide-react';

import { mockCourses, mockVideos, getProgressForVideo, getVideosForCourse, formatDuration } from "@/utils/mock-data";
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Slider } from '@workspace/ui/components/slider';

const VideoPlayerPage = () => {
  const { courseId, videoId } = useParams<{ courseId: string; videoId: string }>();
  const navigate = useNavigate();
  const video = mockVideos.find(v => v._id === videoId);
  const course = mockCourses.find(c => c._id === courseId);
  const courseVideos = getVideosForCourse(courseId || '');
  const progress = getProgressForVideo(videoId || '');

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(progress?.last_position_seconds || 0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [showControls, setShowControls] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const duration = video?.duration_seconds || 300;

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, duration]);

  if (!video || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-display">Video not found</p>
      </div>
    );
  }

  const currentIndex = courseVideos.findIndex(v => v._id === videoId);
  const prevVideo = currentIndex > 0 ? courseVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < courseVideos.length - 1 ? courseVideos[currentIndex + 1] : null;

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
          <div
            className="relative bg-card aspect-video w-full flex items-center justify-center cursor-pointer group"
            onClick={() => setIsPlaying(!isPlaying)}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => !isPlaying || setShowControls(true)}
          >
            {/* Mock video surface */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary to-card flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3 glow-primary">
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-primary" />
                  ) : (
                    <Play className="w-8 h-8 text-primary ml-1" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-display">
                  {isPlaying ? 'Playing' : 'Click to play'} — Mock HLS Stream
                </p>
                <p className="text-xs text-muted-foreground mt-1">storage_key: {video.storage_key}</p>
              </div>
            </div>

            {/* Controls overlay */}
            <motion.div
              initial={false}
              animate={{ opacity: showControls ? 1 : 0 }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 pt-12"
            >
              {/* Seek bar */}
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={([v]) => setCurrentTime(v)}
                className="mb-3"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" disabled={!prevVideo}
                    onClick={(e) => { e.stopPropagation(); if (prevVideo) navigate(`/courses/${courseId}/videos/${prevVideo._id}`); }}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground"
                    onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }}>
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" disabled={!nextVideo}
                    onClick={(e) => { e.stopPropagation(); if (nextVideo) navigate(`/courses/${courseId}/videos/${nextVideo._id}`); }}>
                    <SkipForward className="w-4 h-4" />
                  </Button>

                  <span className="text-xs text-muted-foreground ml-2 font-mono">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <div className="w-20 hidden sm:block" onClick={e => e.stopPropagation()}>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      step={1}
                      onValueChange={([v]) => { setVolume(v); setIsMuted(v === 0); }}
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground"
                    onClick={(e) => e.stopPropagation()}>
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Video info */}
          <div className="p-6">
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">{video.title}</h2>
            {video.description && <p className="text-secondary-foreground">{video.description}</p>}
          </div>
        </div>

        {/* Sidebar: course videos list */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/30">
          <div className="p-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground text-sm">Course Videos</h3>
          </div>
          <div className="overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-120px)]">
            {courseVideos.map(v => {
              const vProg = getProgressForVideo(v._id);
              const isActive = v._id === videoId;
              return (
                <button
                  key={v._id}
                  onClick={() => { navigate(`/courses/${courseId}/videos/${v._id}`); setCurrentTime(0); setIsPlaying(false); }}
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
