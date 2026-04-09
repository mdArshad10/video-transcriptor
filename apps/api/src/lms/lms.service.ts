import { Injectable } from '@nestjs/common';
import { CreateLmDto } from './dto/create-lm.dto';
import { UpdateLmDto } from './dto/update-lm.dto';

@Injectable()
export class LmsService {
  create(createLmDto: CreateLmDto) {
    return 'This action adds a new lm';
  }

  findAll() {
    return `This action returns all lms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lm`;
  }

  update(id: number, updateLmDto: UpdateLmDto) {
    return `This action updates a #${id} lm`;
  }

  remove(id: number) {
    return `This action removes a #${id} lm`;
  }
}
