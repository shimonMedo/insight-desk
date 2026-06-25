type RequiredEnv = {
  databaseUrl: string;
  openAiApiKey: string | null;
  port: number;
  clientUrl: string;
};

export function readEnv(): RequiredEnv {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return {
    databaseUrl,
    openAiApiKey: process.env.OPENAI_API_KEY || null,
    port: Number(process.env.PORT ?? 3002),
    clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000",
  };
}
