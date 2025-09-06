'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { formatDistanceToNow } from 'date-fns';
import { BlogType } from '@/types/blog';

interface BlogContentProps {
    post: BlogType;
}

const BlogContent: React.FC<BlogContentProps> = ({ post }) => {
    const publishedDate = post.publishedAt ? new Date(post.publishedAt) : new Date(post.createdAt);

    return (
        <article className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                    {post.title}
                </h1>

                {post.excerpt && (
                    <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                        {post.excerpt}
                    </p>
                )}

                {/* Meta information */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                    <time dateTime={publishedDate.toISOString()}>
                        Published {formatDistanceToNow(publishedDate, { addSuffix: true })}
                    </time>

                    {post.readingTimeMins && (
                        <span>{post.readingTimeMins} min read</span>
                    )}

                    {post.wordCount && (
                        <span>{post.wordCount.toLocaleString()} words</span>
                    )}
                </div>

                {/* Cover image */}
                {post.coverImage?.url && (
                    <div className="mb-8">
                        <img
                            src={post.coverImage.url}
                            alt={post.coverImage.altText || `${post.title} cover image`}
                            className="w-full h-96 object-cover rounded-lg shadow-lg"
                        />
                    </div>
                )}
            </header>

            {/* Main content */}
            <div className="prose prose-lg max-w-none">
                <ReactMarkdown
                    components={{
                        // Customize markdown rendering
                        h1: ({ children }) => (
                            <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                                {children}
                            </h3>
                        ),
                        p: ({ children }) => (
                            <p className="mb-4 text-gray-700 leading-relaxed">
                                {children}
                            </p>
                        ),
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                {children}
                            </a>
                        ),
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-6">
                                {children}
                            </blockquote>
                        ),
                        code: ({ children, className }) => {
                            const isInline = !className;
                            if (isInline) {
                                return (
                                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                                        {children}
                                    </code>
                                );
                            }
                            return (
                                <code className="block bg-gray-900 text-white p-4 rounded-lg overflow-x-auto">
                                    {children}
                                </code>
                            );
                        },
                    }}
                >
                    {post.contentMd}
                </ReactMarkdown>
            </div>

            {/* Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                    <p>
                        Last updated: {formatDistanceToNow(new Date(post.updatedAt), { addSuffix: true })}
                    </p>
                    {post.canonicalUrl && post.canonicalUrl !== window.location.href && (
                        <p className="mt-2">
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
        </article>
    );
};

export default BlogContent;