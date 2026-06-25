import "dotenv/config";
import OpenAI from "openai";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    console.error("OPENAI_API_KEY is missing in server/.env");
    process.exit(1);
  }

  const client = new OpenAI({ apiKey });

  await client.models.list();
  console.log("OPENAI_API_KEY is configured and accepted by the OpenAI API.");
}

main().catch((error) => {
  console.error("OpenAI key check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
