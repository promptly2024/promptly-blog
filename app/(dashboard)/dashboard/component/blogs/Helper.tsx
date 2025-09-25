// Enhanced version with additional features and improvements

"use client";
import React, { useMemo, useState } from 'react';
import { UsersBlogType, BlogStatusType } from '@/actions/fetchAllPostByUser';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Edit,
    Trash2,
    Eye,
    Calendar,
    Clock,
    MessageCircle,
    Heart,
    Globe,
    Link,
    Lock,
    Archive,
    CheckCircle,
    XCircle,
    FileText,
    MoreHorizontal,
    ExternalLink,
    Copy,
    Share2,
    Download,
    Upload,
    TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export const statusConfig = {
    draft: {
        icon: FileText,
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        text: 'Draft',
        description: 'Work in progress',
        priority: 1
    },
    under_review: {
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Under Review',
        description: 'Being reviewed',
        priority: 3
    },
    approved: {
        icon: CheckCircle,
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        text: 'Approved',
        description: 'Ready to publish',
        priority: 4
    },
    scheduled: {
        icon: Calendar,
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        text: 'Scheduled',
        description: 'Scheduled for later',
        priority: 5
    },
    rejected: {
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rejected',
        description: 'Needs revision',
        priority: 7
    },
    archived: {
        icon: Archive,
        color: 'bg-slate-100 text-slate-800 border-slate-200',
        text: 'Archived',
        description: 'No longer active',
        priority: 8
    }
};

export const AnalyticsCard = ({ blogs }: { blogs: UsersBlogType[] }) => {
    const stats = useMemo(() => {
        const totalBlogs = blogs.length;
        const publishedBlogs = blogs.filter(b => b.status === 'published').length;
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.wordCount || 0), 0);
        const totalReactions = blogs.reduce((sum, blog) => sum + (typeof blog.reactionCount === 'number' ? blog.reactionCount : 0), 0);
        const totalComments = blogs.reduce((sum, blog) => sum + (typeof blog.commentCount === 'number' ? blog.commentCount : 0), 0);
        const avgReadingTime = totalBlogs > 0 ? Math.round(blogs.reduce((sum, blog) => sum + (blog.readingTimeMins || 0), 0) / totalBlogs) : 0;

        return {
            totalBlogs,
            publishedBlogs,
            totalViews,
            totalReactions,
            totalComments,
            avgReadingTime,
            publishRate: totalBlogs > 0 ? Math.round((publishedBlogs / totalBlogs) * 100) : 0
        };
    }, [blogs]);

    return (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl border border-sky-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-sky-600" />
                <h3 className="font-semibold text-slate-900">Blog Analytics</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="text-center">
                    <div className="text-2xl font-bold text-sky-600">{stats.totalBlogs}</div>
                    <div className="text-xs text-slate-600">Total Posts</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.publishedBlogs}</div>
                    <div className="text-xs text-slate-600">Published</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.publishRate}%</div>
                    <div className="text-xs text-slate-600">Publish Rate</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.totalReactions}</div>
                    <div className="text-xs text-slate-600">Total Reactions</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalComments}</div>
                    <div className="text-xs text-slate-600">Comments</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-slate-600">{stats.avgReadingTime}m</div>
                    <div className="text-xs text-slate-600">Avg Read Time</div>
                </div>
            </div>
        </div>
    );
};

export const BulkActions = ({ selectedBlogs, onBulkAction, onClearSelection }: {
    selectedBlogs: string[];
    onBulkAction: (action: string, blogIds: string[]) => void;
    onClearSelection: () => void;
}) => {
    if (selectedBlogs.length === 0) return null;

    return (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-sky-900">
                        {selectedBlogs.length} blog{selectedBlogs.length !== 1 ? 's' : ''} selected
                    </span>
                    <button
                        onClick={onClearSelection}
                        className="text-xs text-sky-600 hover:text-sky-800 underline"
                    >
                        Clear selection
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <Select onValueChange={(value) => onBulkAction(value, selectedBlogs)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Bulk actions" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="publish">Publish All</SelectItem>
                            <SelectItem value="draft">Move to Draft</SelectItem>
                            <SelectItem value="archive">Archive All</SelectItem>
                            <SelectItem value="delete">Delete All</SelectItem>
                            <SelectItem value="export">Export Selected</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};

export const StatusBadge = ({ status, blog }: { status: BlogStatusType; blog?: UsersBlogType }) => {
    const config = statusConfig[status];
    const IconComponent = config.icon;

    let tooltipText = config.description;
    if (blog) {
        if (status === 'scheduled' && blog.scheduledAt) {
            tooltipText = `Scheduled for ${new Date(blog.scheduledAt).toLocaleString()}`;
        } else if (status === 'rejected' && blog.rejectionReason) {
            tooltipText = `Rejected: ${blog.rejectionReason}`;
        }
    }

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
            title={tooltipText}
        >
            <IconComponent className="w-3 h-3" />
            <span className="hidden sm:inline">{config.text}</span>
        </div>
    );
};

export const EnhancedBlogCard = ({
    blog,
    isSelected,
    onSelect,
    onEdit,
    onDelete,
    onDuplicate,
    onArchive,
    viewMode = 'grid'
}: {
    blog: UsersBlogType;
    isSelected: boolean;
    onSelect: (id: string, selected: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
    viewMode?: 'grid' | 'list';
}) => {
    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getEngagementRate = () => {
        const total = (blog.reactionCount || 0) + (blog.commentCount || 0);
        const views = blog.wordCount || 1; // Using wordCount as proxy for views
        return views > 0 ? ((total / views) * 100).toFixed(1) : '0.0';
    };

    if (viewMode === 'list') {
        return (
            <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${isSelected ? 'ring-2 ring-sky-500 border-sky-300' : 'border-slate-200'}`}>
                <div className="flex items-start gap-4">
                    <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelect(blog.id, !!checked)}
                        className="mt-1"
                    />
                    <img
                        src={blog.coverImageUrl || '/default-thumbnail.png'}
                        alt={blog.coverImageAlt || 'Cover'}
                        className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-slate-900 line-clamp-1 mb-2">
                                    {blog.title}
                                </h3>
                                {blog.excerpt && (
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                                        {blog.excerpt}
                                    </p>
                                )}
                                <div className="flex items-center gap-3 flex-wrap">
                                    <StatusBadge status={blog.status} blog={blog} />
                                    <span className="text-xs text-slate-500">
                                        Updated {formatDate(blog.updatedAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="text-right text-xs text-slate-500">
                                    <div>{blog.wordCount} words</div>
                                    <div>{getEngagementRate()}% engagement</div>
                                </div>
                                <ActionDropdown
                                    blog={blog}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    onDuplicate={onDuplicate}
                                    onArchive={onArchive}
                                    viewMode="list"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${isSelected ? 'ring-2 ring-sky-500 border-sky-300' : 'border-slate-200'}`}>
            <div className="relative">
                <img
                    src={blog.coverImageUrl || '/default-thumbnail.png'}
                    alt={blog.coverImageAlt || 'Cover'}
                    className="w-full h-40 object-cover"
                />
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => onSelect(blog.id, !!checked)}
                    className="absolute top-3 left-3 bg-white border-white shadow-sm"
                />
                {blog.status === 'published' && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Live
                    </div>
                )}
            </div>
            <div className="p-5">
                <h3 className="font-semibold text-slate-900 line-clamp-2 mb-2">
                    {blog.title}
                </h3>
                {blog.excerpt && (
                    <p className="text-slate-600 text-sm line-clamp-2 mb-3">
                        {blog.excerpt}
                    </p>
                )}

                <div className="flex items-center gap-2 mb-4">
                    <StatusBadge status={blog.status} blog={blog} />
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap mb-4">
                    <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{blog.wordCount} words</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{blog.readingTimeMins}m read</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{blog.reactionCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{blog.commentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{getEngagementRate()}%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
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
                            onArchive={onArchive}
                            viewMode="grid"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ActionDropdown = ({ 
    blog, 
    onEdit, 
    onDelete, 
    onDuplicate, 
    onArchive,
    viewMode = 'grid'
}: {
    blog: UsersBlogType;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onArchive: (id: string) => void;
    viewMode?: 'grid' | 'list';
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

    const handleExportAnalytics = () => {
        const csvContent = [
            'Metric,Value',
            `Title,"${blog.title}"`,
            `Status,${blog.status}`,
            `Word Count,${blog.wordCount}`,
            `Reading Time,${blog.readingTimeMins}`,
            `Reactions,${blog.reactionCount}`,
            `Comments,${blog.commentCount}`,
            `Created,${blog.createdAt}`,
            `Published,${blog.publishedAt || 'Not published'}`
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${blog.slug}-analytics.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
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
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className={`absolute right-0 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 ${
                        viewMode === 'grid' 
                            ? 'bottom-full mb-1' // Opens upward in grid mode
                            : 'top-full mt-1'   // Opens downward in list mode
                    }`}>
                        {[
                            { icon: Edit, label: 'Edit', action: () => onEdit(blog.id), color: 'text-slate-700' },
                            { icon: ExternalLink, label: 'View', action: () => window.open(`/blog/${blog.slug}`, '_blank'), color: 'text-slate-700' },
                            { icon: Copy, label: 'Copy Link', action: handleCopyLink, color: 'text-slate-700' },
                            { icon: Share2, label: 'Share', action: handleShare, color: 'text-slate-700' },
                            { icon: Download, label: 'Export Data', action: handleExportAnalytics, color: 'text-slate-700' },
                            { icon: Copy, label: 'Duplicate', action: () => onDuplicate(blog.id), color: 'text-slate-700' },
                            { icon: Archive, label: 'Archive', action: () => onArchive(blog.id), color: 'text-slate-700' },
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
