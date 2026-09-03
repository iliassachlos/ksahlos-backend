import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma 7 reads migration/CLI settings from here rather than from
// schema.prisma. The runtime connection is created in src/config/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
