import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, path, query, body, ip } = req;
    const timestamp = new Date().toLocaleTimeString('fr-FR');

    // Log de la requête entrante
    this.logger.log(
      `[${timestamp}] 📨 ${method} ${path}${Object.keys(query).length > 0 ? '?' + new URLSearchParams(query as any).toString() : ''}`,
    );

    // Log le body si présent (sauf les mots de passe pour la sécurité)
    if (body && Object.keys(body).length > 0) {
      const sanitizedBody = { ...body };
      // Masquer les données sensibles
      if (sanitizedBody.password) sanitizedBody.password = '***';
      if (sanitizedBody.MAIL_PASSWORD) sanitizedBody.MAIL_PASSWORD = '***';
      this.logger.debug(`   Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log l'IP client
    this.logger.debug(`   IP: ${ip}`);

    // Capturer la réponse
    const startTime = Date.now();

    // Intercepter la fin de la réponse
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;

      // Colorer le log selon le code de statut
      let statusEmoji = '✅';
      if (statusCode >= 400 && statusCode < 500) statusEmoji = '⚠️';
      if (statusCode >= 500) statusEmoji = '❌';

      this.logger.log(
        `${statusEmoji} ${method} ${path} → ${statusCode} (${duration}ms)`,
      );
    });

    next();
  }
}
