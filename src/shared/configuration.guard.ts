import { CanActivate, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IBackendConfig } from './OutputInterfaces';

@Injectable()
export class ConfigGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    const configState: IBackendConfig | undefined =
      this.configService.get<IBackendConfig>('appConfig');

    const configured: boolean =
      configState?.AnimeDir &&
      configState?.SeriesDir &&
      configState?.PageSize &&
      configState?.TmdbApiKey
        ? true
        : false;

    return configured;
  }
}
