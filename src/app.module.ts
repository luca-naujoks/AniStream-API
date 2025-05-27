import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { DetailedMediaModule } from './detailed-media/detailed-media.module';
import { SetupModule } from './setup/setup.module';
import { SetupController } from './setup/setup.controller';
import { SetupService } from './setup/setup.service';
import { MediaController } from './media/media.controller';
import { DetailedMediaController } from './detailed-media/detailed-media.controller';

import { MediaService } from './media/media.service';
import { DetailedMediaService } from './detailed-media/detailed-media.service';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { TypeOrmModule } from '@nestjs/typeorm';
import { SqliteModule } from './sqlite/sqlite.module';
import { SqliteService } from './sqlite/sqlite.service';
import { SqliteController } from './sqlite/sqlite.controller';
import { MediaModule } from './media/media.module';
import { WatchlistController } from './watchlist/watchlist.controller';
import { WatchlistModule } from './watchlist/watchlist.module';
import { WatchlistService } from './watchlist/watchlist.service';
import { TelemetricsController } from './telemetrics/telemetrics.controller';
import { TelemetricsModule } from './telemetrics/telemetrics.module';
import { ProviderController } from './provider/provider.controller';
import { ProviderModule } from './provider/provider.module';
import appConfig from './app.config';
import { modules } from './shared/typeOrmImports';
import { ProviderRegistry } from './provider/provider.registry';
import { ProviderService } from './provider/provider.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'storage/db.sqlite3',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature(modules),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    ScheduleModule.forRoot(),
    SetupModule,
    MediaModule,
    DetailedMediaModule,
    SqliteModule,
    WatchlistModule,
    TelemetricsModule,
    ProviderModule,
  ],
  controllers: [
    AppController,
    SetupController,
    MediaController,
    DetailedMediaController,
    SqliteController,
    WatchlistController,
    TelemetricsController,
    ProviderController,
  ],
  providers: [
    AppService,
    SetupService,
    MediaService,
    DetailedMediaService,
    SqliteService,
    WatchlistService,
    ProviderService,
    ProviderRegistry,
  ],
})
export class AppModule {}
