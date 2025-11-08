import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { 
  generateBlogCoverPrompt,
  generateSocialImagePrompt 
} from '@/utils/imagen4Service';

export async function POST(request: NextRequest) {
  try {
    const { 
      title, 
      contentMD, 
      type = 'blog-cover', 
      platform, 
      customPrompt,
      aspectRatio = '16:9',
      style = 'modern-professional'
    } = await request.json();

    if (!title && !customPrompt) {
      return NextResponse.json({ error: 'Title or custom prompt is required' }, { status: 400 });
    }

    let prompt: string;
    if (customPrompt) {
      prompt = customPrompt;
    } else {
      switch (type) {
        case 'social':
          prompt = generateSocialImagePrompt(title, platform);
          break;
        case 'blog-cover':
        default:
          prompt = generateBlogCoverPrompt(title, contentMD);
          break;
      }
    }

    prompt += ` Style: ${style.replace('-', ' ')}.`;

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
      console.error("Response structure:", JSON.stringify(response, null, 2));
      throw new Error("No images generated in response");
    }
    
    const imageData = generatedImage as any;
    const imageBytes = imageData.image?.imageBytes || imageData.imageBytes;
    
    if (!imageBytes) {
      console.error("Generated image structure:", JSON.stringify(generatedImage, null, 2));
      throw new Error("No image bytes found in response");
    }

    const modelUsed = "imagen-4.0-generate-001";
    
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBytes: imageBytes,
        altText: `AI generated: ${title}`,
        provider: 'imagen-4',
        type: 'generated',
        mimeType: 'image/png'
      }),
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      throw new Error(errorData.error || 'Failed to upload generated image');
    }

    const uploadData = await uploadResponse.json();
    
    return NextResponse.json({
      success: true,
      media: uploadData.media,
      prompt: prompt,
      model: modelUsed,
      mimeType: 'image/png'
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' }, 
      { status: 500 }
    );
  }
}
