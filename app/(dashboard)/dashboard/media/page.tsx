'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Grid3X3,
  List,
  Trash2,
  Calendar,
  Plus,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { MediaCard, MediaInfoCard, UploadModal } from './MediaCard';

interface MediaItem {
  id: string;
  url: string;
  publicId: string;
  alt?: string;
  createdAt: string;
}

const MediaManagement = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedUploadImage, setSelectedUploadImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragOver, setDragOver] = useState(false);

  // Fetch all images
  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/uploadimages');
        const data = await res.json();
        setMedia(data.media || []);
      } catch (err) {
        setError('Failed to load images.');
      }
      setLoading(false);
    };
    fetchMedia();
  }, []);

  // Filter and sort media
  const filteredAndSortedMedia = useMemo(() => {
    let filtered = media;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        (item.alt && item.alt.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.publicId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort media
    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortBy === 'date') {
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
      } else {
        aValue = a.alt || a.publicId;
        bValue = b.alt || b.publicId;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return filtered;
  }, [media, searchQuery, sortBy, sortOrder]);

  // Get storage stats
  const storageStats = useMemo(() => {
    const totalImages = media.length;
    const estimatedSize = totalImages * 0.5; // Rough estimate in MB
    return { totalImages, estimatedSize };
  }, [media]);

  // Delete image handler
  const handleDelete = async (id: string, publicId: string) => {
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch('/api/uploadimages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, publicId }),
      });
      if (res.ok) {
        setMedia((prev) => prev.filter((item) => item.id !== id));
        setSelectedImages(prev => prev.filter(imgId => imgId !== id));
        toast.success('Image deleted successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete image.');
        toast.error('Failed to delete image');
      }
    } catch (err) {
      setError('Failed to delete image.');
      toast.error('Failed to delete image');
    }
    setDeleting(null);
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedImages.length === 0) return;

    const confirmDelete = window.confirm(`Delete ${selectedImages.length} selected images?`);
    if (!confirmDelete) return;

    for (const imageId of selectedImages) {
      const image = media.find(img => img.id === imageId);
      if (image) {
        await handleDelete(image.id, image.publicId);
      }
    }
    setSelectedImages([]);
  };

  // Download image handler
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename || 'image';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);

      toast.success('Image downloaded successfully');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  // Copy URL handler
  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Image URL copied to clipboard');
  };

  // Upload handler
  const handleUploadImageToCloudinary = async () => {
    if (!selectedUploadImage) {
      toast.error('No image selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedUploadImage);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch('/api/uploadimages', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      setMedia((prev) => [data.media, ...prev]);
      setSelectedUploadImage(null);
      setIsUploadModalOpen(false);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      setError(error.message);
      toast.error('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      setSelectedUploadImage(imageFile);
      setIsUploadModalOpen(true);
    } else {
      toast.error('Please drop an image file');
    }
  }, []);

  // Selection handlers
  const handleSelectImage = (imageId: string, selected: boolean) => {
    setSelectedImages(prev =>
      selected
        ? [...prev, imageId]
        : prev.filter(id => id !== imageId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedImages(selected ? filteredAndSortedMedia.map(img => img.id) : []);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Media Library
              </h1>
              <p className="text-slate-600">
                Manage your images and media files for blog posts
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Image</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{storageStats.totalImages}</div>
                <div className="text-slate-600 text-sm">Total Images</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatFileSize(storageStats.estimatedSize * 1024 * 1024)}
                </div>
                <div className="text-slate-600 text-sm">Storage Used</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {media.length > 0 ? new Date(media[0].createdAt).toLocaleDateString() : 'N/A'}
                </div>
                <div className="text-slate-600 text-sm">Last Upload</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search images by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'name', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list'
                    ? 'bg-sky-100 text-sky-700'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedImages.length > 0 && (
            <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sky-900">
                  {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedImages([])}
                    className="text-xs text-sky-600 hover:text-sky-800 underline"
                  >
                    Clear selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error:</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Media Grid/List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">
              All Images ({filteredAndSortedMedia.length})
            </h2>
            {filteredAndSortedMedia.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedImages.length === filteredAndSortedMedia.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-slate-600">Select all</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-slate-600">Loading images...</span>
              </div>
            </div>
          ) : filteredAndSortedMedia.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`border-2 border-dashed rounded-xl p-12 transition-colors ${dragOver
                  ? 'border-sky-400 bg-sky-50'
                  : 'border-slate-300 hover:border-slate-400'
                  }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">
                  {media.length === 0 ? 'No images uploaded yet' : 'No images match your search'}
                </h3>
                <p className="text-slate-500 mb-6">
                  {media.length === 0
                    ? 'Upload your first image to get started, or drag and drop files here'
                    : 'Try adjusting your search query or filters'
                  }
                </p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Upload Your First Image
                </button>
              </div>
            </div>
          ) : (
            <div className={
              // viewMode === 'grid'
              //   ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4'
              //       : 'space-y-3'
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-3'
            }>
              {filteredAndSortedMedia.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  isSelected={selectedImages.includes(item.id)}
                  isDeleting={deleting === item.id}
                  onSelect={handleSelectImage}
                  onDelete={handleDelete}
                  onDownload={downloadImage}
                  onCopyUrl={copyImageUrl}
                />
              ))}
            </div>
          )}
        </div>

        <MediaInfoCard />
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          selectedFile={selectedUploadImage}
          isUploading={isUploading}
          onFileSelect={setSelectedUploadImage}
          onUpload={handleUploadImageToCloudinary}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedUploadImage(null);
          }}
        />
      )}

    </div>
  );
};

export default MediaManagement;