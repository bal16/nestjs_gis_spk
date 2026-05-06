import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BuildingService } from './building.service';
import { WebResponse } from '../common/responses/web.response';
import { CreateBuildingDTO } from './dto/create-building.dto';
import { UpdateBuildingDTO } from './dto/update-building.dto';
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

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':id')
  async update(
    @Body() updateBuildingDTO: UpdateBuildingDTO,
    @Param('id') id: string,
  ) {
    const buildings = await this.buildingService.update(updateBuildingDTO, id);

    return new WebResponse(
      'Building updated successfully',
      buildings,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const isDeleted = await this.buildingService.delete(id);

    return new WebResponse(
      'Building deleted successfully',
      isDeleted,
      HttpStatus.OK,
    );
  }
}
