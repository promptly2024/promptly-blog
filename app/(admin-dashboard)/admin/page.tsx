"use client";
import { BarChart3, MessageCircle, Grid, Tag, FileText, UserCheck2, UserPlus, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { AdminOverviewResponse } from './types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHomePage = () => {
    const [overviewData, setOverviewData] = React.useState<AdminOverviewResponse | null>(null);

    React.useEffect(() => {
        const fetchOverviewData = async () => {
            try {
                const response = await fetch('/api/admin/overview');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setOverviewData(data.data);
            } catch (error) {
                console.error('Error fetching admin overview data:', error);
            }
        };
        fetchOverviewData();
    }, []);

    if (!overviewData) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-gray-500 text-sm">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    const topTagsData = {
        labels: overviewData.trends.topTags.slice(0, 8).map(tag => tag.name),
        datasets: [{
            label: 'Count',
            data: overviewData.trends.topTags.slice(0, 8).map(tag => tag.count),
            backgroundColor: 'rgba(244, 63, 94, 0.7)',
            borderRadius: 6,
        }],
    };

    const topCategoriesData = {
        labels: overviewData.trends.topCategories.slice(0, 8).map(cat => cat.name),
        datasets: [{
            label: 'Count',
            data: overviewData.trends.topCategories.slice(0, 8).map(cat => cat.count),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderRadius: 6,
        }],
    };

    const postReactionsData = {
        labels: overviewData.trends.postReactions.map(r => r.type),
        datasets: [{
            label: 'Reactions',
            data: overviewData.trends.postReactions.map(r => r.count),
            backgroundColor: [
                'rgba(59, 130, 246, 0.7)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(34, 197, 94, 0.7)',
                'rgba(234, 179, 8, 0.7)',
                'rgba(168, 85, 247, 0.7)',
                'rgba(236, 72, 153, 0.7)',
                'rgba(251, 146, 60, 0.7)',
            ],
            borderRadius: 6,
        }],
    };

    const countCards = [
        { label: "Users", valueKey: "users", icon: <UserCheck2 className="h-5 w-5" />, gradient: "from-blue-500 to-blue-600" },
        { label: "Posts", valueKey: "posts", icon: <FileText className="h-5 w-5" />, gradient: "from-green-500 to-green-600" },
        { label: "Comments", valueKey: "comments", icon: <BarChart3 className="h-5 w-5" />, gradient: "from-yellow-500 to-yellow-600" },
        { label: "Queries", valueKey: "contactQueries", icon: <MessageCircle className="h-5 w-5" />, gradient: "from-purple-500 to-purple-600" },
        { label: "Invites", valueKey: "invites", icon: <UserPlus className="h-5 w-5" />, gradient: "from-pink-500 to-pink-600" },
        { label: "Categories", valueKey: "categories", icon: <Grid className="h-5 w-5" />, gradient: "from-indigo-500 to-indigo-600" },
        { label: "Tags", valueKey: "tags", icon: <Tag className="h-5 w-5" />, gradient: "from-rose-500 to-rose-600" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-3 sm:p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
                    {countCards.map(card => (
                        <div
                            key={card.label}
                            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-800"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}/>
                            <div className="p-4 relative">
                                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${card.gradient} text-white mb-3`}>
                                    {card.icon}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                        {overviewData.counts[card.valueKey as keyof typeof overviewData.counts]}
                                    </div>
                                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{card.label}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Posts Workflow - Side by Side */}
                {(overviewData.workflow.postsUnderReview.length > 0 || overviewData.workflow.scheduledPosts.length > 0) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {overviewData.workflow.postsUnderReview.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-b border-orange-100 dark:border-orange-900/30">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-600" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Posts Under Review</h3>
                                        <span className="ml-auto bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-bold px-2 py-1 rounded-full">
                                            {overviewData.workflow.postsUnderReview.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                                    {overviewData.workflow.postsUnderReview.map(post => (
                                        <div
                                            key={post.id}
                                            className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-900/50"
                                        >
                                            {post.coverImageUrl ? (
                                                <img src={post.coverImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-sm">
                                                    <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{post.title}</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {post.authorProfileImage ? (
                                                        <img src={post.authorProfileImage} alt="" className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                            <UserCheck2 className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                    <span className="truncate font-medium">{post.authorName || post.authorEmail || "Unknown"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {overviewData.workflow.scheduledPosts.length > 0 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-100 dark:border-blue-900/30">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Scheduled Posts</h3>
                                        <span className="ml-auto bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold px-2 py-1 rounded-full">
                                            {overviewData.workflow.scheduledPosts.length}
                                        </span>
                                    </div>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto p-3 space-y-2">
                                    {overviewData.workflow.scheduledPosts.map(post => (
                                        <div
                                            key={post.id}
                                            className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50"
                                        >
                                            {post.coverImageUrl ? (
                                                <img src={post.coverImageUrl} alt="" className="w-14 h-14 rounded-lg object-cover shadow-sm" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-sm">
                                                    <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{post.title}</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {post.authorProfileImage ? (
                                                        <img src={post.authorProfileImage} alt="" className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                                            <UserCheck2 className="w-3 h-3" />
                                                        </div>
                                                    )}
                                                    <span className="truncate font-medium">{post.authorName || post.authorEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Workflow Items Grid */}
                {(overviewData.workflow.flaggedComments.length > 0 ||
                    overviewData.workflow.pendingInvites.length > 0 ||
                    overviewData.workflow.pendingQueries.length > 0) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overviewData.workflow.flaggedComments.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 border-b border-red-100 dark:border-red-900/30">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-red-600" />
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Flagged Comments</h3>
                                            <span className="ml-auto bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {overviewData.workflow.flaggedComments.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                                        {overviewData.workflow.flaggedComments.map(comment => (
                                            <div key={comment.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{comment.content}</p>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                                                    {comment.name || comment.email || comment.userId}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {overviewData.workflow.pendingInvites.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-b border-purple-100 dark:border-purple-900/30">
                                        <div className="flex items-center gap-2">
                                            <UserPlus className="h-4 w-4 text-purple-600" />
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Pending Invites</h3>
                                            <span className="ml-auto bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {overviewData.workflow.pendingInvites.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                                        {overviewData.workflow.pendingInvites.map(invite => (
                                            <div key={invite.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{invite.inviteeEmail}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                                                        {invite.role}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {overviewData.workflow.pendingQueries.length > 0 && (
                                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                                    <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-b border-amber-100 dark:border-amber-900/30">
                                        <div className="flex items-center gap-2">
                                            <MessageCircle className="h-4 w-4 text-amber-600" />
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Pending Queries</h3>
                                            <span className="ml-auto bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {overviewData.workflow.pendingQueries.length}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto p-3 space-y-2">
                                        {overviewData.workflow.pendingQueries.map(query => (
                                            <div key={query.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                                <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{query.subject || "No subject"}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                                                    {query.name} · {query.email}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                {/* Recent Activity Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {overviewData.recent.users.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-b border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-2">
                                    <UserCheck2 className="h-4 w-4 text-green-600" />
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">New Users</h3>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                                {overviewData.recent.users.slice(0, 5).map(user => (
                                    <div key={user.id} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-sm" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                                                <UserCheck2 className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-medium">
                                            {user.siteRole}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {overviewData.recent.approvals.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border-b border-cyan-100 dark:border-cyan-900/30">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-cyan-600" />
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Recent Approvals</h3>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                                {overviewData.recent.approvals.slice(0, 5).map((approval, idx) => (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs px-2 py-1 bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 rounded-full font-semibold">
                                                {approval.decision}
                                            </span>
                                        </div>
                                        {approval.reason && <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{approval.reason}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {overviewData.recent.auditLogs.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border-b border-slate-100 dark:border-slate-900/30">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-slate-600" />
                                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Audit Logs</h3>
                                </div>
                            </div>
                            <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                                {overviewData.recent.auditLogs.slice(0, 5).map(log => (
                                    <div key={log.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            <span className="text-indigo-600 dark:text-indigo-400">{log.action}</span> on {log.targetType}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Trends - Tags and Categories in Single Row */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-5">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingUp className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Trends & Analytics</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {overviewData.trends.topTags.length > 0 && (
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/10 dark:to-pink-950/10 rounded-xl p-4 border border-rose-100 dark:border-rose-900/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Tag className="h-4 w-4 text-rose-600" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Tags</h3>
                                </div>
                                <Bar
                                    data={topTagsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(0, 0, 0, 0.05)' }
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                    height={200}
                                />
                            </div>
                        )}

                        {overviewData.trends.topCategories.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/10 dark:to-purple-950/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <Grid className="h-4 w-4 text-indigo-600" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Top Categories</h3>
                                </div>
                                <Bar
                                    data={topCategoriesData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(0, 0, 0, 0.05)' }
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                    height={200}
                                />
                            </div>
                        )}
                    </div>

                    {/* Post and Comment Reactions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        {overviewData.trends.postReactions.length > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/10 dark:to-emerald-950/10 rounded-xl p-4 border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 className="h-4 w-4 text-green-600" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Post Reactions</h3>
                                </div>
                                <Bar
                                    data={postReactionsData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: true,
                                        plugins: {
                                            legend: { display: false },
                                            tooltip: {
                                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                                padding: 12,
                                                cornerRadius: 8,
                                            }
                                        },
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                grid: { color: 'rgba(0, 0, 0, 0.05)' }
                                            },
                                            x: {
                                                grid: { display: false }
                                            }
                                        }
                                    }}
                                    height={200}
                                />
                            </div>
                        )}

                        {overviewData.trends.commentReactions.length > 0 && (
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/10 dark:to-orange-950/10 rounded-xl p-4 border border-amber-100 dark:border-amber-900/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageCircle className="h-4 w-4 text-amber-600" />
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Comment Reactions</h3>
                                </div>
                                <div className="space-y-3">
                                    {overviewData.trends.commentReactions.map((r, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800/50 rounded-lg hover:shadow-sm transition-shadow">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{r.type}</span>
                                            <div className="flex items-center gap-3">
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden w-24">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min((r.count / Math.max(...overviewData.trends.commentReactions.map(x => x.count))) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 dark:text-white min-w-[40px] text-right">{r.count}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminHomePage;