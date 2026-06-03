import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.sistemapia.com.ve',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER || 'notificacion@sistemapia.com.ve',
        pass: process.env.SMTP_PASS || '7c)I8WE6QH7?dRm[',
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendDorsalEmail(
    to: string,
    subject: string,
    text: string,
    imageBuffer: Buffer,
    imageName: string,
  ): Promise<void> {
    const from = process.env.SMTP_FROM || 'notificacion@sistemapia.com.ve';
    this.logger.log(`Enviando email a ${to} asunto: ${subject}`);
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        attachments: [{ filename: imageName, content: imageBuffer }],
      });
      this.logger.log(`Email enviado: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Error al enviar email a ${to}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
