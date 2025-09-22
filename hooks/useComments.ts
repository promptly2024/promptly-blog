"use client";

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { addComment, CommentData } from '../actions/commentActions';
import { toast } from 'sonner';

export function useComments(postId: string, initialComments: CommentData[]) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState(initialComments);
  const [isPending, startTransition] = useTransition();

  const submitComment = (content: string) => {
    if (!isSignedIn) {
      toast.error('Please sign in to comment');
      return;
    }

    if (!content.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (content.length > 1000) {
      toast.error('Comment is too long (max 1000 characters)');
      return;
    }

    startTransition(async () => {
      try {
        await addComment(postId, content);
        toast.success('Comment added successfully!');
        // Comments will be updated via revalidation
      } catch (error) {
        if (error instanceof Error && error.message.includes('authenticated')) {
          toast.error('Please sign in to comment');
        } else {
          toast.error(error instanceof Error ? error.message : 'Failed to add comment');
        }
      }
    });
  };

  return {
    comments,
    submitComment,
    isPending
  };
}
