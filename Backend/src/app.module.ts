import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TripsModule } from './trips/trips.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AlertsModule } from './alerts/alerts.module';
import { BookingsModule } from './bookings/bookings.module';
import { MailModule } from './mail/mail.module';
import { CommonModule } from './common/common.module';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { PubSubModule } from './common/pubsub/pubsub.module';
import { NotificationsModule } from './notifications/notification.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: true,
      subscriptions: {
        'graphql-ws': {
          path: '/graphql',
        },
      },
      context: ({ req, res }) => ({ req, res }),
    }),
    EventEmitterModule.forRoot(),

    TripsModule, BookingsModule, AuthModule, UsersModule, MailModule, CommonModule, ReviewsModule, AlertsModule, PubSubModule, NotificationsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes('*'); // Appliquer à toutes les routes
  }
}


