import { generateGeminiResponse } from '@/utils/generateGeminiResponse';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, user, categories, tags, postCategories, postTags, postCollaborators, media } from '@/db/schema';

// Profanity detection function
function detectProfanity(text: string) {
  const results = {
    hasProfanity: false,
    profanityFlags: [] as string[],
    severity: 'none' as 'none' | 'low' | 'medium' | 'high'
  };

  // Common profanity words
  const profanityPatterns = [
    /\b(fuck|shit|damn|bitch|ass|bastard|hell|crap|dick|piss)\b/gi,
    /\b(nigger|nigga|fag|faggot|retard|slut|whore|cunt|pussy)\b/gi,
  ];

  // Check for profanity
  let totalMatches = 0;
  profanityPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      results.hasProfanity = true;
      totalMatches += matches.length;
      results.profanityFlags.push(
        `Found ${matches.length} instance(s) of inappropriate language`
      );
    }
  });

  // Determine severity based on total matches
  if (totalMatches > 5) {
    results.severity = 'high';
  } else if (totalMatches > 2) {
    results.severity = 'medium';
  } else if (totalMatches > 0) {
    results.severity = 'low';
  }

  return results;
}

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

    // **PROFANITY CHECK**
    const titleModeration = detectProfanity(postData.title);
    const contentModeration = detectProfanity(postData.contentMd);
    const excerptModeration = postData.excerpt 
      ? detectProfanity(postData.excerpt) 
      : { hasProfanity: false, profanityFlags: [], severity: 'none' as const };

    const moderationResults = {
      flagged: titleModeration.hasProfanity || contentModeration.hasProfanity || excerptModeration.hasProfanity,
      profanity: {
        detected: titleModeration.hasProfanity || contentModeration.hasProfanity || excerptModeration.hasProfanity,
        locations: {
          title: titleModeration.hasProfanity,
          content: contentModeration.hasProfanity,
          excerpt: excerptModeration.hasProfanity,
        },
        details: [
          ...titleModeration.profanityFlags.map(f => `Title: ${f}`),
          ...contentModeration.profanityFlags.map(f => `Content: ${f}`),
          ...excerptModeration.profanityFlags.map(f => `Excerpt: ${f}`),
        ]
      },
      overallSeverity: Math.max(
        titleModeration.severity === 'high' ? 3 : titleModeration.severity === 'medium' ? 2 : titleModeration.severity === 'low' ? 1 : 0,
        contentModeration.severity === 'high' ? 3 : contentModeration.severity === 'medium' ? 2 : contentModeration.severity === 'low' ? 1 : 0,
        excerptModeration.severity === 'high' ? 3 : excerptModeration.severity === 'medium' ? 2 : excerptModeration.severity === 'low' ? 1 : 0
      ) >= 3 ? 'high' : Math.max(
        titleModeration.severity === 'high' ? 3 : titleModeration.severity === 'medium' ? 2 : titleModeration.severity === 'low' ? 1 : 0,
        contentModeration.severity === 'high' ? 3 : contentModeration.severity === 'medium' ? 2 : contentModeration.severity === 'low' ? 1 : 0,
        excerptModeration.severity === 'high' ? 3 : excerptModeration.severity === 'medium' ? 2 : excerptModeration.severity === 'low' ? 1 : 0
      ) >= 2 ? 'medium' : Math.max(
        titleModeration.severity === 'high' ? 3 : titleModeration.severity === 'medium' ? 2 : titleModeration.severity === 'low' ? 1 : 0,
        contentModeration.severity === 'high' ? 3 : contentModeration.severity === 'medium' ? 2 : contentModeration.severity === 'low' ? 1 : 0,
        excerptModeration.severity === 'high' ? 3 : excerptModeration.severity === 'medium' ? 2 : excerptModeration.severity === 'low' ? 1 : 0
      ) >= 1 ? 'low' : 'none',
      recommendation: (titleModeration.hasProfanity || contentModeration.hasProfanity || excerptModeration.hasProfanity)
        ? '🚫 IMMEDIATE REJECTION RECOMMENDED - Contains inappropriate/profane language'
        : '✅ No profanity detected'
    };

    // Calculate content metrics for analysis
    const wordCount = postData.contentMd.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200);
    const paragraphs = postData.contentMd.split('\n\n').filter(p => p.trim().length > 0);
    const headings = postData.contentMd.match(/^#+\s+.+$/gm) || [];
    const links = postData.contentMd.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
    const images = postData.contentMd.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
    const bulletPoints = postData.contentMd.match(/^[\*\-\+]\s+/gm) || [];
    
    // SEO Analysis
    const titleLength = postData.title.length;
    const excerptLength = postData.excerpt?.length || 0;
    const metaTitleLength = postData.metaTitle?.length || 0;
    const metaDescLength = postData.metaDescription?.length || 0;

    // Build moderation warning for analysis prompt
    const moderationWarning = moderationResults.flagged ? `

🚨 **CRITICAL MODERATION ALERT - PROFANITY DETECTED** 🚨
${moderationResults.recommendation}

**Profanity Detection Results:**
- Title: ${moderationResults.profanity.locations.title ? '⚠️ FLAGGED' : '✅ Clean'}
- Content: ${moderationResults.profanity.locations.content ? '⚠️ FLAGGED' : '✅ Clean'}
- Excerpt: ${moderationResults.profanity.locations.excerpt ? '⚠️ FLAGGED' : '✅ Clean'}

**Details:** ${moderationResults.profanity.details.join('; ')}

**Severity Level:** ${moderationResults.overallSeverity.toUpperCase()}

⚠️ This content should be REJECTED until all inappropriate language is removed.

***
` : '';

    const analysisPrompt = `
You are conducting a PRE-PUBLICATION content analysis for a blog post that is currently in "${postData.status}" status and awaiting admin approval. This analysis will help the admin decide whether to approve, reject, or request revisions.

${moderationWarning}

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

${moderationResults.flagged ? `
## ⚠️ PROFANITY ALERT - IMMEDIATE ATTENTION REQUIRED
This content has been automatically flagged for containing inappropriate/profane language.
**Locations:** ${Object.entries(moderationResults.profanity.locations).filter(([_, flagged]) => flagged).map(([loc]) => loc).join(', ')}
**Recommendation:** REJECT this post and request the author remove all inappropriate language before resubmission.

` : ''}

## 1. Content Quality & Editorial Standards
- **Content Depth**: Is the content comprehensive and valuable to readers?
- **Writing Quality**: Grammar, spelling, sentence structure, and flow
- **Originality**: Does this bring unique value or insight?
- **Accuracy**: Any factual concerns or claims that need verification?
- **Tone & Style**: Appropriate for the target audience and platform?
${moderationResults.profanity.detected ? '- **⚠️ LANGUAGE APPROPRIATENESS**: FLAGGED - Contains profanity/inappropriate language - RECOMMEND REJECTION' : ''}

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
${moderationResults.profanity.detected ? '- 🚫 **REJECT** - Contains inappropriate/profane language (AUTO-FLAGGED)' : `- ✅ **APPROVE** - Ready for publication
- ⚠️ **APPROVE WITH MINOR REVISIONS** - Small fixes needed
- ❌ **REQUEST MAJOR REVISIONS** - Significant improvements required
- 🚫 **REJECT** - Does not meet publication standards`}

### Specific Action Items:
${moderationResults.profanity.detected ? '[PRIORITY] Remove all inappropriate/profane language before resubmission\n' : ''}
[List 3-5 specific, actionable improvements the author should make]

### Admin Notes:
${moderationResults.flagged ? `[AUTOMATED MODERATION ALERT] ${moderationResults.recommendation}\n` : ''}
[Any concerns or observations for admin consideration]

## 6. Content Scoring (1-10 scale)
- **Content Quality**: X/10
- **SEO Optimization**: X/10  
- **Editorial Standards**: X/10 ${moderationResults.profanity.detected ? '(FLAGGED FOR PROFANITY - Consider 0/10)' : ''}
- **Publication Readiness**: X/10 ${moderationResults.flagged ? '(FLAGGED BY MODERATION)' : ''}
- **Overall Score**: X/10

**FINAL RECOMMENDATION**: ${moderationResults.flagged ? '🚫 REJECTION RECOMMENDED due to profanity. ' : ''}[Clear guidance for admin approval decision]

***
Format your response with clear headers and actionable insights that will help the admin make an informed approval decision.
`;

    const analysis = await generateGeminiResponse(analysisPrompt);

    return NextResponse.json({
      success: true,
      data: {
        postId,
        analysis,
        moderationResults,
        prePublicationMetrics: {
          wordCount,
          readingTime,
          paragraphCount: paragraphs.length,
          headingCount: headings.length,
          linkCount: links.length,
          imageCount: images.length,
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
    
    if (error.message?.includes('safety') || error.message?.includes('SAFETY')) {
      return NextResponse.json(
        { 
          error: 'Content blocked by AI safety filters - likely contains harmful or inappropriate content',
          moderationBlock: true,
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to analyze post for publication' },
      { status: 500 }
    );
  }
}
