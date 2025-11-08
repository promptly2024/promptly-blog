import { GoogleGenAI } from "@google/genai";

export const generateGeminiResponse = async (prompt: string) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-001",
      contents: prompt,
    });

    const text = response.text;
      
    if (!text) {
      throw new Error("No text generated in response");
    }
      return text;
  } 
  catch (error: any) {
      throw new Error(`Gemini response generation failed: ${error.message}`);
  }
};
