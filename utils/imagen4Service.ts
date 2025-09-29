import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType?: string;
}

// Used Gemini 2.5 Flash Image Preview
export const generateImageWithGemini = async (
  prompt: string
): Promise<{ imageBytes: string; text?: string; mimeType?: string }> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-image-preview" 
  });

  try {
    const result = await model.generateContent([prompt]);
    const response = result.response;
    
    let imageBytes = "";
    let text = "";
    let mimeType = "";
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.text) {
        text += part.text;
      } else if (part.inlineData) {
        imageBytes = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
      }
    }

    if (!imageBytes) {
      throw new Error("No image generated in response");
    }

    return { imageBytes, text, mimeType };
  } catch (error: any) {
    throw new Error(`Gemini image generation failed: ${error.message}`);
  }
};

// Enhanced prompt generation with better context
export const generateBlogCoverPrompt = (title: string, contentMD?: string): string => {
  let contextualInfo = "";
  if (contentMD) {
    const words = contentMD.toLowerCase().split(/\s+/).slice(0, 150);
    const keywords = words.filter(word => 
      word.length > 4 && 
      !['this', 'that', 'with', 'have', 'will', 'from', 'they', 'been', 'said', 'each', 'which', 'their', 'about', 'could', 'there', 'other'].includes(word)
    ).slice(0, 12);
    
    if (keywords.length > 0) {
      contextualInfo = `. Related concepts: ${keywords.join(', ')}`;
    }
  }

  return `Create a professional blog cover image for "${title}"${contextualInfo}. Design should be modern, clean, and visually striking with high contrast elements. Include subtle text overlay space, use contemporary color palette, ensure social media compatibility. Style: minimalist, professional, eye-catching. Format: 16:9 aspect ratio, high resolution.`;
};

// Social media optimized prompt
export const generateSocialImagePrompt = (title: string, platform: 'twitter' | 'linkedin' | 'instagram' = 'twitter'): string => {
  const platformSpecs = {
    twitter: "Twitter/X post image, 16:9 ratio, bold text overlay",
    linkedin: "LinkedIn article cover, professional aesthetic, 16:9 ratio", 
    instagram: "Instagram post image, square 1:1 ratio, vibrant and engaging"
  };

  return `${platformSpecs[platform]} for "${title}". Modern design, high contrast text, social media optimized, attention-grabbing visual elements, brand-friendly color scheme.`;
};
