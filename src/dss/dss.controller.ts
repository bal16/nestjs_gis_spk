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

@Controller('dss')
export class DssController {
  constructor(private readonly dssService: DssService) {}

  // @HttpCode(HttpStatus.OK)
  // @Get('results')
  // async getResults() {
  //   const results = await this.dssService.getLastResults();

  //   return new WebResponse('Success', results, HttpStatus.OK);
  // }
  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('runs')
  async findAllResults() {
    const data = await this.dssService.findAllResults();
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('runs/lastest')
  async getLastResults() {
    const data = await this.dssService.getLastResult();
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('runs/:id')
  async getResultById(@Param('id') id: string) {
    const data = await this.dssService.getResultById(id);
    return new WebResponse('Success', data, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Get('weights')
  async getWeights() {
    const weightDatas = await this.dssService.getWeights();
    return new WebResponse('Success', weightDatas, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Put('weights')
  async updateWeights(@Body() updateWeightsDTO: BatchUpdateWeightsDTO) {
    const isUpdated = await this.dssService.updateWeights(updateWeightsDTO);
    return new WebResponse('Success', isUpdated, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Post('calculate')
  async calculate() {
    const isCreated = await this.dssService.calculateAndSave();

    return new WebResponse('Success', isCreated, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Delete('runs/details/:id')
  async deleteRunDetail(@Param('id') id: string) {
    const isDeleted = await this.dssService.deleteRunDetail(id);

    return new WebResponse('Success', isDeleted, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(AccessTokenGuard)
  @Delete('runs/:id')
  async deleteRun(@Param('id') id: string) {
    const isDeleted = await this.dssService.deleteRun(id);

    return new WebResponse('Success', isDeleted, HttpStatus.OK);
  }
}
