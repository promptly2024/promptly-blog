import { NextRequest, NextResponse } from 'next/server';
import { 
  generateImageWithGemini,
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

    // Add style and aspect ratio to prompt
    prompt += ` Style: ${style.replace('-', ' ')}. Aspect ratio: ${aspectRatio}.`;

    let imageBytes: string;
    let generatedText: string | undefined;
    let mimeType: string | undefined;
    let modelUsed: string;

    try {
      // Use Gemini 2.5 Flash Image Preview
      const geminiResponse = await generateImageWithGemini(prompt);
      imageBytes = geminiResponse.imageBytes;
      generatedText = geminiResponse.text;
      mimeType = geminiResponse.mimeType;
      modelUsed = "gemini-2.5-flash-image-preview";
    } catch (error: any) {
      throw error;
    }
    
    // Upload to your media system
    const uploadResponse = await fetch(`${request.nextUrl.origin}/api/media/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBytes: imageBytes,
        altText: `AI generated: ${title}`,
        provider: 'gemini-image',
        type: 'generated',
        mimeType: mimeType
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
      generatedText: generatedText || null,
      model: modelUsed,
      mimeType: mimeType
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' }, 
      { status: 500 }
    );
  }
}
