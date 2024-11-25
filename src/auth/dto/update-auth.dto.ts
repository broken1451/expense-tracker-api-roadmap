import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {

    @IsOptional()
    @Type(() => Number)
    updated: number;
}
