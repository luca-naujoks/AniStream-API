import { SchedulerRegistry } from '@nestjs/schedule';
import {
  ExtendedProvider,
  Provider,
  ProviderSandboxContext,
} from './provider.interface';
import { CronJob } from 'cron';
import { MediaArraySchema } from 'src/shared/zod.interfaces';
import { Logger } from '@nestjs/common';

import { SqliteService } from 'src/sqlite/sqlite.service';

export function scheduleProvider({
  provider,
  schedulerRegistry,
  sqliteService,
}: {
  provider: ExtendedProvider;
  schedulerRegistry: SchedulerRegistry;
  sqliteService: SqliteService;
}) {
  const job = new CronJob(provider.schedule, async () => {
    await jobExecutionWrapper({
      provider,
      sqliteService,
    });
  });
  schedulerRegistry.addCronJob(provider.name, job);
  if (provider.enabled) {
    job.start();
    Logger.log(`Scheduled provider with name: ${provider.name}`);
  } else {
    job.stop();
  }
}

async function jobExecutionWrapper({
  provider,
  sqliteService,
}: {
  provider: Provider;
  sqliteService: SqliteService;
}): Promise<void> {
  const providerContext: ProviderSandboxContext = {
    getDBItems: async () => sqliteService.media.getAllMedia({}),
  };

  try {
    const executedProvider = await provider.fetchData(providerContext);

    // Validate the result using Zod
    const parsedData = MediaArraySchema.safeParse(executedProvider);

    if (!parsedData.success) {
      Logger.error('Data Validation Failed');
      return;
    }

    Logger.log('Inserting data into DB');
    await sqliteService.media.createMedia(parsedData.data.newMedia || []);
  } catch (error) {
    Logger.error('Job execution failed:', error);
  }
}
