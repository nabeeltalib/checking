import { AppwriteException } from 'appwrite';
import { appwriteConfig, databases, functions } from './api';

export const getAISuggestions = async (userId: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/ai-suggestions');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return data.suggestions;
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      throw new Error("Invalid JSON response from AI suggestions API");
    }
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return [];
  }
};

export const generateListIdea = async (prompt: string): Promise<string> => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.generateListIdeaFunctionId,
      JSON.stringify({ prompt }),
      false
    );
    return JSON.parse(execution.response).listIdea;
  } catch (error) {
    console.error("Error generating list idea:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw new Error("Failed to generate list idea");
  }
};

export const analyzeSentiment = async (text: string): Promise<string> => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.analyzeSentimentFunctionId,
      JSON.stringify({ text }),
      false
    );
    return JSON.parse(execution.response).sentiment;
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw new Error("Failed to analyze sentiment");
  }
};

export const enhanceListDescription = async (listId: string, description: string): Promise<string> => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.enhanceDescriptionFunctionId,
      JSON.stringify({ listId, description }),
      false
    );
    return JSON.parse(execution.response).enhancedDescription;
  } catch (error) {
    console.error("Error enhancing list description:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw new Error("Failed to enhance list description");
  }
};