import { Controller, Get, Post, Patch, Delete, Param, Body, BadRequestException } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigCorreo } from './entities/config-correo.entity';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @Get('providers')
  getAllProviders() {
    return this.mailService.getAllProviders();
  }

  @Get('providers/:id')
  getProviderById(@Param('id') id: string) {
    return this.mailService.getProviderById(+id);
  }

  @Post('providers')
  createProvider(@Body() data: Partial<ConfigCorreo>) {
    return this.mailService.createProvider(data);
  }

  @Patch('providers/:id')
  updateProvider(@Param('id') id: string, @Body() data: Partial<ConfigCorreo>) {
    return this.mailService.updateProvider(+id, data);
  }

  @Delete('providers/:id')
  deleteProvider(@Param('id') id: string) {
    return this.mailService.deleteProvider(+id);
  }

  @Patch('providers/:id/activar')
  activarProvider(@Param('id') id: string) {
    return this.mailService.activarProvider(+id);
  }

  @Post('providers/test')
  testProvider(@Body() body: { id?: number; email?: string }) {
    if (!body?.email) throw new BadRequestException('Debe ingresar un correo de destino para la prueba');
    return this.mailService.testProvider(body.id, body.email);
  }
}
