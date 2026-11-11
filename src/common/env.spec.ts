import envConfig, { EnvironmentVariables } from './env';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // Clears the cache
    process.env = { ...originalEnv }; // Make a copy
  });

  afterAll(() => {
    process.env = originalEnv; // Restore original env
  });

  it('should return default values when environment variables are not set', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.PORT;
    delete process.env.CORS_ORIGIN;

    // We must import the module here to re-evaluate it with the modified process.env
    const config = (envConfig as unknown as () => EnvironmentVariables)();

    expect(config).toEqual({
      JWT_SECRET: 'jwt-secret',
      JWT_REFRESH_SECRET: 'jwt-refresh-secret',
      PORT: 3000,
      CORS_ORIGIN: 'http://localhost:3000',
    });
  });

  it('should return values from environment variables when they are set', () => {
    // Set custom values for the environment variables
    process.env.JWT_SECRET = 'my-custom-secret';
    process.env.JWT_REFRESH_SECRET = 'my-custom-refresh-secret';
    process.env.PORT = '8080';
    process.env.CORS_ORIGIN = 'https://app.ft.unnes.ac.id';

    const config = (envConfig as unknown as () => EnvironmentVariables)();

    expect(config).toEqual({
      JWT_SECRET: 'my-custom-secret',
      JWT_REFRESH_SECRET: 'my-custom-refresh-secret',
      PORT: 8080,
      CORS_ORIGIN: 'https://app.ft.unnes.ac.id',
    });
  });
});
