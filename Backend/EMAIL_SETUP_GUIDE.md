# Guide Configuration Email - Gmail SMTP

## ⚙️ Configuration Requise

Pour envoyer des emails via Gmail avec nodemailer, vous devez :

### 1️⃣ Activer 2-Factor Authentication sur votre compte Google
- Allez sur https://myaccount.google.com/security
- Activez "Vérification en deux étapes"

### 2️⃣ Générer un mot de passe d'application
- Allez sur https://myaccount.google.com/apppasswords
- Sélectionnez "Mail" et "Windows"
- Cliquez sur "Générer"
- Google créera un mot de passe à 16 caractères

### 3️⃣ Mettre à jour `.env`
Remplacez les valeurs dans le fichier `.env` :

```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=votre-email@gmail.com          # ← Votre adresse Gmail
MAIL_PASSWORD=xxxx xxxx xxxx xxxx        # ← Mot de passe généré (16 caractères)
MAIL_FROM=noreply@covoiturage.com
MAIL_FROM_NAME=Covoiturage
```

⚠️ **Important:** 
- N'utilisez PAS votre mot de passe Gmail normal
- Utilisez UNIQUEMENT le mot de passe généré via https://myaccount.google.com/apppasswords
- Le mot de passe d'application a 16 caractères avec des espaces

## 🧪 Test de l'Email

Après configuration, créez un nouvel utilisateur :

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test@1234",
    "phone": "+21612345678"
  }'
```

Vérifiez les logs :
- ✅ `✅ Email de bienvenue envoyé à test@example.com`
- ❌ Si erreur, vérifiez les credentials dans `.env`

## 📧 Service Mail

Le service `MailService` est disponible dans `src/mail/mail.service.ts` :

```typescript
// Injecter dans n'importe quel service
constructor(private mailService: MailService) {}

// Envoyer un email
await this.mailService.sendWelcomeEmail('user@example.com', 'Username');
```

## 🔒 Sécurité

- Les credentials sont stockés dans `.env` (git-ignoré)
- N'commitez PAS `.env` sur Git
- Utilisez un mot de passe d'application, pas le mot de passe principal
