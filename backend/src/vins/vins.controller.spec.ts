import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { VinsController } from './vins.controller';
import { VinsService } from './vins.service';
import { Vin } from './entities/vin.entity';

describe('VinsController', () => {
  let controller: VinsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VinsController],
      providers: [
        VinsService,
        {
          provide: getRepositoryToken(Vin),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<VinsController>(VinsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
