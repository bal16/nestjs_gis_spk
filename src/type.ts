export interface IResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}
