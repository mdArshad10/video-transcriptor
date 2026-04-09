import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LmsService } from './lms.service';
import { CreateLmDto } from './dto/create-lm.dto';
import { UpdateLmDto } from './dto/update-lm.dto';

@Controller('lms')
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  @Post()
  create(@Body() createLmDto: CreateLmDto) {
    return this.lmsService.create(createLmDto);
  }

  @Get()
  findAll() {
    return this.lmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lmsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLmDto: UpdateLmDto) {
    return this.lmsService.update(+id, updateLmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lmsService.remove(+id);
  }
}
