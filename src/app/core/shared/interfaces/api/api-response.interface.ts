export interface iApiResponse<T> {
  data: T;
  message: string;
  error: boolean;
}
