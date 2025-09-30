"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Users,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Mail,
    Calendar,
    MessageSquare,
    Heart,
    FileText,
    Shield,
    Crown,
    Eye,
    Edit,
    Trash2,
    RefreshCw,
    MoreHorizontal,
    AlertTriangle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { boolean } from 'zod';

// Interface based on your data structure
interface UsersWithStats {
    postCount: number;
    commentCount: number;
    reactionCount: number;
    collaborationsCount: number;
    invitesCount: number;
    id: string;
    clerkId: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    siteRole: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
}
interface Pagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean
}
interface ApiResponse {
    users: UsersWithStats[];
    pagination: Pagination
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<UsersWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter and search states
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [activityFilter, setActivityFilter] = useState<"all" | "none" | "published">("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        pageSize: 0,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    // UI states
    const [confirmRoleChange, setConfirmRoleChange] = useState<{
        userId: string;
        userName: string;
        currentRole: string;
        newRole: string;
    } | null>(null);

    // Add filter/search bar UI state
    const [filterInput, setFilterInput] = useState({
        search: "",
        role: "all",
        activity: "all",
        startDate: "",
        endDate: ""
    });

    // Fetch users from API
    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                role: roleFilter,
                postActivity: activityFilter,
                sortBy,
                sortDir,
                page: pagination.page.toString(),
                limit: pagination.pageSize.toString()
            });

            const res = await fetch(`/api/admin/users?${params.toString()}`);
            if (!res.ok) {
                throw new Error('Failed to fetch users');
            }
            const data: ApiResponse = await res.json();
            setUsers(data.users);
            setPagination(data.pagination)
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch data when filters change
    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, activityFilter, sortBy, sortDir, pagination.page, pagination.pageSize]);

    // Sync filterInput with actual filter/search state
    useEffect(() => {
        setFilterInput({
            search: searchTerm,
            role: roleFilter,
            activity: activityFilter,
            startDate: "",
            endDate: ""
        });
        // eslint-disable-next-line
    }, []);

    // Update filters when filterInput changes
    useEffect(() => {
        setSearchTerm(filterInput.search);
        setRoleFilter(filterInput.role as "all" | "user" | "admin");
        setActivityFilter(filterInput.activity as "all" | "none" | "published");
        // You can add date filter logic here if your API supports it
        // eslint-disable-next-line
    }, [filterInput]);

    // Handle role change with confirmation
    const handleRoleChangeRequest = (userId: string, userName: string, currentRole: string, newRole: string) => {
        setConfirmRoleChange({ userId, userName, currentRole, newRole });
    };

    const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ siteRole: newRole }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, siteRole: newRole } : u)
            );
            setConfirmRoleChange(null);
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleExportUsers = () => {
        const csvContent = [
            ["Name", "Email", "Role", "Posts", "Comments", "Reactions", "Collaborations", "Invites", "Created At"].join(","),
            ...users.map(user => [
                `"${user.name}"`,
                `"${user.email}"`,
                user.siteRole,
                user.postCount,
                user.commentCount,
                user.reactionCount,
                user.collaborationsCount,
                user.invitesCount,
                new Date(user.createdAt).toLocaleDateString()
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getRoleIcon = (role: string) => {
        return role === "admin"
            ? <Crown className="w-4 h-4 text-amber-500" />
            : <Shield className="w-4 h-4 text-blue-500" />;
    };

    const getRoleBadge = (role: string) => {
        return role === "admin"
            ? "bg-amber-100 text-amber-800 border-amber-200"
            : "bg-blue-100 text-blue-800 border-blue-200";
    };

    const getActivityStatus = (postCount: number) => {
        if (postCount === 0) return { text: "Inactive", color: "bg-gray-100 text-gray-700" };
        if (postCount < 5) return { text: "New", color: "bg-blue-100 text-blue-700" };
        if (postCount < 15) return { text: "Active", color: "bg-green-100 text-green-700" };
        return { text: "Highly Active", color: "bg-purple-100 text-purple-700" };
    };

    // Add these handlers for pagination
    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({
            ...prev,
            page
        }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({
            ...prev,
            pageSize,
            page: 1
        }));
    };

    // Helper for filter chips
    const activeFilters = [
        filterInput.search && { key: "search", label: "Search", value: filterInput.search },
        filterInput.role !== "all" && { key: "role", label: "Role", value: filterInput.role },
        filterInput.activity !== "all" && { key: "activity", label: "Activity", value: filterInput.activity },
        filterInput.startDate && { key: "startDate", label: "Start", value: filterInput.startDate },
        filterInput.endDate && { key: "endDate", label: "End", value: filterInput.endDate }
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6" title="User statistics overview">
                    {[
                        { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600" },
                        { label: "Active Writers", value: users.filter(u => u.postCount > 0).length, icon: FileText, color: "text-green-600" },
                        { label: "Administrators", value: users.filter(u => u.siteRole === "admin").length, icon: Crown, color: "text-amber-600" },
                        { label: "New This Month", value: users.filter(u => new Date(u.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-purple-600" }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-6" title={stat.label}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg bg-gray-50 ${stat.color}`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Improved Filter/Search Bar */}
                <form
                    className="flex flex-col md:flex-row flex-wrap gap-2 md:gap-4 mb-4 items-end bg-white p-3 rounded-lg border border-gray-200 shadow-sm w-full"
                    onSubmit={e => e.preventDefault()}
                >
                    <div className="flex-1 min-w-[150px] w-full md:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                className="border rounded pl-8 pr-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                                value={filterInput.search}
                                onChange={e => setFilterInput(f => ({ ...f, search: e.target.value }))}
                                placeholder="Name or email..."
                            />
                        </div>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                        <select
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                            value={filterInput.role}
                            onChange={e => setFilterInput(f => ({ ...f, role: e.target.value }))}
                        >
                            <option value="all">All</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Activity</label>
                        <select
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                            value={filterInput.activity}
                            onChange={e => setFilterInput(f => ({ ...f, activity: e.target.value }))}
                        >
                            <option value="all">All</option>
                            <option value="none">No Posts</option>
                            <option value="published">Has Published</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="createdAt">Join Date</option>
                            <option value="name">Name</option>
                            <option value="email">Email</option>
                            <option value="postCount">Posts</option>
                            <option value="commentCount">Comments</option>
                            <option value="reactionCount">Reactions</option>
                        </select>
                    </div>
                    <div className="w-full sm:w-auto">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                        <select
                            value={sortDir}
                            onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                            className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="desc">Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleExportUsers}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
                            title="Export current user list as CSV"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                        <button
                            type="button"
                            onClick={fetchUsers}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
                            title="Refresh user list"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </form>
                {/* Active Filter Chips */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 items-center w-full">
                        {activeFilters.map((filterObj, idx) => {
                            // Type guard for filterObj
                            if (!filterObj || typeof filterObj !== "object") return null;
                            const filter = filterObj as { key: string; label: string; value: string };
                            return (
                                <span
                                    key={filter.key}
                                    className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
                                >
                                    {filter.label}: {filter.value}
                                    <button
                                        type="button"
                                        className="ml-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                                        aria-label={`Remove ${filter.label} filter`}
                                        title={`Remove filter: ${filter.label}`}
                                        onClick={() => {
                                            setFilterInput(fi => {
                                                if (filter.key === "role") return { ...fi, role: "all" };
                                                if (filter.key === "activity") return { ...fi, activity: "all" };
                                                if (filter.key === "search") return { ...fi, search: "" };
                                                if (filter.key === "startDate") return { ...fi, startDate: "" };
                                                if (filter.key === "endDate") return { ...fi, endDate: "" };
                                                return fi;
                                            });
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                        <button
                            type="button"
                            className="ml-2 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border hover:bg-gray-200"
                            onClick={() => setFilterInput({
                                search: "",
                                role: "all",
                                activity: "all",
                                startDate: "",
                                endDate: ""
                            })}
                        >
                            Clear All
                        </button>
                    </div>
                )}
                
                {/* Users Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto" title="User list table">
                    {loading ? (
                        // Skeleton loader for users table
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 py-2">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-1/4" />
                                        </div>
                                        <div className="h-6 w-16 bg-gray-100 rounded" />
                                        <div className="h-6 w-20 bg-gray-100 rounded" />
                                        <div className="h-6 w-24 bg-gray-100 rounded" />
                                        <div className="h-6 w-20 bg-gray-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">
                                No users found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No users match your criteria. Try searching by name, email, or adjust filters above.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto" title="Scrollable user table">
                                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm" title="User data table" style={{ minWidth: 700 }}>
                                    <thead className="bg-gray-50" title="Table columns">
                                        <tr>
                                            <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="User column">User</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Role column">Role</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Activity column">Activity</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Stats column">Stats</th>
                                            <th className="px-2 sm:px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" title="Joined column">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200" title="User rows">
                                        {users.map((user) => {
                                            const activityStatus = getActivityStatus(user.postCount);
                                            return (
                                                <tr key={user.id} className="hover:bg-gray-50" title={`User row for ${user.name}`}>
                                                    <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap" title="User info">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0" title="User avatar">
                                                                {user.avatarUrl ? (
                                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} title={`Avatar of ${user.name}`} />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center" title="Default avatar">
                                                                        <span className="text-sm font-medium text-gray-700"
                                                                            title={user.name}>
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4" title="User name and email">
                                                                <div className="text-sm font-medium text-gray-900" title="User name">{user.name}</div>
                                                                <div className="text-sm text-gray-500 flex items-center"
                                                                    title={`Email: ${user.email}`}>
                                                                    <Mail className="w-3 h-3 mr-1" />
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap" title="User role">
                                                        <div className="flex items-center space-x-2"
                                                            title={`Current role: ${user.siteRole}. Use dropdown to change role.`}>
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.siteRole)}`} title={`Role badge: ${user.siteRole}`}>
                                                                {getRoleIcon(user.siteRole)}
                                                                <span className="ml-1 capitalize">{user.siteRole}</span>
                                                            </span>
                                                            <select
                                                                value={user.siteRole}
                                                                onChange={(e) => handleRoleChangeRequest(
                                                                    user.id,
                                                                    user.name,
                                                                    user.siteRole,
                                                                    e.target.value
                                                                )}
                                                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                                title="Change user role"
                                                            >
                                                                <option value="user" title="Set role to User">User</option>
                                                                <option value="admin" title="Set role to Admin">Admin</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap" title="User activity status">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityStatus.color}`} title={`Activity: ${activityStatus.text}`}>
                                                            {activityStatus.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap" title="User stats">
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                            <div className="flex items-center" title={`Total posts: ${user.postCount}`}>
                                                                <FileText className="w-4 h-4 mr-1" />
                                                                <span>{user.postCount}</span>
                                                            </div>
                                                            <div className="flex items-center" title={`Total comments: ${user.commentCount}`}>
                                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                                <span>{user.commentCount}</span>
                                                            </div>
                                                            <div className="flex items-center" title={`Total reactions: ${user.reactionCount}`}>
                                                                <Heart className="w-4 h-4 mr-1" />
                                                                <span>{user.reactionCount}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-2 sm:px-4 md:px-6 py-3 whitespace-nowrap" title="User join date">
                                                        <div className="flex items-center text-sm text-gray-500" title="Joined date">
                                                            <Calendar className="w-4 h-4 mr-1" />
                                                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        </>

                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && (
                    <div className="flex flex-col md:flex-row flex-wrap md:items-center md:justify-between mt-4 gap-2 w-full px-1">
                        <div className="text-xs text-gray-600 text-center md:text-left">
                            Page {pagination.page} of {pagination.totalPages} | {pagination.total} users
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                                    disabled={!pagination.hasPrev}
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    title="Go to previous page"
                                >
                                    <ChevronLeft /> <span className="hidden sm:inline">Previous</span>
                                </button>
                                <input
                                    type="number"
                                    min={1}
                                    max={pagination.totalPages}
                                    value={pagination.page}
                                    onChange={e => handlePageChange(Number(e.target.value))}
                                    className="w-full sm:w-14 px-2 py-1 border rounded text-xs sm:text-sm text-center"
                                    style={{ minWidth: 0 }}
                                    title="Current page number"
                                />
                                <button
                                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                                    disabled={!pagination.hasNext}
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    title="Go to next page"
                                >
                                    <span className="hidden sm:inline">Next</span> <ChevronRight />
                                </button>
                            </div>
                            {/* Page size selector */}
                            <select
                                className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 px-2 py-1 border rounded text-xs sm:text-sm cursor-pointer bg-white"
                                value={pagination.pageSize}
                                onChange={e =>
                                    handlePageSizeChange(Number(e.target.value))
                                }
                                title="Select number of users per page"
                            >
                                {[10, 20, 30, 50].map(size => (
                                    <option key={size} value={size}>{size} / page</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Role Change Confirmation Modal */}
                {confirmRoleChange && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity" title="Role change confirmation dialog">
                        <div className="bg-white rounded-lg max-w-xs sm:max-w-md w-full p-4 sm:p-6 shadow-2xl" title="Confirm role change">
                            <div className="flex items-center mb-4">
                                <AlertTriangle className="w-6 h-6 text-amber-600 mr-2" />
                                <h3 className="text-lg font-medium text-gray-900" title="Confirm role change heading">Confirm Role Change</h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-4" title="Role change explanation">
                                Are you sure you want to change <strong>{confirmRoleChange.userName}</strong> to <strong>{confirmRoleChange.newRole.toLocaleUpperCase()}</strong>?
                                This will give them {confirmRoleChange.newRole === 'admin' ? 'full administrative access' : 'standard user permissions'}.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3" title="Confirmation actions">
                                <button
                                    onClick={() => setConfirmRoleChange(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    title="Cancel role change"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole as "user" | "admin")}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                                    title="Confirm and apply role change"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default AdminUsersPage;