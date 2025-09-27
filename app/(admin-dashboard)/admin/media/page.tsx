"use client"
import { Loader2, Search, XCircle } from 'lucide-react';
import React from 'react'
import { toast } from 'sonner';

interface MediaItem {
  id: string;
  url: string;
  type: string;
  provider: string;
  altText: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    siteRole: "user" | "admin";
  } | null;
}
interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
interface MediaUsage {
  postId: string;
  title: string;
  slug: string;
  status: "draft" | "under_review" | "approved" | "scheduled" | "rejected" | "archived";
  publishedAt: string | null;
}
interface MediaListResponse {
  pagination: Pagination;
  items: MediaItem[];
}
interface MediaItemDetailsResponse {
  data: MediaItem;
  usage: MediaUsage[];
}

const getUniqueProviders = (items: MediaItem[] = []) =>
  Array.from(new Set(items.map(m => m.provider))).filter(Boolean);

const MediaPage = () => {
  const [mediaList, setMediaList] = React.useState<MediaListResponse | null>(null);
  const [selectedMedia, setSelectedMedia] = React.useState<string | null>(null);
  const [mediaDetails, setMediaDetails] = React.useState<MediaItemDetailsResponse | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingDetails, setLoadingDetails] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rawResponse, setRawResponse] = React.useState<any>(null);
  const [altText, setAltText] = React.useState<string>("");
  const [provider, setProvider] = React.useState<string>("");
  const [updating, setUpdating] = React.useState<boolean>(false);
  const [deleting, setDeleting] = React.useState<boolean>(false);
  const [search, setSearch] = React.useState<string>("");
  const [filterProvider, setFilterProvider] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(10);


  // Fetch media list
  React.useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchMedia = async () => {
      try {
        const res = await fetch(`/api/admin/media?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&provider=${encodeURIComponent(filterProvider)}`);
        const data = await res.json();
        setMediaList(data);
      } catch (err) {
        toast.error("Failed to fetch media items");
        setError("Failed to fetch media items");
      } finally {
        setLoading(false);
      }
    };
    fetchMedia();
  }, [page, limit, search, filterProvider]);

  // Fetch media details
  React.useEffect(() => {
    if (!selectedMedia) return;
    setLoadingDetails(true);
    setError(null);
    const fetchMediaDetails = async () => {
      try {
        const res = await fetch(`/api/admin/media/${selectedMedia}`);
        const data = await res.json();
        setRawResponse(data);
        setMediaDetails(data);
        setAltText(data.data.altText || "");
        setProvider(data.data.provider || "");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to fetch media details");
        setError("Failed to fetch media details");
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchMediaDetails();
  }, [selectedMedia]);

  // Handlers
  const handleUpdate = React.useCallback(async () => {
    if (!selectedMedia) return;
    if (!altText && !provider) {
      toast.error("Please provide altText or provider to update");
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/media/${selectedMedia}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ altText, provider }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Media updated successfully");
        setMediaDetails(prev => prev ? { ...prev, data: { ...prev.data, altText, provider } } : prev);
        setMediaList(prev =>
          prev
            ? {
              ...prev,
              items: prev.items.map(item =>
                item.id === selectedMedia ? { ...item, altText, provider } : item
              ),
            }
            : prev
        );
      } else {
        toast.error(data.error || "Failed to update media");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update media");
    }
    setUpdating(false);
  }, [selectedMedia, altText, provider]);

  const handleDelete = React.useCallback(async () => {
    if (!selectedMedia) return;
    if (!confirm("Are you sure you want to delete this media item? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${selectedMedia}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Media deleted successfully");
        setMediaList(prev => prev ? { ...prev, items: prev.items.filter(item => item.id !== selectedMedia) } : prev);
        setMediaDetails(null);
        setSelectedMedia(null);
      } else {
        toast.error(data.error || "Failed to delete media");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete media");
    }
    setDeleting(false);
  }, [selectedMedia]);

  // Memoized filtered items
  const filteredItems = React.useMemo(() => {
    if (!mediaList?.items) return [];
    return mediaList.items.filter(
      m =>
        (m.altText?.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase()) ||
          m.type.toLowerCase().includes(search.toLowerCase()))
        && (!filterProvider || m.provider === filterProvider)
    );
  }, [mediaList, search, filterProvider]);

  // Provider options for filter
  const providerOptions = React.useMemo(() => getUniqueProviders(mediaList?.items), [mediaList]);

  // Skeleton loader for sidebar
  const SidebarSkeleton = () => (
    <ul className="flex-1 space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-3 items-center p-2 rounded bg-gray-100">
          <div className="w-16 h-16 bg-gray-200 rounded border" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        </li>
      ))}
    </ul>
  );

  // Skeleton loader for details
  const DetailsSkeleton = () => (
    <div className="flex gap-6 mb-4 animate-pulse">
      <div className="w-48 h-48 bg-gray-200 rounded border" />
      <div className="flex-1 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Media Library</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar: Media List */}
        <aside className="md:w-1/3 w-full bg-white rounded-lg shadow p-4 flex flex-col max-h-[80vh] sticky top-6">
          <div className="mb-4 flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search media..."
                className="w-full pl-8 pr-8 py-2 border rounded focus:outline-none focus:ring"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={loading}
                aria-label="Search media"
              />
              {search && (
                <button
                  className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  tabIndex={-1}
                  type="button"
                >
                  <XCircle size={18} />
                </button>
              )}
            </div>
            <select
              className="border rounded px-2 py-2 text-sm bg-white"
              value={filterProvider}
              onChange={e => setFilterProvider(e.target.value)}
              disabled={loading}
              aria-label="Filter by provider"
            >
              <option value="">All Providers</option>
              {providerOptions.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <h2 className="text-xl font-semibold mb-3">Media Items</h2>
          {loading ? (
            <SidebarSkeleton />
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 py-8">
              <span className="text-4xl mb-2">🖼️</span>
              <p>No media found.</p>
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1 pr-1">
              {filteredItems.map(media => (
                <li
                  key={media.id}
                  className={`mb-3 p-2 rounded cursor-pointer transition border hover:bg-gray-100 ${selectedMedia === media.id ? "bg-blue-50 border-blue-400" : "border-transparent"
                    }`}
                  onClick={() => setSelectedMedia(media.id)}
                  title={media.altText || undefined}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={media.url}
                      alt={media.altText || 'Media'}
                      className="w-16 h-16 object-cover rounded border"
                      loading="lazy"
                    />
                    <div className="truncate">
                      <p className="font-medium truncate" title={media.altText || undefined}>
                        {media.altText || <span className="italic text-gray-400">No Alt Text</span>}
                      </p>
                      <p className="text-xs text-gray-500 truncate">Type: {media.type}</p>
                      <p className="text-xs text-gray-500 truncate">Provider: {media.provider}</p>
                      <p className="text-xs text-gray-400 truncate">By: {media.createdBy ? media.createdBy.name : 'Unknown'}</p>
                      <p className="text-xs text-gray-400">At: {new Date(media.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 gap-2">
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={loading || !(mediaList?.pagination.hasPrevious)}
            >
              Prev
            </button>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              Page {mediaList?.pagination.page ?? page}
            </span>
            <span className="text-sm text-gray-600 whitespace-nowrap">
              <select
                className="w-20 text-center border rounded px-2 py-1"
                value={limit}
                onChange={e => {
                  setPage(1); // Reset to first page on limit change
                  setLimit(Number(e.target.value))
                }}
                aria-label="Items per page"
                disabled={loading}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={30}>30 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              onClick={() => setPage(p => p + 1)}
              disabled={loading || !(mediaList?.pagination.hasNext)}
            >
              Next
            </button>
          </div>
        </aside>
        {/* Details Panel */}
        <section className="md:w-2/3 w-full bg-white rounded-lg shadow p-6 min-h-[400px]">
          <h2 className="text-xl font-semibold mb-4">Media Details</h2>
          {loadingDetails ? (
            <DetailsSkeleton />
          ) : mediaDetails ? (
            <div>
              <div className="flex flex-col md:flex-row gap-6 mb-4">
                <img
                  src={mediaDetails.data.url}
                  alt={mediaDetails.data.altText || 'Media'}
                  className="w-full md:w-48 h-48 object-contain rounded border bg-gray-50"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      value={altText}
                      onChange={e => setAltText(e.target.value)}
                      disabled={updating}
                      maxLength={120}
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700">Provider</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      value={provider}
                      onChange={e => setProvider(e.target.value)}
                      disabled={updating || deleting}
                      maxLength={60}
                    />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                      onClick={handleUpdate}
                      disabled={updating}
                    >
                      {updating && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                      Update
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 flex items-center"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-medium">Type:</span> {mediaDetails.data.type}
              </div>
              <div className="mb-2">
                <span className="font-medium">Uploaded by:</span>
                <span className="ml-2">
                  {mediaDetails.data.createdBy ? (
                    <>
                      <span className="font-semibold">{mediaDetails.data.createdBy.name}</span>
                      <span className="ml-2 text-gray-500">{mediaDetails.data.createdBy.email}</span>
                      <span className="ml-2 text-xs text-gray-400">({mediaDetails.data.createdBy.siteRole})</span>
                      <span className="ml-2">
                        {mediaDetails.data.createdBy.avatarUrl ? (
                          <a href={mediaDetails.data.createdBy.avatarUrl} target="_blank" rel="noopener noreferrer">
                            <img src={mediaDetails.data.createdBy.avatarUrl} alt="Avatar" className="w-6 h-6 inline-block rounded-full border" />
                          </a>
                        ) : (
                          <img src="/default-avatar.png" alt="Avatar" className="w-6 h-6 inline-block rounded-full border" />
                        )}
                      </span>
                    </>
                  ) : (
                    <span>Unknown</span>
                  )}
                </span>
              </div>
              <div className="mb-4">
                <span className="font-medium">Uploaded at:</span> {new Date(mediaDetails.data.createdAt).toLocaleString()}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Usage</h3>
                <ul className="space-y-2">
                  {mediaDetails.usage.length > 0 ? mediaDetails.usage.map(usage => (

                    <li key={usage.postId} className="border rounded p-2 bg-gray-50">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate" title={usage.title}>{usage.title}</p>
                        <a href={`/blogs/${usage.slug}`} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">View Post</a>
                      </div>
                      <p className="text-xs text-gray-500 truncate">Slug: {usage.slug}</p>
                      <p className="text-xs text-gray-500">Status: {usage.status}</p>
                      <p className="text-xs text-gray-500">Published At: {usage.publishedAt ? new Date(usage.publishedAt).toLocaleDateString() : 'Not Published'}</p>
                    </li>
                  )) : (
                    <li className="text-gray-400">No Usage Found</li>
                  )}
                </ul>
              </div>
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-gray-500">Raw API Response</summary>
                <pre className="bg-gray-100 rounded p-2 mt-2 text-xs overflow-x-auto">{JSON.stringify(rawResponse, null, 2)}</pre>
              </details>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-16">
              <span className="text-5xl mb-2">🖼️</span>
              <p>Select a media item to see details</p>
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-600 text-sm">{error}</div>
          )}
        </section>
      </div>
    </div>
  )
}

export default MediaPage;