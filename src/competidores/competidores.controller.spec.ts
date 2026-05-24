import { Test, TestingModule } from '@nestjs/testing';
import { CompetidoresController } from './competidores.controller';
import { CompetidoresService } from './competidores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Competidor } from './entities/competidore.entity';

describe('CompetidoresController', () => {
  let controller: CompetidoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetidoresController],
      providers: [
        CompetidoresService,
        {
          provide: getRepositoryToken(Competidor),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CompetidoresController>(CompetidoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
