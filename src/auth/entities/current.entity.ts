import { Exclude } from 'class-transformer';
import type { User } from 'generated/prisma';

export class CurrentUser implements User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly avatar: string | null,
    public readonly isAdmin: boolean,
  ) {}

  @Exclude()
  token: string | null;

  @Exclude()
  password: string;
}
