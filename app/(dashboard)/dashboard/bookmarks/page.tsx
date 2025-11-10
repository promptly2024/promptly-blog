'use client'
import { useState, useEffect } from 'react';
import { BookmarkIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BookmarkCard } from '@/components/Bookmark/BookmarkCard';
import { EmptyBookmarkState } from '@/components/Bookmark/EmptyBookmarkState';
import { BookmarkPagination } from '@/components/Bookmark/BookmarkPagination';

interface BookmarkedPost {
  bookmarkId: string;
  bookmarkedAt: Date;
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    status: string;
    publishedAt: Date | null;
    readingTimeMins: number | null;
    coverImageUrl: string | null;
  };
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface BookmarksResponse {
  success: boolean;
  data: BookmarkedPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const Bookmarks = () => {
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<BookmarkedPost[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/bookmarks?page=${page}&limit=10`);
      if (response.ok) {
        const data: BookmarksResponse = await response.json();
        setBookmarks(data.data);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error);
      toast.error('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId: string, postTitle: string) => {
    setRemovingId(postId);
    try {
      const response = await fetch(`/api/bookmarks?postId=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBookmarks(bookmarks.filter(b => b.post.id !== postId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        toast.success(`Removed "${postTitle}" from bookmarks`);
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    } finally {
      setRemovingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBookmarks(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && bookmarks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookmarkIcon className="h-8 w-8" />
            My Bookmarks
          </h1>
          <p className="text-muted-foreground mt-1">
            {pagination.total} {pagination.total === 1 ? 'post' : 'posts'} saved for later
          </p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <EmptyBookmarkState />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookmarks.map((bookmark) => (
              <BookmarkCard
                key={bookmark.bookmarkId}
                bookmark={bookmark}
                onRemove={handleRemoveBookmark}
                isRemoving={removingId === bookmark.post.id}
              />
            ))}
          </div>

          <BookmarkPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            loading={loading}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default Bookmarks;
