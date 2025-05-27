import { ApiProperty } from '@nestjs/swagger';
import { IBackendConfig } from './OutputInterfaces';

export class ConfigDto implements IBackendConfig {
  @ApiProperty({
    description: 'The API Key for the TMDB API',
    example: '1234567890',
  })
  TmdbApiKey: string;

  @ApiProperty({
    description: 'The path to the local Anime Directory',
    example: '/anime',
  })
  AnimeDir: string;

  @ApiProperty({
    description: 'The path to the local Series Directory',
    example: '/series',
  })
  SeriesDir: string;

  @ApiProperty({
    description: 'The Page Size used for paginated media',
    example: 100,
  })
  PageSize: number;
}

export class UploadProviderDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
