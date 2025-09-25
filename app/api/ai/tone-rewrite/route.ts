import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import type { ToneRewriteRequest, AIResponse } from '@/lib/ai/types';
import { createToneRewritePrompt } from '@/lib/ai/prompt';

export async function POST(request: NextRequest) {
  try {
    const body: ToneRewriteRequest = await request.json();
    
    if (!body.content?.trim()) {
      return NextResponse.json<AIResponse>({
        success: false,
        error: 'Content is required'
      }, { status: 400 });
    }

    if (!body.tone || !['friendly', 'professional', 'concise'].includes(body.tone)) {
      return NextResponse.json<AIResponse>({
        success: false,
        error: 'Valid tone is required (friendly, professional, concise)'
      }, { status: 400 });
    }

    const prompt = createToneRewritePrompt(body);
    const rewrittenContent = await generateGeminiResponse(prompt);

    return NextResponse.json<AIResponse>({
      success: true,
      data: rewrittenContent
    });

  } catch (error) {
    console.error('Tone Rewrite API Error:', error);
    return NextResponse.json<AIResponse>({
      success: false,
      error: 'Failed to rewrite content'
    }, { status: 500 });
  }
}
