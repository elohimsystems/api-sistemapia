import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { mailLogger } from './mail-logger';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 3,
      rateDelta: 2000,
      rateLimit: 5,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
  }

  async sendDorsalEmail(
    to: string,
    subject: string,
    text: string,
    imageBuffer: Buffer,
    imageName: string,
  ): Promise<boolean> {
    const from = process.env.SMTP_FROM;
    this.logger.log(`Enviando email a ${to} asunto: ${subject}`);
    try {
      const info = await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        attachments: [{ filename: imageName, content: imageBuffer }],
      });
      this.logger.log(`Email enviado a ${to}: ${info.messageId}`);
      mailLogger.info(`Email enviado a ${to}`, { messageId: info.messageId, subject });
      return true;
    } catch (error) {
      const msg = `Error al enviar email a ${to}: ${error.message}`;
      this.logger.error(msg);
      mailLogger.error(msg, { to, subject, error: error.stack });
      return false;
    }
  }
}
