import { Controller, Get } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { AppService } from './app.service';
import { APP_NAME, APP_VERSION, MIN_FLUTTER_VERSION } from './version';
import { logger } from './logger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('version')
  getVersion() {
    return {
      name: APP_NAME,
      version: APP_VERSION,
      minFlutterVersion: MIN_FLUTTER_VERSION,
    };
  }

  @Get('config')
  getConfig() {
    const candidatos = [
      join(dirname(require.main?.filename || process.cwd()), 'config.json'),
      join(process.cwd(), 'config.json'),
    ];
    for (const ruta of candidatos) {
      if (existsSync(ruta)) {
        try {
          const contenido = readFileSync(ruta, 'utf-8');
          return JSON.parse(contenido);
        } catch (e) {
          logger.error(`Error al leer config.json: ${(e as Error).message}`);
        }
      }
    }
    return {
      showEnviarTodos: process.env.SHOW_ENVIAR_TODOS !== 'false',
    };
  }
}
