import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateGeminiResponse = async (prompt: string) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    return result.response.text();
    // return { intent: "other", reply: "I'm sorry, but I cannot assist with that." };
};
