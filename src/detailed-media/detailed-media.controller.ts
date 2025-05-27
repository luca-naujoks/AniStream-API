import { Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import {
  ApiAmbiguousResponse,
  ApiResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { DetailedMediaService } from './detailed-media.service';
import { SqliteService } from 'src/sqlite/sqlite.service';
import { Media } from 'src/enities/media.entity';
import { IDetailedMedia, ISeason } from 'src/shared/OutputInterfaces';
import { ConfigGuard } from 'src/shared/configuration.guard';

@UseGuards(ConfigGuard)
@Controller('detailed-media')
export class DetailedMediaController {
  constructor(
    private readonly detailedMediaService: DetailedMediaService,
    private readonly sqliteService: SqliteService,
  ) {}

  @Get()
  @ApiQuery({
    name: 'external_identifier',
    type: String,
    example: 'gods-games-we-play',
    description: 'The Stream Name of the Media to get detailed information for',
  })
  @ApiOperation({
    summary: 'Request the Detailed Media Object of a specific Media',
  })
  @ApiResponse({
    description: 'The detailed media object was successfully returned',
  })
  @ApiAmbiguousResponse({
    description: 'The detailed media object was not found',
  })
  getDetailedMedia(@Query('external_identifier') external_identifier: string) {
    return this.detailedMediaService.getDetailedMedia(external_identifier);
  }

  @Get('season')
  @ApiOperation({
    summary:
      'Request the Season Details of a specific Media by its TMDB ID and Season Number',
  })
  @ApiResponse({
    description: 'The detailed media object was successfully returned',
  })
  async getSeasonForMedia(
    @Query('tmdb_id') tmdb_id: number,
    @Query('seasonNumber') seasonNumber: number,
  ): Promise<ISeason> {
    return this.detailedMediaService.getSeasonForMedia(tmdb_id, seasonNumber);
  }

  //TODO modify to return detailedMedia Objects
  @ApiOperation({
    summary: 'Search tmdb and get a list of type Media as return',
  })
  @Get('search')
  async getTmdbData(@Query('query') query: string): Promise<IDetailedMedia[]> {
    return this.detailedMediaService.searchTMDB(query);
  }

  @ApiOperation({
    summary:
      'Update tmdb_id, name, poster and backdrop my passing a new tmdb_id',
  })
  @ApiResponse({
    description: 'Returns the upadted Media object',
  })
  @Put('update-tmdb')
  async updateTmdbData(
    @Query('external_identifier') external_identifier: string,
    @Query('tmdb_id') tmdb_id: number,
  ) {
    const oldMedia: Media = await this.sqliteService.media.getOne({
      external_identifier: external_identifier,
    });
    if (!oldMedia) {
      console.error('Media not found:', external_identifier);
      return;
    }
    const tmdbData = await this.detailedMediaService.getTmdbData(tmdb_id);
    if (!tmdbData) {
      console.error('TMDB data not found for ID:', tmdb_id);
      return;
    }
    const updatedMedia: Media = {
      ...oldMedia,
      tmdb_id: tmdbData.id,
      name: tmdbData.name,
      poster: 'https://image.tmdb.org/t/p/original' + tmdbData.poster_path,
      backdrop: 'https://image.tmdb.org/t/p/original' + tmdbData.backdrop_path,
    };

    await this.sqliteService.audit.createLog([
      {
        type: 'info',
        user: 'system',
        message: `Updated ${updatedMedia.external_identifier}, new tmdb_id: ${updatedMedia.tmdb_id}`,
      },
    ]);

    await this.sqliteService.media.updateMedia(updatedMedia);

    return updatedMedia;
  }
}
