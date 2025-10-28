import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class RegistrationDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsAlphanumeric()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export type RegistrationResponse = {
  id: string;
  username: string;
  email: string;
};
