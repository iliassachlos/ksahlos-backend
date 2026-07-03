import { Router } from "express";
import { AwardController } from "../controllers/award.controller.js";
import multer from "multer";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", AwardController.getAwards);

router.post(
  "/",
  authenticate,
  upload.single("image"),
  AwardController.create,
);

router.patch("/rearrange", authenticate, AwardController.rearrange);

router.delete("/:id", authenticate, AwardController.delete);

export default router;
