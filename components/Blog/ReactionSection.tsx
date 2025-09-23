"use client";

import React from 'react';
import { Heart, Smile, Zap, Lightbulb, Laugh, Frown, Angry, Lock, ThumbsUp } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { ReactionCounts, ReactionType, UserReactions } from '@/actions/reactionActions';
import { useReactions } from '@/hooks/useReactions';


interface ReactionSectionProps {
  postId: string;
  initialCounts: ReactionCounts;
  initialUserReactions: UserReactions;
}

const reactionConfig = {
  like: { icon: ThumbsUp, label: 'Like', color: 'text-red-500' },
  love: { icon: Heart, label: 'Love', color: 'text-pink-500' },
  clap: { icon: Zap, label: 'Clap', color: 'text-yellow-500' },
  insightful: { icon: Lightbulb, label: 'Insightful', color: 'text-blue-500' },
  laugh: { icon: Laugh, label: 'Laugh', color: 'text-green-500' },
  sad: { icon: Frown, label: 'Sad', color: 'text-gray-500' },
  angry: { icon: Angry, label: 'Angry', color: 'text-red-600' },
};

const ReactionSection: React.FC<ReactionSectionProps> = ({
  postId,
  initialCounts,
  initialUserReactions,
}) => {
  const { user, isSignedIn } = useUser();
  const { counts, userReactions, handleReaction, isPending } = useReactions(
    postId,
    initialCounts,
    initialUserReactions
  );

  const totalReactions = Object.values(counts).reduce((sum, count) => sum + count, 0);

  const handleReactionClick = (type: ReactionType) => {
    if (!isSignedIn) {
      // Do nothing - the UI will show auth prompt
      return;
    }
    handleReaction(type);
  };

  return (
    <div className="bg-slate-50 rounded-xl p-6 my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Share your thoughts
        </h3>
        {totalReactions > 0 && (
          <span className="text-sm text-slate-600">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        )}
      </div>

      {/* Authentication Warning for Non-signed Users */}
      {!isSignedIn && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium mb-1">
                Sign in to react to this post
              </p>
              <p className="text-xs text-blue-600">
                Join the conversation and share your thoughts with reactions
              </p>
            </div>
            <SignInButton mode="modal">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
        {Object.entries(reactionConfig).map(([type, config]) => {
          const Icon = config.icon;
          const count = counts[type as ReactionType];
          const isActive = userReactions[type] || false;
          const isDisabled = !isSignedIn || isPending;
          
          return (
            <div key={type} className="relative group">
              <button
                onClick={() => handleReactionClick(type as ReactionType)}
                disabled={isPending}
                className={`
                  w-full flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white shadow-md scale-105 border-2 border-slate-200' 
                    : 'hover:bg-white hover:shadow-sm border-2 border-transparent'
                  }
                  ${isDisabled 
                    ? 'cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                  ${!isSignedIn 
                    ? 'opacity-60' 
                    : isPending 
                      ? 'opacity-50' 
                      : ''
                  }
                `}
              >
                <Icon 
                  className={`w-6 h-6 ${isActive ? config.color : 'text-slate-400'} transition-colors`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className="text-xs font-medium text-slate-600">
                  {count > 0 ? count : config.label}
                </span>
                
                {/* Auth overlay for non-signed users */}
                {!isSignedIn && (
                  <Lock className="absolute top-1 right-1 w-3 h-3 text-slate-400" />
                )}
              </button>

              {/* Tooltip for non-authenticated users */}
              {!isSignedIn && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  Sign in to react
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalReactions > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(counts)
              .filter(([, count]) => count > 0)
              .map(([type, count]) => {
                const config = reactionConfig[type as ReactionType];
                const Icon = config.icon;
                return (
                  <div key={type} className="flex items-center gap-1 text-sm text-slate-600">
                    <Icon className={`w-4 h-4 ${config.color}`} />
                    <span>{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactionSection;
