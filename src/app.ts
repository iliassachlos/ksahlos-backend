import "dotenv/config";
import express from "express";
import cors from "cors";
import photosRouter from "./routes/photo.routes.js";
import authRouter from "./routes/auth.routes.js";
import awardsRouter from "./routes/award.routes.js";
import collectionsRouter from "./routes/collection.routes.js";
import { connectToDatabase } from "./config/prisma.js";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware.js";
import { connectToCloudinary } from "./config/cloudinary.js";
import { globalLimitter } from "./middleware/rate-limit.middleware.js";
import { legacyIdSerializer } from "./middleware/serialize.middleware.js";

const PORT = process.env.PORT || "8080";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");

const app = express();

app.set("trust proxy", 1);

app.use(globalLimitter);
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());
app.use(legacyIdSerializer);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/photos", photosRouter);
app.use("/api/auth", authRouter);
app.use("/api/awards", awardsRouter);
app.use("/api/collections", collectionsRouter);

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectToDatabase();
    connectToCloudinary();

    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

await startServer();
