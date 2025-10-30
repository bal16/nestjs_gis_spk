import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registeration.dto';
import type { Request } from 'express';
import { RefreshTokenGuard } from './strategies/refreshToken.guard';
import { AccessTokenGuard } from './strategies/accessToken.guard';
import type { CustomRequest } from '../type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() LoginDTO: LoginDTO) {
    return this.authService.authenticate(LoginDTO);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() RegistrationDTO: RegistrationDTO) {
    return await this.authService.register(RegistrationDTO);
  }

  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('refresh')
  async refresh(@Req() request: CustomRequest) {
    const authorization = request.headers.authorization!;
    const token = authorization.split(' ')[1];

    const { email } = request.user;

    return await this.authService.refresh(token, email);
  }

  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Req() request: CustomRequest) {
    const { email } = request.user;

    return await this.authService.getSession(email);
  }
}
