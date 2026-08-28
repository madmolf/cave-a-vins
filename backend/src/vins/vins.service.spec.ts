import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VinsService } from './vins.service';
import { Vin } from './entities/vin.entity';

describe('VinsService', () => {
  let service: VinsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VinsService,
        {
          provide: getRepositoryToken(Vin),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<VinsService>(VinsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
