import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { SqliteService } from './sqlite.service';
import { MediaObjectDTO } from 'src/dtos/mediaObject.dto';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Tag } from 'src/enities/tags.entity';
import { Trending } from 'src/enities/trending.entity';
import { LocalSeason } from 'src/enities/localSeasons.entity';
import { LogDto } from 'src/dtos/log.dto';

@Controller('sqlite')
export class SqliteController {
  constructor(private readonly sqliteService: SqliteService) {}

  // media related endpoints
  @Get('/aggregated')
  async getRandomMedia(
    @Query('type') type: string,
    @Query('count') count: number,
  ) {
    return await this.sqliteService.media.getRandomMedia({
      type: type,
      count: count,
    });
  }

  @ApiTags('SQLMedia')
  @Get()
  async getMedia(@Query('external_identifier') external_identifier: string) {
    return await this.sqliteService.media.getOne({
      external_identifier: external_identifier,
    });
  }

  @ApiTags('SQLMedia')
  @ApiQuery({
    name: 'type',
    type: String,
    required: false,
    description: 'The type of media to get',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'The search term to filter media',
  })
  @Get('all')
  async getAllMedia(
    @Query('type') type: string,
    @Query('search') search: string,
  ) {
    return await this.sqliteService.media.getMedia({
      type: type,
      page: 0,
      local: false,
      search: search,
    });
  }

  @ApiTags('SQLMedia')
  @ApiBody({
    type: MediaObjectDTO,
    examples: {
      example1: {
        value: {
          type: 'anime',
          tmdb_id: 76059,
          external_identifier: 'a-place-further-than-the-universe',
          name: 'A Place Further Than the Universe',
          poster:
            'https://image.tmdb.org/t/p/original/iERXyBf0K6DfAQ8oKEYrdjf1vIs.jpg',
          backdrop:
            'https://image.tmdb.org/t/p/original/bTIbUZVoKnlMt2IrZQv2ODPVs0N.jpg',
        },
      },
    },
  })
  @Post('media')
  async createMediaEntry(@Body() media: MediaObjectDTO[]) {
    return await this.sqliteService.media.createMedia(media);
  }

  // tag related endpoints
  @ApiTags('Tags')
  @Get('tags')
  async getTags(@Query('media_id') media_id: number) {
    return await this.sqliteService.tags.getTags({ media_id: media_id });
  }

  @ApiTags('Tags')
  @ApiBody({
    type: Tag,
    examples: {
      example1: {
        value: {
          media_id: 1,
          tag_id: 1,
        },
      },
    },
  })
  @Post('tags')
  async createTag(@Body() tag: Tag[]) {
    return await this.sqliteService.tags.createTag(tag);
  }

  // trending related endpoints
  @ApiTags('SQLTrending')
  @Get('trending')
  async getTrending(@Query('type') type: string) {
    return await this.sqliteService.trending.getTrending({ mediaType: type });
  }

  @ApiTags('SQLTrending')
  @ApiBody({
    type: Trending,
    examples: {
      example1: {
        value: [
          {
            media_id: 1,
            type: 'anime',
          },
        ],
      },
    },
  })
  @Post('trending')
  async createTrending(@Body() trending: Trending[]) {
    return await this.sqliteService.trending.createTrending(trending);
  }

  @ApiTags('SQLTrending')
  @ApiOperation({
    summary: 'Clears the Trending Table and leaves a clear empty table',
  })
  @Delete('trending')
  async clearTrendingMediaTable() {
    return await this.sqliteService.trending.clearTrendingMediaTable();
  }

  // localSeason related endpoints
  @ApiTags('LocalSeason')
  @Get('localSeasons')
  async getLocalSeasons(@Query('media_id') media_id: number) {
    return await this.sqliteService.localSeason.getLocalSeasons({
      media_id: media_id,
    });
  }

  @ApiTags('LocalSeason')
  @ApiBody({
    type: LocalSeason,
    examples: {
      example1: {
        value: [
          {
            media_id: 1,
            season: 1,
            episode: 1,
            attention: false,
          },
        ],
      },
    },
  })
  @Post('localSeasons')
  async createLocalSeason(@Body() seasonObject: LocalSeason[]) {
    return await this.sqliteService.localSeason.createLocalSeason(seasonObject);
  }

  // Audit and Logs
  @ApiTags('Logs')
  @ApiQuery({
    name: 'timestampFrom',
    type: Date,
    required: false,
    description: 'The starting timestamp for filtering logs',
  })
  @ApiQuery({
    name: 'timestampTill',
    type: Date,
    required: false,
    description: 'The ending timestamp for filtering logs',
  })
  @ApiQuery({
    name: 'type',
    type: String,
    required: false,
    description: 'The type of log to filter',
  })
  @ApiQuery({
    name: 'user',
    type: String,
    required: false,
    description: 'The user associated with the logs',
  })
  @Get('log')
  async getLogs(
    @Query('timestampFrom') timestampFrom: Date,
    @Query('timestampTill') timestampTill: Date,
    @Query('type') type: string,
    @Query('user') user: string,
  ) {
    return await this.sqliteService.audit.getLogs({
      timestampFrom: timestampFrom,
      timestampTill: timestampTill,
      type: type,
      user: user,
    });
  }

  @ApiTags('Logs')
  @Post('log')
  async createLogs(@Body() logs: LogDto[]) {
    return await this.sqliteService.audit.createLog(logs);
  }
}
