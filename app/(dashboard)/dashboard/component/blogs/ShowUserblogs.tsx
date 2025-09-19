"use client";
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UsersBlogType, BlogStatusType, BlogVisibilityType } from '@/actions/fetchAllPostByUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Eye,
    Calendar,
    Clock,
    BarChart3,
    MessageCircle,
    Heart,
    Globe,
    Link,
    Lock,
    Archive,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    MoreHorizontal,
    ExternalLink,
    Copy,
    Share2,
    SortDesc,
    SortAsc,
    X,
    ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

// Status configuration for badges and colors
const statusConfig = {
    draft: {
        icon: FileText,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Draft',
        description: 'Work in progress'
    },
    submitted: {
        icon: CheckCircle,
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'Submitted',
        description: 'Waiting for review'
    },
    under_review: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Under Review',
        description: 'Being reviewed'
    },
    approved: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved',
        description: 'Ready to publish'
    },
    scheduled: {
        icon: Calendar,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Scheduled',
        description: 'Scheduled for later'
    },
    rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rejected',
        description: 'Needs revision'
    },
    archived: {
        icon: Archive,
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        text: 'Archived',
        description: 'No longer active'
    },
    published: {
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200',
        text: 'Published',
        description: 'Live on the site'
    }
};

const visibilityConfig = {
    public: { icon: Globe, color: 'text-green-600', text: 'Public' },
    unlisted: { icon: Link, color: 'text-orange-600', text: 'Unlisted' },
    private: { icon: Lock, color: 'text-red-600', text: 'Private' }
};

// Loading Spinner Component
const LoadingSpinner = ({ className = "" }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: BlogStatusType }) => {
    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <IconComponent className="w-3 h-3" />
            <span className="hidden sm:inline">{config.text}</span>
        </div>
    );
};

// Visibility Icon Component
const VisibilityIcon = ({ visibility }: { visibility: BlogVisibilityType }) => {
    const config = visibilityConfig[visibility];
    const IconComponent = config.icon;

    return (
        <div className="flex items-center gap-1" title={config.text}>
            <IconComponent className={`w-4 h-4 ${config.color}`} />
            <span className="hidden md:inline text-sm text-slate-600">{config.text}</span>
        </div>
    );
};

// Blog Stats Component
const BlogStats = ({ blog }: { blog: UsersBlogType }) => (
    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{blog.wordCount}</span>
        </div>
        <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{blog.readingTimeMins}m</span>
        </div>
        <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{blog.commentCount}</span>
        </div>
        <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{blog.reactionCount}</span>
        </div>
    </div>
);

// Action Dropdown Component
const ActionDropdown = ({ blog, onEdit, onDelete, onDuplicate }: {
    blog: UsersBlogType;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/blog/${blog.slug}`);
        toast.success('Link copied to clipboard!');
        setIsOpen(false);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: blog.title,
                url: `${window.location.origin}/blog/${blog.slug}`,
            });
        } else {
            handleCopyLink();
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="More actions"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-20">
                        {[
                            { icon: Edit, label: 'Edit', action: () => onEdit(blog.id), color: 'text-slate-700' },
                            { icon: ExternalLink, label: 'View', action: () => window.open(`/blog/${blog.slug}`, '_blank'), color: 'text-slate-700' },
                            { icon: Copy, label: 'Copy Link', action: handleCopyLink, color: 'text-slate-700' },
                            { icon: Share2, label: 'Share', action: handleShare, color: 'text-slate-700' },
                            { icon: Copy, label: 'Duplicate', action: () => onDuplicate(blog.id), color: 'text-slate-700' },
                            { icon: Trash2, label: 'Delete', action: () => onDelete(blog.id), color: 'text-red-600', divider: true },
                        ].map((item, index) => (
                            <div key={index}>
                                {item.divider && <hr className="my-1 border-slate-200" />}
                                <button
                                    onClick={() => { item.action(); setIsOpen(false); }}
                                    className={`flex items-center gap-3 px-3 py-2 ${item.color} hover:bg-slate-50 transition-colors w-full text-left text-sm`}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Mobile Blog Card Component
const MobileBlogCard = ({ blog, onEdit, onDelete, onDuplicate }: {
    blog: UsersBlogType;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex gap-3">
                <img
                    src={blog.coverImageUrl || '/default-thumbnail.png'}
                    alt={blog.coverImageAlt || 'Cover'}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-slate-900 text-sm line-clamp-2 leading-tight">
                            {blog.title}
                        </h3>
                        <ActionDropdown
                            blog={blog}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                        />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <StatusBadge status={blog.status} />
                        <VisibilityIcon visibility={blog.visibility} />
                    </div>
                    <div className="flex items-center justify-between mt-3">
                        <BlogStats blog={blog} />
                        <span className="text-xs text-slate-500">
                            {formatDate(blog.updatedAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Desktop Blog Card Component
const DesktopBlogCard = ({ blog, onEdit, onDelete, onDuplicate }: {
    blog: UsersBlogType;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
}) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
            <img
                src={blog.coverImageUrl || '/default-thumbnail.png'}
                alt={blog.coverImageAlt || 'Cover'}
                className="w-full h-40 object-cover"
            />
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                            {blog.title}
                        </h3>
                        {blog.excerpt && (
                            <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                {blog.excerpt}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={blog.status} />
                    <VisibilityIcon visibility={blog.visibility} />
                </div>

                <BlogStats blog={blog} />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                        Updated {formatDate(blog.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onEdit(blog.id)}
                            className="p-2 hover:bg-sky-50 rounded-lg transition-colors text-sky-600"
                            title="Edit"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                            title="View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <ActionDropdown
                            blog={blog}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onDuplicate={onDuplicate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Filter Button Component
const FilterButton = ({ isActive, onClick, children }: {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
            ? 'bg-sky-100 text-sky-700 border border-sky-200'
            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
    >
        {children}
    </button>
);

// Main Component
interface ManageBlogsProps {
    blogs: UsersBlogType[];
}

const ManageBlogs: React.FC<ManageBlogsProps> = ({ blogs }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedVisibility, setSelectedVisibility] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [activeTab, setActiveTab] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Update URL params
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

    // Initialize from URL params
    useEffect(() => {
        setSearchQuery(searchParams.get('search') || '');
        setSelectedStatus(searchParams.get('status') || 'all');
        setSelectedVisibility(searchParams.get('visibility') || 'all');
        setSortBy(searchParams.get('sortBy') || 'updatedAt');
        setSortOrder(searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc');
        setActiveTab(searchParams.get('tab') || 'all');
    }, [searchParams]);

    // Filter and sort blogs
    const filteredAndSortedBlogs = useMemo(() => {
        let filtered = blogs;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (blog.excerpt && blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by status
        if (selectedStatus !== 'all') {
            filtered = filtered.filter(blog => blog.status === selectedStatus);
        }

        // Filter by visibility
        if (selectedVisibility !== 'all') {
            filtered = filtered.filter(blog => blog.visibility === selectedVisibility);
        }

        // Filter by tab
        if (activeTab !== 'all') {
            filtered = filtered.filter(blog => blog.status === activeTab);
        }

        // Sort blogs
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
    }, [blogs, searchQuery, selectedStatus, selectedVisibility, sortBy, sortOrder, activeTab]);

    // Get blog counts for tabs
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

    // Handlers
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

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedStatus('all');
        setSelectedVisibility('all');
        setActiveTab('all');
        updateUrlParams('search', '');
        updateUrlParams('status', '');
        updateUrlParams('visibility', '');
        updateUrlParams('tab', '');
    };

    const hasActiveFilters = searchQuery || selectedStatus !== 'all' || selectedVisibility !== 'all' || activeTab !== 'all';

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                                Manage Blogs
                            </h1>
                            <p className="text-slate-600">
                                Create, edit, and manage all your blog posts
                            </p>
                        </div>
                        <button
                            onClick={handleNewPost}
                            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Post</span>
                        </button>
                    </div>
                </div>

                {/* Search and Quick Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                    {/* Search Bar */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search blogs..."
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
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
                        {/* Status Filter */}

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
                                <div className="text-sm text-slate-500">
                                    {filteredAndSortedBlogs.length} of {blogs.length}
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
                                    {/* Mobile List View */}
                                    <div className="block lg:hidden space-y-3">
                                        {filteredAndSortedBlogs.map(blog => (
                                            <MobileBlogCard
                                                key={blog.id}
                                                blog={blog}
                                                onEdit={handleBlogEdit}
                                                onDelete={handleBlogDelete}
                                                onDuplicate={handleBlogDuplicate}
                                            />
                                        ))}
                                    </div>

                                    {/* Desktop Grid View */}
                                    <div className="hidden lg:grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                                        {filteredAndSortedBlogs.map(blog => (
                                            <DesktopBlogCard
                                                key={blog.id}
                                                blog={blog}
                                                onEdit={handleBlogEdit}
                                                onDelete={handleBlogDelete}
                                                onDuplicate={handleBlogDuplicate}
                                            />
                                        ))}
                                    </div>

                                    {/* Load More Button (if needed) */}
                                    {filteredAndSortedBlogs.length > 12 && (
                                        <div className="text-center mt-8">
                                            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors">
                                                Load More Posts
                                            </button>
                                        </div>
                                    )}
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

export default ManageBlogs;