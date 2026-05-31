import { Router } from "express";
import { PhotoController } from "../controllers/photo.controller.js";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", PhotoController.getPhotos);
router.post(
  "/create",
  authenticate,
  upload.single("image"),
  PhotoController.create,
);

export default router;
