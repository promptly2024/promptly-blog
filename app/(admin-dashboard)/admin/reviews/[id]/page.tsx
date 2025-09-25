"use client";

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Tag,
    FolderOpen,
    Eye,
    Globe,
    Lock,
    EyeOff,
    CheckCircle,
    XCircle,
    Archive,
    Send,
    AlertTriangle,
    MessageSquare,
    Heart,
    FileText,
    Edit,
    Users,
    History,
    Save,
    X
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Post {
    id: string;
    authorId: string;
    title: string;
    slug: string;
    excerpt: string | null;
    contentMd: string;
    coverImageId: string | null;
    ogImageUrl: string | null;
    canonicalUrl: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    status: "draft" | "submitted" | "under_review" | "approved" | "scheduled" | "published" | "rejected" | "archived";
    publishedAt: Date | null;
    scheduledAt: Date | null;
    submittedAt: Date | null;
    approvedAt: Date | null;
    rejectedAt: Date | null;
    rejectionReason: string | null;
    wordCount: number | null;
    readingTimeMins: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface Author {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    siteRole: "user" | "admin";
}

interface Collaborator {
    id: string;
    postId: string;
    userId: string;
    role: "contributor" | "reviewer" | "co_author";
    canEdit: boolean;
    canSubmit: boolean;
    canComment: boolean;
    addedByUserId: string | null;
    invitedAt: Date;
    acceptedAt: Date | null;
}

interface Category {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    name: string;
    slug: string;
}

interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    status: "visible" | "hidden" | "flagged" | "deleted";
    createdAt: Date;
    updatedAt: Date;
}

interface Reaction {
    id: string;
    postId: string;
    userId: string;
    type: "like" | "love" | "clap" | "insightful" | "laugh" | "sad" | "angry";
    createdAt: Date;
}

interface Revision {
    id: string;
    postId: string;
    editedByUserId: string | null;
    title: string;
    contentMd: string;
    createdAt: Date;
}

interface AuditLog {
    id: string;
    postId: string;
    adminId: string;
    status: "approved" | "rejected" | "scheduled" | "published" | "archived";
    reason: string | null;
    decidedAt: Date;
}
interface Media {
    url: string;
    type: string;
    provider: string;
    altText: string | null;
    createdBy: string;
    createdAt: Date;
}

interface PostData {
    post: Post;
    author: Author;
    collaborators: Collaborator[];
    categories: Category[];
    tags: Tag[];
    comments: Comment[];
    reactions: Reaction[];
    revisions: Revision[];
    auditLog: AuditLog | null;
    media: Media | null;
}

const PostReviewDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const [data, setData] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [showActionModal, setShowActionModal] = useState<string | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');

    const { id: postId } = React.use(params);

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch(`/api/admin/posts/${postId}`);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch post');
                }

                const result = await response.json();
                setData(result.data[0]);
            } catch (err: any) {
                toast.error(err.message, {
                    description: 'Could not load post data. Please try again.',
                    action: { label: 'Retry', onClick: () => fetchPost() }
                });
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchPost();
        }
        toast.info(`Post ID: ${postId}`, { duration: 3000 });
    }, [postId]);

    // Handle admin actions
    const handleAction = async (action: string) => {
        if (!data) return;

        setActionLoading(true);
        setError(null);

        try {
            const payload: any = {
                action,
                ...(actionReason && { reason: actionReason }),
                ...(action === 'schedule' && scheduledDate && scheduledTime && {
                    scheduledAt: `${scheduledDate}T${scheduledTime}`
                })
            };

            const response = await fetch(`/api/admin/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to perform action');
            }

            // Refresh the page data
            window.location.reload();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setActionLoading(false);
            setShowActionModal(null);
            setActionReason('');
            setScheduledDate('');
            setScheduledTime('');
        }
    };

    const getStatusBadge = (status: Post['status']) => {
        const badges = {
            draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
            submitted: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
            under_review: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
            scheduled: { color: 'bg-purple-100 text-purple-800', text: 'Scheduled' },
            published: { color: 'bg-emerald-100 text-emerald-800', text: 'Published' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
            archived: { color: 'bg-gray-100 text-gray-600', text: 'Archived' }
        };
        return badges[status] || badges.draft;
    };

    const canTakeAction = (currentStatus: string) => {
        const allowedActions = {
            under_review: ['approve', 'reject'],
            approved: ['reject'],
            scheduled: ['approve'], // approve the scheduled one to be public when live on scheduled.
            rejected: ['approve'], // 
            archived: ['']
        };
        return allowedActions[currentStatus as keyof typeof allowedActions] || [];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Posts
                    </button>

                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }


    const { post, author, collaborators, categories, tags, comments, reactions, revisions, auditLog } = data;
    const statusBadge = getStatusBadge(post.status);
    const availableActions = canTakeAction(post.status);

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Posts
                    </button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Post Content */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            {post.coverImageId && (
                                <div className="mb-6">
                                    <img
                                        src={data.media?.url || '/placeholder-image.png'}
                                        alt={post.title}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>

                            {post.excerpt && (
                                <p className="text-lg text-gray-600 mb-6 italic">{post.excerpt}</p>
                            )}

                            <div className="prose prose-gray max-w-none">
                                <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                                    {post.contentMd}
                                </pre>
                            </div>
                        </div>

                        {/* Comments Section */}
                        {comments && comments.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Comments ({comments.length})
                                </h3>
                                <div className="space-y-4">
                                    {comments.slice(0, 3).map((comment) => (
                                        <div key={comment.id} className="border-l-4 border-blue-200 pl-4 py-2">
                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                    {comments.length > 3 && (
                                        <p className="text-sm text-gray-500">
                                            +{comments.length - 3} more comments
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Revisions History */}
                        {revisions && revisions.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <History className="w-5 h-5 mr-2" />
                                    Revision History ({revisions.length})
                                </h3>
                                <div className="space-y-3">
                                    {revisions.slice(0, 3).map((revision) => (
                                        <div key={revision.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{revision.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(revision.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <Edit className="w-4 h-4 text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Action Buttons */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                            <div className="space-y-3">
                                {availableActions.map((action) => {
                                    const actionConfig = {
                                        approve: { icon: CheckCircle, text: 'Approve Post', color: 'bg-green-600 hover:bg-green-700 text-white' },
                                        reject: { icon: XCircle, text: 'Reject Post', color: 'bg-red-600 hover:bg-red-700 text-white' },
                                        schedule: { icon: Calendar, text: 'Schedule Post', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
                                        publish: { icon: Send, text: 'Publish Now', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
                                        archive: { icon: Archive, text: 'Archive Post', color: 'bg-gray-600 hover:bg-gray-700 text-white' }
                                    };

                                    const config = actionConfig[action as keyof typeof actionConfig];
                                    if (!config) return null;

                                    return (
                                        <button
                                            key={action}
                                            onClick={() => setShowActionModal(action)}
                                            disabled={actionLoading}
                                            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${config.color}`}
                                        >
                                            <config.icon className="w-4 h-4" />
                                            {config.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* // rejected reason if availble */}
                        {post.rejectionReason && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Rejection Reason</h3>
                                <p className="text-sm text-gray-700">{post.rejectionReason}</p>
                            </div>
                        )}

                        {/* Post Details */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Post Details</h3>
                            <div className="space-y-4">
                                {/* Author */}
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                        {author.avatarUrl ? (
                                            <img src={author.avatarUrl} alt={author.name} className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-gray-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{author.name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{author.siteRole}</p>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Word Count</span>
                                        <span className="text-gray-900">{post.wordCount || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Reading Time</span>
                                        <span className="text-gray-900">{post.readingTimeMins || 'N/A'} min</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-500">Submitted</span>
                                        <span className="text-gray-900">
                                            {post.submittedAt ? new Date(post.submittedAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    {post.scheduledAt && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-500">Scheduled</span>
                                            <span className="text-gray-900">
                                                {new Date(post.scheduledAt).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Categories & Tags */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Taxonomy</h3>
                            <div className="space-y-4">
                                {categories && categories.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FolderOpen className="w-4 h-4 mr-1" />
                                            Categories
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map((category) => (
                                                <span
                                                    key={category.id}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tags && tags.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <Tag className="w-4 h-4 mr-1" />
                                            Tags
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <span
                                                    key={tag.id}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Collaborators */}
                        {collaborators && collaborators.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Users className="w-5 h-5 mr-2" />
                                    Collaborators ({collaborators.length})
                                </h3>
                                <div className="space-y-3">
                                    {collaborators.map((collab) => (
                                        <div key={collab.id} className="flex items-center justify-between">
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{collab.userId}</p>
                                                <p className="text-xs text-gray-500 capitalize">{collab.role}</p>
                                            </div>
                                            <div className="flex space-x-1">
                                                {collab.canEdit && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Edit</span>}
                                                {collab.canSubmit && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Submit</span>}
                                                {collab.canComment && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Comment</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reactions */}
                        {reactions && reactions.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Heart className="w-5 h-5 mr-2" />
                                    Reactions ({reactions.length})
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(
                                        reactions.reduce((acc, reaction) => {
                                            acc[reaction.type] = (acc[reaction.type] || 0) + 1;
                                            return acc;
                                        }, {} as Record<string, number>)
                                    ).map(([type, count]) => (
                                        <span
                                            key={type}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                                        >
                                            {type}: {count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Audit Log */}
                        {auditLog && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Last Action</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <span className="text-sm font-medium text-gray-900 capitalize">{auditLog.status}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Date</span>
                                        <span className="text-sm text-gray-900">
                                            {new Date(auditLog.decidedAt).toLocaleString()}
                                        </span>
                                    </div>
                                    {auditLog.reason && (
                                        <div className="mt-2">
                                            <span className="text-sm text-gray-500">Reason</span>
                                            <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">{auditLog.reason}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Modals */}
                {showActionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Confirm {showActionModal.charAt(0).toUpperCase() + showActionModal.slice(1)}
                                </h3>
                                <button
                                    onClick={() => setShowActionModal(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-700">
                                    Are you sure you want to {showActionModal} this post?
                                </p>

                                {showActionModal === 'schedule' && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={scheduledDate}
                                                onChange={(e) => setScheduledDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                            <input
                                                type="time"
                                                value={scheduledTime}
                                                onChange={(e) => setScheduledTime(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {(showActionModal === 'reject' || showActionModal === 'archive') && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason {showActionModal === 'reject' ? '(required)' : '(optional)'}
                                        </label>
                                        <textarea
                                            value={actionReason}
                                            onChange={(e) => setActionReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows={3}
                                            placeholder={`Enter reason for ${showActionModal}...`}
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={() => setShowActionModal(null)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleAction(showActionModal)}
                                        disabled={
                                            actionLoading ||
                                            (showActionModal === 'reject' && !actionReason.trim()) ||
                                            (showActionModal === 'schedule' && (!scheduledDate || !scheduledTime))
                                        }
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {actionLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Processing...
                                            </div>
                                        ) : (
                                            `Confirm ${showActionModal.charAt(0).toUpperCase() + showActionModal.slice(1)}`
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostReviewDetailPage;