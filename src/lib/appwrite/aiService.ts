import { functions, appwriteConfig } from './api';
import { AppwriteException } from 'appwrite';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

export const getAISuggestions = async (userId: string): Promise<string[]> => {
  try {
    if (!userId) {
      console.error("UserId is undefined or empty");
      return [];
    }
    const execution = await functions.createExecution(
      appwriteConfig.aiSuggestionsFunctionId,
      JSON.stringify({ userId }),
      false
    );
    return JSON.parse(execution.responseBody).suggestions;
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    return [];
  }
};

export const generateListItems = async (Title: string): Promise<any[]> => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.generateListItemFunctionId,
      JSON.stringify({ Title }),
      false
    );
    return JSON.parse(execution.responseBody).items;
  } catch (error) {
    console.error("Error generating list items:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw new Error("Failed to generate list items");
  }
};

export const useGetAISuggestions = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_AI_SUGGESTIONS, userId],
    queryFn: () => getAISuggestions(userId),
    enabled: !!userId,
  });
};

export const generateListIdea = async (prompt: string, userId: string): Promise<string> => {
  try {
    const execution = await functions.createExecution(
      appwriteConfig.generateListIdeaFunctionId,
      JSON.stringify({ prompt, userId }),
      false
    );
    return JSON.parse(execution.responseBody).suggestions;
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
    return JSON.parse(execution.responseBody).sentiment;
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
    return JSON.parse(execution.responseBody).enhancedDescription;
  } catch (error) {
    console.error("Error enhancing list description:", error);
    if (error instanceof AppwriteException) {
      console.error("Appwrite error details:", error.message, error.code);
    }
    throw new Error("Failed to enhance list description");
  }
};