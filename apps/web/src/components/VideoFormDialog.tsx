import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { Button } from '@workspace/ui/components/button';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Upload, File } from 'lucide-react';
import { type Video } from '@/utils/mock-data';

interface VideoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: Video | null;
  onSave: (data: Partial<Video>, file: File | null) => void;
}

export const VideoFormDialog = ({ open, onOpenChange, video, onSave }: VideoFormDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || '');
      setIsPublished(video.is_published);
      setFileName(video.storage_key.split('/').pop() || '');
    } else {
      setTitle('');
      setDescription('');
      setIsPublished(false);
      setFileName('');
    }
  }, [video, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (fileObj) {
      setFileName(fileObj.name);
      if (!title) setTitle(fileObj.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      setFile(fileObj);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description: description || null,
      is_published: isPublished,
      storage_key: `courses/uploads/${fileName || 'video.mp4'}`,
    }, file);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display">{video ? 'Edit Video' : 'Upload Video'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File upload area */}
          <div className="space-y-2">
            <Label>Video File</Label>
            <div
              className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              {fileName ? (
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <File className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select a video file</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM supported</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-title">Title</Label>
            <Input id="video-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title" required className="bg-secondary border-border" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="video-desc">Description</Label>
            <Textarea id="video-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" rows={2} className="bg-secondary border-border" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="published">Published</Label>
            <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {video ? 'Update' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
