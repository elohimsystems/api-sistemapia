import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigCorreo } from './entities/config-correo.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ConfigCorreo])],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
