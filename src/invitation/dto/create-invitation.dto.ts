import { IsEmail, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class CreateInvitationDTO {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsIn(['user', 'admin'])
  role?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}
