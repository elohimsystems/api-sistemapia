import { Test, TestingModule } from '@nestjs/testing';
import { InscritosService } from './inscritos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inscrito } from './entities/inscrito.entity';

describe('InscritosService', () => {
  let service: InscritosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InscritosService,
        {
          provide: getRepositoryToken(Inscrito),
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

    service = module.get<InscritosService>(InscritosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
