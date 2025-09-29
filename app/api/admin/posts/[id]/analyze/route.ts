import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, user, categories, tags, postCategories, postTags, postCollaborators, media } from '@/db/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    
    const postWithRelations = await db
      .select({
        // Post fields
        id: posts.id,
        title: posts.title,
        slug: posts.slug,
        excerpt: posts.excerpt,
        contentMd: posts.contentMd,
        status: posts.status,
        submittedAt: posts.submittedAt,
        metaTitle: posts.metaTitle,
        metaDescription: posts.metaDescription,
        canonicalUrl: posts.canonicalUrl,
        coverImageId: posts.coverImageId,
        // Author fields
        authorName: user.name,
        authorBio: user.bio,
        authorRole: user.siteRole,
        // Cover image fields
        coverImageUrl: media.url,
        coverImageAlt: media.altText,
      })
      .from(posts)
      .leftJoin(user, eq(posts.authorId, user.id))
      .leftJoin(media, eq(posts.coverImageId, media.id))
      .where(eq(posts.id, postId))
      .limit(1);

    if (!postWithRelations || postWithRelations.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const postData = postWithRelations[0];

    // Get categories for this post
    const postCategoriesData = await db
      .select({
        categoryName: categories.name,
      })
      .from(postCategories)
      .leftJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, postId));

    // Get tags for this post
    const postTagsData = await db
      .select({
        tagName: tags.name,
      })
      .from(postTags)
      .leftJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, postId));

    // Get collaborators for this post
    const postCollaboratorsData = await db
      .select({
        collaboratorName: user.name,
        collaboratorBio: user.bio,
        collaboratorRole: user.siteRole,
        role: postCollaborators.role,
      })
      .from(postCollaborators)
      .leftJoin(user, eq(postCollaborators.userId, user.id))
      .where(eq(postCollaborators.postId, postId));

    // Calculate content metrics for analysis
    const wordCount = postData.contentMd.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);
    const paragraphs = postData.contentMd.split('\n\n').filter(p => p.trim().length > 0);
    const headings = postData.contentMd.match(/^#+\s+.+$/gm) || [];
    const links = postData.contentMd.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    const images = postData.contentMd.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
    const codeBlocks = postData.contentMd.match(/``````/g) || [];
    const bulletPoints = postData.contentMd.match(/^[\*\-\+]\s+/gm) || [];
    
    // SEO Analysis
    const titleLength = postData.title.length;
    const excerptLength = postData.excerpt?.length || 0;
    const metaTitleLength = postData.metaTitle?.length || 0;
    const metaDescLength = postData.metaDescription?.length || 0;

    const analysisPrompt = `
You are conducting a PRE-PUBLICATION content analysis for a blog post that is currently in "${postData.status}" status and awaiting admin approval. This analysis will help the admin decide whether to approve, reject, or request revisions.

**POST SUBMISSION DETAILS:**
- Title: "${postData.title}"
- Slug: "${postData.slug}"
- Current Status: ${postData.status}
- Submitted At: ${postData.submittedAt ? new Date(postData.submittedAt).toLocaleDateString() : 'Not submitted yet'}
- Word Count: ${wordCount} words
- Estimated Reading Time: ${readingTime} minutes

**AUTHOR & COLLABORATION:**
- Author: ${postData.authorName || 'Unknown'} (${postData.authorRole || 'user'})
- Author Bio Available: ${postData.authorBio ? 'Yes' : 'No'}
- Collaborators: ${postCollaboratorsData.length} ${postCollaboratorsData.length ? `(${postCollaboratorsData.map(c => `${c.collaboratorName} as ${c.role}`).join(', ')})` : ''}

**CONTENT STRUCTURE METRICS:**
- Paragraphs: ${paragraphs.length}
- Headings: ${headings.length}
- Links: ${links.length}
- Images: ${images.length}
- Code Blocks: ${codeBlocks.length}
- Bullet Points/Lists: ${bulletPoints.length}

**SEO & METADATA:**
- Title Length: ${titleLength} characters ${titleLength > 60 ? '(⚠️ Too long for SEO)' : titleLength < 30 ? '(⚠️ Too short)' : '(✅ Good)'}
- Meta Title: ${postData.metaTitle || 'NOT SET'} ${metaTitleLength ? `(${metaTitleLength} chars)` : ''}
- Meta Description: ${postData.metaDescription || 'NOT SET'} ${metaDescLength ? `(${metaDescLength} chars)` : ''}
- Excerpt Length: ${excerptLength} characters ${excerptLength > 160 ? '(⚠️ Too long)' : excerptLength === 0 ? '(⚠️ Missing)' : '(✅ Good)'}
- Canonical URL: ${postData.canonicalUrl || 'Not set'}
- Cover Image: ${postData.coverImageUrl ? `✅ Yes${postData.coverImageAlt ? ' (with alt text)' : ' (⚠️ missing alt text)'}` : '⚠️ No cover image'}

**CONTENT CATEGORIZATION:**
- Categories: ${postCategoriesData.map(pc => pc.categoryName).join(', ') || 'None assigned'}
- Tags: ${postTagsData.map(pt => pt.tagName).join(', ') || 'None assigned'}

**EXCERPT:**
${postData.excerpt || 'No excerpt provided'}

**FULL CONTENT TO ANALYZE:**
${postData.contentMd}

---

**ADMIN APPROVAL ANALYSIS - Please provide detailed assessment in these areas:**

## 1. Content Quality & Editorial Standards
- **Content Depth**: Is the content comprehensive and valuable to readers?
- **Writing Quality**: Grammar, spelling, sentence structure, and flow
- **Originality**: Does this bring unique value or insight?
- **Accuracy**: Any factual concerns or claims that need verification?
- **Tone & Style**: Appropriate for the target audience and platform?

## 2. SEO & Technical Optimization
- **Title Effectiveness**: Is the title compelling and SEO-optimized?
- **Meta Data Quality**: Evaluate meta title and description
- **Heading Structure**: Proper H1, H2, H3 hierarchy for readability
- **Internal Linking**: Opportunities for site navigation improvement
- **Image Optimization**: Cover image and alt text assessment
- **URL Structure**: Is the slug SEO-friendly?

## 3. Content Structure & Readability
- **Organization**: Logical flow and clear structure
- **Scanability**: Use of headings, bullet points, and white space
- **Length Appropriateness**: Is the word count suitable for the topic?
- **Visual Elements**: Effective use of images, code blocks, lists
- **Reading Experience**: Will readers stay engaged throughout?

## 4. Publication Readiness
- **Completeness**: All required fields filled (meta data, categories, tags)
- **Brand Compliance**: Aligns with site standards and guidelines
- **Legal/Compliance**: Any potential issues with content claims?
- **Target Audience**: Appropriate for intended readers?

## 5. Editorial Recommendations

### APPROVAL RECOMMENDATION: 
- ✅ **APPROVE** - Ready for publication
- ⚠️ **APPROVE WITH MINOR REVISIONS** - Small fixes needed
- ❌ **REQUEST MAJOR REVISIONS** - Significant improvements required
- 🚫 **REJECT** - Does not meet publication standards

### Specific Action Items:
[List 3-5 specific, actionable improvements the author should make]

### Admin Notes:
[Any concerns or observations for admin consideration]

## 6. Content Scoring (1-10 scale)
- **Content Quality**: X/10
- **SEO Optimization**: X/10  
- **Editorial Standards**: X/10
- **Publication Readiness**: X/10
- **Overall Score**: X/10

**FINAL RECOMMENDATION**: [Clear guidance for admin approval decision]

---
Format your response with clear headers and actionable insights that will help the admin make an informed approval decision.
`;

    const analysis = await generateGeminiResponse(analysisPrompt);

    return NextResponse.json({
      success: true,
      data: {
        postId,
        analysis,
        prePublicationMetrics: {
          wordCount,
          readingTime,
          paragraphCount: paragraphs.length,
          headingCount: headings.length,
          linkCount: links.length,
          imageCount: images.length,
          codeBlockCount: codeBlocks.length,
          bulletPointCount: bulletPoints.length,
          titleLength,
          excerptLength,
          metaTitleLength,
          metaDescLength,
          hasCoverImage: !!postData.coverImageUrl,
          hasAltText: !!postData.coverImageAlt,
          categoryCount: postCategoriesData.length,
          tagCount: postTagsData.length,
          collaboratorCount: postCollaboratorsData.length,
        },
        analyzedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Pre-publication analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze post for publication' },
      { status: 500 }
    );
  }
}
