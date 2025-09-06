import { media, posts } from '@/db/schema';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogContent from '@/components/BlogContent';
import { BlogType } from '@/types/blog';
import { serializeDocument } from '@/utils/date-formatter';

// Define the expected type for the props
interface BlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

const isUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
};

const getBlogData = async (id: string): Promise<BlogType | null> => {
    try {
        let postQuery;

        if (!isUUID(id)) {
            // Search by slug
            postQuery = db
                .select({
                    id: posts.id,
                    title: posts.title,
                    slug: posts.slug,
                    excerpt: posts.excerpt,
                    contentMd: posts.contentMd,
                    coverImageId: posts.coverImageId,
                    ogImageUrl: posts.ogImageUrl,
                    canonicalUrl: posts.canonicalUrl,
                    metaTitle: posts.metaTitle,
                    metaDescription: posts.metaDescription,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,

                    // image info from media
                    coverImage: {
                        id: media.id,
                        url: media.url,
                        type: media.type,
                        altText: media.altText,
                        provider: media.provider,
                    }
                })
                .from(posts)
                .leftJoin(media, eq(posts.coverImageId, media.id))
                .where(eq(posts.slug, id))
                .limit(1);
        } else {
            // Search by ID
            postQuery = db
                .select({
                    id: posts.id,
                    title: posts.title,
                    slug: posts.slug,
                    excerpt: posts.excerpt,
                    contentMd: posts.contentMd,
                    coverImageId: posts.coverImageId,
                    ogImageUrl: posts.ogImageUrl,
                    canonicalUrl: posts.canonicalUrl,
                    metaTitle: posts.metaTitle,
                    metaDescription: posts.metaDescription,
                    createdAt: posts.createdAt,
                    updatedAt: posts.updatedAt,

                    // image info
                    coverImage: {
                        id: media.id,
                        url: media.url,
                        type: media.type,
                        altText: media.altText,
                        provider: media.provider,
                    }
                })
                .from(posts)
                .leftJoin(media, eq(posts.coverImageId, media.id))
                .where(eq(posts.id, id))
                .limit(1);
        }

        const post = await postQuery.execute();

        if (!post[0]) return null;

        // Serialize the document
        const serializedPost = serializeDocument(post[0]);
        return serializedPost || null;
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return null;
    }
};

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    const { id } = await params;
    const post = await getBlogData(id);

    if (!post) {
        return {
            title: 'Post Not Found',
            description: 'The requested blog post could not be found.',
        };
    }

    // Use custom meta fields if available, otherwise fall back to defaults
    const title = post.metaTitle || post.title;
    const description = post.metaDescription || post.excerpt || 'Read this blog post';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: post.publishedAt || undefined,
            modifiedTime: post.updatedAt,
            images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.ogImageUrl ? [post.ogImageUrl] : undefined,
        },
        alternates: {
            canonical: post.canonicalUrl || undefined,
        },
        other: {
            'article:author': post.authorId,
            'article:modified_time': post.updatedAt,
        },
    };
}

const BlogPage = async ({ params }: BlogPageProps) => {
    const { id } = await params;
    const post = await getBlogData(id);

    // Return 404 if post not found or not published
    if (!post) {
        notFound();
    }

    // if (post.status !== 'published' || post.visibility !== 'public') {
    //     notFound();
    // }

    if (post.deletedAt) {
        notFound();
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <BlogContent post={post} />
        </div>
    );
};

export default BlogPage;