import { Test, TestingModule } from '@nestjs/testing';
import { InscritosController } from './inscritos.controller';
import { InscritosService } from './inscritos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inscrito } from './entities/inscrito.entity';

describe('InscritosController', () => {
  let controller: InscritosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InscritosController],
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

    controller = module.get<InscritosController>(InscritosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
