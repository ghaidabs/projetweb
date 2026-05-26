import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import DataLoader from 'dataloader';
import { User } from 'src/users/entities/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class DriverLoader {
  public readonly loader: DataLoader<number, User | null>;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    this.loader = new DataLoader<number, User | null>(
      (ids) => this.batchLoad(ids as number[]),
    );
  }

  private async batchLoad(userIds: number[]): Promise<(User | null)[]> {
    const users = await this.userRepo.find({
      where: { id: In(userIds) },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));
    return userIds.map((id) => userMap.get(id) ?? null);
  }
}
