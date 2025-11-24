export class LoginUser {
  constructor(
    public readonly access_token: string,
    public readonly refresh_token: string,
    public readonly username: string,
    public readonly id: string,
  ) {}
}
