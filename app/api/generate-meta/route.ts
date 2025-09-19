import { generateGeminiResponse } from "@/utils/generateGeminiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Create a prompt for the AI that requests meta title, description, excerpt
    const prompt = `
Generate a concise SEO meta title, a meta description, and a short excerpt for a blog post with the following content:
"""
${content}
"""
Format the response as JSON with keys: metaTitle, metaDescription, excerpt.
`;

    const aiResponseText = await generateGeminiResponse(prompt);

    // Attempt to parse AI response as JSON safely
    let aiData: { metaTitle: string; metaDescription: string; excerpt: string } = {
      metaTitle: "",
      metaDescription: "",
      excerpt: ""
    };

    try {
      // Sometimes AI might not perfectly format JSON, try to extract JSON substring
      const jsonStart = aiResponseText.indexOf("{");
      const jsonEnd = aiResponseText.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = aiResponseText.substring(jsonStart, jsonEnd);
        aiData = JSON.parse(jsonString);
      } else {
        // fallback simple parsing by lines if needed
        const lines = aiResponseText.split('\n').map(line => line.trim());
        aiData.metaTitle = lines[0] || "";
        aiData.metaDescription = lines[1] || "";
        aiData.excerpt = lines[2] || "";
      }
    } catch {
      // Parsing failed, fallback to empty strings
    }

    return NextResponse.json({
      metaTitle: aiData.metaTitle || "",
      metaDescription: aiData.metaDescription || "",
      excerpt: aiData.excerpt || ""
    });
  } catch (error: any) {
    console.error("AI meta generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI metadata. Please try again later." },
      { status: 500 }
    );
  }
}
