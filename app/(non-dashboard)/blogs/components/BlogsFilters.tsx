'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';

interface BlogsFiltersProps {
    currentFilters: {
        authorId?: string;
        sortBy: string;
        sortOrder: string;
    };
    searchParams: {
        page?: string;
        limit?: string;
        authorId?: string;
        sortBy?: string;
        sortOrder?: string;
        search?: string;
    };
}

export default function BlogsFilters({ currentFilters, searchParams }: BlogsFiltersProps) {
    const router = useRouter();
    const urlSearchParams = useSearchParams();

    // Local state for form inputs
    const [filters, setFilters] = useState({
        authorId: searchParams.authorId || '',
        sortBy: searchParams.sortBy || 'createdAt',
        sortOrder: searchParams.sortOrder || 'desc',
        limit: searchParams.limit || '10',
        search: searchParams.search || '',
    });

    const updateURL = useCallback((newFilters: typeof filters) => {
        const params = new URLSearchParams();

        // Always reset to page 1 when filters change
        params.set('page', '1');

        // Always set status=published
        params.set('status', 'published');

        // Add non-empty parameters
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value && value !== '') {
                params.set(key, value);
            }
        });

        router.push(`/blogs?${params.toString()}`);
    }, [router]);

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        // Auto-apply filters (you could also add an "Apply" button)
        updateURL(newFilters);
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            authorId: '',
            sortBy: 'createdAt',
            sortOrder: 'desc',
            limit: '10',
            search: '',
        };
        setFilters(clearedFilters);
        updateURL(clearedFilters);
    };

    const hasActiveFilters = filters.search;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">Filter & Sort Posts</h2>

                {hasActiveFilters && (
                    <button
                        onClick={clearAllFilters}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                        Clear all filters
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {/* Search */}
                <div className="xl:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                        Search Posts
                    </label>
                    <input
                        type="text"
                        id="search"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder="Search titles, content..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Sort By */}
                <div>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                    </label>
                    <select
                        id="sortBy"
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="createdAt">Created Date</option>
                        <option value="publishedAt">Published Date</option>
                        <option value="updatedAt">Updated Date</option>
                        <option value="title">Title</option>
                    </select>
                </div>

                {/* Sort Order */}
                <div>
                    <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                    </label>
                    <select
                        id="sortOrder"
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Posts per page */}
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                    <label htmlFor="limit" className="text-sm font-medium text-gray-700">
                        Posts per page:
                    </label>
                    <select
                        id="limit"
                        value={filters.limit}
                        onChange={(e) => handleFilterChange('limit', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600">Active filters:</span>
                        {filters.search && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                                Search: "{filters.search}"
                                <button
                                    onClick={() => handleFilterChange('search', '')}
                                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                                >
                                    ×
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}