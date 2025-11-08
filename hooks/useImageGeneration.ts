import { useState } from 'react';
import { toast } from 'sonner';

interface GenerateImageOptions {
  title?: string;
  contentMD?: string;
  type?: 'blog-cover' | 'social';
  platform?: 'twitter' | 'linkedin' | 'instagram';
  customPrompt?: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  style?: string;
}

interface DBResponse {
  id: string;
  createdAt: Date;
  url: string;
  type: string;
  provider: string;
  altText: string | null;
  createdBy: string | null;
}

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<DBResponse | null>(null);
  const [usedPrompt, setUsedPrompt] = useState<string>('');
  const [usedModel, setUsedModel] = useState<string>('');

  const generateImage = async (options: GenerateImageOptions) => {
    if (!options.title && !options.customPrompt) {
      toast.error('Title or custom prompt is required');
      return null;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.media);
      setUsedPrompt(data.prompt);
      setUsedModel(data.model);
      
      toast.success('Image Generated Successfully!', {
        description: 'Created using Imagen 4.0'
      });

      return data.media;
    } catch (error: any) {
      toast.error('Generation Failed', {
        description: error.message
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const resetGeneration = () => {
    setGeneratedImage(null);
    setUsedPrompt('');
    setUsedModel('');
  };

  return {
    generateImage,
    isGenerating,
    generatedImage,
    usedPrompt,
    usedModel,
    resetGeneration
  };
};
