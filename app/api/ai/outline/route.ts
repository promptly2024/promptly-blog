import { NextRequest, NextResponse } from 'next/server';
import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import type { OutlineRequest, AIResponse, OutlineResponse } from '@/lib/ai/types';
import { createOutlinePrompt } from '@/lib/ai/prompt';

// Utility function to extract JSON from markdown code blocks
function extractJSONFromResponse(response: string): string {
  // Remove markdown code blocks if present
  const codeBlockPattern = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const match = response.match(codeBlockPattern);
  
  if (match) {
    return match[1].trim();
  }
  
  // If no code blocks, return the original response trimmed
  return response.trim();
}

export async function POST(request: NextRequest) {
  try {
    const body: OutlineRequest = await request.json();
    
    if (!body.content?.trim()) {
      return NextResponse.json<AIResponse>({
        success: false,
        error: 'Content is required'
      }, { status: 400 });
    }

    const prompt = createOutlinePrompt(body);
    const response = await generateGeminiResponse(prompt);
    
    // Extract JSON from potential markdown code blocks
    const cleanedResponse = extractJSONFromResponse(response);
    
    try {
      const outline: OutlineResponse = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!outline.outline || !Array.isArray(outline.outline)) {
        throw new Error('Invalid outline structure received');
      }

      return NextResponse.json<AIResponse<OutlineResponse>>({
        success: true,
        data: outline
      });
      
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', response);
      console.error('Cleaned response:', cleanedResponse);
      
      return NextResponse.json<AIResponse>({
        success: false,
        error: 'Failed to parse AI response as JSON'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Outline API Error:', error);
    return NextResponse.json<AIResponse>({
      success: false,
      error: 'Failed to generate outline'
    }, { status: 500 });
  }
}
