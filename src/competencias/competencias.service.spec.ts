import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciasService } from './competencias.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Competencia } from './entities/competencia.entity';

describe('CompetenciasService', () => {
  let service: CompetenciasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetenciasService,
        {
          provide: getRepositoryToken(Competencia),
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

    service = module.get<CompetenciasService>(CompetenciasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
