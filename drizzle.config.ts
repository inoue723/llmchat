import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./app/db/schema.ts",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "local",
    databaseId: "993fe731-ab54-45dc-8600-9008c54ba3da",
    token: process.env.CLOUDFLARE_D1_TOKEN || "local",
  },
});