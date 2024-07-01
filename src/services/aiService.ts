import { OpenAI } from 'openai'; // or whatever AI service you're using

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getAISuggestions = async (): Promise<string[]> => {
  try {
    const response = await openai.completions.create({
      model: "text-davinci-003",
      prompt: "Suggest 3 interesting list ideas:",
      max_tokens: 100,
      n: 3,
    });

    return response.choices.map(choice => choice.text.trim());
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    throw new Error("Failed to generate AI suggestions");
  }
};