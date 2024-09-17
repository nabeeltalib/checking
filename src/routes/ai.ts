// import express from "express";
import { generateListItems, getAISuggestions } from '@/services/aiService';

// const router = express.Router();

// router.get("/ai-suggestions", async (req, res) => {
//   try {
//     const suggestions = await getAISuggestions();
//     res.json({ suggestions });
//   } catch (error) {
//     console.error("Error fetching AI suggestions:", error);
//     res.status(500).json({ error: "Failed to fetch AI suggestions", details: error.message });
//   }
// });

// export default router;

export const getAISuggestionsRoute = (userId: string): Promise<any[]> =>
  new Promise(async (resolve, reject) => {
    try {
      const suggestions = await getAISuggestions(userId);
      console.log("asdsadas: ",suggestions)

      return resolve(suggestions);
    } catch (error: any) {
      console.error('Error fetching AI suggestions:', error);
      return reject({
        error: 'Failed to fetch AI suggestions',
        details: error.message
      });
    }
  });

  
export const generateListItem = (Title: object): Promise<any[]> =>
  new Promise(async (resolve, reject) => {
    try {
      const items = await generateListItems(Title);

      return resolve(items);
    } catch (error: any) {
      console.error('Error fetching AI suggestions:', error);
      return reject({
        error: 'Failed to fetch AI suggestions',
        details: error.message
      });
    }
  });
