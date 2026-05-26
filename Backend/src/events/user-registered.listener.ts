import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from './user.events';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UserRegisteredListener {
  private readonly logger = new Logger(UserRegisteredListener.name);

  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: UserRegisteredEvent) {
    this.logger.log(
      ` Envoi d'un email de bienvenue à ${payload.email}...`,
    );

    try {
      // Envoyer l'email de bienvenue
      await this.mailService.sendWelcomeEmail(payload.email, payload.name);

      this.logger.log(
        ` Email de bienvenue envoyé avec succès à ${payload.email}!`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Erreur lors de l'envoi de l'email à ${payload.email}:`,
        error,
      );
    }
  }
}

