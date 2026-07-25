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
import { DssService } from './dss.service';
import { BatchUpdateWeightsDTO } from './dto/update-weights.dto';
import { SawRunEntity } from './entities/saw-run.entity';
import { WeightConfigurationEntity } from './entities/weight-configuration.entity';

@Controller('dss')
export class DssController {
  constructor(private readonly dssService: DssService) {}

  // @HttpCode(HttpStatus.OK)
  // @Get('results')
  // async getResults() {
  //   const results = await this.dssService.getLastResults();

  //   return new WebResponse('Success', results, HttpStatus.OK);
  // }
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('runs')
  async findAllResults(): Promise<WebResponse<SawRunEntity[]>> {
    const data = await this.dssService.findAllResults();
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('runs/lastest')
  async getLastResults(): Promise<WebResponse<SawRunEntity | null>> {
    const data = await this.dssService.getLastResult();
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('runs/:id')
  async getResultById(
    @Param('id') id: string,
  ): Promise<WebResponse<SawRunEntity | null>> {
    const data = await this.dssService.getResultById(id);
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('weights')
  async getWeights(): Promise<WebResponse<WeightConfigurationEntity[]>> {
    const weightDatas = await this.dssService.getWeights();
    return new WebResponse('Success', weightDatas, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Put('weights')
  async updateWeights(
    @Body() updateWeightsDTO: BatchUpdateWeightsDTO,
  ): Promise<WebResponse<boolean>> {
    const isUpdated = await this.dssService.updateWeights(updateWeightsDTO);
    return new WebResponse(
      'Weights updated successfully',
      isUpdated,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Post('calculate')
  async calculate(): Promise<WebResponse<boolean>> {
    const isCreated = await this.dssService.calculateAndSave();

    return new WebResponse(
      'Calculation executed successfully',
      isCreated,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('runs/details/:id')
  async deleteRunDetail(
    @Param('id') id: string,
  ): Promise<WebResponse<boolean>> {
    const isDeleted = await this.dssService.deleteRunDetail(id);

    return new WebResponse(
      'Run detail deleted successfully',
      isDeleted,
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('runs/:id')
  async deleteRun(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const isDeleted = await this.dssService.deleteRun(id);

    return new WebResponse(
      'Run deleted successfully',
      isDeleted,
      HttpStatus.OK,
    );
  }
}
