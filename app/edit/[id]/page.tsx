import { serializeDocument } from '@/utils/date-formatter';
import BlogEditor from '@/components/Write/BlogEditor';
import { fetchAllCategories, fetchPostWithCategories, getUserIdFromClerk } from '@/utils/blog-helper';

// Define the expected type for the props
interface BlogPageProps {
    params: Promise<{
        id: string;
    }>;
}

const getBlogData = async (id: string) => {
    try {
        const userId = await getUserIdFromClerk();
        // promise all to fetch post and categories concurrently
        if (!userId) throw new Error("User not authenticated.");

        const [postData, allCategories] = await Promise.all([
            fetchPostWithCategories(id, userId, false),
            fetchAllCategories()
        ]);

        if (!postData) return null;

        // Serialize post and categories
        const serializedPost = serializeDocument(postData);
        const serializedCategories = postData.categories.map(serializeDocument);

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

const EditBlog = async ({ params }: BlogPageProps) => {
    const { id } = await params;
    const result = await getBlogData(id);

    if (!result || !result.post) {
        return showError('Blog post not found or you do not have permission to edit this post.');
    }

    return (
        <div>
            <BlogEditor post={result.post} mode="edit" categories={result.categories} />
        </div>
    );
};

export default EditBlog;

// Error display component
export const showError = (message: string) => (
    <div className="max-w-3xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative
        min-h-[200px] flex items-center justify-center" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{message}</span>
        </div>
    </div>
);