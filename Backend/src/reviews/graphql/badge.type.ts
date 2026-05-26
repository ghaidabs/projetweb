import { ObjectType, Field, registerEnumType } from '@nestjs/graphql';
import { Badge } from '../enums/badge.enum';

registerEnumType(Badge, { name: 'Badge' });

@ObjectType()
export class BadgeType {
  @Field(() => Badge)
  badge: Badge;

  @Field()
  unlockedAt: Date;
}