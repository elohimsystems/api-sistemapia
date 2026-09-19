import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Inscrito } from '../inscritos/entities/inscrito.entity';
import { MailService } from '../mail/mail.service';

interface EmailTask {
  id: string;
  status: 'pending' | 'processing' | 'completed';
  total: number;
  enviados: number;
  fallidos: { id: number; error: string }[];
  createdAt: Date;
}

@Injectable()
export class NotificacionesService {
  private readonly emailTasks = new Map<string, EmailTask>();
  private taskCounter = 0;
  private readonly logger = new Logger(NotificacionesService.name);

  constructor(
    @InjectRepository(Inscrito)
    private readonly inscritoRepo: Repository<Inscrito>,
    private readonly mailService: MailService,
  ) {}

  getEmailTaskStatus(taskId: string): EmailTask {
    const task = this.emailTasks.get(taskId);
    if (!task) throw new NotFoundException('Task no encontrada');
    return task;
  }

  async enviar(
    inscritoIds: number[],
    subject: string,
    message: string,
    archivo?: Express.Multer.File,
  ): Promise<{ task_id: string }> {
    const taskId = `notif_email_${Date.now()}_${++this.taskCounter}`;
    const task: EmailTask = {
      id: taskId, status: 'pending', total: inscritoIds.length,
      enviados: 0, fallidos: [], createdAt: new Date(),
    };
    this.emailTasks.set(taskId, task);
    this.processEmailBatch(task, inscritoIds, subject, message, archivo).catch(err => {
      this.logger.error(`Error critico en envio batch: ${err.message}`, err.stack);
    });
    return { task_id: taskId };
  }

  async enviarTodos(
    idevento: number,
    subject: string,
    message: string,
    archivo?: Express.Multer.File,
  ): Promise<{ task_id: string }> {
    const inscritos = await this.inscritoRepo.find({
      where: { idevento: String(idevento) },
      relations: ['competidor'],
    });
    const ids = inscritos.map(i => Number(i.id));
    return this.enviar(ids, subject, message, archivo);
  }

  private async processEmailBatch(
    task: EmailTask,
    ids: number[],
    subject: string,
    message: string,
    archivo?: Express.Multer.File,
  ): Promise<void> {
    task.status = 'processing';
    const CONCURRENCY = 5;
    for (let i = 0; i < ids.length; i += CONCURRENCY) {
      const batch = ids.slice(i, i + CONCURRENCY);
      const results = await Promise.allSettled(
        batch.map(id => this.sendSingleNotification(id, subject, message, archivo)),
      );
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value.success) task.enviados++;
          else task.fallidos.push({ id: result.value.id, error: result.value.error });
        }
      }
      if (i + CONCURRENCY < ids.length) await new Promise(r => setTimeout(r, 200));
    }
    task.status = 'completed';
  }

  private async sendSingleNotification(
    id: number,
    subject: string,
    message: string,
    archivo?: Express.Multer.File,
  ): Promise<{ id: number; success: boolean; error?: string }> {
    try {
      const inscrito = await this.inscritoRepo.findOne({
        where: { id: String(id) },
        relations: ['competidor'],
      });
      if (!inscrito) return { id, success: false, error: 'Inscrito no encontrado' };

      const email = inscrito.competidor?.emailpersonal || inscrito.competidor?.email;
      if (!email) return { id, success: false, error: 'El participante no tiene email registrado' };

      const nombre = `${inscrito.competidor?.nombre || ''} ${inscrito.competidor?.apellido || ''}`.trim() || 'Participante';
      const fullMessage = `${message}\n\n---\nNombre: ${nombre}`;

      let ok: boolean;
      if (archivo) {
        const ext = archivo.originalname.split('.').pop() || 'bin';
        ok = await this.mailService.sendEmail(
          email, subject, fullMessage,
          { buffer: archivo.buffer, filename: `adjunto_${inscrito.competidor?.iddocumento || id}.${ext}` },
        );
      } else {
        ok = await this.mailService.sendEmail(email, subject, fullMessage);
      }

      if (ok) {
        await this.inscritoRepo.update(id, { notificado: true });
        return { id, success: true };
      }
      return { id, success: false, error: 'Error al enviar el correo' };
    } catch (e: any) {
      return { id, success: false, error: e.message || 'Error desconocido' };
    }
  }
}
