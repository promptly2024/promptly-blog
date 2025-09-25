import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import type { ContinuationRequest, AIResponse } from '@/lib/ai/types';
import { createContinuationPrompt } from '@/lib/ai/prompt';

export async function POST(request: NextRequest) {
  try {
    const body: ContinuationRequest = await request.json();
    
    if (!body.previousContext || !body.currentParagraph) {
      return NextResponse.json<AIResponse>({
        success: false,
        error: 'Previous context and current paragraph are required'
      }, { status: 400 });
    }

    const prompt = createContinuationPrompt(body);
    const continuation = await generateGeminiResponse(prompt);

    return NextResponse.json<AIResponse>({
      success: true,
      data: continuation
    });

  } catch (error) {
    console.error('Continuation API Error:', error);
    return NextResponse.json<AIResponse>({
      success: false,
      error: 'Failed to generate continuation'
    }, { status: 500 });
  }
}
