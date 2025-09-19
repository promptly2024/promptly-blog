// app/not-found.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found | Your Site Name',
    description: 'The page you are looking for could not be found.',
    robots: {
        index: false,
        follow: false,
    },
};

export default function GlobalNotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-12 px-4 shadow-xl sm:rounded-2xl sm:px-10 text-center">
                    {/* 404 Animation/Illustration */}
                    <div className="mx-auto mb-8">
                        <div className="text-8xl font-bold text-indigo-600 mb-4">404</div>
                        <div className="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
                    </div>

                    {/* Error Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                        Oops! Page Not Found
                    </h1>

                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                        The page you're looking for seems to have wandered off into the digital void.
                        Let's get you back on track!
                    </p>

                    {/* Navigation Options */}
                    <div className="space-y-4 mb-8">
                        <Link
                            href="/"
                            className="w-full inline-flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            Go Home
                        </Link>

                        <div className="flex space-x-3">
                            <Link
                                href="/blog"
                                className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Blog
                            </Link>

                            <Link
                                href="/about"
                                className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                About
                            </Link>

                            <Link
                                href="/contact"
                                className="flex-1 inline-flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Contact
                            </Link>
                        </div>
                    </div>

                    {/* Search Box */}
                    <div className="mb-8">
                        <form
                            action="/search"
                            method="GET"
                            className="relative"
                        >
                            <input
                                type="text"
                                name="q"
                                placeholder="Search our site..."
                                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-indigo-600 focus:outline-none focus:text-indigo-600"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </button>
                        </form>
                    </div>

                    {/* Additional Help */}
                    <div className="pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">
                            Still can't find what you're looking for?
                        </p>

                        <Link
                            href="/contact"
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                        >
                            Get in touch with our support team
                        </Link>
                    </div>
                </div>

                {/* Fun fact or tip */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        💡 <span className="font-medium">Pro tip:</span> Double-check the URL for typos, or use the search above to find what you need.
                    </p>
                </div>
            </div>
        </div>
    );
}