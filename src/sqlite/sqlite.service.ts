import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalSeasonDTO } from 'src/dtos/localSeason.dto';
import { MediaObjectDTO } from 'src/dtos/mediaObject.dto';
import { TagDto } from 'src/dtos/tag.dto';
import { TrendingDTO } from 'src/dtos/trending.dto';
import { LocalSeason } from 'src/enities/localSeasons.entity';
import { LogDto } from 'src/dtos/log.dto';
import { Log } from 'src/enities/log.entity';
import { Media } from 'src/enities/media.entity';
import { Tag } from 'src/enities/tags.entity';
import { Trending } from 'src/enities/trending.entity';
import { DeleteResult, Repository } from 'typeorm';
import { WatchlistItem } from 'src/enities/watchlist.entity';
import { WatchListDto } from 'src/dtos/watchlist.dto';
import { ConfigService } from '@nestjs/config';
import { Provider } from 'src/enities/provider.entity';

@Injectable()
export class SqliteService {
  constructor(
    @InjectRepository(Media) private mediaRepository: Repository<Media>,
    @InjectRepository(Tag) private tagsRepository: Repository<Tag>,
    @InjectRepository(LocalSeason)
    private localSeasonsRepository: Repository<LocalSeason>,
    @InjectRepository(Trending)
    private trendingRepository: Repository<Trending>,
    @InjectRepository(Log)
    private logRepository: Repository<Log>,
    @InjectRepository(WatchlistItem)
    private watchListRepository: Repository<WatchlistItem>,
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>,
    private readonly configService: ConfigService,
  ) {}

  // Media
  media = {
    getAllMedia: async ({
      type,
      online_available,
      selectedFields,
    }: {
      type?: string;
      online_available?: boolean;
      selectedFields?: (keyof Media)[];
    }): Promise<Media[]> => {
      return this.mediaRepository.find({
        where: { type: type, online_available: !online_available },
        select: selectedFields ? selectedFields : undefined,
      });
    },

    getMedia: async ({
      type,
      page,
      local,
      search,
      selectedFields,
    }: {
      type: string;
      page: number;
      local: boolean;
      search?: string;
      selectedFields?: (keyof Media)[];
    }): Promise<Media[]> => {
      if (local) {
        const mediaIds = (await this.localSeasonsRepository
          .createQueryBuilder('ls')
          .select('DISTINCT ls.media_id')
          .execute()) as Array<{ media_id: string }>;

        const media_ids = mediaIds.map((item) => item.media_id);

        return this.mediaRepository
          .createQueryBuilder('media')
          .where('media.type = :type', { type })
          .andWhere('media.id IN (:...media_ids)')
          .setParameters({ media_ids })
          .andWhere('media.name LIKE :name', {
            name: `%${search ? search : ''}%`,
          })
          .skip(
            page
              ? page *
                  (this.configService.get<number>('appConfig.PageSize') ?? 10)
              : 0,
          )
          .take(this.configService.get<number>('appConfig.PageSize'))
          .getMany();
      }
      return this.mediaRepository
        .createQueryBuilder('media')
        .where('media.type = :type', { type })
        .andWhere('media.name LIKE :name', {
          name: search ? `%${search}%` : '%',
        })
        .skip(
          page
            ? page *
                (this.configService.get<number>('appConfig.PageSize') ?? 10)
            : 0,
        )
        .take(this.configService.get<number>('appConfig.PageSize'))
        .addSelect(
          selectedFields ? selectedFields.map((field) => `media.${field}`) : [],
        )
        .getMany();
    },
    getOne: async ({
      external_identifier,
    }: {
      external_identifier: string;
    }): Promise<Media> => {
      const media = await this.mediaRepository.findOne({
        where: { external_identifier },
      });
      if (!media) {
        throw new NotFoundException(
          `Media with external_identifier ${external_identifier} not found`,
        );
      }
      return media;
    },

    getOneById: async ({ id }: { id: number }): Promise<Media> => {
      const media = await this.mediaRepository.findOne({
        where: { id },
      });
      if (!media) {
        throw new NotFoundException(`Media with id ${id} not found`);
      }
      return media;
    },
    getByTmdbID: async ({ tmdb_id }: { tmdb_id: number }): Promise<Media> => {
      const media = await this.mediaRepository.findOne({
        where: { tmdb_id: tmdb_id },
      });
      if (!media) {
        throw new NotFoundException(`Media with id ${tmdb_id} not found`);
      }
      return media;
    },
    updateMedia: async (media: MediaObjectDTO): Promise<Media> => {
      await this.media.getOne({
        external_identifier: media.external_identifier,
      });
      return await this.mediaRepository.save(media);
    },

    getRandomMedia: async ({
      type,
      count,
      local,
    }: {
      type: string;
      count: number;
      local?: boolean;
    }): Promise<Media[]> => {
      if (local) {
        const mediaIds = (await this.localSeasonsRepository
          .createQueryBuilder('ls')
          .select('DISTINCT ls.media_id')
          .execute()) as Array<{ media_id: string }>;

        const media_ids = mediaIds.map((item) => item.media_id);

        return await this.mediaRepository
          .createQueryBuilder('media')
          .where('media.type = :type', { type })
          .andWhere('media.id IN (:...media_ids)')
          .setParameters({ media_ids })
          .orderBy('RANDOM()')
          .limit(count)
          .getMany();
      }

      return await this.mediaRepository
        .createQueryBuilder('media')
        .where('media.type = :type', { type })
        .orderBy('RANDOM()')
        .limit(count)
        .getMany();
    },

    createMedia: async (media: MediaObjectDTO[]): Promise<Media[]> => {
      const newMedia = this.mediaRepository.create(media);
      return await this.mediaRepository.save(newMedia);
    },
  };

  // Tags

  tags = {
    getTags: async ({ media_id }: { media_id: number }): Promise<Tag[]> => {
      return this.tagsRepository.find({
        where: { media_id: media_id },
        select: ['tag_id'],
      });
    },

    createTag: async (tag: TagDto[]): Promise<Tag[]> => {
      const newTag = this.tagsRepository.create(tag);
      return await this.tagsRepository.save(newTag);
    },
  };

  // Trending

  trending = {
    getTrending: async ({
      mediaType,
    }: {
      mediaType: string;
    }): Promise<Trending[]> => {
      return await this.trendingRepository.find({
        where: { type: mediaType },
      });
    },

    createTrending: async (trending: TrendingDTO[]): Promise<Trending[]> => {
      const newTrending = this.trendingRepository.create(trending);
      return await this.trendingRepository.save(newTrending);
    },

    clearTrendingMediaTable: async () => {
      return await this.trendingRepository.clear();
    },
  };

  // Local Seasons

  localSeason = {
    getLocalSeasons: async ({
      media_id,
    }: {
      media_id: number;
    }): Promise<LocalSeason[]> => {
      return this.localSeasonsRepository.find({
        where: { media_id: media_id },
        select: ['season', 'episode', 'attention'],
      });
    },

    checkLocalEpisode: async ({
      media_id,
      season_number,
      episode_number,
    }: {
      media_id: number;
      season_number: number;
      episode_number: number;
    }): Promise<boolean> => {
      const isEpisodeLocalAvailable = await this.localSeasonsRepository.findOne(
        {
          where: {
            media_id: media_id,
            season: season_number,
            episode: episode_number,
          },
        },
      );

      return isEpisodeLocalAvailable ? true : false;
    },

    createLocalSeason: async (
      localSeason: LocalSeasonDTO[],
    ): Promise<LocalSeason[]> => {
      const newLocalSeason = this.localSeasonsRepository.create(localSeason);
      return await this.localSeasonsRepository.save(newLocalSeason);
    },
  };

  // Audit and Logs

  audit = {
    getLogs: async ({
      timestampFrom,
      timestampTill,
      type,
      user,
    }: {
      timestampFrom?: Date;
      timestampTill?: Date;
      type?: string;
      user?: string;
    }): Promise<Log[]> => {
      const queryBuilder = this.logRepository.createQueryBuilder('log');

      if (timestampFrom) {
        queryBuilder.andWhere('log.timestamp >= :timestampFrom', {
          timestampFrom: timestampFrom,
        });
      }
      if (timestampTill) {
        queryBuilder.andWhere('log.timestamp <= :timestampTill', {
          timestampTill: timestampTill,
        });
      }
      if (type) {
        queryBuilder.andWhere('log.type = :type', { type: type });
      }

      if (user) {
        queryBuilder.andWhere('log.user = :user', { user: user });
      }

      return queryBuilder.getMany();
    },

    createLog: async (logs: LogDto[] | LogDto): Promise<Log[]> => {
      if (!Array.isArray(logs)) {
        logs = [logs];
      }
      const newLogs = this.logRepository.create(
        logs.map((log) => ({ ...log, timestamp: new Date() })),
      );
      return await this.logRepository.save(newLogs);
    },
  };

  // WatchList

  watchList = {
    getWatchList: async ({ user }: { user: number }): Promise<number[]> => {
      const media_ids: { watchlist_media_id: number }[] =
        await this.watchListRepository
          .createQueryBuilder('watchlist')
          .where('watchlist.user = :user', { user: user })
          .select(['watchlist.media_id AS watchlist_media_id'])
          .getRawMany();

      return media_ids.map(
        (item: { watchlist_media_id: number }) => item.watchlist_media_id,
      );
    },

    createWatchListItem: async (
      watchListItem: WatchListDto,
    ): Promise<WatchlistItem> => {
      const newWatchListItem = this.watchListRepository.create(watchListItem);
      return await this.watchListRepository.save(newWatchListItem);
    },
    deleteWatchListItem: async (watchListItem: WatchListDto) => {
      await this.watchListRepository.delete({
        media_id: watchListItem.media_id,
        user: watchListItem.user,
      });
    },
  };

  // Telemetrics and analytics

  telemetrics = {
    countMedia: async ({ type }: { type: string }): Promise<number> => {
      return this.mediaRepository.count({ where: { type: type } });
    },
  };

  // Providers

  provider = {
    get: async (name: string): Promise<Provider | null> => {
      return this.providerRepository.findOne({ where: { name } });
    },

    create: async (provider: {
      name: string;
      enabled: boolean;
    }): Promise<Provider> => {
      const newProvider = this.providerRepository.create(provider);
      return this.providerRepository.save(newProvider);
    },

    toggle: async (name: string): Promise<void> => {
      const provider: Provider | null = await this.providerRepository.findOne({
        where: { name },
      });

      if (!provider) {
        return;
      }
      await this.providerRepository.update(
        { name: name },
        { enabled: !provider.enabled },
      );
    },

    delete: async (name: string): Promise<DeleteResult> => {
      return this.providerRepository.delete({ name: name });
    },
  };
}
