"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  FileText,
  Clock,
  CheckCircle,
  Eye,
  Calendar,
  User,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  RefreshCw
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  status: "draft" | "under_review" | "approved" | "scheduled" | "rejected" | "archived";
  submittedAt: Date | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  authorId: string;
  authorName: string | null;
  authorImage: string | null;
}

interface ApiResponse {
  data: Post[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const BlogManagementPage = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    pageSize: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Filter states
  const [filterInput, setFilterInput] = useState({
    search: '',
    status: 'all',
    author: 'all',
  });
  const [sortBy, setSortBy] = useState('submittedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.pageSize.toString(),
        ...(filterInput.search && { search: filterInput.search }),
        ...(filterInput.status !== 'all' && { status: filterInput.status }),
        ...(filterInput.author !== 'all' && { author: filterInput.author }),
        ...(sortBy && { sortBy }),
        ...(sortDir && { sortDir }),
      });

      const response = await fetch(`/api/admin/posts?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch posts');
      }

      const data: ApiResponse = await response.json();
      setPosts(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.pageSize, filterInput, sortBy, sortDir]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newSize, page: 1 }));
  };

  // Get status badge styling
  const getStatusBadge = (status: Post['status']) => {
    const badges = {
      draft: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
      under_review: { color: 'bg-yellow-100 text-yellow-800', text: 'Under Review' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      scheduled: { color: 'bg-purple-100 text-purple-800', text: 'Scheduled' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      archived: { color: 'bg-gray-100 text-gray-600', text: 'Archived' }
    };
    return badges[status] || badges.draft;
  };

  // Calculate stats
  const stats = {
    total: pagination.total,
    underReview: posts.filter(p => p.status === 'under_review').length,
    approved: posts.filter(p => p.status === 'approved').length,
    scheduled: posts.filter(p => p.status === 'scheduled').length,
    rejected: posts.filter(p => p.status === 'rejected').length,
  };

  // Get unique authors for filter
  const uniqueAuthors = Array.from(new Set(posts.map(p => ({ id: p.authorId, name: p.authorName }))))
    .filter(author => author.name);

  // Active filter chips
  const activeFilters = [
    filterInput.search && { key: 'search', label: 'Search', value: filterInput.search },
    filterInput.status !== 'all' && { key: 'status', label: 'Status', value: filterInput.status },
    filterInput.author !== 'all' && { key: 'author', label: 'Author', value: uniqueAuthors.find(a => a.id === filterInput.author)?.name || filterInput.author },
  ].filter(Boolean) as { key: string; label: string; value: string }[];

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {/* Card: Total Posts */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Posts</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-gray-50 text-gray-600">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
          {/* Card: Scheduled */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-xl sm:text-2xl font-semibold text-blue-600 mt-1">{stats.scheduled}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
          {/* Card: Under Review */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Under Review</p>
                <p className="text-xl sm:text-2xl font-semibold text-yellow-600 mt-1">{stats.underReview}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
          {/* Card: Approved */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                <p className="text-xl sm:text-2xl font-semibold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-green-50 text-green-600">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
          {/* Card: Rejected */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-xl sm:text-2xl font-semibold text-emerald-600 mt-1">{stats.rejected}</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Controls */}
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
                placeholder="Title or excerpt..."
              />
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <select
              className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              value={filterInput.status}
              onChange={e => setFilterInput(f => ({ ...f, status: e.target.value }))}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="scheduled">Scheduled</option>
              <option value="rejected">Rejected</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
            <select
              className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
              value={filterInput.author}
              onChange={e => setFilterInput(f => ({ ...f, author: e.target.value }))}
            >
              <option value="all">All</option>
              {uniqueAuthors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-600 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-2 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
            >
              <option value="submittedAt">Submitted Date</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
              <option value="authorName">Author</option>
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

          {/* <div className="flex gap-2 mt-2 md:mt-0 w-full sm:w-auto">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto"
              title="Export current post list as CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              type="button"
              onClick={fetchPosts}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 w-full sm:w-auto"
              title="Refresh post list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div> */}
        </form>
        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 items-center w-full">
            {activeFilters.map((filterObj, idx) => (
              <span
                key={filterObj.key}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium shadow-sm border border-blue-200"
              >
                {filterObj.label}: {filterObj.value}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  aria-label={`Remove ${filterObj.label} filter`}
                  title={`Remove filter: ${filterObj.label}`}
                  onClick={() => {
                    setFilterInput(fi => {
                      if (filterObj.key === "status") return { ...fi, status: "all" };
                      if (filterObj.key === "author") return { ...fi, author: "all" };
                      if (filterObj.key === "search") return { ...fi, search: "" };
                      return fi;
                    });
                  }}
                >
                  ×
                </button>
              </span>
            ))}
            <button
              type="button"
              className="ml-2 px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200 hover:bg-gray-200 transition"
              onClick={() => setFilterInput({
                search: "",
                status: "all",
                author: "all"
              })}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Posts Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          {loading ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Post
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Author
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Submitted
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(6)].map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="w-12 h-10 sm:w-16 sm:h-12 bg-gray-200 rounded-md flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-200 mr-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          <div className="h-6 w-6 bg-gray-100 rounded"></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filterInput.search || filterInput.status !== 'all' || filterInput.author !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No blog posts have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Post
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Author
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Submitted
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => {
                      const statusBadge = getStatusBadge(post.status);
                      return (
                        <tr key={post.id} className="hover:bg-gray-50 transition">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              {post.coverImage && (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-12 h-10 sm:w-16 sm:h-12 object-cover rounded-md flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => window.open(`/admin/reviews/${post.id}`, '_blank')}
                                  className="text-left hover:text-blue-600 transition-colors"
                                >
                                  <p className="text-xs sm:text-sm font-medium text-gray-900 hover:underline line-clamp-1">
                                    {post.title}
                                  </p>
                                </button>
                                {post.excerpt && (
                                  <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-2">
                                    {post.excerpt}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                                {post.authorImage ? (
                                  <img
                                    src={post.authorImage}
                                    alt={post.authorName || 'Unknown'}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-medium text-gray-900">
                                  {post.authorName || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                              {statusBadge.text}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-500">
                              {post.submittedAt ? (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(post.submittedAt).toLocaleDateString()}
                                </div>
                              ) : (
                                <span className="text-gray-400">Not submitted</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => window.open(`/admin/reviews/${post.id}`, '_blank')}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Review Post"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => window.open(`/admin/reviews/${post.id}`, '_blank')}
                                className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors"
                                title="Open in New Tab"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
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

        {pagination && (
          <div className="flex flex-col md:flex-row flex-wrap md:items-center md:justify-between mt-4 gap-2 w-full px-1">
            <div className="text-xs text-gray-600 text-center md:text-left">
              Page {pagination.page} of {pagination.totalPages} | {pagination.total} posts
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
      </div>
    </div>
  );
};

export default BlogManagementPage;