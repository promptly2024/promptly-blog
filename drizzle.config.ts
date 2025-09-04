import { defineConfig } from "drizzle-kit";
import "dotenv/config";

// if (!process.env.DATABASE_URL) {
//     throw new Error("DATABASE_URL is not defined");
// }

export default defineConfig({
    dialect: "postgresql",
    schema: "./db/schema.ts",
    out: "./db/migrations",
    dbCredentials: {
        url: process.env.DATABASE_URL || "postgresql://postgres:12345@localhost:5432/promptlyblog",
        ssl: true
    }
});