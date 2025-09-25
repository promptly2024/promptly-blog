import type { ContinuationRequest, OutlineRequest, ToneRewriteRequest, ToneType } from './types';

export const createContinuationPrompt = ({
  previousContext,
  currentParagraph,
}: ContinuationRequest): string => {
  return `Continue writing from where the user left off. Here's the context:

Previous context:
${previousContext}

Current paragraph being written:
${currentParagraph}

Instructions:
- Continue naturally from the current paragraph
- Maintain the same tone and style
- Keep the continuation relevant to the context
- Write 2-3 sentences that flow seamlessly
- If the current paragraph seems complete, start a new paragraph

IMPORTANT: Return only the continuation text, no explanations, no markdown formatting, no code blocks.`;
};

export const createOutlinePrompt = ({ content }: OutlineRequest): string => {
  return `Analyze this markdown content and suggest an improved H1-H3 structure. Also identify areas needing more detail, sources, or examples:

Content:
${content}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no markdown code blocks, no explanations
- Do not wrap the response in \`\`\`json or any other formatting
- The response will be parsed directly with JSON.parse()

Return a JSON response with this EXACT structure:
{
  "outline": [
    {
      "level": 1,
      "title": "Header title",
      "needsDetail": true,
      "needsSources": false,
      "needsExamples": true
    }
  ]
}

Guidelines:
- Suggest logical H1-H3 headers based on content
- Mark sections that need more detail, sources, or examples
- Keep titles concise and descriptive
- Ensure proper hierarchy (H1 > H2 > H3)
- level must be 1, 2, or 3
- needsDetail, needsSources, needsExamples must be boolean values

Return only the JSON object, nothing else.`;
};

const TONE_INSTRUCTIONS: Record<ToneType, string> = {
  friendly: "Make the tone warm, conversational, and approachable. Use contractions and casual language where appropriate.",
  professional: "Use formal language, clear structure, and authoritative tone. Avoid contractions and casual expressions.",
  concise: "Make the content more concise and to-the-point. Remove unnecessary words and redundancy while keeping key information."
};

export const createToneRewritePrompt = ({ content, tone }: ToneRewriteRequest): string => {
  return `Rewrite this markdown content with a ${tone} tone:

Original content:
${content}

Instructions:
${TONE_INSTRUCTIONS[tone]}

Requirements:
- Maintain all markdown formatting
- Keep the same structure and headers
- Preserve technical accuracy
- Return only the rewritten content, no explanations, no markdown code blocks`;
};
