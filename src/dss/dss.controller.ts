import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DssService } from './dss.service';
import { WebResponse } from '../common/responses/web.response';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';

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
}
