import { Router } from "express";
import { CollectionController } from "../controllers/collection.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", CollectionController.getCollections);

router.patch("/rearrange", authenticate, CollectionController.rearrange);

router.post("/", authenticate, CollectionController.create);

router.patch("/:id/cover", authenticate, CollectionController.setCover);
router.patch("/:id", authenticate, CollectionController.update);
router.delete("/:id", authenticate, CollectionController.delete);

router.get("/:slug", CollectionController.getBySlug);

export default router;