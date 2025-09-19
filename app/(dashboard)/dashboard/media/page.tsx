'use client';
import React, { useEffect, useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  publicId: string; // Cloudinary public_id
  alt?: string;
  createdAt: string;
}

const MediaManagement = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete image.');
      }
    } catch (err) {
      setError('Failed to delete image.');
    }
    setDeleting(null);
  };

  return (
    <div>
      <h1>Media Management</h1>
      <p>Welcome to the Media Management section of your dashboard!</p>
      {error && <div className="text-red-600 my-2">{error}</div>}
      {loading ? (
        <div>Loading images...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {media.length === 0 && <div>No images found.</div>}
          {media.map((item) => (
            <div key={item.id} className="border rounded p-2 flex flex-col items-center">
              <img src={item.url} alt={item.alt || ''} className="w-full h-32 object-cover rounded mb-2" />
              <div className="text-xs text-gray-600 mb-1">{item.alt}</div>
              <div className="text-xs text-gray-400 mb-2">
                {new Date(item.createdAt).toLocaleString()}
              </div>
              <button
                onClick={() => handleDelete(item.id, item.publicId)}
                disabled={deleting === item.id}
                className="text-red-600 text-xs border px-2 py-1 rounded hover:bg-red-50"
              >
                {deleting === item.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
