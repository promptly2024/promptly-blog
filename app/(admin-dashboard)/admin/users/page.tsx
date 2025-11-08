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

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
    const [activityFilter, setActivityFilter] = useState<"all" | "none" | "published">("all");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
    });

    const [confirmRoleChange, setConfirmRoleChange] = useState<{
        userId: string;
        userName: string;
        currentRole: string;
        newRole: string;
    } | null>(null);

    const [filterInput, setFilterInput] = useState({
        search: "",
        role: "all",
        activity: "all",
        startDate: "",
        endDate: ""
    });

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
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [searchTerm, roleFilter, activityFilter, sortBy, sortDir, pagination.page, pagination.pageSize]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTerm(filterInput.search);
            setRoleFilter(filterInput.role as "all" | "user" | "admin");
            setActivityFilter(filterInput.activity as "all" | "none" | "published");
        }, 300);

        return () => clearTimeout(timer);
    }, [filterInput]);

    const handleRoleChangeRequest = (userId: string, userName: string, currentRole: string, newRole: string) => {
        if (currentRole !== newRole) {
            setConfirmRoleChange({ userId, userName, currentRole, newRole });
        }
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

    const handlePageChange = (page: number) => {
        if (page < 1 || page > pagination.totalPages) return;
        setPagination(prev => ({ ...prev, page }));
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPagination(prev => ({ ...prev, pageSize, page: 1 }));
    };

    const activeFilters = [
        filterInput.search && { key: "search", label: "Search", value: filterInput.search },
        filterInput.role !== "all" && { key: "role", label: "Role", value: filterInput.role },
        filterInput.activity !== "all" && { key: "activity", label: "Activity", value: filterInput.activity },
    ].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage users, roles, and permissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[
                        { label: "Total Users", value: pagination.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                        { label: "Active Writers", value: users.filter(u => u.postCount > 0).length, icon: FileText, color: "text-green-600", bg: "bg-green-50" },
                        { label: "Administrators", value: users.filter(u => u.siteRole === "admin").length, icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
                        { label: "New This Month", value: users.filter(u => new Date(u.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000).length, icon: UserCheck, color: "text-purple-600", bg: "bg-purple-50" }
                    ].map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-2 sm:p-3 rounded-lg ${stat.bg} ${stat.color} flex-shrink-0`}>
                                    <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filters
                        </h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleExportUsers}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <button
                                type="button"
                                onClick={fetchUsers}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="w-full border border-gray-300 rounded-md pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={filterInput.search}
                                    onChange={e => setFilterInput(f => ({ ...f, search: e.target.value }))}
                                    placeholder="Name or email..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filterInput.role}
                                onChange={e => setFilterInput(f => ({ ...f, role: e.target.value }))}
                            >
                                <option value="all">All Roles</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Activity</label>
                            <select
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filterInput.activity}
                                onChange={e => setFilterInput(f => ({ ...f, activity: e.target.value }))}
                            >
                                <option value="all">All Activity</option>
                                <option value="none">No Posts</option>
                                <option value="published">Has Published</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="createdAt">Join Date</option>
                                <option value="name">Name</option>
                                <option value="email">Email</option>
                                <option value="postCount">Posts</option>
                                <option value="commentCount">Comments</option>
                                <option value="reactionCount">Reactions</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Order</label>
                            <select
                                value={sortDir}
                                onChange={(e) => setSortDir(e.target.value as "asc" | "desc")}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="desc">Descending</option>
                                <option value="asc">Ascending</option>
                            </select>
                        </div>
                    </div>

                    {activeFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-600">Active filters:</span>
                            {activeFilters.map((filterObj) => {
                                if (!filterObj || typeof filterObj !== "object") return null;
                                const filter = filterObj as { key: string; label: string; value: string };
                                return (
                                    <span
                                        key={filter.key}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium"
                                    >
                                        {filter.label}: <span className="font-semibold">{filter.value}</span>
                                        <button
                                            type="button"
                                            className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                            onClick={() => {
                                                setFilterInput(fi => {
                                                    if (filter.key === "role") return { ...fi, role: "all" };
                                                    if (filter.key === "activity") return { ...fi, activity: "all" };
                                                    if (filter.key === "search") return { ...fi, search: "" };
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
                                className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200 transition-colors"
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
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-6">
                            <div className="animate-pulse space-y-4">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3" />
                                            <div className="h-3 bg-gray-100 rounded w-1/4" />
                                        </div>
                                        <div className="hidden sm:flex gap-2">
                                            <div className="h-6 w-16 bg-gray-100 rounded" />
                                            <div className="h-6 w-20 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading users</h3>
                            <p className="mt-1 text-sm text-gray-500">{error}</p>
                            <button
                                onClick={fetchUsers}
                                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                No users match your criteria. Try adjusting your filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => {
                                            const activityStatus = getActivityStatus(user.postCount);
                                            return (
                                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-10 w-10 flex-shrink-0">
                                                                {user.avatarUrl ? (
                                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                                                                ) : (
                                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                                        <span className="text-sm font-medium text-white">
                                                                            {user.name.charAt(0).toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                <div className="text-sm text-gray-500 flex items-center">
                                                                    <Mail className="w-3 h-3 mr-1" />
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.siteRole)}`}>
                                                                {getRoleIcon(user.siteRole)}
                                                                <span className="ml-1 capitalize">{user.siteRole}</span>
                                                            </span>
                                                            <select
                                                                value={user.siteRole}
                                                                onChange={(e) => handleRoleChangeRequest(user.id, user.name, user.siteRole, e.target.value)}
                                                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                            >
                                                                <option value="user">User</option>
                                                                <option value="admin">Admin</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityStatus.color}`}>
                                                            {activityStatus.text}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center" title="Posts">
                                                                <FileText className="w-4 h-4 mr-1" />
                                                                <span>{user.postCount}</span>
                                                            </div>
                                                            <div className="flex items-center" title="Comments">
                                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                                <span>{user.commentCount}</span>
                                                            </div>
                                                            <div className="flex items-center" title="Reactions">
                                                                <Heart className="w-4 h-4 mr-1" />
                                                                <span>{user.reactionCount}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-sm text-gray-500">
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

                            <div className="lg:hidden divide-y divide-gray-200">
                                {users.map((user) => {
                                    const activityStatus = getActivityStatus(user.postCount);
                                    return (
                                        <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="h-12 w-12 flex-shrink-0">
                                                        {user.avatarUrl ? (
                                                            <img className="h-12 w-12 rounded-full object-cover" src={user.avatarUrl} alt={user.name} />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                                                <span className="text-base font-medium text-white">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
                                                        <p className="text-xs text-gray-500 truncate flex items-center">
                                                            <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${activityStatus.color} flex-shrink-0`}>
                                                    {activityStatus.text}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-600">Role:</span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadge(user.siteRole)}`}>
                                                        {getRoleIcon(user.siteRole)}
                                                        <span className="ml-1 capitalize">{user.siteRole}</span>
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={user.siteRole}
                                                        onChange={(e) => handleRoleChangeRequest(user.id, user.name, user.siteRole, e.target.value)}
                                                        className="flex-1 text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <option value="user">Change to User</option>
                                                        <option value="admin">Change to Admin</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center" title="Posts">
                                                        <FileText className="w-3.5 h-3.5 mr-1" />
                                                        {user.postCount}
                                                    </span>
                                                    <span className="flex items-center" title="Comments">
                                                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                                                        {user.commentCount}
                                                    </span>
                                                    <span className="flex items-center" title="Reactions">
                                                        <Heart className="w-3.5 h-3.5 mr-1" />
                                                        {user.reactionCount}
                                                    </span>
                                                </div>
                                                <span className="flex items-center">
                                                    <Calendar className="w-3.5 h-3.5 mr-1" />
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>

                {pagination.total > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                        <div className="flex flex-col gap-3 sm:gap-4">
                            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                                Showing <span className="font-medium">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of{' '}
                                <span className="font-medium">{pagination.total}</span> users
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">Previous</span>
                                    </button>

                                    <div className="hidden xs:flex items-center gap-1 sm:gap-2">
                                        <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Page</span>
                                        <input
                                            type="number"
                                            min={1}
                                            max={pagination.totalPages}
                                            value={pagination.page}
                                            onChange={e => handlePageChange(Number(e.target.value))}
                                            className="w-12 sm:w-16 px-1 sm:px-2 py-1 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">of {pagination.totalPages}</span>
                                    </div>

                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={!pagination.hasNext}
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="hidden sm:inline mr-1">Next</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                <select
                                    value={pagination.pageSize}
                                    onChange={e => handlePageSizeChange(Number(e.target.value))}
                                    className="w-full sm:w-auto px-2 sm:px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                    {[10, 20, 30, 50].map(size => (
                                        <option key={size} value={size}>{size} per page</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex xs:hidden items-center justify-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
                                <span>Page {pagination.page} of {pagination.totalPages}</span>
                            </div>
                        </div>
                    </div>
                )}

                {confirmRoleChange && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-in zoom-in duration-200">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-amber-100 rounded-full mr-3">
                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Confirm Role Change</h3>
                            </div>
                            <p className="text-sm text-gray-700 mb-6">
                                Are you sure you want to change <span className="font-semibold">{confirmRoleChange.userName}</span>'s role to{' '}
                                <span className="font-semibold uppercase">{confirmRoleChange.newRole}</span>?
                                <br />
                                <br />
                                This will {confirmRoleChange.newRole === 'admin' ? 'grant them full administrative access' : 'revoke their administrative privileges'}.
                            </p>
                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                                <button
                                    onClick={() => setConfirmRoleChange(null)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleRoleChange(confirmRoleChange.userId, confirmRoleChange.newRole as "user" | "admin")}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Confirm Change
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;