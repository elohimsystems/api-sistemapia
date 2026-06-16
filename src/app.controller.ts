import { Controller, Get } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AppService } from './app.service';
import { APP_NAME, APP_VERSION, MIN_FLUTTER_VERSION } from './version';

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
      join(process.cwd(), 'config.json'),
      join(__dirname, '..', '..', 'config.json'),
      join(process.cwd(), '..', 'config.json'),
    ];
    for (const ruta of candidatos) {
      if (existsSync(ruta)) {
        try {
          const contenido = readFileSync(ruta, 'utf-8');
          return JSON.parse(contenido);
        } catch (e) {
          console.error(`Error al leer ${ruta}:`, (e as Error).message);
        }
      }
    }
    console.warn('config.json no encontrado. Buscado en:', candidatos);
    return {
      showEnviarTodos: process.env.SHOW_ENVIAR_TODOS !== 'false',
    };
  }
}
