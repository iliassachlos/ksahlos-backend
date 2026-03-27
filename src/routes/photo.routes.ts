import { Router } from "express";
import status from "http-status";

const router = Router();

router.get("/hello", (req, res) => {
  res.status(status.OK).json({ message: "Hello, World!" });
});

export default router;
