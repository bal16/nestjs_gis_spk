import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HashService } from './hash.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, HashService],
  imports: [
    UserModule,
    ConfigModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
