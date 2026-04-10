import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { CourseCard } from '@/components/CourseCard';
import { CourseFormDialog } from '@/components/CourseFormDialog';
import { type Course, type CourseStatus } from "@/utils/mock-data";
import { useCreateCourseMutation, useGetMyCoursesQuery, useUpdateCourseMutation } from '@/store/api/courseApi';
import { toast } from 'sonner';

const CoursesPage = () => {
  // const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filterStatus, setFilterStatus] = useState<CourseStatus | 'all'>('all');
  const [createCourse] = useCreateCourseMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const { data } = useGetMyCoursesQuery();

  const filtered = filterStatus === 'all' ? data?.data : data?.data.filter(c => c.status === filterStatus);

  const handleSave = async (data: Partial<Course>) => {
    try {
      if (editingCourse) {
        // setCourses(prev => prev.map(c => c._id === editingCourse._id ? { ...c, ...data, updated_at: new Date().toISOString() } : c));
        await updateCourse({ id: editingCourse._id, body: data }).unwrap();
        toast.success('Course updated successfully');
      } else {
        const newCourse = {
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'draft',
          thumbnail_url: null,
          owner_id: 'user-001',
          created_by: 'user-001',
          updated_by: 'user-001',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await createCourse(newCourse).unwrap();
        toast.success('Course created successfully')
      }
      setEditingCourse(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast.error("Failed to save course");
      console.log(error);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const statusFilters: { label: string; value: CourseStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-display font-bold text-foreground">CourseHub</h1>
          </div>
          <Button
            onClick={() => { setEditingCourse(null); setDialogOpen(true); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-display font-bold text-foreground mb-2">Your Courses</h2>
          <p className="text-muted-foreground mb-6">Manage and track your video courses</p>

          <div className="flex gap-2 mb-8">
            {statusFilters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filterStatus === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((course, i) => (
              <motion.div
                key={course?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
              >
                <CourseCard course={course} onEdit={handleEdit} />
              </motion.div>
            ))}
          </div>

          {filtered?.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="font-display text-lg">No courses found</p>
            </div>
          )}
        </motion.div>
      </main>

      <CourseFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse}
        onSave={handleSave}
      />
    </div>
  );
};

export default CoursesPage;
