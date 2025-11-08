import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { content, currentTitle } = await req.json();
        
        if (!content?.trim() && !currentTitle?.trim()) {
            return NextResponse.json(
                { error: 'Either content or current title is required' }, 
                { status: 400 }
            );
        }

        let prompt: string;

        if (currentTitle?.trim() && content?.trim()) {
            // Both title and content provided - improve the existing title
            prompt = `Based on the current title and blog content below, generate 3 improved, engaging, SEO-friendly titles. The new titles should be better than the current one while staying true to the content.

Current Title: "${currentTitle}"

Blog Content:
${content}

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them more catchy and engaging than the current title
- Ensure they accurately reflect the content
- Use action words and power words when appropriate
- Focus on click-worthiness while maintaining accuracy

Return only the 3 improved titles, each on a new line:`;

        } else if (currentTitle?.trim()) {
            // Only title provided - enhance the existing title
            prompt = `Improve and enhance the following title to make it more engaging, SEO-friendly, and click-worthy. Generate 3 variations:

Current Title: "${currentTitle}"

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them more catchy and engaging
- Use action words and power words
- Focus on click-worthiness
- Maintain the core meaning of the original title

Return only the 3 improved titles, each on a new line:`;

        } else {
            // Only content provided - generate new titles
            prompt = `Based on the following blog content, generate 3 engaging, SEO-friendly titles:

${content}

Requirements:
- Titles should be between 40-60 characters for optimal SEO
- Make them catchy and engaging
- Ensure they accurately reflect the content
- Use action words when appropriate

Return only the titles, each on a new line:`;
        }

        const response = await generateGeminiResponse(prompt);
        
        if (!response || !response.trim()) {
            throw new Error('No response generated from AI');
        }
        const titles = response.split('\n').filter(title => title.trim());

        if (titles.length === 0) {
            throw new Error('No valid titles generated');
        }
        
        // Return the first title or a random one from the generated titles
        const selectedTitle = titles[Math.floor(Math.random() * titles.length)] || titles[0];
        
        return NextResponse.json({ 
            title: selectedTitle.replace(/^\d+\.\s*/, '').trim() 
        });
        
    } catch (error) {
        console.error('Error generating title:', error);
        return NextResponse.json(
            { error: 'Failed to generate title' }, 
            { status: 500 }
        );
    }
}
