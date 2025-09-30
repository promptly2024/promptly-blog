"use client";

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CommentsResponse {
    query: {
        id: string;
        name: string;
        email: string;
        subject: string | null;
        category: string | null;
        message: string;
        status: "new" | "in_progress" | "resolved";
        reply: string | null;
        repliedAt: Date | null;
        repliedBy: string | null;
        createdAt: Date;
        updatedAt: Date;
    };
    admin: {
        id: string;
        name: string;
        email: string;
        profileImage: string | null;
        siteRole: "user" | "admin";
    } | null;
};
interface CommentsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Skeleton component for loading state
const Skeleton: React.FC<{ rows?: number, columns?: number }> = ({ rows = 8, columns = 6 }) => (
    <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
            <tbody>
                {[...Array(rows)].map((_, rowIdx) => (
                    <tr key={rowIdx}>
                        {[...Array(columns)].map((_, colIdx) => (
                            <td key={colIdx} className="px-4 py-2">
                                <div className="h-6 bg-gray-200 rounded w-full" />
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const DetailsModal: React.FC<{
    open: boolean;
    comment: CommentsResponse | null;
    onClose: () => void;
    onUpdate: (status: "in_progress" | "resolved", reply: string) => Promise<void>;
    onDelete: () => void;
    updating: boolean;
    deleting: boolean;
}> = ({ open, comment, onClose, onUpdate, onDelete, updating, deleting }) => {
    const [statusUpdate, setStatusUpdate] = useState<"in_progress" | "resolved">("in_progress");
    const [replyUpdate, setReplyUpdate] = useState<string>("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    React.useEffect(() => {
        if (comment) {
            setStatusUpdate(comment.query.status === "new" ? "in_progress" : comment.query.status);
            setReplyUpdate(comment.query.reply || "");
        }
    }, [comment]);

    if (!open || !comment) return null;

    const canReply = !comment.query.reply;
    // Only allow update if not resolved
    const canUpdateStatus = comment.query.status !== "resolved" || canReply;
    // Disable form if resolved
    const isResolved = comment.query.status === "resolved";

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <div
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-2 flex flex-col max-h-[90vh] overflow-hidden"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}
            >
                {/* Sticky header */}
                <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold">Comment/Report Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold focus:outline-none cursor-pointer"
                        aria-label="Close"
                        title="Close details"
                    >
                        &times;
                    </button>
                </div>
                <div className="overflow-y-auto px-6 py-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Name:</span> {comment.query.name}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Email:</span> {comment.query.email}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Subject:</span> {comment.query.subject || 'N/A'}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Category:</span> {comment.query.category || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Status:</span>{" "}
                                <span className={
                                    comment.query.status === "new"
                                        ? "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                        : comment.query.status === "in_progress"
                                            ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                                            : "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                }>
                                    {comment.query.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Created At:</span> {new Date(comment.query.createdAt).toLocaleString()}
                            </div>
                            <div className="mb-2">
                                <span className="font-semibold text-gray-700">Updated At:</span> {new Date(comment.query.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="mb-4">
                        <span className="font-semibold text-gray-700">Message:</span>
                        <div
                            className="bg-gray-50 rounded p-3 mt-1 border text-gray-800 whitespace-pre-line"
                            style={{
                                maxHeight: 200,
                                overflowY: 'auto',
                                fontSize: '1rem',
                                lineHeight: '1.5',
                                wordBreak: 'break-word'
                            }}
                        >
                            {comment.query.message}
                        </div>
                    </div>
                    {comment.query.reply && (
                        <div className="mb-4 border rounded-lg bg-green-50 p-4 flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-shrink-0">
                                {comment.admin?.profileImage ? (
                                    <img
                                        src={comment.admin.profileImage}
                                        alt={comment.admin.name}
                                        className="w-14 h-14 rounded-full border object-cover"
                                        title={comment.admin.name}
                                    />
                                ) : (
                                    <div
                                        className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-2xl text-gray-500 font-bold"
                                        title={comment.admin?.name || "Admin"}
                                    >
                                        {comment.admin?.name?.[0] || "A"}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <span className="font-semibold text-green-700">Replied by:</span>
                                    <span className="text-gray-800">{comment.admin?.name || "N/A"}</span>
                                    <span className="text-gray-500 text-xs">({comment.admin?.email || "N/A"})</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                    {comment.query.repliedAt ? new Date(comment.query.repliedAt).toLocaleString() : 'N/A'}
                                </div>
                                <div className="bg-white border rounded p-2 text-gray-800">
                                    {comment.query.reply}
                                </div>
                            </div>
                        </div>
                    )}
                    {canUpdateStatus && (
                        <form
                            className="space-y-3"
                            onSubmit={async e => {
                                e.preventDefault();
                                await onUpdate(statusUpdate, replyUpdate);
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={statusUpdate}
                                        onChange={e => setStatusUpdate(e.target.value as "in_progress" | "resolved")}
                                        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                                        disabled={updating || isResolved}
                                        title="Change status"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                    </select>
                                </div>
                                {canReply && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Reply</label>
                                        <textarea
                                            value={replyUpdate}
                                            onChange={e => setReplyUpdate(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            placeholder="Write your reply here..."
                                            disabled={updating || isResolved}
                                            title="Write your reply"
                                        />
                                        <div className="mb-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-1">
                                            You can reply only once. Your reply will be sent to the user via email.
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold cursor-pointer"
                                    disabled={updating || isResolved}
                                    title="Save changes"
                                >
                                    {updating ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-2 px-6 py-4 border-t bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition w-full sm:w-auto font-medium cursor-pointer"
                        title="Close details"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition w-full sm:w-auto font-medium cursor-pointer"
                        disabled={deleting}
                        title="Delete comment/report"
                    >
                        Delete
                    </button>
                </div>
                {/* Custom Delete Confirmation Dialog */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full">
                            <div className="mb-4 text-center">
                                <div className="text-lg font-semibold mb-2">Delete Comment/Report?</div>
                                <div className="text-sm text-gray-600">Are you sure you want to delete this comment/report? This action cannot be undone.</div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition cursor-pointer"
                                    disabled={deleting}
                                    title="Cancel deletion"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        onDelete();
                                    }}
                                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition cursor-pointer"
                                    disabled={deleting}
                                    title="Confirm delete"
                                >
                                    {deleting ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Comments = () => {
    const [comments, setComments] = React.useState<CommentsResponse[]>([]);
    const [pagination, setPagination] = React.useState<CommentsPagination>({
        page: 0,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });
    const [loading, setLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const [selectedComment, setSelectedComment] = React.useState<CommentsResponse | null>(null);
    const [modalOpen, setModalOpen] = React.useState<boolean>(false);
    const [detailsModalOpen, setDetailsModal] = React.useState<boolean>(false);
    const [updating, setUpdating] = React.useState(false);
    const [deleting, setDeleting] = React.useState(false);
    const [search, setSearch] = React.useState<string>("");
    const [statusFilter, setStatusFilter] = React.useState<string>("");
    const [perPage, setPerPage] = React.useState<number>(10);

    const fetchComments = useCallback((page = 1, limit = perPage, searchTerm = search, status = statusFilter) => {
        setLoading(true);
        setError(null);
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sort: "desc",
            search: searchTerm,
            status: status,
        });
        fetch(`/api/admin/queries?${queryParams.toString()}`)
            .then(res => res.json())
            .then(data => {
                setComments(data.data);
                setPagination(data.pagination);
            }).catch(err => {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                toast.error(errorMessage || 'Error fetching comments');
                setError(errorMessage || 'Error fetching comments');
            }).finally(() => {
                setLoading(false);
            });
    }, [perPage, search, statusFilter]);

    useEffect(() => {
        fetchComments(1, perPage, search, statusFilter);
        updateStatusNewToInProgress();
    }, [fetchComments, perPage, search, statusFilter]);

    const handleUpdateStatus = useCallback(async (id: string, status: "in_progress" | "resolved", reply?: string) => {
        setUpdating(true);
        try {
            const response = await fetch(`/api/admin/queries/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status, reply }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update status');
            }
            setComments(prevComments => prevComments.map(comment => comment.query.id === id ? { ...comment, query: data.query } : comment));
            toast.success('Status updated successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(errorMessage || 'Error updating status');
        } finally {
            setUpdating(false);
        }
    }, []);

    const isOlderThan24Hours = (date: Date | string) => {
        return Date.now() - new Date(date).getTime() > 24 * 60 * 60 * 1000;
    };

    const updateStatusNewToInProgress = () => {
        comments
            .filter(comment => comment.query.status === "new" && isOlderThan24Hours(comment.query.createdAt))
            .forEach(comment => {
                handleUpdateStatus(comment.query.id, "in_progress");
            });
    }

    const handleDelete = useCallback(async (id: string) => {
        setDeleting(true);
        try {
            const response = await fetch(`/api/admin/queries/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete comment/report');
            }
            setComments(prevComments => prevComments.filter(comment => comment.query.id !== id));
            toast.success('Comment/report deleted successfully');
            setDetailsModal(false);
            setSelectedComment(null);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast.error(errorMessage || 'Error deleting comment/report');
        } finally {
            setDeleting(false);
        }
    }, []);

    const openDetailsModal = useCallback((comment: CommentsResponse) => {
        setSelectedComment(comment);
        setDetailsModal(true);
    }, []);
    const closeDetailsModal = useCallback(() => {
        setDetailsModal(false);
        setSelectedComment(null);
    }, []);

    const handlePageChange = useCallback((page: number) => {
        fetchComments(page, perPage, search, statusFilter);
    }, [fetchComments, perPage, search, statusFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);
    };

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {/* Search and filter controls */}
            <form
                className="flex flex-wrap gap-2 mb-4 items-end bg-gray-50 p-3 rounded shadow-sm"
                onSubmit={e => e.preventDefault()}
            >
                <div>
                    <label className="block text-xs font-medium text-gray-600">Search</label>
                    <input
                        type="text"
                        className="border rounded px-2 py-1 text-sm"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search by name, email, subject..."
                        title="Search comments"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-600">Status</label>
                    <select
                        className="border rounded px-2 py-1 text-sm cursor-pointer"
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        title="Filter by status"
                    >
                        <option value="">All</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </form>
            {error && <div className="text-red-600 mt-4">{error}</div>}
            {!error && (
                <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subject</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Created At</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6">
                                        <Skeleton rows={4} columns={6} />
                                    </td>
                                </tr>
                            ) : comments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                        No comments or reports found.
                                    </td>
                                </tr>
                            ) : (
                                comments.map(comment => (
                                    <tr
                                        key={comment.query.id}
                                        className="hover:bg-gray-50 transition cursor-pointer"
                                        title="Click to view details"
                                    >
                                        <td className="px-4 py-2 whitespace-nowrap">{comment.query.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{comment.query.email}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">{comment.query.subject || 'N/A'}</td>
                                        <td className="px-4 py-2 whitespace-nowrap capitalize">
                                            <span className={
                                                comment.query.status === "new"
                                                    ? "bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
                                                    : comment.query.status === "in_progress"
                                                        ? "bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs"
                                                        : "bg-green-100 text-green-700 px-2 py-1 rounded text-xs"
                                            }
                                                title={`Status: ${comment.query.status.replace('_', ' ')}`}
                                            >
                                                {comment.query.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{new Date(comment.query.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-2 whitespace-nowrap flex gap-2">
                                            <button
                                                onClick={() => openDetailsModal(comment)}
                                                className="inline-flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                                                title="View details"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
            {
                pagination && (
                    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between mt-4 gap-3 sm:gap-2 w-full">
                        <div className="text-xs text-gray-600 w-full sm:w-auto text-center sm:text-left">
                            Page {pagination.page} of {pagination.totalPages} | {pagination.total} queries
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto">
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer min-w-[90px] justify-center"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    title="Go to previous page"
                                >
                                    <ChevronLeft /> Previous
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={pagination.totalPages}
                                    value={pagination.page}
                                    onChange={e => handlePageChange(Number(e.target.value))}
                                    className="w-16 px-2 py-1 border rounded text-sm text-center"
                                    style={{ minWidth: 0 }}
                                    title="Current page number"
                                />
                                <button
                                    className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center gap-1 disabled:opacity-50 cursor-pointer min-w-[90px] justify-center"
                                    disabled={!pagination.hasNext}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    title="Go to next page"
                                >
                                    Next <ChevronRight />
                                </button>
                            </div>
                            {/* Page size selector */}
                            <select
                                className="w-full sm:w-auto ml-0 sm:ml-2 px-2 py-1 border rounded text-sm cursor-pointer"
                                value={perPage}
                                onChange={e => {
                                    setPerPage(Number(e.target.value));
                                    fetchComments(1, Number(e.target.value), search, statusFilter);
                                }}
                                title="Select number of queries per page"
                            >
                                {[10, 20, 30, 50].map(size => (
                                    <option key={size} value={size}>{size} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )
            }
            {/* Details Modal */}
            <DetailsModal
                open={detailsModalOpen}
                comment={selectedComment}
                onClose={closeDetailsModal}
                onUpdate={async (status, reply) => {
                    if (!selectedComment) return;
                    await handleUpdateStatus(selectedComment.query.id, status, reply);
                }}
                onDelete={async () => {
                    if (!selectedComment) return;
                    await handleDelete(selectedComment.query.id);
                }}
                updating={updating}
                deleting={deleting}
            />
        </div>
    )
}

export default Comments;