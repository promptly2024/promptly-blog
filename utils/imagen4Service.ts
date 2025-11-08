import { GoogleGenAI } from "@google/genai";

export interface GeneratedImageResult {
  imageBytes: string;
  mimeType?: string;
}

export const generateImageWithGemini = async (
  prompt: string,
  aspectRatio: string = "16:9"
): Promise<{ imageBytes: string; mimeType?: string }> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: "image/png",
      },
    });

    const generatedImage = response.generatedImages?.[0];
    
    if (!generatedImage) {
      throw new Error("No image generated in response");
    }
    
    const imageData = generatedImage as any;
    const imageBytes = imageData.image?.imageBytes || imageData.imageBytes;
    
    if (!imageBytes) {
      console.error("Generated image object:", JSON.stringify(generatedImage, null, 2));
      throw new Error("Could not extract image bytes from response");
    }

    return {
      imageBytes: imageBytes,
      mimeType: "image/png",
    };
  } catch (error: any) {
    throw new Error(`Imagen generation failed: ${error.message}`);
  }
};

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

export const generateSocialImagePrompt = (title: string, platform: 'twitter' | 'linkedin' | 'instagram' = 'twitter'): string => {
  const platformSpecs = {
    twitter: "Twitter/X post image, 16:9 ratio, bold text overlay",
    linkedin: "LinkedIn article cover, professional aesthetic, 16:9 ratio", 
    instagram: "Instagram post image, square 1:1 ratio, vibrant and engaging"
  };

  return `${platformSpecs[platform]} for "${title}". Modern design, high contrast text, social media optimized, attention-grabbing visual elements, brand-friendly color scheme.`;
};
