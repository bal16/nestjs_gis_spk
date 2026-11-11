export default () => ({
  JWT_SECRET: process.env.JWT_SECRET || 'jwt-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'jwt-refresh-secret',
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
});

export interface EnvironmentVariables {
  JWT_REFRESH_SECRET: string;
  JWT_SECRET: string;
  PORT?: number;
  CORS_ORIGIN?: string;
}
