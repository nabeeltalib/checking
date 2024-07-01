import express from "express";
import { getAISuggestions } from "@/services/aiService";

const router = express.Router();

router.get("/ai-suggestions", async (req, res) => {
  try {
    const suggestions = await getAISuggestions();
    res.json({ suggestions });
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    res.status(500).json({ error: "Failed to fetch AI suggestions", details: error.message });
  }
});

export default router;