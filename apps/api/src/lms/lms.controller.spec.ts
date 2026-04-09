import { Test, TestingModule } from '@nestjs/testing';
import { LmsController } from './lms.controller';
import { LmsService } from './lms.service';

describe('LmsController', () => {
  let controller: LmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LmsController],
      providers: [LmsService],
    }).compile();

    controller = module.get<LmsController>(LmsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
