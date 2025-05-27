import * as fs from 'fs';
import { IBackendConfig } from './shared/OutputInterfaces';
import { Logger } from '@nestjs/common';
import path from 'path';
import { registerAs } from '@nestjs/config';

const configPath: string = 'storage/appConfig.json';
const storagePath: string = 'storage';

export default registerAs('appConfig', () => {
  // create storage directory if not exsisting
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath);
  }
  // create provider directory if not exsisting
  if (!fs.existsSync(path.join(storagePath, 'providers'))) {
    fs.mkdirSync(path.join(storagePath, 'providers'));
  }
  // create appConfig file
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(
      configPath,
      JSON.stringify(
        {
          CONFIGURED: false,
          TMDB_API_KEY: '',
          LOCAL_ANIME_PATH: '',
          LOCAL_SERIES_PATH: '',
          PAGE_SIZE: 100,
        },
        null,
        2,
      ),
    );
  }

  const config: IBackendConfig = JSON.parse(
    fs.readFileSync(configPath, 'utf-8'),
  ) as IBackendConfig;

  return config;
});

export function updateConfig(newConfig: IBackendConfig) {
  try {
    const currentConfig: IBackendConfig = JSON.parse(
      fs.readFileSync(configPath, 'utf-8'),
    ) as IBackendConfig;
    const updatedConfig: IBackendConfig = { ...currentConfig, ...newConfig };
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
  } catch (error) {
    Logger.warn(`Failed to update configuration: ${error}`);
  }
}
