import { Resolver, Query, Mutation, Args, Context, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserType } from './graphql/user.type';
import { UpdateProfileInput } from './graphql/update-profile.input';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';

@Resolver(() => UserType)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserType, { description: 'Get current authenticated user profile' })
  @UseGuards(GqlJwtAuthGuard)
  async me(@Context() context: any) {
    const userId = context.req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Query(() => UserType, { description: 'Get public user profile by ID' })
  async userProfile(@Args('id', { type: () => Int }) id: number) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    // Return public profile (hide sensitive data if needed)
    return user;
  }

  @Mutation(() => UserType, { description: 'Update current user profile' })
  @UseGuards(GqlJwtAuthGuard)
  async updateProfile(
    @Args('input', { type: () => UpdateProfileInput })
    input: UpdateProfileInput,
    @Context() context: any,
  ) {
    const userId = context.req.user.id;
    const updatedUser = await this.usersService.updateUserProfile(userId, input);
    return updatedUser;
  }
}
