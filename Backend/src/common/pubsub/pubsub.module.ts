import { Module, Global } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

export const SHARED_PUBSUB = 'SHARED_PUBSUB';

@Global()
@Module({
  providers: [
    {
      provide: SHARED_PUBSUB,
      useValue: new PubSub(),
    },
  ],
  exports: [SHARED_PUBSUB],
})
export class PubSubModule { }