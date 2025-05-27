import { Body, Controller, Get, HttpException, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { IBackendConfig } from 'src/shared/OutputInterfaces';
import { ConfigDto } from 'src/shared/swagger.dto';
import { SetupService } from './setup.service';
import { ConfigService } from '@nestjs/config';
import { updateConfig } from 'src/app.config';

interface SetupReturn {
  fieldData: {
    TmdbApiKey: string;
    AnimeDir: string;
    SeriesDir: string;
    PageSize: number;
  };
  errors: {
    TmdbApiKey: boolean;
    AnimeDir: boolean;
    SeriesDir: boolean;
    PageSize: boolean;
  };
  messages: {
    TmdbApiKey: string;
    AnimeDir: string;
    SeriesDir: string;
    PageSize: string;
  };
}

@Controller('setup')
export class SetupController {
  constructor(
    private readonly setupService: SetupService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({ summary: 'Api Discovery request' })
  @Get('discovery')
  discovery() {
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Returns the current configuration of the Backend' })
  @Get()
  getConfig() {
    const config = this.configService.get<IBackendConfig>('appConfig');

    return config;
  }

  @ApiOperation({
    summary: 'Configures the Backend with the supplyed configuration object',
  })
  @ApiBody({
    type: ConfigDto,
    description: 'The configuration object for the backend',
  })
  @ApiResponse({
    status: 201,
    description: 'just returns a 201 as response with the send FormData',
    type: FormData,
    example: {
      TmdbApiKey: '1234567890',
      AnimeDir: '/anime',
      SeriesDir: '/series',
      PageSize: 100,
    },
  })
  @ApiBadRequestResponse({
    description: 'Returns FormData with the corresponding validation errors ',
    type: FormData,
    example: {
      fieldData: {
        TmdbApiKey: '1234567890',
        AnimeDir: '/animer',
        SeriesDir: '/series',
        PageSize: 100,
      },
      errors: {
        TmdbApiKey: true,
        AnimeDir: true,
        SeriesDir: false,
        PageSize: false,
      },
      messages: {
        TmdbApiKey: 'TmdbApiKey is invalid please provide a valid key',
        AnimeDir: 'Couldnt access directory please provide a valid one',
        SeriesDir: 'Successful validated',
        PageSize: 'Successful validated',
      },
    },
  })
  @Post()
  async configureBackend(@Body() config: IBackendConfig) {
    const TmdbApiKey = await this.setupService.validateTmdbAPIKey(
      config.TmdbApiKey,
    );
    const AnimeDir = this.setupService.validateAnimeDir(config.AnimeDir);
    const SeriesDir = this.setupService.validateSeriesDir(config.SeriesDir);
    const PageSize = this.setupService.validatePageSize(config.PageSize);

    const response: SetupReturn = {
      fieldData: {
        TmdbApiKey: TmdbApiKey.fieldData.TmdbApiKey,
        AnimeDir: AnimeDir.fieldData.AnimeDir,
        SeriesDir: SeriesDir.fieldData.SeriesDir,
        PageSize: PageSize.fieldData.PageSize,
      },
      errors: {
        TmdbApiKey: TmdbApiKey.errors.TmdbApiKey,
        AnimeDir: AnimeDir.errors.AnimeDir,
        SeriesDir: SeriesDir.errors.SeriesDir,
        PageSize: PageSize.errors.PageSize,
      },
      messages: {
        TmdbApiKey: TmdbApiKey.messages.TmdbApiKey,
        AnimeDir: AnimeDir.messages.AnimeDir,
        SeriesDir: SeriesDir.messages.SeriesDir,
        PageSize: PageSize.messages.PageSize,
      },
    };

    if (
      response.errors.TmdbApiKey ||
      response.errors.AnimeDir ||
      response.errors.SeriesDir ||
      response.errors.PageSize
    ) {
      throw new HttpException(response, 400);
    } else {
      updateConfig(config);
      return response;
    }
  }
}
