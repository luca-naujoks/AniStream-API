import { Injectable } from '@nestjs/common';
import { loadProviders } from './provider/loadProviders';
import { ProviderRegistry } from './provider/provider.registry';

@Injectable()
export class AppService {
  constructor(private readonly providerRegistry: ProviderRegistry) {}
  async onApplicationBootstrap(): Promise<void> {
    try {
      await loadProviders(this.providerRegistry);
    } catch (error) {
      console.error('Error during provider initialization:', error);
    }
  }
}
