import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InscritosModule } from './inscritos/inscritos.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosModule } from './eventos/eventos.module';
import { CompetidoresModule } from './competidores/competidores.module';
import { CategoriasModule } from './categorias/categorias.module';
import { PagosModule } from './pagos/pagos.module';
import { CompetenciasModule } from './competencias/competencias.module';
import { DorsalesModule } from './dorsales/dorsales.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    InscritosModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true' || false,
    }),
    EventosModule,
    CompetidoresModule,
    CategoriasModule,
    PagosModule,
    CompetenciasModule,
    DorsalesModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
