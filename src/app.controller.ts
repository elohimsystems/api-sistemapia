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
    const raiz = dirname(require.main?.filename || process.argv[1]);
    const ruta = join(raiz, 'config.json');
    if (existsSync(ruta)) {
      try {
        const contenido = readFileSync(ruta, 'utf-8');
        return JSON.parse(contenido);
      } catch (e) {
        logger.error(`Error al leer config.json: ${(e as Error).message}`);
      }
    }
    return {
      showEnviarTodos: process.env.SHOW_ENVIAR_TODOS !== 'false',
    };
  }
}
