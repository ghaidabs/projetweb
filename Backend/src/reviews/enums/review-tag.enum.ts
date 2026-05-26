import { registerEnumType } from '@nestjs/graphql';

export enum ReviewTag {
  PUNCTUAL = 'PUNCTUAL',
  FRIENDLY = 'FRIENDLY',
  CLEAN_CAR = 'CLEAN_CAR',
  SAFE_DRIVER = 'SAFE_DRIVER',
  GOOD_MUSIC = 'GOOD_MUSIC',
  FAST_DRIVER = 'FAST_DRIVER',
}
registerEnumType(ReviewTag, {
  name: 'ReviewTag',
});