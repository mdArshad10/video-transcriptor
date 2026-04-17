import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { QueryFilter, Model, SortOrder } from 'mongoose';
import {
  Course,
  CourseAssignment,
  CourseAssignmentDocument,
  CourseDocument,
} from '@app/database';
import {
  CreateAssignmentDto,
  CreateCourseDto,
  ListCoursesQueryDto,
  UpdateCourseDto,
} from './dto';
import { AuthUser } from '../../auth/interfaces/auth-user.interface';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,

    @InjectModel(CourseAssignment.name)
    private readonly assignmentModel: Model<CourseAssignmentDocument>,
  ) { }

  // ─── Create ──────────────────────────────────────────────────────────────────

  /** Create a new course */
  async createCourse(dto: CreateCourseDto, user: AuthUser) {
    this.logger.log(`Creating course: "${dto.title}"`);

    const course = await this.courseModel.create({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      thumbnail_url: dto.thumbnailUrl ?? null,
      owner_id: user.vendorId || user.sub,
      created_by: null,
      updated_by: null,
    });

    return { message: 'course created', data: course };
  }

  // ─── Read ─────────────────────────────────────────────────────────────────────

  /**
   * Return courses relevant to the requesting user.
   * Applies ownedByMe / assignedToMe / status / pagination + sort filters.
   *
   * TODO: replace hardcoded userId with real user from JWT when auth is wired.
   */
  async getMyCourses(query: ListCoursesQueryDto, user: AuthUser) {
    const {
      ownedByMe,
      assignedToMe,
      status,
      page = 1,
      limit = 20,
      sort = '-created_at',
    } = query;

    const filter: QueryFilter<CourseDocument> = {};

    if (status) {
      filter.status = status;
    }

    if (ownedByMe) {
      filter.owner_id = user.vendorId || user.sub;
    }

    if (assignedToMe) {
      // Find all course IDs assigned to the current user
      const assignments = await this.assignmentModel
        .find({ target_type: 'user', target_id: user.sub })
        .select('course_id')
        .lean();

      const assignedIds = assignments.map((a) => a.course_id);
      filter._id = { $in: assignedIds };
    }

    // Parse sort string: prefix `-` means descending (e.g. `-created_at` → { created_at: -1 })
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortOrder: SortOrder = sort.startsWith('-') ? -1 : 1;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.courseModel
        .find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.courseModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Read a single course by ID */
  async getCourseById(id: string) {
    this.logger.log(`Fetching course ${id}`);

    const course = await this.courseModel.findById(id).lean();
    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }

    return { data: course };
  }

  // ─── Update ───────────────────────────────────────────────────────────────────

  /** Partially update an existing course (soft-delete guard is applied by schema pre-hook) */
  async updateCourse(id: string, dto: UpdateCourseDto) {
    this.logger.log(`Updating course ${id}`);

    const update: Partial<Course> = {};
    if (dto.title !== undefined) update.title = dto.title;
    if (dto.description !== undefined) update.description = dto.description;
    if (dto.status !== undefined) update.status = dto.status;
    if (dto.thumbnailUrl !== undefined)
      update.thumbnail_url = dto.thumbnailUrl ?? null;

    const course = await this.courseModel
      .findByIdAndUpdate(
        id,
        { $set: update },
        { new: true, runValidators: true },
      )
      .lean();

    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }

    return { message: 'course updated', data: course };
  }

  // ─── Assignment ───────────────────────────────────────────────────────────────

  /** Assign a course to a user / group / organisation */
  async assign(id: string, dto: CreateAssignmentDto, _user: AuthUser) {
    this.logger.log(`Assigning course ${id} → ${dto.targetType}:${dto.targetId}`);

    // Ensure the course exists and is not soft-deleted
    const course = await this.courseModel.findById(id).lean();
    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }

    try {
      const assignment = await this.assignmentModel.create({
        course_id: course._id,
        target_type: dto.targetType,
        target_id: dto.targetId,
        assigned_by: null,
      });

      return { message: 'course assigned', data: assignment };
    } catch (err: any) {
      // MongoDB duplicate key error code
      if (err?.code === 11000) {
        throw new ConflictException(
          `Course "${id}" is already assigned to ${dto.targetType} "${dto.targetId}"`,
        );
      }
      throw err;
    }
  }

  // ─── Delete ───────────────────────────────────────────────────────────────────

  /** Soft-delete a course by setting deleted_at to the current timestamp */
  async deleteCourse(id: string) {
    this.logger.log(`Soft-deleting course ${id}`);

    // findByIdAndUpdate bypasses the pre-find soft-delete hook intentionally
    const course = await this.courseModel
      .findByIdAndUpdate(
        id,
        { $set: { deleted_at: new Date() } },
        { new: true },
      )
      .lean();

    if (!course) {
      throw new NotFoundException(`Course with id "${id}" not found`);
    }

    return { message: 'course deleted', id };
  }
}
