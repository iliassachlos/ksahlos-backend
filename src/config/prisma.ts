import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// Prisma 7 needs a driver adapter rather than a connection string in the
// schema. MySQL and MariaDB share a wire protocol, so this adapter serves the
// MySQL database that Plesk provides.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaMariaDb(connectionString);

export const prisma = new PrismaClient({ adapter });

export const connectToDatabase = async () => {
  await prisma.$connect();

  console.info("Connected to MySQL");
};

export const disconnectFromDatabase = async () => {
  await prisma.$disconnect();
};
