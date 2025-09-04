// app/blogs/BlogsPagination.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PaginationData {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

interface BlogsPaginationProps {
    pagination: PaginationData;
    searchParams: {
        page?: string;
        limit?: string;
        status?: string;
        visibility?: string;
        authorId?: string;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
    };
}

export default function BlogsPagination({ pagination, searchParams }: BlogsPaginationProps) {
    const router = useRouter();

    const buildURL = (page: number) => {
        const params = new URLSearchParams();

        // Add the new page
        params.set('page', page.toString());

        // Preserve all other search parameters
        Object.entries(searchParams).forEach(([key, value]) => {
            if (key !== 'page' && value && value !== '') {
                params.set(key, value);
            }
        });

        return `/blogs?${params.toString()}`;
    };

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        router.push(buildURL(page));
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2; // Number of pages to show on each side of current page
        const range = [];
        const rangeWithDots = [];

        // Calculate the range of page numbers to show
        for (let i = Math.max(2, pagination.page - delta); i <= Math.min(pagination.totalPages - 1, pagination.page + delta); i++) {
            range.push(i);
        }

        if (pagination.page - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (pagination.page + delta < pagination.totalPages - 1) {
            rangeWithDots.push('...', pagination.totalPages);
        } else if (pagination.totalPages > 1) {
            rangeWithDots.push(pagination.totalPages);
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    if (pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-8">
            {/* Pagination Info */}
            <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                        {((pagination.page - 1) * pagination.limit) + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                        {Math.min(pagination.page * pagination.limit, pagination.totalCount)}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium">{pagination.totalCount}</span> results
                </div>

                {/* Quick page jump */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="page-jump" className="text-sm text-gray-600">
                        Go to page:
                    </label>
                    <input
                        id="page-jump"
                        type="number"
                        min="1"
                        max={pagination.totalPages}
                        defaultValue={pagination.page}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                const page = parseInt((e.target as HTMLInputElement).value);
                                if (page >= 1 && page <= pagination.totalPages) {
                                    handlePageChange(page);
                                }
                            }
                        }}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">of {pagination.totalPages}</span>
                </div>
            </div>

            {/* Pagination Controls */}
            <nav className="flex items-center justify-center">
                <div className="flex items-center space-x-1">
                    {/* Previous Page */}
                    <Link
                        href={buildURL(pagination.page - 1)}
                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${pagination.hasPreviousPage
                                ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                            }`}
                        onClick={(e) => {
                            if (!pagination.hasPreviousPage) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </Link>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                        {pageNumbers.map((pageNum, index) => {
                            if (pageNum === '...') {
                                return (
                                    <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                                        ...
                                    </span>
                                );
                            }

                            const isCurrentPage = pageNum === pagination.page;
                            return (
                                <Link
                                    key={pageNum}
                                    href={buildURL(pageNum as number)}
                                    className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isCurrentPage
                                            ? 'bg-blue-600 text-white border border-blue-600'
                                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                        }`}
                                >
                                    {pageNum}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Next Page */}
                    <Link
                        href={buildURL(pagination.page + 1)}
                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${pagination.hasNextPage
                                ? 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                                : 'text-gray-300 bg-gray-100 border border-gray-200 cursor-not-allowed'
                            }`}
                        onClick={(e) => {
                            if (!pagination.hasNextPage) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Next
                        <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </nav>

            {/* Additional Navigation */}
            <div className="flex items-center justify-center mt-4 space-x-4">
                {/* First/Last page quick links */}
                {pagination.page > 3 && (
                    <Link
                        href={buildURL(1)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        ← First Page
                    </Link>
                )}

                {pagination.page < pagination.totalPages - 2 && (
                    <Link
                        href={buildURL(pagination.totalPages)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Last Page →
                    </Link>
                )}
            </div>

            {/* Mobile-friendly pagination */}
            <div className="md:hidden mt-4">
                <div className="flex justify-between">
                    <Link
                        href={buildURL(pagination.page - 1)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.hasPreviousPage
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                            }`}
                        onClick={(e) => {
                            if (!pagination.hasPreviousPage) {
                                e.preventDefault();
                            }
                        }}
                    >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </Link>

                    <span className="flex items-center px-4 py-2 text-sm text-gray-700">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <Link
                        href={buildURL(pagination.page + 1)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${pagination.hasNextPage
                                ? 'text-white bg-blue-600 hover:bg-blue-700'
                                : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                            }`}
                        onClick={(e) => {
                            if (!pagination.hasNextPage) {
                                e.preventDefault();
                            }
                        }}
                    >
                        Next
                        <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}