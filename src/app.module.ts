import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { PrismaModule } from './infra/database/pirsma.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import env from './common/env';
import { LoggerModule } from 'nestjs-pino';
import { BuildingModule } from './building/building.module';
import { DssController } from './dss/dss.controller';
import { DssService } from './dss/dss.service';
import { PrismaModule } from './infra/database/prisma.module';
import { DssModule } from './dss/dss.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [env],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty' }
            : undefined,

        redact: {
          paths: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.confirmPassword',
            'req.body.oldPassword',
          ],
          remove: false, // "***"
        },
      },
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    BuildingModule,
    DssModule,
  ],
  controllers: [AppController, DssController],
  providers: [AppService, DssService],
})
export class AppModule {}
