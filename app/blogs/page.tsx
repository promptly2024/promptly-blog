// app/blogs/page.tsx
import { Suspense } from 'react';
import { Metadata } from 'next';
import BlogsFilters from './components/BlogsFilters';
import BlogsContent from './components/BlogsContents';
import BlogsPagination from './components/BlogsPagination';

export const metadata: Metadata = {
    title: 'All Blog Posts | Your Blog Name',
    description: 'Browse all our blog posts with advanced filtering and search capabilities.',
    openGraph: {
        title: 'All Blog Posts',
        description: 'Browse all our blog posts with advanced filtering and search capabilities.',
        type: 'website',
    },
};

interface BlogsPageProps {
    searchParams: {
        page?: string;
        limit?: string;
        status?: string;
        visibility?: string;
        authorId?: string;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
    };
}

// Types based on your API
interface BlogPost {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImageId: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    status: string;
    visibility: string;
    publishedAt: string | null;
    scheduledAt: string | null;
    wordCount: number | null;
    readingTimeMins: number | null;
    createdAt: string;
    updatedAt: string;
}

interface BlogsResponse {
    success: boolean;
    posts: BlogPost[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
    filters: {
        status?: string;
        visibility?: string;
        authorId?: string;
        sortBy: string;
        sortOrder: string;
    };
}

async function fetchBlogs(searchParams: BlogsPageProps['searchParams']): Promise<BlogsResponse> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build query parameters
    const params = new URLSearchParams();
    if (searchParams.page) params.set('page', searchParams.page);
    if (searchParams.limit) params.set('limit', searchParams.limit);
    if (searchParams.status) params.set('status', searchParams.status);
    if (searchParams.visibility) params.set('visibility', searchParams.visibility);
    if (searchParams.authorId) params.set('authorId', searchParams.authorId);
    if (searchParams.sortBy) params.set('sortBy', searchParams.sortBy);
    if (searchParams.sortOrder) params.set('sortOrder', searchParams.sortOrder);

    const url = `${baseUrl}/api/blog?${params.toString()}`;

    try {
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching blogs:', error);
        // Return empty state on error
        return {
            success: false,
            posts: [],
            pagination: {
                page: 1,
                limit: 10,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPreviousPage: false,
            },
            filters: {
                sortBy: 'createdAt',
                sortOrder: 'desc',
            },
        };
    }
}

function LoadingBlogs() {
    return (
        <div className="space-y-6">
            {/* Filter skeleton */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>

            {/* Posts skeleton */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-6">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
    const blogsData = await fetchBlogs(searchParams);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">All Blog Posts</h1>
                    <p className="text-gray-600">
                        Browse and filter through all our blog posts.
                        {blogsData.pagination.totalCount > 0 && (
                            <span className="ml-1">
                                Showing {blogsData.posts.length} of {blogsData.pagination.totalCount} posts
                            </span>
                        )}
                    </p>
                </div>

                <Suspense fallback={<LoadingBlogs />}>
                    {/* Filters */}
                    <BlogsFilters
                        currentFilters={blogsData.filters}
                        searchParams={searchParams}
                    />

                    {/* Results Summary */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            {blogsData.pagination.totalCount === 0 ? (
                                'No posts found'
                            ) : (
                                <>
                                    Page {blogsData.pagination.page} of {blogsData.pagination.totalPages}
                                    {' '}({blogsData.pagination.totalCount} total posts)
                                </>
                            )}
                        </div>

                        {/* Quick stats */}
                        <div className="text-sm text-gray-500">
                            {searchParams.status && (
                                <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                                    Status: {searchParams.status}
                                </span>
                            )}
                            {searchParams.visibility && (
                                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded mr-2">
                                    Visibility: {searchParams.visibility}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Blog Posts */}
                    <BlogsContent posts={blogsData.posts} />

                    {/* Pagination */}
                    {blogsData.pagination.totalPages > 1 && (
                        <BlogsPagination
                            pagination={blogsData.pagination}
                            searchParams={searchParams}
                        />
                    )}

                    {/* Debug Info (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <details className="mt-8 p-4 bg-gray-100 rounded">
                            <summary className="cursor-pointer font-medium">Debug Info</summary>
                            <pre className="mt-2 text-xs overflow-x-auto">
                                {JSON.stringify({ searchParams, filters: blogsData.filters, pagination: blogsData.pagination }, null, 2)}
                            </pre>
                        </details>
                    )}
                </Suspense>
            </div>
        </div>
    );
}