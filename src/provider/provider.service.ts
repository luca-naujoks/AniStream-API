import { Injectable, Logger } from '@nestjs/common';
import { ZProvider } from 'src/shared/zod.interfaces';
import { Provider } from './provider.interface';

@Injectable()
export class ProviderService {
  // validate providers that are already encoded and parsed (ready to check for zod)
  validateProvider(provider: Provider): boolean {
    const parsedData = ZProvider.safeParse(provider);

    if (!parsedData.success) {
      return false;
    }
    return true;
  }

  //validate provider files so .js and .ts files that still need secure parsing
  validateProviderFile(providerFile: Express.Multer.File): boolean {
    const providerToParse: Express.Multer.File = providerFile;

    Logger.log(providerFile);
    // parse file to js if ts
    if (providerFile.mimetype !== 'application/x-javascript') {
      return false;
    }
    // get defaultExport (Provider) Object
    // safeParse the object
    // return result
    return true;
  }
}
