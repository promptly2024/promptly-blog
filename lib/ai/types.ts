export interface AIRequest {
  content: string;
  context?: string;
}

export interface ContinuationRequest extends AIRequest {
  previousContext: string;
  currentParagraph: string;
}

export interface OutlineRequest extends AIRequest {}

export interface ToneRewriteRequest extends AIRequest {
  tone: ToneType;
}

export interface OutlineItem {
  level: number;
  title: string;
  needsDetail: boolean;
  needsSources: boolean;
  needsExamples: boolean;
}

export interface OutlineResponse {
  outline: OutlineItem[];
}

export type ToneType = 'friendly' | 'professional' | 'concise';

export interface AIResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
}
