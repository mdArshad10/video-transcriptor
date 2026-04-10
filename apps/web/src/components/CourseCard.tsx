import { useNavigate } from 'react-router';
import { Play, Clock, MoreVertical } from 'lucide-react';
import { type Course, getCourseProgress, getVideosForCourse, formatDuration } from '@/utils/mock-data';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
}

export const CourseCard = ({ course, onEdit }: CourseCardProps) => {
  const navigate = useNavigate();
  const progress = getCourseProgress(course._id);
  const videos = getVideosForCourse(course._id);
  const totalDuration = videos.reduce((sum, v) => sum + (v.duration_seconds || 0), 0);

  const statusColor =
    course.status === 'published' ? 'bg-success/20 text-success border-success/30' :
      course.status === 'draft' ? 'bg-primary/20 text-primary border-primary/30' :
        'bg-muted text-muted-foreground border-border';

  return (
    <div
      className="surface-elevated rounded-xl overflow-hidden cursor-pointer group hover:border-primary/30 transition-all hover:glow-primary"
      onClick={() => navigate(`/courses/${course._id}`)}
    >
      {/* Thumbnail placeholder */}
      <div className="aspect-video bg-gradient-to-br from-secondary to-card flex items-center justify-center relative">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
          <Play className="w-6 h-6 text-primary ml-0.5" />
        </div>
        <Badge className={`absolute top-3 left-3 ${statusColor}`}>
          {course.status}
        </Badge>
        <button
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-background/50 backdrop-blur-sm flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onEdit(course); }}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <h3 className="font-display font-semibold text-foreground mb-1 truncate">{course.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{course.description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" /> {videos.length} videos
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {formatDuration(totalDuration)}
          </span>
        </div>

        {progress.total > 0 && (
          <div className="space-y-1">
            <Progress value={progress.percentage} className="h-1.5 bg-secondary" />
            <p className="text-xs text-muted-foreground">{progress.percentage}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
};
