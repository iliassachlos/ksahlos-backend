import mongoose from "mongoose";

export const connectToMongo = async () => {
  const mongoUri = process.env.MONGO_DB_URI;

  if (!mongoUri) {
    throw new Error("MONGO_DB_URI is not defined in environment variables");
  }

  await mongoose.connect(mongoUri);

  console.info("Connected to MongoDB");
};
