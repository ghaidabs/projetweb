import { registerEnumType } from '@nestjs/graphql';

export enum Badge {
  EXCELLENT_DRIVER = 'EXCELLENT_DRIVER',   // avg > 4.8
  CLEAN_CAR = 'CLEAN_CAR',                 // 80% clean_car tag
  ALWAYS_ON_TIME = 'ALWAYS_ON_TIME',       // 90% punctual tag
  SAFE_DRIVER = 'SAFE_DRIVER',             // 100 trips + avg > 4.5
  FRIENDLY = 'FRIENDLY',                   // 80% friendly tag
  POPULAR = 'POPULAR',                     // 50+ reviews
}

registerEnumType(Badge, { name: 'Badge' });
