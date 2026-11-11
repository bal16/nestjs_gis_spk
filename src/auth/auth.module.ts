import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { HashService } from './hash.service';
import { AdminGuard } from './strategies/admin.guard';
import { PrismaModule } from '../infra/database/prisma.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, HashService, AdminGuard],
  exports: [AuthService, HashService, AdminGuard],
  imports: [
    UserModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
