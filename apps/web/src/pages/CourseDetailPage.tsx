import { useParams, useNavigate } from 'react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Play, Clock, CheckCircle2, Upload, Loader } from 'lucide-react';
import { VideoFormDialog } from '@/components/VideoFormDialog';
import { type Video, getProgressForVideo, formatDuration } from "@/utils/mock-data";
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Progress } from '@workspace/ui/components/progress';
import { useCreateVideoMutation, useGetCourseVideosQuery, useUpdateVideoMutation } from '@/store/api/videoApi';
import { toast } from 'sonner';
import { useGetCourseByIdQuery } from '@/store/api/courseApi';

export interface FileProgress {
    progress: number;
    isComplete: boolean;
}

const CourseDetailPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [_, setFileProgress] = useState<
        Record<string, FileProgress>
    >({});
    const [createVideo] = useCreateVideoMutation();
    const { data: videos } = useGetCourseVideosQuery(courseId || '');
    const { data: course, isLoading } = useGetCourseByIdQuery(courseId || '');
    const [updateVideo] = useUpdateVideoMutation();



    // const progress = getCourseProgress(course._id);

    const uploadFilesByUrls = async (
        presignedUrls: string[],
        filesToUpload: File[]
    ): Promise<void> => {
        // console.log("inside the uploadFiles By URLs");
        // console.log(filesToUpload);

        const uploadPromises = filesToUpload.map((file, index) => {
            // console.log("inside the filesToUpload");
            // console.log(file);

            return new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setFileProgress((prev) => ({
                            ...prev,
                            [file.name]: { progress, isComplete: false },
                        }));
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        setFileProgress((prev) => ({
                            ...prev,
                            [file.name]: { progress: 100, isComplete: true },
                        }));
                        // console.log("file is upload successfully");

                        resolve();
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                };

                xhr.onerror = () => {
                    reject(new Error("Upload failed"));
                };

                xhr.open("PUT", presignedUrls[index]);
                xhr.setRequestHeader("Content-Type", file.type);
                // console.log("before sending the file in xhr");
                // console.log(file);

                xhr.send(file);
            });
        });

        await Promise.all(uploadPromises);
    };

    const handleSaveVideo = async (data: Partial<Video>, file: File | null = null) => {
        if (editingVideo) {
            await updateVideo({
                id: editingVideo._id,
                body: {
                    title: data.title,
                    description: data.description || undefined,
                    storageKey: data.storage_key,
                    durationSeconds: data.duration_seconds || undefined,
                    thumbnailUrl: data.thumbnail_url || undefined,
                    videoOrder: data.video_order,
                    isPublished: data.is_published,
                }
            });
            toast.success('Video updated successfully');
        } else {
            const res = await createVideo({
                courseId: courseId!,
                body: {
                    title: data.title || '',
                    description: data.description || undefined,
                    storageKey: data.storage_key || '',
                    durationSeconds: data.duration_seconds || undefined,
                    thumbnailUrl: undefined,
                    videoOrder: Number(videos?.data?.length) + 1,
                    isPublished: data.is_published || false,
                }
            }).unwrap();
            console.log(res);
            if (file && res.url) {
                await uploadFilesByUrls([res.url], [file]);
                await updateVideo({
                    id: res.data._id,
                    body: { status: 'UPLOADED' }
                }).unwrap();
            }
            toast.success('Video created successfully');
        }
        setEditingVideo(null);
        setDialogOpen(false);
    };

    if (isLoading) {
        return <Loader className="animate-spin" />
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-display font-bold text-foreground truncate">{course?.data.title}</h1>
                    </div>
                    <Button
                        onClick={() => { setEditingVideo(null); setDialogOpen(true); }}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Video
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="surface-elevated rounded-xl p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <Badge className={
                                    course?.data.status === 'published' ? 'bg-success/20 text-success border-success/30' :
                                        course?.data.status === 'draft' ? 'bg-primary/20 text-primary border-primary/30' :
                                            'bg-muted text-muted-foreground border-border'
                                }>
                                    {course?.data.status}
                                </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{videos?.data.length} videos</span>
                        </div>
                        <p className="text-secondary-foreground mb-4">{course?.data.description}</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Course Progress</span>
                                <span className="text-foreground font-medium">10/10 completed</span>
                            </div>
                            <Progress value={50} className="h-2 bg-secondary" />
                        </div>
                    </div>
                </motion.div>

                <h3 className="text-xl font-display font-semibold text-foreground mb-4">Videos</h3>

                <div className="space-y-3">
                    {videos?.data.map((video, i) => {
                        const vProgress = getProgressForVideo(video._id);
                        const isCompleted = vProgress?.completed;
                        const watchedPercent = video.duration_seconds && vProgress
                            ? Math.round((vProgress.last_position_seconds / video.duration_seconds) * 100)
                            : 0;

                        return (
                            <motion.div
                                key={video._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="surface-elevated rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group"
                                onClick={() => navigate(`/courses/${course?.data._id}/videos/${video._id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                                        {isCompleted ? (
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                        ) : (
                                            <Play className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-muted-foreground font-medium">{video.video_order}.</span>
                                            <h4 className="font-display font-medium text-foreground truncate">{video.title}</h4>
                                            {!video.is_published && (
                                                <Badge variant="outline" className="text-xs border-primary/30 text-primary">Draft</Badge>
                                            )}
                                        </div>
                                        {video.description && (
                                            <p className="text-sm text-muted-foreground truncate">{video.description}</p>
                                        )}
                                        {watchedPercent > 0 && !isCompleted && (
                                            <Progress value={watchedPercent} className="h-1 mt-2 bg-secondary" />
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                                        <Clock className="w-4 h-4" />
                                        {formatDuration(video.duration_seconds)}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingVideo(video);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {videos?.data.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground surface-elevated rounded-xl">
                        <Upload className="w-12 h-12 mx-auto mb-4 opacity-40" />
                        <p className="font-display text-lg mb-2">No videos yet</p>
                        <p className="text-sm">Add your first video to get started</p>
                    </div>
                )}
            </main>

            <VideoFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                video={editingVideo}
                onSave={handleSaveVideo}
            />
        </div>
    );
};

export default CourseDetailPage;
