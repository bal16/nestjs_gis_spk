import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BuildingService } from './building.service';
import { WebResponse } from '../common/responses/web.response';
import { CreateBuildingDTO } from './dto/create-building.dto';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll() {
    const buildings = await this.buildingService.findAll();

    return new WebResponse('Success', buildings, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(@Body() createBuildingDTO: CreateBuildingDTO) {
    const buildings = await this.buildingService.create(createBuildingDTO);

    return new WebResponse(
      'Building created successfully',
      buildings,
      HttpStatus.CREATED,
    );
  }
}
