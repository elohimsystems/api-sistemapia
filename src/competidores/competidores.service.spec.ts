import { Test, TestingModule } from '@nestjs/testing';
import { CompetidoresService } from './competidores.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Competidor } from './entities/competidore.entity';

describe('CompetidoresService', () => {
  let service: CompetidoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<CompetidoresService>(CompetidoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
