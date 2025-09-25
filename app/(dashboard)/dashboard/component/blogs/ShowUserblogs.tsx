"use client";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UsersBlogType } from '@/actions/fetchAllPostByUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Search,
    Filter,
    Plus,
    FileText,
    SortDesc,
    SortAsc,
    X,
    ChevronDown,
    Grid3X3,
    List,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { AnalyticsCard, BulkActions, EnhancedBlogCard, statusConfig } from './Helper';


// Main Enhanced Component
interface ManageBlogsProps {
    blogs: UsersBlogType[];
}

const EnhancedManageBlogs: React.FC<ManageBlogsProps> = ({ blogs }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Existing state
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // New state
    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
    const [showAnalytics, setShowAnalytics] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initialize from URL params (existing code)
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
        setSortBy(searchParams.get('sortBy') || 'updatedAt');
        setSortOrder(searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc');
        setActiveTab(searchParams.get('tab') || 'all');
        setViewMode(searchParams.get('view') as 'grid' | 'list' || 'grid');
    }, [searchParams]);

    // URL params update function (existing)
    const updateUrlParams = useCallback((key: string, value: string) => {
        const url = new URL(window.location.href);
        const searchParams = new URLSearchParams(url.search);
        if (value === '' || value === 'all') {
            searchParams.delete(key);
        } else {
            searchParams.set(key, value);
        }
        window.history.replaceState({}, '', `${window.location.pathname}?${searchParams}`);
    }, []);

    // Enhanced filtering and sorting (existing logic enhanced)
    const filteredAndSortedBlogs = useMemo(() => {
        let filtered = blogs;

        if (searchQuery) {
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (blog.metaTitle && blog.metaTitle.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (activeTab !== 'all') {
            filtered = filtered.filter(blog => blog.status === activeTab);
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy as keyof UsersBlogType];
            let bValue = b[sortBy as keyof UsersBlogType];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortOrder === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return 0;
        });

        return filtered;
    }, [blogs, searchQuery, sortBy, sortOrder, activeTab]);

    // Blog counts (existing)
    const blogCounts = useMemo(() => {
        const counts: Record<string, number> = {
            all: blogs.length,
            draft: 0,
            submitted: 0,
            under_review: 0,
            approved: 0,
            scheduled: 0,
            rejected: 0,
            archived: 0,
            published: 0
        };

        blogs.forEach(blog => {
            counts[blog.status] = (counts[blog.status] || 0) + 1;
        });

        return counts;
    }, [blogs]);

    // Selection handlers
    const handleBlogSelect = useCallback((blogId: string, selected: boolean) => {
        setSelectedBlogs(prev =>
            selected
                ? [...prev, blogId]
                : prev.filter(id => id !== blogId)
        );
    }, []);

    const handleSelectAll = useCallback((selected: boolean) => {
        setSelectedBlogs(selected ? filteredAndSortedBlogs.map(blog => blog.id) : []);
    }, [filteredAndSortedBlogs]);

    const handleClearSelection = useCallback(() => {
        setSelectedBlogs([]);
    }, []);

    // Bulk actions handler
    const handleBulkAction = useCallback((action: string, blogIds: string[]) => {
        switch (action) {
            case 'publish':
                toast.success(`${blogIds.length} blogs published`);
                break;
            case 'draft':
                toast.success(`${blogIds.length} blogs moved to draft`);
                break;
            case 'archive':
                toast.success(`${blogIds.length} blogs archived`);
                break;
            case 'delete':
                toast.success(`${blogIds.length} blogs deleted`);
                break;
            case 'export':
                const csvContent = [
                    'Title,Status,Word Count,Reactions,Comments,Created Date',
                    ...blogs.filter(blog => blogIds.includes(blog.id)).map(blog =>
                        `"${blog.title.replace(/"/g, '""')}",${blog.status},${blog.wordCount},${blog.reactionCount},${blog.commentCount},${blog.createdAt ? new Date(blog.createdAt).toISOString() : ""}`
                    )
                ].join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Promptly Blog | blogs-export-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success(`${blogIds.length} blogs exported`);
                break;
        }
        setSelectedBlogs([]);
    }, [blogs]);

    // Existing handlers
    const handleBlogEdit = useCallback((blogId: string) => {
        router.push(`/dashboard/blogs/edit/${blogId}`);
    }, [router]);

    const handleBlogDelete = useCallback((blogId: string) => {
        toast.success('Blog deleted successfully!');
    }, []);

    const handleBlogArchive = useCallback((blogId: string) => {
        toast.success('Blog archived successfully!');
    }, []);

    const handleBlogDuplicate = useCallback((blogId: string) => {
        toast.success('Blog duplicated successfully!');
    }, []);

    const handleRefresh = useCallback(async () => {
        router.refresh();
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    }, []);

    const handleNewPost = () => {
        router.push('/write');
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        updateUrlParams('search', value);
    };

    const clearSearch = () => {
        setSearchQuery('');
        updateUrlParams('search', '');
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        updateUrlParams('sortBy', value);
    };

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(newOrder);
        updateUrlParams('sortOrder', newOrder);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        updateUrlParams('tab', value);
    };

    const handleViewModeChange = (mode: 'grid' | 'list') => {
        setViewMode(mode);
        updateUrlParams('view', mode);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setActiveTab('all');
        updateUrlParams('search', '');
        updateUrlParams('status', '');
        updateUrlParams('tab', '');
    };

    const hasActiveFilters = searchQuery || activeTab !== 'all';
    const allSelected = selectedBlogs.length === filteredAndSortedBlogs.length && filteredAndSortedBlogs.length > 0;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Enhanced Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                                Manage Blogs
                            </h1>
                            <p className="text-slate-600">
                                Create, edit, and manage all your blog posts with advanced analytics
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleNewPost}
                                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Post</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Analytics Card */}
                {showAnalytics && (
                    <AnalyticsCard blogs={blogs} />
                )}

                {/* Bulk Actions */}
                <BulkActions
                    selectedBlogs={selectedBlogs}
                    onBulkAction={handleBulkAction}
                    onClearSelection={handleClearSelection}
                />

                {/* Enhanced Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by title, excerpt, or meta title..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
                            >
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>

                    {/* Mobile Filters Toggle */}
                    <div className="flex items-center justify-between mb-4 lg:hidden">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Filters */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                        {/* Status Filter */}
                        {/* <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <config.icon className="w-3 h-3" />
                                            {config.text}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Visibility Filter */}
                        {/* <Select value={selectedVisibility} onValueChange={setSelectedVisibility}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Visibility</SelectItem>
                                {Object.entries(visibilityConfig).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        <div className="flex items-center gap-2">
                                            <config.icon className="w-3 h-3" />
                                            {config.text}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select> */}

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={handleSortChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="updatedAt">Last Updated</SelectItem>
                                <SelectItem value="createdAt">Created Date</SelectItem>
                                <SelectItem value="publishedAt">Published Date</SelectItem>
                                <SelectItem value="title">Title</SelectItem>
                                <SelectItem value="wordCount">Word Count</SelectItem>
                                <SelectItem value="reactionCount">Reactions</SelectItem>
                                <SelectItem value="commentCount">Comments</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Sort Order */}
                        <button
                            onClick={toggleSortOrder}
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                            {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                            <span className="hidden sm:inline">
                                {sortOrder === 'desc' ? 'Desc' : 'Asc'}
                            </span>
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handleViewModeChange('grid')}
                                className={`flex-1 flex items-center justify-center py-2 px-3 transition-colors ${viewMode === 'grid'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleViewModeChange('list')}
                                className={`flex-1 flex items-center justify-center py-2 px-3 transition-colors ${viewMode === 'list'
                                    ? 'bg-sky-100 text-sky-700'
                                    : 'bg-white text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Clear Filters (Desktop) */}
                    {hasActiveFilters && (
                        <div className="hidden lg:flex justify-end mt-4">
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <div className="p-4 border-b border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-slate-900">Posts</h2>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm text-slate-500">
                                        {filteredAndSortedBlogs.length} of {blogs.length}
                                    </div>
                                    {filteredAndSortedBlogs.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={allSelected}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <span className="text-sm text-slate-600">Select all</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <TabsList className="w-full justify-start overflow-x-auto">
                                <TabsTrigger value="all" className="flex items-center gap-2 whitespace-nowrap">
                                    <span>All</span>
                                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                                        {blogCounts.all}
                                    </span>
                                </TabsTrigger>
                                {Object.entries(statusConfig).map(([key, config]) => (
                                    <TabsTrigger
                                        key={key}
                                        value={key}
                                        className="flex items-center gap-2 whitespace-nowrap"
                                    >
                                        <config.icon className="w-3 h-3" />
                                        <span className="hidden sm:inline">{config.text}</span>
                                        <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                                            {blogCounts[key] || 0}
                                        </span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        <TabsContent value={activeTab} className="p-6">
                            {filteredAndSortedBlogs.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-600 mb-2">
                                        No blogs found
                                    </h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        {hasActiveFilters
                                            ? 'Try adjusting your filters or search query to find what you\'re looking for.'
                                            : 'Start creating your first blog post to get started.'
                                        }
                                    </p>
                                    {hasActiveFilters ? (
                                        <button
                                            onClick={clearAllFilters}
                                            className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleNewPost}
                                            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                        >
                                            Create Your First Post
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* Blog List */}
                                    <div className={viewMode === 'grid'
                                        ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
                                        : 'space-y-4'
                                    }>
                                        {filteredAndSortedBlogs.map(blog => (
                                            <EnhancedBlogCard
                                                key={blog.id}
                                                blog={blog}
                                                viewMode={viewMode}
                                                isSelected={selectedBlogs.includes(blog.id)}
                                                onSelect={handleBlogSelect}
                                                onEdit={handleBlogEdit}
                                                onDelete={handleBlogDelete}
                                                onArchive={handleBlogArchive}
                                                onDuplicate={handleBlogDuplicate}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Results Summary */}
                {filteredAndSortedBlogs.length > 0 && (
                    <div className="text-center text-slate-500 text-sm">
                        Showing {filteredAndSortedBlogs.length} of {blogs.length} posts
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="ml-2 text-sky-600 hover:text-sky-700 underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Quick Actions FAB (Mobile) */}
                <div className="fixed bottom-6 right-6 lg:hidden">
                    <button
                        onClick={handleNewPost}
                        className="bg-sky-600 hover:bg-sky-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                        aria-label="Create new post"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedManageBlogs;