import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { mailLogger } from './mail-logger';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(MailService.name);
  private readonly driver: string;

  constructor() {
    this.driver = (process.env.MAIL_DRIVER || 'smtp').toLowerCase();
    if (this.driver === 'sendmail') {
      this.transporter = nodemailer.createTransport({
        sendmail: true,
        newline: 'unix',
        path: '/usr/sbin/sendmail',
      });
    } else if (this.driver === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
    } else {
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
      if (this.driver === 'sendgrid') {
        const msg = {
          to,
          from: from || '',
          subject,
          text,
          attachments: [{
            content: imageBuffer.toString('base64'),
            filename: imageName,
            type: 'image/jpeg' as const,
            disposition: 'attachment' as const,
          }],
        };
        await sgMail.send(msg);
        this.logger.log(`Email enviado a ${to} via SendGrid`);
        mailLogger.info(`Email enviado a ${to}`, { driver: 'sendgrid', subject });
      } else {
        const info = await this.transporter!.sendMail({
          from,
          to,
          subject,
          text,
          attachments: [{ filename: imageName, content: imageBuffer }],
        });
        this.logger.log(`Email enviado a ${to}: ${info.messageId}`);
        mailLogger.info(`Email enviado a ${to}`, { messageId: info.messageId, subject });
      }
      return true;
    } catch (error) {
      const msg = `Error al enviar email a ${to}: ${(error as Error).message}`;
      this.logger.error(msg);
      mailLogger.error(msg, { to, subject, error: (error as Error).stack });
      return false;
    }
  }
}
