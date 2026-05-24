import { Test, TestingModule } from '@nestjs/testing';
import { CompetenciasController } from './competencias.controller';
import { CompetenciasService } from './competencias.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Competencia } from './entities/competencia.entity';

describe('CompetenciasController', () => {
  let controller: CompetenciasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetenciasController],
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

    controller = module.get<CompetenciasController>(CompetenciasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
