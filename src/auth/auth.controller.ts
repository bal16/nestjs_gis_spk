import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
  Delete,
} from '@nestjs/common';

import { AuthService } from './auth.service';

import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registeration.dto';

import { WebResponse } from '../common/responses/web.response';
import { LoginUser } from './entities/login.entity';
import { RegisteredUser } from './entities/register.entity';
import { CurrentUser } from './entities/current.entity';

import { RefreshTokenGuard } from './strategies/refreshToken.guard';
import { AccessTokenGuard } from './strategies/accessToken.guard';

import type { CustomRequest } from '../type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() LoginDTO: LoginDTO): Promise<WebResponse<LoginUser>> {
    const user = await this.authService.signIn(LoginDTO);

    return new WebResponse('Success', user, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(
    @Body() RegistrationDTO: RegistrationDTO,
  ): Promise<WebResponse<RegisteredUser>> {
    const user = await this.authService.register(RegistrationDTO);

    return new WebResponse(
      'User successfully registered',
      user,
      HttpStatus.CREATED,
    );
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(
    @Req() request: CustomRequest,
  ): Promise<WebResponse<LoginUser>> {
    const authorization = request.headers.authorization!;
    const token = authorization.split(' ')[1];

    const { email } = request.user;

    const user = await this.authService.refresh(token, email);

    return new WebResponse('Success', user, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(
    @Req() request: CustomRequest,
  ): Promise<WebResponse<CurrentUser>> {
    const { email } = request.user;

    const user = await this.authService.getSession(email);

    return new WebResponse('Success', user, HttpStatus.OK);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('session')
  async logout(@Req() request: CustomRequest): Promise<WebResponse<null>> {
    const { sub } = request.user;

    await this.authService.logout(sub);

    return new WebResponse('Success', null, HttpStatus.OK);
  }
}
