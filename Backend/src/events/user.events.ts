/**
 * Événement émis quand un nouvel utilisateur se crée
 */
export class UserRegisteredEvent {
  userId: number;
  email: string;
  name: string;
  role: string;
  createdAt: Date;

  constructor(userId: number, email: string, name: string, role: string, createdAt: Date) {
    this.userId = userId;
    this.email = email;
    this.name = name;
    this.role = role;
    this.createdAt = createdAt;
  }
}
