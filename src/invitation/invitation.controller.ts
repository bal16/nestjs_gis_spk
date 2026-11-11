import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { AdminGuard } from '../auth/strategies/admin.guard';
import { WebResponse } from '../common/responses/web.response';
import { CreateInvitationDTO } from './dto/create-invitation.dto';
import { InvitationService } from './invitation.service';
import type { InvitationToken } from '../generated/prisma/client';

@Controller('invitations')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @UseGuards(AccessTokenGuard, AdminGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async create(
    @Body() dto: CreateInvitationDTO,
  ): Promise<WebResponse<InvitationToken>> {
    const invitation = await this.invitationService.create(dto);
    return new WebResponse(
      'Invitation token created successfully',
      invitation,
      HttpStatus.CREATED,
    );
  }

  @UseGuards(AccessTokenGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAll(): Promise<WebResponse<InvitationToken[]>> {
    const invitations = await this.invitationService.findAll();
    return new WebResponse('Success', invitations, HttpStatus.OK);
  }

  @HttpCode(HttpStatus.OK)
  @Get('validate/:token')
  async validate(
    @Param('token') token: string,
  ): Promise<WebResponse<{ valid: boolean; email: string | null; role: string }>> {
    const invitation = await this.invitationService.validateToken(token);
    return new WebResponse(
      'Invitation token is valid',
      {
        valid: true,
        email: invitation.email,
        role: invitation.role,
      },
      HttpStatus.OK,
    );
  }

  @UseGuards(AccessTokenGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<WebResponse<boolean>> {
    const deleted = await this.invitationService.delete(id);
    return new WebResponse(
      'Invitation token deleted successfully',
      deleted,
      HttpStatus.OK,
    );
  }
}
