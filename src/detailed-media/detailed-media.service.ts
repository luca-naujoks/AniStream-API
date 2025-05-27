import { Injectable } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { Media } from 'src/enities/media.entity';

import {
  ISearchTvResponse,
  ISeasonDetails,
  ITvSeriesDetails,
} from 'src/shared/tmdbInterfaces';
import { IDetailedMedia, ISeason } from 'src/shared/OutputInterfaces';
import { SqliteService } from 'src/sqlite/sqlite.service';
import { ConfigService } from '@nestjs/config';

//TODO remove these both interfaces and use the general tmdb interface
interface ItmdbData {
  tags: { id: number; name: string }[];
  vote_average: number;
  original_name: string;
  overview: string;
  original_language: string;
  first_air_date: string;
  status: string;
  episode_run_time: number;
  number_of_episodes: number;
  production_country: string;
  seasons: ItmdbSeasonObject[];
}

interface ItmdbSeasonObject {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}

@Injectable()
export class DetailedMediaService {
  constructor(
    private readonly sqliteService: SqliteService,
    private readonly configService: ConfigService,
  ) {}

  api_key = this.configService.get<string>('appConfig.TmdbApiKey');

  async getSeasonForMedia(
    tmdb_id: number,
    seasonNumber: number,
  ): Promise<ISeason> {
    const media: Media = await this.sqliteService.media.getByTmdbID({
      tmdb_id: tmdb_id,
    });
    const apiRequest = async (): Promise<ISeasonDetails> => {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${tmdb_id}/season/${seasonNumber}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.api_key,
          },
        },
      );
      return (await response.json()) as ISeasonDetails;
    };

    const isEpisodeLocalAvailable = async ({
      season,
      episode,
    }: {
      season: number;
      episode: number;
    }): Promise<boolean> => {
      return await this.sqliteService.localSeason.checkLocalEpisode({
        media_id: media.id,
        season_number: season,
        episode_number: episode,
      });
    };

    const tmdbSeasonData: ISeasonDetails = await apiRequest();
    const season: ISeason = {
      episodes: await Promise.all(
        tmdbSeasonData.episodes.map(async (episode) => {
          return {
            name: episode.name,
            air_date: episode.air_date,
            episode_number: episode.episode_number,
            episode_type: episode.episode_type,
            local_available: await isEpisodeLocalAvailable({
              season: episode.season_number,
              episode: episode.episode_number,
            }),
          };
        }),
      ),
    };

    return season;
  }

  async getDetailedMedia(external_identifier: string): Promise<IDetailedMedia> {
    let tmdbData: ItmdbData;

    const localData: Media = await this.sqliteService.media.getOne({
      external_identifier: external_identifier,
    });

    if (!localData) {
      throw new HttpErrorByCode[404]('Media not found');
    }

    if (localData.tmdb_id === 0) {
      const localDataObject: ItmdbData = {
        vote_average: 0,
        tags: [],
        original_name: 'N/A',
        overview: 'N/A',
        original_language: 'N/A',
        first_air_date: 'N/A',
        status: 'N/A',
        episode_run_time: 0,
        number_of_episodes: 0,
        production_country: 'N/A',
        seasons: [],
      };
      tmdbData = localDataObject;
    } else {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${localData.tmdb_id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + this.api_key,
          },
        },
      );
      const data = (await response.json()) as ITvSeriesDetails;

      if (!data) {
        throw new HttpErrorByCode[404]('TMDB data not found');
      }

      tmdbData = {
        tags: data.genres || [],
        vote_average: data.vote_average || 0,
        original_name: data.original_name || 'N/A',
        overview: data.overview || 'N/A',
        original_language: data.original_language || 'N/A',
        first_air_date: data.first_air_date || 'N/A',
        status: data.status || 'N/A',
        episode_run_time:
          data.episode_run_time.length > 0 ? data.episode_run_time[0] : 0,
        number_of_episodes: data.number_of_episodes || 0,
        production_country:
          data.production_countries.length > 0
            ? data.production_countries[0].name
            : 'N/A',
        seasons: data.seasons || [],
      };
    }

    return {
      id: localData.id,
      type: localData.type,
      tmdb_id: localData.tmdb_id,
      external_identifier: localData.external_identifier,
      name: localData.name,
      tags: tmdbData.tags,
      poster: localData.poster,
      backdrop: localData.backdrop,

      vote_average: tmdbData?.vote_average,
      original_name: tmdbData.original_name,
      overview: tmdbData.overview,
      original_language: tmdbData.original_language,
      first_air_date: tmdbData.first_air_date,
      status: tmdbData.status,
      episode_run_time: tmdbData.episode_run_time,
      number_of_episodes: tmdbData.number_of_episodes,
      production_country: tmdbData.production_country,
      seasons: tmdbData.seasons,
    };
  }

  async searchTMDB(query: string): Promise<IDetailedMedia[]> {
    const tvResponse = await fetch(
      `https://api.themoviedb.org/3/search/tv?query=${query}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.api_key,
        },
      },
    );

    const tvData = (await tvResponse.json()) as ISearchTvResponse;

    const tvDataToDetailedMedia: IDetailedMedia[] = tvData.results.map(
      (result) => {
        return {
          id: 0,
          type: 'unknown',
          tmdb_id: result.id,
          external_identifier: 'unknown',
          name: result.name,
          tags: [] as { id: number; name: string }[],
          poster: 'https://image.tmdb.org/t/p/original' + result.poster_path,
          backdrop:
            'https://image.tmdb.org/t/p/original' + result.backdrop_path,

          vote_average: result.vote_average,
          original_name: result.original_name,
          overview: result.overview,
          original_language: result.original_language,
          first_air_date: result.first_air_date,
          status: 'unknown',
          episode_run_time: 0,
          number_of_episodes: 0,
          production_country: 'unknown',

          seasons: [] as { name: string; season_number: number }[],
        };
      },
    );

    return tvDataToDetailedMedia;
  }

  async getTmdbData(tmdb_id: number): Promise<ITvSeriesDetails> {
    const response = await fetch(`https://api.themoviedb.org/3/tv/${tmdb_id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + this.api_key,
      },
    });

    const data = (await response.json()) as ITvSeriesDetails;
    if (!data) {
      await this.sqliteService.audit.createLog({
        type: 'warning',
        user: 'system',
        message:
          'Detailed Information Request - No data aviable for the requested tmdb_id',
      });
    }

    return data;
  }
}
