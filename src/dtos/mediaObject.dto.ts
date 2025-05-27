import { Optional } from '@nestjs/common';
import { IsNotEmpty, IsInt, IsString, IsBoolean } from 'class-validator';

export class MediaObjectDTO {
  @IsNotEmpty({ message: 'Field type must be added' })
  @IsString()
  type: string;

  @IsNotEmpty({ message: 'Field tmdb_id must be added' })
  @IsInt()
  tmdb_id: number;

  @IsNotEmpty({ message: 'Field external_identifier must be added' })
  @IsString()
  external_identifier: string;

  @IsNotEmpty({ message: 'Field name must be added' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Field poster must be added' })
  @IsString()
  poster: string;

  @IsNotEmpty({ message: 'Field backdrop must be added' })
  @IsString()
  backdrop: string;

  @IsNotEmpty({ message: 'Field online_available must be added' })
  @IsBoolean()
  online_available: boolean;
}

export class UpdateMediaObjectDTO {
  @IsNotEmpty({ message: 'Field tmdb_id must be added' })
  @Optional()
  @IsInt()
  tmdb_id?: number;

  @IsNotEmpty({ message: 'Field online_available must be added' })
  @Optional()
  @IsBoolean()
  online_available?: boolean;
}
