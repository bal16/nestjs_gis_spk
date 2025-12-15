import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  // With ConfigModule set isGlobal: true in AppModule, no import needed here
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
