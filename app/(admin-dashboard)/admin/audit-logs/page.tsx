"use client";
import { ChevronLeft, ChevronRight, FileIcon, FileQuestionIcon, Image, LucideAlignEndVertical, Mail, MessageCircle, QuoteIcon, Search, User } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'sonner';
import { actionLabels, AuditLogEntry, Pagination } from './types';

const targetIcons: Record<string, React.ReactNode> = {
  user: <User className="inline mr-1 text-blue-500" />,
  post: <FileIcon className="inline mr-1 text-green-500" />,
  comment: <MessageCircle className="inline mr-1 text-yellow-500" />,
  invitation: <LucideAlignEndVertical className="inline mr-1 text-purple-500" />,
  other: <FileQuestionIcon className="inline mr-1 text-gray-400" />,
  approval: <QuoteIcon className="inline mr-1 text-pink-500" />,
  system: <LucideAlignEndVertical className="inline mr-1 text-red-500" />,
  email: <Mail className="inline mr-1 text-indigo-500" />,
  media: <Image className="inline mr-1 text-teal-500" />
};

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    page: number;
    pageSize: number;
    q: string;
    targetType: string;
    action: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    page: 1,
    pageSize: 30,
    q: "",
    targetType: "",
    action: "",
    startDate: undefined,
    endDate: undefined,
  });

  // Filter UI state
  const [filterInput, setFilterInput] = useState({
    q: "",
    targetType: "",
    action: "",
    startDate: "",
    endDate: ""
  });

  // Debounce for search input
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounce search query
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setFilters(f => ({
        ...f,
        page: 1,
        q: filterInput.q
      }));
    }, 400);
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterInput.q]);

  // Immediate update for other filters
  useEffect(() => {
    setFilters(f => ({
      ...f,
      page: 1,
      targetType: filterInput.targetType,
      action: filterInput.action,
      startDate: filterInput.startDate ? new Date(filterInput.startDate) : undefined,
      endDate: filterInput.endDate ? new Date(filterInput.endDate) : undefined
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterInput.targetType, filterInput.action, filterInput.startDate, filterInput.endDate]);

  // Fetch logs when filters or page changes
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
          throw new Error("Invalid date range: start date is after end date.");
        }
        // Build query params
        const queryParams = new URLSearchParams({
          page: filters.page.toString(),
          pageSize: filters.pageSize.toString(),
          ...(filters.q && { q: filters.q }),
          ...(filters.targetType && { targetType: filters.targetType }),
          ...(filters.action && { action: filters.action }),
          ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
          ...(filters.endDate && { endDate: filters.endDate.toISOString() }),
        });

        const res = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || 'Failed to fetch');
        setRawResponse(data);
        setAuditLogs(data.data.data || []);
        setPagination(data.data.pagination);
      } catch (err: any) {
        const errorMessage = err?.message || "Error fetching audit logs";
        setError(errorMessage);
        toast.error(errorMessage, {
          description: "Please try again later or contact support.",
          action: { label: 'Dismiss', onClick: () => toast.dismiss() }
        });
        console.error("Error fetching audit logs", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [filters]);

  // Pagination controls
  const handlePageChange = (newPage: number) => {
    setFilters(f => ({ ...f, page: newPage }));
  };

  // Loading skeletons
  const SkeletonRow = () => (
    <tr>
      <td className="px-3 py-2"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
      <td className="px-3 py-2"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></td>
      <td className="px-3 py-2"><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></td>
      <td className="px-3 py-2"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></td>
      <td className="px-3 py-2"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse" /></td>
    </tr>
  );

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      {/* Filter Bar */}
      <form
        className="flex flex-wrap gap-2 mb-4 items-end bg-gray-50 p-3 rounded shadow-sm"
        onSubmit={e => e.preventDefault()}
      >
        <div>
          <label className="block text-xs font-medium text-gray-600">Actor ID</label>
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            value={filterInput.q}
            onChange={e => setFilterInput(f => ({ ...f, q: e.target.value }))}
            placeholder="Enter query..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Target Type</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterInput.targetType}
            onChange={e => setFilterInput(f => ({ ...f, targetType: e.target.value }))}
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="invitation">Invitation</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Action</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={filterInput.action}
            onChange={e => setFilterInput(f => ({ ...f, action: e.target.value }))}
          >
            <option value="">All</option>
            {Object.keys(actionLabels).map(a => (
              <option key={a} value={a}>{actionLabels[a]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">Start Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={filterInput.startDate}
            onChange={e => setFilterInput(f => ({ ...f, startDate: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">End Date</label>
          <input
            type="date"
            className="border rounded px-2 py-1 text-sm"
            value={filterInput.endDate}
            onChange={e => setFilterInput(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>
      </form>
      {/* // Show Active filter chips and a clear button */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        {Object.entries(filters)
          .filter(([key, value]) =>
            // Only show filters that are not default/empty
            key !== "page" && key !== "pageSize" &&
            value !== "" && value !== undefined && value !== null
          )
          .map(([key, value]) => {
            // Human-friendly labels
            const keyLabels: Record<string, string> = {
              q: "Search Query",
              targetType: "Target",
              action: "Action",
              startDate: "Start",
              endDate: "End"
            };
            let displayValue = value;
            if (value instanceof Date) displayValue = value.toISOString().slice(0, 10);
            return (
              <span
                key={key}
                className="flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium"
              >
                {keyLabels[key] || key}: {displayValue ? String(displayValue) : "N/A"}
                <button
                  type="button"
                  className="ml-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  aria-label={`Remove ${keyLabels[key] || key} filter`}
                  title={`Remove filter: ${keyLabels[key] || key}`}
                  onClick={() => {
                    setFilters(f => ({
                      ...f,
                      [key]: key === "startDate" || key === "endDate" ? undefined : ""
                    }));
                    setFilterInput(fi => ({
                      ...fi,
                      [key]: ""
                    }));
                  }}
                >
                  ×
                </button>
              </span>
            );
          })}
        {/* Clear all button */}
        {Object.entries(filters).some(([key, value]) =>
          key !== "page" && key !== "pageSize" && value !== "" && value !== undefined && value !== null
        ) && (
            <button
              type="button"
              className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300 cursor-pointer"
              title="Clear all filters"
              onClick={() => {
                setFilters(f => ({
                  ...f,
                  q: "",
                  targetType: "",
                  action: "",
                  startDate: undefined,
                  endDate: undefined,
                  page: 1
                }));
                setFilterInput(fi => ({
                  ...fi,
                  q: "",
                  targetType: "",
                  action: "",
                  startDate: "",
                  endDate: ""
                }));
              }}
            >
              Clear All
            </button>
          )}
      </div>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {/* Table */}
      < div className="overflow-x-auto rounded shadow bg-white" >
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left font-semibold" title='The date the action was performed'>Date</th>
              <th className="px-3 py-2 text-left font-semibold" title='The action performed'>Action</th>
              <th className="px-3 py-2 text-left font-semibold" title='The user who performed the action'>Actor</th>
              <th className="px-3 py-2 text-left font-semibold" title='The target of the action'>Target</th>
              <th className="px-3 py-2 text-left font-semibold" title='Additional information about the action'>Metadata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading
              ? Array.from({ length: pagination?.pageSize || 10 }).map((_, i) => <SkeletonRow key={i} />)
              : auditLogs.length === 0
                ? <tr><td colSpan={5} className="text-center py-8 text-gray-400">No audit logs found.</td></tr>
                : auditLogs.map((log, idx) => (
                  <tr key={log.id} className={idx % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span title={log.createdAt}>
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium capitalize"
                        title={log.action}
                      >
                        {actionLabels[log.action] || log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap flex items-center gap-2">
                      {log.actor.avatarUrl
                        ? <img src={log.actor.avatarUrl} alt={log.actor.name || "avatar"} className="w-7 h-7 rounded-full border" />
                        : <User className="w-7 h-7 text-gray-300" />}
                      <div>
                        <div className="font-medium">{log.actor.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{log.actor.email}</div>
                        <div className="text-xs text-gray-400">{log.actor.siteRole}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div>
                        <div className="font-medium flex items-center gap-1">
                          {log.target.type && targetIcons[log.target.type] || <QuoteIcon className="inline mr-1 text-gray-400" />}
                          {log.target.type}
                        </div>
                        {log.target.title && <div className="text-xs">{log.target.title}</div>}
                        {log.target.name && <div className="text-xs">{log.target.name}</div>}
                        {log.target.email && <div className="text-xs text-gray-500">{log.target.email}</div>}
                        {/* Handle url/slug display logic */}
                        {log.target.url && log.target.slug ? (
                          <a href={log.target.url}>
                            <div className="text-xs text-gray-400">/{log.target.slug}</div>
                          </a>
                        ) : log.target.url ? (
                          <a href={log.target.url}>
                            <div className="text-xs text-gray-400">{log.target.url}</div>
                          </a>
                        ) : log.target.slug ? (
                          <div className="text-xs text-gray-400">/{log.target.slug}</div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-xs">
                      <details>
                        <summary className="cursor-pointer text-blue-600" title="Click to view metadata details">View</summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </details>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div >
      {/* Pagination controls */}
      {
        pagination && (
          <div className="flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between mt-4 gap-3 sm:gap-2 w-full">
            <div className="text-xs text-gray-600 text-center sm:text-left">
              Page {pagination.page} of {pagination.totalPages} | {pagination.total} logs
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full sm:w-auto">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                  disabled={!pagination.hasPrevious}
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
                  className="w-full sm:w-14 px-2 py-1 border rounded text-sm text-center"
                  style={{ minWidth: 0 }}
                  title="Current page number"
                />
                <button
                  className="flex-1 sm:flex-none px-3 py-1 rounded border text-sm flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer transition-colors bg-white hover:bg-gray-100"
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  title="Go to next page"
                >
                  <span className="hidden sm:inline">Next</span> <ChevronRight />
                </button>
              </div>
              {/* Page size selector */}
              <select
                className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-2 px-2 py-1 border rounded text-sm cursor-pointer bg-white"
                value={filters.pageSize}
                onChange={e =>
                  setFilters(f => ({
                    ...f,
                    pageSize: Number(e.target.value),
                    page: 1
                  }))
                }
                title="Select number of logs per page"
              >
                {[10, 20, 30, 50, 100].map(size => (
                  <option key={size} value={size}>{size} / page</option>
                ))}
              </select>
            </div>
          </div>
        )
      }
      <div className='text-xs text-gray-600 mt-6'>
        <details>
          <summary className="cursor-pointer font-semibold">Show Raw API Response</summary>
          <pre className="bg-gray-100 p-3 rounded overflow-x-auto">{JSON.stringify(rawResponse, null, 2)}</pre>
        </details>
      </div>
    </div >
  )
}

export default AuditLogsPage