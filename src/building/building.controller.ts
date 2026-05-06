import { Body, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { BuildingService } from './building.service';
import { WebResponse } from '../common/responses/web.response';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    const buildings = await this.buildingService.findAll();

    return new WebResponse('Success', buildings, HttpStatus.OK);
  }
}
