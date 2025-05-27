import { Media } from 'src/enities/media.entity';

export interface Provider {
  name: string;
  // new media is a list of media objects that are added to the database
  //toggledMedia is a list of media ids that should get toggled to online_available or not
  variables: string[];
  fetchData(
    ctx: ProviderSandboxContext,
  ): Promise<{ newMedia?: Media[]; toggleMedia?: string[] }>;
  trending?(
    ctx: ProviderSandboxContext,
  ): Promise<{ newMedia?: Media[]; toggleMedia?: string[] }>;
  schedule: string;
  // request_url: string
}

export interface ExtendedProvider {
  name: string;
  variables: string[];
  fetchData(
    ctx: ProviderSandboxContext,
  ): Promise<{ newMedia?: Media[]; toggleMedia?: string[] }>;
  trending?(
    ctx: ProviderSandboxContext,
  ): Promise<{ newMedia?: Media[]; toggleMedia?: string[] }>;
  schedule: string;
  file_path: string;
  enabled: boolean;
}

export interface ProviderSandboxContext {
  getDBItems: () => Promise<Media[]>;
}
