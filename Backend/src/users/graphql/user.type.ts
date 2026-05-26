import { ObjectType, Field, Int, Float, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  role: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  profileImage: string;

  @Field(() => Float)
  rating: number;

  @Field()
  isEmailVerified: boolean;

  @Field({ nullable: true })
  emergencyContact: string;

  @Field({ nullable: true })
  emergencyPhone: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
