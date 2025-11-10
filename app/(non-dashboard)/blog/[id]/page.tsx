import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlogType, CategoryType } from '@/types/blog';
import { serializeDocument } from '@/utils/date-formatter';
import { showError } from '@/app/(non-dashboard)/edit/[id]/page';
import { getUserIdFromClerk, fetchPostWithCategories, fetchAllCategories } from '@/utils/blog-helper';
import BlogContent from '@/components/BlogContent';
import { BookmarkButton } from '@/components/Bookmark/BookmarkButton';

interface BlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

const getBlogData = async (id: string) => {
    try {
        const userId = await getUserIdFromClerk();
        if (!userId) {
            return { error: "User not authenticated." };
        }

        const [postData, allCategories] = await Promise.all([
            fetchPostWithCategories(id, userId, false),
            fetchAllCategories()
        ]);
        if (!postData) return null;

        const serializedPost = serializeDocument(postData) as BlogType & {
            reactionCounts: any;
            userReactions: any;
            comments: any[];
            totalComments: number;
            totalReactions: number;
        };
        const serializedCategories = postData.categories.map(serializeDocument) as CategoryType[];

        return {
            post: serializedPost,
            category: serializedCategories,
            categories: allCategories
        };
    } catch (error) {
        console.error('Error fetching blog data:', error);
        return null;
    }
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    const { id } = await params;
    const result = await getBlogData(id);
    const post = result?.post;

    if (result?.error === "User not authenticated.") {
        return {
            title: 'Authentication Required',
            description: 'You must be logged in to view this blog post.',
        };
    }

    if (!post) {
        return {
            title: 'Post Not Found',
            description: 'The requested blog post could not be found.',
        };
    }

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
            images: post.ogImageUrl ? [{ url: post.ogImageUrl }] : post.coverImage ? [{ url: post.coverImage.url }] : undefined,
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
    const result = await getBlogData(id);
    const post = result?.post;

    if (result?.error === "User not authenticated.") {
        return showError('You must be logged in to view this blog post.');
    }

    if (!result || !post) {
        return showError('Blog post not found or you do not have permission to view this post.');
    }

    if (post.deletedAt) {
        notFound();
    }

    const transformedReactions = {
        counts: post.reactionCounts || {
            like: 0,
            love: 0,
            clap: 0,
            insightful: 0,
            laugh: 0,
            sad: 0,
            angry: 0,
        },
        userReactions: post.userReactions || {},
    };
    const transformedComments = post.comments || [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-end mb-6">
                <BookmarkButton postId={post.id} />
            </div>

            <BlogContent 
                post={post}
                reactions={transformedReactions}
                comments={transformedComments}
            />
        </div>
    );
};

export default BlogPage;