"use client";

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send, Trash2, Lock, User } from 'lucide-react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { toast } from 'sonner';
import { CommentData, deleteComment } from '@/actions/commentActions';
import { useComments } from '@/hooks/useComments';

interface CommentSectionProps {
  postId: string;
  initialComments: CommentData[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  initialComments,
}) => {
  const { user, isSignedIn } = useUser();
  const { comments, submitComment, isPending } = useComments(postId, initialComments);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !isSignedIn) return;

    setIsSubmitting(true);
    await submitComment(commentText);
    setCommentText('');
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  return (
    <div className="my-12">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-slate-600" />
        <h3 className="text-xl font-semibold text-slate-900">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      {isSignedIn ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <div className="flex gap-4">
            <img
              src={user.imageUrl}
              alt={user.fullName || 'User'}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <form onSubmit={handleSubmit} className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isSubmitting}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className={`text-sm ${commentText.length > 900 ? 'text-red-500' : 'text-slate-500'}`}>
                  {commentText.length}/1000
                </span>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isSubmitting || commentText.length > 1000}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">
                Join the conversation
              </h4>
              <p className="text-slate-600 text-sm mb-4">
                Sign in to share your thoughts and engage with other readers
              </p>
              <div className="flex gap-3">
                <SignInButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors font-medium">
                    Create Account
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-600 mb-2">
              No comments yet
            </h4>
            <p className="text-slate-500">
              {isSignedIn 
                ? "Be the first to share your thoughts!" 
                : "Sign in to start the conversation"
              }
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <img
                  src={comment.author.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.author.name}`}
                  alt={comment.author.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-slate-900 flex items-center gap-2">
                        {comment.author.name}
                        <User className="w-3 h-3 text-slate-400" />
                      </h4>
                      <p className="text-sm text-slate-500">
                        {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="ml-1 text-slate-400">(edited)</span>
                        )}
                      </p>
                    </div>
                    {isSignedIn && user?.id && comment.author.id === user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete comment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sign in CTA at bottom if not authenticated */}
      {!isSignedIn && comments.length > 0 && (
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
          <p className="text-slate-600 text-sm mb-3">
            Want to join the discussion?
          </p>
          <SignInButton mode="modal">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Sign In to Comment
            </button>
          </SignInButton>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
