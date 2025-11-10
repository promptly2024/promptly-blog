'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RemoveBookmarkButtonProps {
  postId: string;
  postTitle: string;
}

export function RemoveBookmarkButton({ postId, postTitle }: RemoveBookmarkButtonProps) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm(`Remove "${postTitle}" from bookmarks?`)) return;

    setIsRemoving(true);
    try {
      const response = await fetch(`/api/bookmarks?postId=${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to remove bookmark');
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
      alert('Failed to remove bookmark');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isRemoving ? 'Removing...' : 'Remove'}
    </button>
  );
}
