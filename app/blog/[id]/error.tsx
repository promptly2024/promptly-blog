// app/blog/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function BlogError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Blog page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {/* Error Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg
                            className="h-8 w-8 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Something went wrong
                    </h1>

                    <p className="text-gray-600 mb-8">
                        We're sorry, but there was an error loading this blog post. This might be a temporary issue.
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        <button
                            onClick={reset}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Try Again
                        </button>

                        <Link
                            href="/blog"
                            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Back to Blog
                        </Link>
                    </div>

                    {/* Error Details (only in development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                            <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Error Details (Development):
                            </h3>
                            <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                                {error.message}
                            </pre>
                            {error.digest && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Digest: {error.digest}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}