import express from "express";
import aiRoutes from "./ai";
import categoryRoutes from "./categories";

const router = express.Router();

router.use("/api", aiRoutes);
router.use("/api", categoryRoutes);

export default router;