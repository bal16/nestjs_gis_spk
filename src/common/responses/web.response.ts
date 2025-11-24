export class WebResponse<T> {
  message: string;

  statusCode: number;

  data: T;

  constructor(message: string, data: T, statusCode = 200) {
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
  }
}
