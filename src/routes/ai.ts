import express from "express";
import { getAISuggestions } from "@/services/aiService";

const router = express.Router();

router.get("/ai-suggestions", async (req, res) => {
  try {
    const suggestions = await getAISuggestions();
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI suggestions" });
  }
});

export default router;