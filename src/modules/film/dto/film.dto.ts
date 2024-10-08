import {
  IsString,
  IsNumber,
  IsArray,
  Min,
  Max,
  ArrayNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilmDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  director: string;

  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  @IsNumber()
  @Min(1900)
  release_year: number;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
      : value.split(',').map((genre) => genre.trim()),
  )
  genre: string[];

  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @IsNumber()
  @Min(0)
  price: number;

  @Transform(({ value }) => parseInt(value), { toClassOnly: true })
  @IsNumber()
  @Min(0)
  duration: number;
}
