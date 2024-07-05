// import express from "express";
import { getCategories } from "@/lib/appwrite/api";

// const router = express.Router();

// router.get("/categories", async (req, res) => {
//   try {
//     const categories = await getCategories();
//     res.json({ categories });
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     res.status(500).json({ error: "Failed to fetch categories", details: error.message });
//   }
// });

// export default router;

export const getCategoriesRoute = (): Promise<any[]> =>
  new Promise(async (resolve, reject) => {
    try {
      const categories = await getCategories();

      return resolve(categories);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return reject({
        error: 'Failed to fetch categories',
        details: error.message
      });
    }
  });
