import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
      secure: false, // true for 465, false for other ports (use TLS)
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASSWORD'),
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      const mailFrom = `${this.configService.get<string>('MAIL_FROM_NAME')} <${this.configService.get<string>('MAIL_FROM')}>`;
const htmlContent = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #333; line-height: 1.6;">
    
    <div style="background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="margin: 0;">Bienvenue sur Covoiturage</h1>
    </div>

    <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
      
      <p>Bonjour <strong>${name}</strong>,</p>

      <p>
        Nous vous remercions de votre inscription sur notre plateforme.
        Votre compte a été créé avec succès et vous pouvez désormais accéder à l'ensemble de nos services.
      </p>

      <h3>Fonctionnalités disponibles :</h3>

      <ul>
        <li>Publier et gérer vos trajets</li>
        <li>Rechercher des trajets correspondant à votre destination</li>
        <li>Réserver des places auprès des conducteurs</li>
        <li>Consulter et mettre à jour votre profil</li>
        <li>Interagir avec la communauté des utilisateurs</li>
      </ul>

      <p>
        Notre plateforme a pour objectif de faciliter vos déplacements tout en favorisant le partage et l'optimisation des trajets.
      </p>


      <p>
        Si vous avez des questions ou rencontrez des difficultés, notre équipe reste à votre disposition pour vous accompagner.
      </p>

      <p>
        Nous vous souhaitons une excellente expérience sur notre plateforme.
      </p>

      <p>
        Cordialement,<br>
        <strong>L'équipe Covoiturage</strong>
      </p>

    </div>

  </div>
`;
      await this.transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Bienvenue sur Covoiturage!',
        html: htmlContent,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'X-Mailer': 'Covoiturage',
          'X-Entity-Ref-ID': `covoiturage-${Date.now()}`,
        },
      });

      this.logger.log(`✅ Email de bienvenue envoyé à ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erreur lors de l'envoi de l'email à ${email}:`, error);
      throw error;
    }
  }
}
