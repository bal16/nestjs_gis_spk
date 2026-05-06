import { Module } from '@nestjs/common';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { PrismaModule } from '../infra/database/prisma.module';

@Module({
  controllers: [BuildingController],
  providers: [BuildingService],
  imports: [PrismaModule],
  exports: [BuildingService],
})
export class BuildingModule {}
