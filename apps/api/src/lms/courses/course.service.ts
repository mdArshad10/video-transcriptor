import { Injectable } from '@nestjs/common';
import { CreateCourseDto, CreateAssignmentDto, ListCoursesQueryDto, UpdateCourseDto } from './dto';

@Injectable()
export class CourseService {
  /** Create a new course */
  createCourse(dto: CreateCourseDto) {
    // TODO: persist to DB
    return { message: 'course created', data: dto };
  }

  /**
   * Return courses relevant to the requesting user.
   * Applies owned_by_me / assigned_to_me / status / pagination filters.
   */
  getMyCourses(query: ListCoursesQueryDto) {
    // TODO: query DB with filters
    return { message: 'my courses', data: [], meta: query };
  }

  /** Partially update an existing course */
  updateCourse(id: string, dto: UpdateCourseDto) {
    // TODO: findByIdAndUpdate with soft-delete guard
    return { message: 'course updated', id, data: dto };
  }

  /** Assign a course to a user / group / organisation */
  assign(id: string, dto: CreateAssignmentDto) {
    // TODO: persist assignment
    return { message: 'course assigned', courseId: id, target: dto };
  }

  /** Soft-delete a course by setting deleted_at */
  deleteCourse(id: string) {
    // TODO: set deleted_at = new Date()
    return { message: 'course deleted', id };
  }
}
