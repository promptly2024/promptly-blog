// To DO: Add pagination for large number of categories/tags
// To DO: Add bulk delete functionality, select multiple categories/tags and delete, already have UI for it

"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Tag,
  FolderOpen,
  Calendar,
  FileText,
  MoreHorizontal,
  X,
  Save,
  AlertTriangle,
  TrendingUp,
  Archive,
  Clock,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { SampleCategories, SampleTags } from '@/lib/sample-taxonomy';

interface Category {
  id: string;
  name: string;
  createdAt: Date;
  postsCount?: number;
}

interface TagItem {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  postsCount: number;
}

interface TaxonomyResponse {
  success: boolean;
  message: string;
  categories: Category[];
  tags: TagItem[];
}

const TaxonomyAdminPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'postsCount'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showUnused, setShowUnused] = useState(false);

  // UI states
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'category' | 'tag', id: string, name: string, slug?: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'category' | 'tag', id: string, name: string, postsCount: number } | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [addingItems, setAddingItems] = useState(false);

  // Form states
  const [newItemName, setNewItemName] = useState('');
  const [newItemSlug, setNewItemSlug] = useState('');

  const [uploadingBulk, setUploadingBulk] = useState(false);

  // Track if user has manually edited the slug
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Fetch taxonomy data
  const fetchTaxonomy = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/taxonomy');
      if (!response.ok) {
        throw new Error('Failed to fetch taxonomy data');
      }
      const data: TaxonomyResponse = await response.json();
      setCategories(data.categories);
      setTags(data.tags);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 64); // limit slug length to 64 chars
  };

  // Handle creating new item
  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    setAddingItems(true);

    try {
      let slugToUse = newItemSlug;
      if (activeTab === 'tags' && !slugManuallyEdited) {
        slugToUse = generateSlug(newItemName);
        setNewItemSlug(slugToUse);
      }

      const payload = {
        type: activeTab === 'categories' ? 'category' : 'tag',
        name: newItemName.trim(),
        ...(activeTab === 'tags' && { slug: slugToUse || generateSlug(newItemName) })
      };

      const response = await fetch('/api/admin/taxonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create item');
      }

      const data = await response.json();
      if (activeTab === 'categories' && data.category) {
        setCategories((prev) => [...prev, data.category]);
      } else if (activeTab === 'tags' && data.tag) {
        setTags((prev) => [...prev, data.tag]);
      }
      setShowAddForm(false);
      setNewItemName('');
      setNewItemSlug('');
      setSlugManuallyEdited(false);
      toast.success(`${activeTab === 'categories' ? 'Category' : 'Tag'} created successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create item');
      setError(err.message);
    } finally {
      setAddingItems(false);
    }
  };

  const handleSampleTaxonomyCreate = async () => {
    try {
      const allTaxonomies = [
        ...SampleCategories.map((category) => ({
          type: "category",
          name: category,
          slug: generateSlug(category),
        })),
        ...SampleTags.map((tag) => ({
          type: "tag",
          name: tag,
          slug: generateSlug(tag),
        })),
      ];

      setUploadingBulk(true);
      await Promise.all(
        allTaxonomies.map(async (item) => {
          try {
            const res = await fetch("/api/admin/taxonomy", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(item),
            });

            // if taxonomy already exists, skip without throwing
            if (!res.ok && res.status !== 409) {
              throw new Error(`Failed to insert ${item.type}: ${item.name}`);
            }
            const data = await res.json();
            setCategories((prev) => {
              if (
                item.type === "category" &&
                data.category &&
                !prev.some((c) => c.name.toLowerCase() === data.category.name.toLowerCase())
              ) {
                return [...prev, data.category];
              }
              return prev;
            });
            setTags((prev) => {
              if (
                item.type === "tag" &&
                data.tag &&
                !prev.some((t) => t.name.toLowerCase() === data.tag.name.toLowerCase())
              ) {
                return [...prev, data.tag];
              }
              return prev;
            });
          } catch (err) {
            console.error("Taxonomy insert error:", err);
          }
        })
      );

      setUploadingBulk(false);
      toast.success("Default categories & tags created (duplicates skipped)");
    } catch (err: any) {
      setError(err.message || "Something went wrong while creating taxonomy");
      toast.error("Failed to create default taxonomy");
    } finally {
      setUploadingBulk(false);
      fetchTaxonomy();
    }
  };


  // Handle updating item
  const handleUpdate = async () => {
    if (!editingItem || !editingItem.name.trim()) return;

    try {
      let slugToUse = editingItem.slug;
      if (editingItem.type === 'tag' && (!slugToUse || !slugManuallyEdited)) {
        slugToUse = generateSlug(editingItem.name);
      }

      const payload = {
        type: editingItem.type,
        id: editingItem.id,
        name: editingItem.name.trim(),
        ...(editingItem.type === 'tag' && { slug: slugToUse })
      };

      const response = await fetch('/api/admin/taxonomy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      await fetchTaxonomy();
      setEditingItem(null);
      setSlugManuallyEdited(false);
      toast.success(`${editingItem.type === 'category' ? 'Category' : 'Tag'} updated successfully`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle deleting item
  const handleDelete = async (type: 'category' | 'tag', id: string) => {
    try {
      const response = await fetch('/api/admin/taxonomy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id })
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      await fetchTaxonomy();
      setDeleteConfirm(null);
      toast.success(`${type === 'category' ? 'Category' : 'Tag'} deleted successfully`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter and sort data
  const getFilteredData = () => {
    const data = activeTab === 'categories' ? categories : tags;
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Show unused filter
    if (showUnused) {
      filtered = filtered.filter(item => item.postsCount === 0);
    }

    // Remove duplicates by name (case-insensitive)
    const seenNames = new Set<string>();
    filtered = filtered.filter(item => {
      const lowerName = item.name.toLowerCase();
      if (seenNames.has(lowerName)) return false;
      seenNames.add(lowerName);
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'postsCount':
          aVal = a.postsCount;
          bVal = b.postsCount;
          break;
        default:
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
      }

      if (sortDir === 'desc') {
        if (typeof aVal === 'string' && typeof bVal === 'string') return bVal.localeCompare(aVal);
        return (bVal as number) - (aVal as number);
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') return aVal.localeCompare(bVal);
      return (aVal as number) - (bVal as number);
    });

    return filtered;
  };

  // Calculate stats
  const totalCategories = categories.length;
  const totalTags = tags.length;
  const unusedCategories = categories.filter(c => c.postsCount === 0).length;
  const unusedTags = tags.filter(t => t.postsCount === 0).length;
  const mostUsedCategories = categories.sort((a, b) => (b.postsCount || 0) - (a.postsCount || 0)).slice(0, 5);
  const mostUsedTags = tags.sort((a, b) => (b.postsCount || 0) - (a.postsCount || 0)).slice(0, 5);

  const filteredData = getFilteredData();

  return (
    <div className="min-h-screen bg-gray-50/50 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm min-w-0 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="p-2 sm:p-3 rounded-lg bg-gray-100 text-gray-300 flex items-center justify-center">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6 w-full">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{totalCategories}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Tags</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{totalTags}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Unused Categories</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{unusedCategories}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Archive className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Unused Tags</p>
                  <p className="text-xl sm:text-2xl font-semibold text-gray-900 mt-1">{unusedTags}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Cards */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 min-w-0 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-200 mr-3"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-4 w-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Top Categories by Usage
              </h3>
              <div className="space-y-3">
                {mostUsedCategories.map((category, index) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {category.postsCount}
                    </span>
                  </div>
                ))}
                {mostUsedCategories.length === 0 && (
                  <p className="text-sm text-gray-500">No categories with posts yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 min-w-0">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Top Tags by Usage
              </h3>
              <div className="space-y-3">
                {mostUsedTags.map((tag, index) => (
                  <div key={tag.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-medium flex items-center justify-center mr-3">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      {tag.postsCount}
                    </span>
                  </div>
                ))}
                {mostUsedTags.length === 0 && (
                  <p className="text-sm text-gray-500">No tags with posts yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50 px-2 py-2 sm:px-4 sm:py-3">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap space-x-2 sm:space-x-8 px-2 sm:px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                Categories ({totalCategories})
              </button>
              <button
                onClick={() => setActiveTab('tags')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Tags ({totalTags})
              </button>
            </nav>
          </div>

          {/* Controls */}
          <div className="p-2 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 items-stretch sm:items-center justify-between flex-wrap">
              <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 sm:gap-4 w-full">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                <div className="flex flex-row gap-2 mt-2 sm:mt-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'postsCount')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="createdAt">Sort by Date</option>
                    <option value="postsCount">Sort by Usage</option>
                  </select>

                  <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value as 'asc' | 'desc')}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2 sm:mt-0 flex-wrap">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showUnused}
                    onChange={(e) => setShowUnused(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Show unused only</span>
                </label>

                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTab === 'categories' ? 'Category' : 'Tag'}
                </button>
              </div>
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-2 sm:p-6 bg-gray-50 border-b border-gray-200">
              <div className="max-w-full sm:max-w-md space-y-3 sm:space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New {activeTab === 'categories' ? 'Category' : 'Tag'}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => {
                      setNewItemName(e.target.value);
                      if (activeTab === 'tags') {
                        // If user hasn't manually edited slug, always update slug on name change
                        if (!slugManuallyEdited) {
                          setNewItemSlug(generateSlug(e.target.value));
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter ${activeTab === 'categories' ? 'category' : 'tag'} name`}
                  />
                </div>

                {activeTab === 'tags' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={newItemSlug}
                      onChange={(e) => {
                        setNewItemSlug(e.target.value);
                        setSlugManuallyEdited(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="tag-slug"
                    />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={!newItemName.trim() || addingItems}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {addingItems ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItemName('');
                      setNewItemSlug('');
                    }}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="overflow-x-auto w-full">
              <table className="min-w-[500px] sm:min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3"></th>
                    {activeTab === 'tags' && <th className="px-2 sm:px-6 py-2 sm:py-3"></th>}
                    <th className="px-2 sm:px-6 py-2 sm:py-3"></th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3"></th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} className="hover:bg-gray-50 animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                      </td>
                      {activeTab === 'tags' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-10 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              {activeTab === 'categories' ? <FolderOpen className="mx-auto h-12 w-12 text-gray-400" /> : <Tag className="mx-auto h-12 w-12 text-gray-400" />}
              <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : `Get started by creating a new ${activeTab === 'categories' ? 'category' : 'tag'}.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-[500px] sm:min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                    {activeTab === 'tags' && (
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Slug</th>
                    )}
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Created</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Posts</th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingItem?.id === item.id ? (
                          <input
                            type="text"
                            value={editingItem.name}
                            onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                            className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <div className="flex items-center">
                            {activeTab === 'categories' ? (
                              <FolderOpen className="w-4 h-4 text-blue-500 mr-2" />
                            ) : (
                              <Tag className="w-4 h-4 text-green-500 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-900">{item.name}</span>
                          </div>
                        )}
                      </td>
                      {activeTab === 'tags' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingItem?.id === item.id ? (
                            <input
                              type="text"
                              value={editingItem.slug || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-600 font-mono">{(item as TagItem).slug}</span>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.postsCount === 0
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-blue-100 text-blue-800'
                            }`}>
                            <FileText className="w-3 h-3 mr-1" />
                            {item.postsCount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingItem?.id === item.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={handleUpdate}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingItem({
                                type: activeTab === 'categories' ? 'category' : 'tag',
                                id: item.id,
                                name: item.name,
                                ...(activeTab === 'tags' && { slug: (item as TagItem).slug })
                              })}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({
                                type: activeTab === 'categories' ? 'category' : 'tag',
                                id: item.id,
                                name: item.name,
                                postsCount: item.postsCount || 0
                              })}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="p-2 sm:p-4 text-xs sm:text-sm text-gray-500">Showing {filteredData.length} of {activeTab === 'categories' ? totalCategories : totalTags} {activeTab}</p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSampleTaxonomyCreate}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 transition-colors"
            disabled={uploadingBulk}
          >
            {uploadingBulk ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span className="text-white">Updating the taxonomy with default values...</span></>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Sample Categories & Tags
              </>
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg max-w-full sm:max-w-md w-full p-4 sm:p-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-2">
                  Are you sure you want to delete the {deleteConfirm.type} <strong>"{deleteConfirm.name}"</strong>?
                </p>

                {deleteConfirm.postsCount > 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mr-2" />
                      <p className="text-sm text-amber-800">
                        <strong>Warning:</strong> This {deleteConfirm.type} is used in {deleteConfirm.postsCount} post{deleteConfirm.postsCount !== 1 ? 's' : ''}.
                        Deleting it will remove it from all associated posts.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full mr-2 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      </div>
                      <p className="text-sm text-green-800">
                        This {deleteConfirm.type} is not used in any posts and can be safely deleted.
                      </p>
                    </div>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
              </div>

              <div className="flex justify-end space-x-2 sm:space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete {deleteConfirm.type === 'category' ? 'Category' : 'Tag'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Modal */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 sm:p-4 w-[90vw] max-w-xs">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} {activeTab} selected
              </span>
              <button
                onClick={() => setSelectedItems([])}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  toast('Feature coming soon!');
                  console.log('Bulk delete:', selectedItems);
                  setSelectedItems([]);
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxonomyAdminPage;