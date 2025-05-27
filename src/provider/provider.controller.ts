import {
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProviderRegistry } from './provider.registry';
import type { Provider as CustomProvider } from './provider.interface';
import { ApiParam, ApiTags, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import path from 'path';
import * as fs from 'fs';
import { UploadProviderDto } from 'src/shared/swagger.dto';
import { ProviderService } from './provider.service';

@ApiTags('Providers')
@Controller('provider')
export class ProviderController {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly providerService: ProviderService,
  ) {}

  @Get()
  getProviders() {
    return this.providerRegistry.listProviders();
  }

  @ApiParam({ name: 'name', type: String })
  @Get(':name')
  getProvider(@Param() params: { name: string }) {
    return this.providerRegistry.getProvider(params.name);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Provider file (.ts, or .js)',
    type: UploadProviderDto,
  })
  @Post()
  @UseInterceptors(FileInterceptor('file', {}))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const storagePath = path.join(__dirname, '../../storage/providers');
    Logger.warn(storagePath);
    try {
      // Save file to storage/provider
      if (!fs.existsSync(storagePath)) {
        fs.mkdirSync(storagePath, { recursive: true });
      }
      const filePath = path.join(storagePath, file.originalname);
      fs.writeFileSync(filePath, file.buffer);

      // Dynamically import the uploaded file
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const importedModule = await import(filePath);

      const provider =
        (importedModule as { default?: CustomProvider }).default ||
        (importedModule as CustomProvider);

      if (!this.providerService.validateProvider(provider)) {
        fs.unlinkSync(path.join(storagePath, file.originalname));
        return { message: 'Provider Validation Failed' };
      }

      await this.providerRegistry.registerProvider({
        provider,
        filePath: path.join(storagePath, file.originalname),
      });

      Logger.log('Provider registered');

      return { message: 'File uploaded and validated successfully.' };
    } catch (error) {
      fs.unlinkSync(path.join(storagePath, file.originalname));
      return {
        statusCode: 400,
        message: 'Failed to upload provider file.',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Delete()
  removeProvider(@Query('id') id: string) {
    return this.providerRegistry.removeProvider(id);
  }
}
