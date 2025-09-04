import { posts } from '@/db/schema';
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
        let post;
        if (!isUUID(id)) {
            // Search by slug
            post = await db.select()
                .from(posts)
                .where(eq(posts.slug, id))
                .limit(1)
                .execute();
        } else {
            // Search by ID
            post = await db.select()
                .from(posts)
                .where(eq(posts.id, id))
                .limit(1)
                .execute();
        }
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

    // Return 404 if post not found or not published (depending on your requirements)
    if (!post) {
        notFound();
    }

    // if (post.status !== 'published' || post.visibility !== 'public') {
    //     // You might want to check user permissions here
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