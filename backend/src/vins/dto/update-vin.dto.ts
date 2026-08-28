import { PartialType } from '@nestjs/mapped-types';
import { CreateVinDto } from './create-vin.dto';

export class UpdateVinDto extends PartialType(CreateVinDto) {}
