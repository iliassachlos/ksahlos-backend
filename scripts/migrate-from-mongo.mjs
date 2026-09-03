/**
 * One-off migration: MongoDB Atlas -> MySQL (Prisma).
 *
 * Run locally, where the Atlas connection works:
 *   MONGO_DB_URI=... DATABASE_URL=... node scripts/migrate-from-mongo.mjs
 *
 * Mongo ObjectIds are carried over as the new primary keys (they are strings,
 * and the schema uses string ids), so existing relationships stay intact and
 * the script can safely be re-run: every write is an upsert.
 */
import "dotenv/config";
import { MongoClient } from "mongodb";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const mongoUri = process.env.MONGO_DB_URI;
const databaseUrl = process.env.DATABASE_URL;

if (!mongoUri) throw new Error("MONGO_DB_URI is not set");
if (!databaseUrl) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(databaseUrl) });
const mongo = new MongoClient(mongoUri);

const id = (value) => (value ? String(value) : null);

const run = async () => {
  await mongo.connect();
  const db = mongo.db();

  const admins = await db.collection("admins").find().toArray();
  const collections = await db.collection("collections").find().toArray();
  const photos = await db.collection("photos").find().toArray();
  const awards = await db.collection("awards").find().toArray();

  console.log(
    `Found: ${admins.length} admins, ${collections.length} collections, ` +
      `${photos.length} photos, ${awards.length} awards`,
  );

  for (const admin of admins) {
    await prisma.admin.upsert({
      where: { id: id(admin._id) },
      update: { username: admin.username, password: admin.password },
      create: {
        id: id(admin._id),
        username: admin.username,
        password: admin.password,
      },
    });
  }
  console.log(`Migrated ${admins.length} admins`);

  // Collections first, without covers: a cover points at a photo that does not
  // exist yet. Covers are applied in a third pass below.
  for (const collection of collections) {
    const data = {
      title: collection.title,
      slug: collection.slug,
      order: collection.order ?? 0,
      visibility: collection.visibility ?? true,
      createdAt: collection.createdAt ?? new Date(),
      updatedAt: collection.updatedAt ?? new Date(),
    };

    await prisma.collection.upsert({
      where: { id: id(collection._id) },
      update: data,
      create: { id: id(collection._id), ...data },
    });
  }
  console.log(`Migrated ${collections.length} collections`);

  for (const photo of photos) {
    const data = {
      title: photo.title,
      description: photo.description ?? "",
      url: photo.url,
      number: photo.number,
      visibility: photo.visibility ?? true,
      hero: photo.hero ?? false,
      cloudinaryId: photo.cloudinaryId,
      collectionId: id(photo.collectionId),
      createdAt: photo.createdAt ?? new Date(),
      updatedAt: photo.updatedAt ?? new Date(),
    };

    await prisma.photo.upsert({
      where: { id: id(photo._id) },
      update: data,
      create: { id: id(photo._id), ...data },
    });
  }
  console.log(`Migrated ${photos.length} photos`);

  // Now that photos exist, wire up the admin-chosen covers.
  let coversSet = 0;
  for (const collection of collections) {
    const coverPhotoId = id(collection.coverPhotoId);
    if (!coverPhotoId) continue;

    const exists = await prisma.photo.findUnique({
      where: { id: coverPhotoId },
      select: { id: true },
    });
    if (!exists) {
      console.warn(
        `Collection ${collection.slug}: cover photo ${coverPhotoId} not found, skipping`,
      );
      continue;
    }

    await prisma.collection.update({
      where: { id: id(collection._id) },
      data: { coverPhotoId },
    });
    coversSet++;
  }
  console.log(`Set ${coversSet} collection covers`);

  for (const award of awards) {
    const data = {
      url: award.url,
      cloudinaryId: award.cloudinaryId,
      order: award.order ?? 0,
      createdAt: award.createdAt ?? new Date(),
      updatedAt: award.updatedAt ?? new Date(),
    };

    await prisma.award.upsert({
      where: { id: id(award._id) },
      update: data,
      create: { id: id(award._id), ...data },
    });
  }
  console.log(`Migrated ${awards.length} awards`);

  console.log("Migration complete.");
};

run()
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongo.close();
    await prisma.$disconnect();
  });
