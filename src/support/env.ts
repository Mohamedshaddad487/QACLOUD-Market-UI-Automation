let dotEnvLoaded = false;

function loadDotEnvFileIfPresent(): void {
  try {
    process.loadEnvFile();
  } catch {
    return;
  }
}

function ensureDotEnvLoaded(): void {
  if (dotEnvLoaded) return;
  dotEnvLoaded = true;
  loadDotEnvFileIfPresent();
}

function requireEnv(name: string): string {
  ensureDotEnvLoaded();
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill it in, or set it as a CI secret.`,
    );
  }
  return value;
}

export function getBaseUrl(): string {
  ensureDotEnvLoaded();
  return process.env.BASE_URL ?? 'https://www.qacloud.dev';
}

export function getCredentials(): { identifier: string; password: string } {
  return {
    identifier: requireEnv('MARKET_EMAIL'),
    password: requireEnv('MARKET_PASSWORD'),
  };
}
