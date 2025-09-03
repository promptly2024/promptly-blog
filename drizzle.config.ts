// drizzle.config.ts
import type { Config } from "drizzle-kit";

export default {
    schema: "./db/schema",
    out: "./drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.DB_HOST!,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        ssl: true
        // Optionally add: port: Number(process.env.DB_PORT), ssl: true
    },
} satisfies Config;
