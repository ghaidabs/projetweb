import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Profile image must be a string' })
  profileImage?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^(\+216|0)?[2459]\d{7}$/, {
    message:
      'Phone number must be in Tunisian format (e.g., +216 20123456, 020123456, or 20123456)',
  })
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Emergency contact must be a string' })
  emergencyContact?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Emergency phone must be a string' })
  @Matches(/^(\+216|0)?[2459]\d{7}$/, {
    message:
      'Emergency phone number must be in Tunisian format (e.g., +216 20123456, 020123456, or 20123456)',
  })
  emergencyPhone?: string;
}
