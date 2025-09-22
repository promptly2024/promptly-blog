'use client';

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { BlogType } from '@/types/blog';
import { Clock, BookOpen, Eye } from 'lucide-react';
import { ReactionCounts, UserReactions } from '../actions/reactionActions';
import { CommentData } from '../actions/commentActions';
import { incrementPostView } from '../actions/viewActions';
import ShareButtons from './Blog/ShareButtons';
import ReactionSection from './Blog/ReactionSection';
import CommentSection from './Blog/CommentSection';

interface BlogContentProps {
  post: BlogType;
  reactions: {
    counts: ReactionCounts;
    userReactions: UserReactions;
  };
  comments: CommentData[];
}

const BlogContent: React.FC<BlogContentProps> = ({ post, reactions, comments }) => {
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Track view when component mounts
  useEffect(() => {
    incrementPostView(post.id);
  }, [post.id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <article className="max-w-4xl mx-auto bg-white">
        {/* Cover Image */}
        {post.coverImage?.url && (
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <img
              src={post.coverImage.url}
              alt={post.coverImage.altText || `${post.title} cover image`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="px-6 md:px-12">
          {/* Header */}
          <header className="py-8 md:py-12">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-slate-600 mb-8 leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}

            {/* Meta information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 mb-8">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <time dateTime={publishedDate.toISOString()}>
                  {formatDistanceToNow(publishedDate, { addSuffix: true })}
                </time>
              </div>

              {post.readingTimeMins && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{post.readingTimeMins} min read</span>
                </div>
              )}

              {post.wordCount && (
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.wordCount.toLocaleString()} words</span>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="pb-8 border-b border-slate-200">
              <ShareButtons 
                title={post.title}
                url={currentUrl}
                excerpt={post.excerpt ?? undefined}
              />
            </div>
          </header>

          {/* Main content */}
          <div className="prose prose-lg prose-slate max-w-none py-8">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-slate-900 mt-12 mb-6 scroll-mt-20">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-slate-800 mt-10 mb-5 scroll-mt-20">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-slate-800 mt-8 mb-4 scroll-mt-20">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-6 text-slate-700 leading-relaxed text-lg">
                    {children}
                  </p>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 hover:decoration-blue-400 transition-colors"
                  >
                    {children}
                  </a>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-6 py-2 my-8 bg-blue-50 rounded-r-lg">
                    <div className="text-slate-700 italic text-lg">{children}</div>
                  </blockquote>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <div className="my-6 rounded-lg overflow-hidden">
                      <code className="block bg-slate-900 text-slate-100 p-6 overflow-x-auto text-sm leading-relaxed">
                        {children}
                      </code>
                    </div>
                  );
                },
                ul: ({ children }) => (
                  <ul className="list-disc list-inside space-y-2 my-6 text-slate-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside space-y-2 my-6 text-slate-700">
                    {children}
                  </ol>
                ),
                img: ({ src, alt }) => (
                  <div className="my-8">
                    <img
                      src={src}
                      alt={alt}
                      className="w-full rounded-lg shadow-md"
                    />
                    {alt && (
                      <p className="text-center text-sm text-slate-500 mt-2 italic">
                        {alt}
                      </p>
                    )}
                  </div>
                ),
              }}
            >
              {post.contentMd}
            </ReactMarkdown>
          </div>

          {/* Reactions */}
          <ReactionSection
            postId={post.id}
            initialCounts={reactions.counts}
            initialUserReactions={reactions.userReactions}
          />

          {/* Comments */}
          <CommentSection
            postId={post.id}
            initialComments={comments}
          />

          {/* Footer */}
          <footer className="py-12 border-t border-slate-200">
            <div className="text-sm text-slate-500">
              <p className="mb-3">
                Last updated: {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
              </p>
              {post.canonicalUrl && post.canonicalUrl !== currentUrl && (
                <p>
                  Originally published at:{' '}
                  <a
                    href={post.canonicalUrl}
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {post.canonicalUrl}
                  </a>
                </p>
              )}
            </div>
          </footer>
        </div>
      </article>
    </div>
  );
};

export default BlogContent;
