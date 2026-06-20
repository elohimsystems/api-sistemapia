import { Controller, Post, Get, Param, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NotificacionesService } from './notificaciones.service';

@Controller('notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Post('enviar')
  @UseInterceptors(FileInterceptor('archivo'))
  async enviar(
    @Body('ids') ids: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    const idsArray = ids ? ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : [];
    if (!idsArray.length) throw new BadRequestException('Debe enviar un arreglo de ids');
    if (!subject) throw new BadRequestException('Debe enviar un subject');
    return this.notificacionesService.enviar(idsArray, subject, message || '', archivo);
  }

  @Post('enviar/:idevento')
  @UseInterceptors(FileInterceptor('archivo'))
  async enviarTodos(
    @Param('idevento') idevento: string,
    @Body('subject') subject: string,
    @Body('message') message: string,
    @UploadedFile() archivo?: Express.Multer.File,
  ) {
    if (!subject) throw new BadRequestException('Debe enviar un subject');
    return this.notificacionesService.enviarTodos(+idevento, subject, message || '', archivo);
  }

  @Get('email-task/:taskId')
  getEmailTaskStatus(@Param('taskId') taskId: string) {
    return this.notificacionesService.getEmailTaskStatus(taskId);
  }
}
