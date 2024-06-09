import axios from 'axios';

const API_URL = "https://cloud.appwrite.io/v1"; // Replace with your backend URL

export const fetchAISuggestions = async () => {
  try {
    const response = await axios.get(`${API_URL}/ai-suggestions`);
    return response.data.suggestions;
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return [];
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data.categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};