import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinsService } from './vins.service';
import { VinsController } from './vins.controller';
import { Vin } from './entities/vin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vin])],
  controllers: [VinsController],
  providers: [VinsService],
})
export class VinsModule {}
