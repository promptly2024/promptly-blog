// app/blogs/BlogsContent.tsx
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';

interface BlogPost {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageId: string | null;
  coverImageUrl: string | null;
  coverImageAltText: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  wordCount: number | null;
  readingTimeMins: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogsContentProps {
  posts: BlogPost[];
}

function PostCard({ post }: { post: BlogPost }) {
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
  const isPublished = post.status === 'published';
  const isScheduled = post.status === 'scheduled';
  const isDraft = post.status === 'draft';

  return (
    <article className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col md:flex-row items-start md:items-center p-6 gap-6">
        {/* Content Left */}
        <div className="flex-1 flex flex-col">
          {/* Status */}
          <div className="flex space-x-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${isPublished ? 'bg-green-100 text-green-800' : isScheduled ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
              {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 line-clamp-2">
            <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
              {post.title}
            </Link>
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed text-base">
              {post.excerpt}
            </p>
          )}

          {/* Metadata & Reading Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <time
              dateTime={publishedDate.toISOString()}
              title={format(publishedDate, 'PPP p')}
              className="whitespace-nowrap"
            >
              {isPublished ? 'Published' : 'Created'} {formatDistanceToNow(publishedDate, { addSuffix: true })}
            </time>

            {isScheduled && post.scheduledAt && (
              <span className="text-yellow-600 whitespace-nowrap">
                Scheduled for {format(new Date(post.scheduledAt), 'PPP p')}
              </span>
            )}

            {new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime() && (
              <span className="whitespace-nowrap">
                Updated {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
              </span>
            )}

            {post.readingTimeMins && (
              <span className="flex items-center whitespace-nowrap">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                {post.readingTimeMins} min read
              </span>
            )}

            {post.wordCount && <span className="whitespace-nowrap">{post.wordCount.toLocaleString()} words</span>}
          </div>
        </div>

        {/* Image Right */}
        {post.coverImageUrl && (
          <div className="w-full md:w-48 flex-shrink-0 rounded-lg overflow-hidden shadow-sm">
            <img
              src={post.coverImageUrl}
              alt={post.coverImageAltText || ""}
              className="w-full h-32 md:h-36 object-cover object-center rounded-lg"
              loading="lazy"
              width={192}
              height={144}
            />
          </div>
        )}
      </div>

      {/* Footer: read more link */}
      <div className="border-t border-gray-100 px-6 py-3 text-right">
        <Link
          href={`/blog/${post.slug}`}
          className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
        >
          Read more →
        </Link>
      </div>
    </article>
  );
}


function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
      <p className="text-gray-600 mb-6">
        There are no posts matching your current filters. Try adjusting your search criteria or clearing the filters.
      </p>
      <div className="space-x-4">
        <Link
          href="/blogs"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          View All Posts
        </Link>
        <Link
          href="/create-post"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          Create New Post
        </Link>
      </div>
    </div>
  );
}

function PostStats({ posts }: { posts: BlogPost[] }) {
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const totalWordCount = posts.reduce((sum, post) => sum + (post.wordCount || 0), 0);
  const totalReadingTime = posts.reduce((sum, post) => sum + (post.readingTimeMins || 0), 0);

  if (posts.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Current Page Statistics</h3>
      <div className="grid grid-cols-3 gap-4 text-center justify-center max-w-lg mx-auto">
        <div>
          <div className="text-2xl font-bold text-green-600">{publishedCount}</div>
          <div className="text-xs text-gray-600">Published</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-blue-600">{totalWordCount.toLocaleString()}</div>
          <div className="text-xs text-gray-600">Total Words</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-purple-600">{totalReadingTime}</div>
          <div className="text-xs text-gray-600">Min Reading</div>
        </div>
      </div>
    </div>
  );
}

export default function BlogsContent({ posts }: BlogsContentProps) {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Statistics */}
      <PostStats posts={posts} />

      {/* Posts Grid */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}