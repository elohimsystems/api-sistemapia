import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { ConfigCorreo } from './entities/config-correo.entity';
import { encryptPassword, decryptPassword } from './mail-crypto';
import { mailLogger } from './mail-logger';

interface ActiveMailConfig {
  transporter: nodemailer.Transporter;
  from: string;
  providerName: string;
  configId?: number;
}

@Injectable()
export class MailService {
  private activeConfig: ActiveMailConfig | null = null;
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectRepository(ConfigCorreo)
    private readonly configRepo: Repository<ConfigCorreo>,
  ) {}

  /**
   * Obtiene o inicializa el transporte de correo activo de forma dinámica.
   */
  async getActiveTransporter(forceRefresh = false): Promise<ActiveMailConfig> {
    if (this.activeConfig && !forceRefresh) {
      return this.activeConfig;
    }

    try {
      const dbConfig = await this.configRepo.findOne({ where: { activo: true } });

      if (dbConfig) {
        const decryptedPass = decryptPassword(dbConfig.passSecret || '');
        const isSecure = dbConfig.secure || dbConfig.port === 465;

        const transporter = nodemailer.createTransport({
          host: dbConfig.host || 'localhost',
          port: dbConfig.port || 587,
          secure: isSecure,
          auth: dbConfig.userKey
            ? {
                user: dbConfig.userKey,
                pass: decryptedPass,
              }
            : undefined,
          pool: true,
          maxConnections: 5,
          rateDelta: 1000,
          rateLimit: 10,
          tls: { rejectUnauthorized: false },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        });

        const from = dbConfig.fromName
          ? `"${dbConfig.fromName}" <${dbConfig.fromEmail}>`
          : dbConfig.fromEmail;

        this.activeConfig = {
          transporter,
          from,
          providerName: dbConfig.nombre,
          configId: dbConfig.id,
        };

        this.logger.log(
          `Proveedor de correo dinámico cargado desde BD: ${dbConfig.nombre} (${dbConfig.host}:${dbConfig.port})`,
        );
        return this.activeConfig;
      }
    } catch (e: any) {
      this.logger.warn(
        `No se pudo cargar la configuración de correo desde BD: ${e?.message}. Usando variables de entorno.`,
      );
    }

    // Respaldo a variables de entorno (.env)
    const host = process.env.SMTP_HOST || 'localhost';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || 'dorsales@tudominio.com';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user ? { user, pass } : undefined,
      pool: true,
      maxConnections: 3,
      rateDelta: 2000,
      rateLimit: 5,
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    this.activeConfig = {
      transporter,
      from,
      providerName: 'Variables de Entorno (.env)',
    };

    return this.activeConfig;
  }

  reloadConfig() {
    this.activeConfig = null;
  }

  // --- CRUD para Proveedores de Correo ---

  async getAllProviders(): Promise<any[]> {
    const list = await this.configRepo.find({ order: { id: 'ASC' } });
    return list.map(item => ({
      ...item,
      passSecretMasked: item.passSecret ? '••••••••' : '',
      passSecret: undefined,
    }));
  }

  async getProviderById(id: number): Promise<ConfigCorreo> {
    const item = await this.configRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Proveedor de correo #${id} no encontrado`);
    return item;
  }

  async createProvider(data: Partial<ConfigCorreo>): Promise<ConfigCorreo> {
    if (!data.nombre || !data.fromEmail) {
      throw new BadRequestException('El nombre y el correo remitente son obligatorios');
    }

    if (data.passSecret) {
      data.passSecret = encryptPassword(data.passSecret);
    }

    if (data.activo) {
      await this.configRepo.update({}, { activo: false });
    }

    const created = await this.configRepo.save(this.configRepo.create(data));
    this.reloadConfig();
    return created;
  }

  async updateProvider(id: number, data: Partial<ConfigCorreo>): Promise<ConfigCorreo> {
    const existing = await this.getProviderById(id);

    if (data.passSecret && data.passSecret !== '••••••••' && data.passSecret !== existing.passSecret) {
      data.passSecret = encryptPassword(data.passSecret);
    } else {
      delete data.passSecret;
    }

    if (data.activo === true) {
      await this.configRepo.update({}, { activo: false });
    }

    Object.assign(existing, data);
    const saved = await this.configRepo.save(existing);
    this.reloadConfig();
    return saved;
  }

  async deleteProvider(id: number): Promise<void> {
    const existing = await this.getProviderById(id);
    await this.configRepo.remove(existing);
    this.reloadConfig();
  }

  async activarProvider(id: number): Promise<ConfigCorreo> {
    const existing = await this.getProviderById(id);
    await this.configRepo.update({}, { activo: false });
    existing.activo = true;
    const saved = await this.configRepo.save(existing);
    this.reloadConfig();
    return saved;
  }

  async testProvider(providerId?: number, testEmail?: string): Promise<{ success: boolean; message: string }> {
    const toEmail = testEmail || 'prueba@tudominio.com';
    let transporter: nodemailer.Transporter;
    let from: string;
    let name: string;

    if (providerId) {
      const p = await this.getProviderById(providerId);
      const decryptedPass = decryptPassword(p.passSecret || '');
      const isSecure = p.secure || p.port === 465;

      transporter = nodemailer.createTransport({
        host: p.host || 'localhost',
        port: p.port || 587,
        secure: isSecure,
        auth: p.userKey ? { user: p.userKey, pass: decryptedPass } : undefined,
        tls: { rejectUnauthorized: false },
        connectionTimeout: 10000,
      });
      from = p.fromName ? `"${p.fromName}" <${p.fromEmail}>` : p.fromEmail;
      name = p.nombre;
    } else {
      const active = await this.getActiveTransporter();
      transporter = active.transporter;
      from = active.from;
      name = active.providerName;
    }

    try {
      const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject: `[PRUEBA] Configuración de Correo - ${name}`,
        text: `Hola, esta es una prueba de envío exitosa desde el Sistema PIA utilizando el proveedor: ${name}.`,
      });

      return {
        success: true,
        message: `Correo de prueba enviado a ${toEmail} con éxito (Message ID: ${info.messageId})`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: `Error al enviar correo de prueba: ${e?.message || e}`,
      };
    }
  }

  // --- Envíos de Correo ---

  async sendDorsalEmail(
    to: string,
    subject: string,
    text: string,
    imageBuffer: Buffer,
    imageName: string,
  ): Promise<boolean> {
    return this.sendEmail(to, subject, text, {
      buffer: imageBuffer,
      filename: imageName,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    attachment?: { buffer: Buffer; filename: string },
  ): Promise<boolean> {
    try {
      const active = await this.getActiveTransporter();
      this.logger.log(
        `Enviando email a ${to} via [${active.providerName}], asunto: ${subject}`,
      );

      const mailOpts: nodemailer.SendMailOptions = {
        from: active.from,
        to,
        subject,
        text,
      };

      if (attachment) {
        mailOpts.attachments = [
          { filename: attachment.filename, content: attachment.buffer },
        ];
      }

      const info = await active.transporter.sendMail(mailOpts);
      this.logger.log(
        `Email enviado a ${to} via [${active.providerName}]: ${info.messageId}`,
      );
      mailLogger.info(`Email enviado a ${to}`, {
        messageId: info.messageId,
        subject,
        provider: active.providerName,
      });

      return true;
    } catch (error: any) {
      const msg = `Error al enviar email a ${to}: ${error?.message || error}`;
      this.logger.error(msg);
      mailLogger.error(msg, { to, subject, error: error?.stack });

      this.activeConfig = null;
      return false;
    }
  }
}
