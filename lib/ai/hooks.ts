import { useState, useCallback } from 'react';
import type { OutlineItem, ToneType, AIResponse, OutlineResponse } from './types';

// Generic API call hook
const useAIService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeAPICall = useCallback(async <T,>(
    endpoint: string, 
    body: any
  ): Promise<T> => {
    const response = await fetch(`/api/ai/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data: AIResponse<T> = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API call failed');
    }

    return data.data as T;
  }, []);

  return { makeAPICall, isLoading, setIsLoading, error, setError };
};

// Hook for AI continuation
export const useAIContinuation = () => {
  const { makeAPICall, isLoading, setIsLoading, error, setError } = useAIService();

  const generateContinuation = useCallback(async (
    content: string,
    onSuccess: (continuation: string) => void
  ) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const paragraphs = content.split('\n\n');
      const currentParagraph = paragraphs[paragraphs.length - 1];
      const previousContext = paragraphs.slice(-3, -1).join('\n\n');
      
      const continuation = await makeAPICall<string>('continue', {
        previousContext,
        currentParagraph,
      });
      
      onSuccess(continuation);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate continuation';
      setError(errorMessage);
      console.error('AI continuation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [makeAPICall, isLoading, setIsLoading, setError]);

  return { generateContinuation, isLoading, error };
};

// Hook for outline generation
export const useOutlineGeneration = () => {
  const { makeAPICall, isLoading, setIsLoading, error, setError } = useAIService();
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [showOutline, setShowOutline] = useState(false);

  const generateOutline = useCallback(async (content: string) => {
    if (isLoading || !content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await makeAPICall<OutlineResponse>('outline', { content });
      setOutline(result.outline || []);
      setShowOutline(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate outline';
      setError(errorMessage);
      console.error('Outline generation failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [makeAPICall, isLoading, setIsLoading, setError]);

  const hideOutline = useCallback(() => {
    setShowOutline(false);
  }, []);

  return { 
    generateOutline, 
    outline, 
    showOutline, 
    hideOutline,
    isLoading, 
    error 
  };
};

// Hook for tone rewriting
export const useToneRewrite = () => {
  const { makeAPICall, isLoading, setIsLoading, error, setError } = useAIService();

  const rewriteWithTone = useCallback(async (
    content: string,
    tone: ToneType,
    onSuccess: (rewrittenContent: string) => void
  ) => {
    if (isLoading || !content.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const rewrittenContent = await makeAPICall<string>('tone-rewrite', {
        content,
        tone,
      });
      
      onSuccess(rewrittenContent);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rewrite content';
      setError(errorMessage);
      console.error('Tone rewrite failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [makeAPICall, isLoading, setIsLoading, setError]);

  return { rewriteWithTone, isLoading, error };
};
