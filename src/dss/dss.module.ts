import { Module } from '@nestjs/common';
import { DssController } from './dss.controller';
import { DssService } from './dss.service';
import { BuildingModule } from '../building/building.module';
import { PrismaModule } from '../infra/database/prisma.module';

@Module({
  providers: [DssService],
  controllers: [DssController],
  imports: [PrismaModule, BuildingModule],
})
export class DssModule {}
