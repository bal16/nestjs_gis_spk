export class LoginUser {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly username: string,
    public readonly isAdmin: boolean,
    public readonly id: string,
    public readonly mustChangePassword: boolean = false,
  ) {}
}
