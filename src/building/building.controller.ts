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
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { WebResponse } from '../common/responses/web.response';
import { BuildingService } from './building.service';
import { CreateAssessmentDTO } from './dto/create-assessment.dto';
import { CreateBuildingDTO } from './dto/create-building.dto';
import { UpdateAssessmentDTO } from './dto/update-assessment.dto';
import { UpdateBuildingDTO } from './dto/update-building.dto';
import { BuildingEntity } from './entities/building.entity';
import { AssessmentEntity } from './entities/assessment.entity';

@Controller('buildings')
export class BuildingController {
  constructor(private readonly buildingService: BuildingService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<WebResponse<BuildingEntity[]>> {
    const buildings = await this.buildingService.findAll();

    return new WebResponse('Success', buildings, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() createBuildingDTO: CreateBuildingDTO,
  ): Promise<WebResponse<BuildingEntity>> {
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
  ): Promise<WebResponse<BuildingEntity>> {
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
  async delete(@Param('id') id: string): Promise<WebResponse<unknown>> {
    const isDeleted = await this.buildingService.delete(id);

    return new WebResponse(
      'Building deleted successfully',
      isDeleted,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':code/assessments')
  async findAssessments(
    @Param('code') code: string,
  ): Promise<WebResponse<BuildingEntity | null>> {
    const assessments = await this.buildingService.findOneWithAssessments(code);

    return new WebResponse('Success', assessments, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':code/assessments')
  async createAssessment(
    @Param('code') id: string,
    @Body() createAssessmentDTO: CreateAssessmentDTO,
  ): Promise<WebResponse<AssessmentEntity>> {
    const assessment = await this.buildingService.createAssessment(
      id,
      createAssessmentDTO,
    );

    return new WebResponse(
      'Assessment created successfully',
      assessment,
      HttpStatus.CREATED,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Put(':code/assessments/:assessmentId')
  async updateAssessment(
    @Param('code') code: string,
    @Param('assessmentId') assessmentId: string,
    @Body() updateAssessmentDTO: UpdateAssessmentDTO,
  ): Promise<WebResponse<AssessmentEntity>> {
    const assessment = await this.buildingService.updateAssessment(
      code,
      assessmentId,
      updateAssessmentDTO,
    );

    return new WebResponse(
      'Assessment updated successfully',
      assessment,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('/assessments/:assessmentId')
  async deleteAssessment(
    @Param('assessmentId') assessmentId: string,
  ): Promise<WebResponse<unknown>> {
    const isDeleted = await this.buildingService.deleteAssessment(assessmentId);

    return new WebResponse(
      'Assessment deleted successfully',
      isDeleted,
      HttpStatus.OK,
    );
  }
}

