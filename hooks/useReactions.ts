"use client";

import { useState, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import { toggleReaction, ReactionType, ReactionCounts, UserReactions } from '../actions/reactionActions';
import { toast } from 'sonner';

export function useReactions(postId: string, initialCounts: ReactionCounts, initialUserReactions: UserReactions) {
  const { isSignedIn } = useUser();
  const [counts, setCounts] = useState(initialCounts);
  const [userReactions, setUserReactions] = useState(initialUserReactions);
  const [isPending, startTransition] = useTransition();

  const handleReaction = (reactionType: ReactionType) => {
    if (!isSignedIn) {
      toast.error('Please sign in to react to this post');
      return;
    }

    // Optimistic update
    const wasActive = userReactions[reactionType] || false;
    
    setUserReactions(prev => ({
      ...prev,
      [reactionType]: !wasActive
    }));
    
    setCounts(prev => ({
      ...prev,
      [reactionType]: wasActive ? prev[reactionType] - 1 : prev[reactionType] + 1
    }));

    startTransition(async () => {
      try {
        await toggleReaction(postId, reactionType);
        toast.success(wasActive ? 'Reaction removed' : 'Reaction added');
      } catch (error) {
        // Revert optimistic update on error
        setUserReactions(prev => ({
          ...prev,
          [reactionType]: wasActive
        }));
        
        setCounts(prev => ({
          ...prev,
          [reactionType]: wasActive ? prev[reactionType] + 1 : prev[reactionType] - 1
        }));
        
        if (error instanceof Error && error.message.includes('authenticated')) {
          toast.error('Please sign in to react to posts');
        } else {
          toast.error(error instanceof Error ? error.message : 'Failed to update reaction');
        }
      }
    });
  };

  return {
    counts,
    userReactions,
    handleReaction,
    isPending
  };
}
