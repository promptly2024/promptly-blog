'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BookmarkButtonProps {
  postId: string;
  initialBookmarked?: boolean;
}

export function BookmarkButton({ postId, initialBookmarked = false }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/bookmarks/check?postId=${postId}`);
        if (response.ok) {
          const data = await response.json();
          setIsBookmarked(data.isBookmarked);
        }
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [postId]);

  const toggleBookmark = async () => {
    setIsLoading(true);
    try {
      if (isBookmarked) {
        const response = await fetch(`/api/bookmarks?postId=${postId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsBookmarked(false);
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to remove bookmark');
        }
      } else {
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        });

        if (response.ok) {
          setIsBookmarked(true);
        } else {
          const data = await response.json();
          if (response.status === 401) {
            alert('Please sign in to bookmark posts');
            router.push('/signin');
          } else {
            alert(data.error || 'Failed to bookmark post');
          }
        }
      }
    } catch (error) {
      console.error('Bookmark toggle error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
        isBookmarked
          ? 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
    >
      <BookmarkIcon
        className={`w-5 h-5 transition-all ${
          isBookmarked ? 'fill-current' : 'fill-none'
        }`}
      />
      <span className="font-medium">
        {isLoading ? 'Loading...' : isBookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </button>
  );
}
