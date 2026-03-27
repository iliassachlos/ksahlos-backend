import express from "express";
import photosRouter from "./routes/photo.routes.js";
import "dotenv/config";
import { PORT } from "./config/globals.js";
import { connectToMongo } from "./config/mongo.js";

const app = express();

app.use(express.json());

app.use("/api/photos", photosRouter);

const startServer = async () => {
  try {
    await connectToMongo();

    app.listen(PORT, () => {
      console.log("Server is running on port " + PORT);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
