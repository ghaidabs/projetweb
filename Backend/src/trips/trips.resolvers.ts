import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { TripsService } from './trips.service';
import { TripType } from './graphql/trip.type';
import { TripStatsType } from './graphql/trip-stats.type';
import { PaginatedTripsType } from './graphql/paginated-trips.type';
import { SearchTripsInput } from './graphql/search-trips.input';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ResolveField, Parent } from '@nestjs/graphql';
import { UserType } from 'src/users/graphql/user.type';
import { DriverLoader } from './driver.loader';
import { Trip } from './entities/trip.entity';

@Resolver(() => TripType)
export class TripsResolver {
  constructor(
    private readonly tripsService: TripsService,
    private readonly driverLoader: DriverLoader,
  ) {}


  @Query(() => TripType)
  trip(@Args('id', { type: () => Int }) id: number) {
    return this.tripsService.getTripById(id);
  }

  @Query(() => TripStatsType)
  @UseGuards(GqlJwtAuthGuard)
  tripsStats(@CurrentUser() user: User) {
    return this.tripsService.getTripsStats(user.id);
  }

  @Query(() => [TripType])
  tripsByStatus(@Args('status') status: string) {
    return this.tripsService.getTripsByStatus(status);
  }

  @Query(() => [TripType])
  upcomingTrips(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ) {
    return this.tripsService.getUpcomingTrips(page, limit);
  }

  @Query(() => PaginatedTripsType)
    searchTrips(
      @Args('filters', { type: () => SearchTripsInput, nullable: true })
      filters?: SearchTripsInput,
    ) {
      return this.tripsService.searchTrips(filters ?? {});
    }

  @Query(() => [TripType])
  tripsNearDate(
    @Args('date') date: string,
    @Args('rangeDays', { type: () => Int }) rangeDays: number,
  ) {
    return this.tripsService.tripsNearDate(date, rangeDays);
  }

  @ResolveField('driver', () => UserType, { nullable: true })
  async resolveDriver(@Parent() trip: Trip) {
    return this.driverLoader.loader.load(trip.driverId);
  }
}