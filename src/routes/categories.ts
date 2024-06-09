import express from "express";
import { getCategories } from "@/services/categoryService";

const router = express.Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await getCategories();
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

export default router;