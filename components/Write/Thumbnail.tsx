import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Image,
    AlertCircle,
    Loader2,
    Search,
    Upload,
    Link,
    Check,
    X,
    Camera,
    Globe,
    Eye,
    Download
} from "lucide-react";
import { fetchUnsplashImages } from '@/utils/getUnsplashImages';
import { toast } from 'sonner';

interface UnsplashImage {
    id: string;
    urls: {
        regular: string;
        small: string;
        thumb: string;
    };
    user: {
        name: string;
        username: string;
    };
    links: {
        html: string;
    };
    description?: string;
    alt_description?: string;
}

interface ThumbnailSectionProps {
    thumbnailId: string | null;
    setThumbnailId?: (id: string) => void;
}

interface DBResponse {
    id: string;
    createdAt: Date;
    url: string;
    type: string;
    provider: string;
    altText: string | null;
    createdBy: string | null;
}

const ThumbnailSection = ({
    thumbnailId,
    setThumbnailId
}: ThumbnailSectionProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState<string>("");
    const [images, setImages] = useState<UnsplashImage[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedUploadImage, setSelectedUploadImage] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<UnsplashImage | null>(null);
    const [page, setPage] = useState(1);
    const [thumbnail, setThumbnail] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'url' | 'search' | 'upload'>('url');
    const [previewLoading, setPreviewLoading] = useState(false);

    const validateImageUrl = (url: string) => {
        setPreviewLoading(true);
        setError(null);

        const img = new window.Image();
        img.onload = () => {
            setPreviewLoading(false);
            setThumbnail(url);
            toast.success('Image loaded successfully!');
        };
        img.onerror = () => {
            setPreviewLoading(false);
            setError('Unable to load image. Please check the URL and try again.');
            setThumbnail(null);
            toast.error('Failed to load image from URL');
        };
        img.src = url;
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        if (!url) {
            setThumbnail(null);
            setSelectedImage(null);
            setError(null);
            return;
        }

        try {
            new URL(url);
            validateImageUrl(url);
        } catch {
            setError('Please enter a valid URL');
            setThumbnail(null);
        }
    };

    const handleImageSearch = async () => {
        if (!query.trim()) {
            setError('Please enter a search term');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const fetchedImages = await fetchUnsplashImages(query);
            // Ensure each image has a 'thumb' property in 'urls'
            setImages(
                fetchedImages.images.map((img: any) => ({
                    ...img,
                    urls: {
                        ...img.urls,
                        thumb: img.urls.thumb || img.urls.small || img.urls.regular
                    }
                }))
            );
            setPage(1);
            toast.success(`Found ${fetchedImages.images.length} images for "${query}"`);
        } catch (error: any) {
            setError(error.message || 'Failed to fetch images');
            toast.error('Search failed', {
                description: error.message || 'Failed to fetch images from Unsplash'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = async () => {
        setIsLoading(true);
        try {
            const moreImages = await fetchUnsplashImages(query, page + 1, 9);
            setPage(page + 1);
            setImages([
                ...images,
                ...moreImages.images.map((img: any) => ({
                    ...img,
                    urls: {
                        ...img.urls,
                        thumb: img.urls.thumb || img.urls.small || img.urls.regular
                    }
                }))
            ]);
            toast.success(`Loaded ${moreImages.images.length} more images`);
        } catch (error: any) {
            setError(error.message || 'Failed to load more images');
            toast.error('Failed to load more images');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageSelect = async (image: UnsplashImage) => {
        if (!image || !image.user) return;

        setThumbnail(image.urls.regular);
        setSelectedImage(image);
        setIsModalOpen(false);

        // Upload to media library immediately
        try {
            setIsLoading(true);
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: image.urls.regular,
                    altText: image.alt_description || image.user.name || '',
                    provider: 'unsplash',
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();
            const media: DBResponse = data.media;
            if (setThumbnailId) {
                setThumbnailId(media.id);
            }

            toast.success('Thumbnail selected!', {
                description: `Photo by ${image.user.name} from Unsplash`
            });
        } catch (error: any) {
            setError('Failed to save image to media library');
            toast.error('Failed to save image', {
                description: error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadImageToCloudinary = async () => {
        if (!selectedUploadImage) {
            toast.error('No image selected', {
                description: 'Please select an image to upload.'
            });
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedUploadImage);

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
            setThumbnail(data.imageUrl);
            setIsUploadModalOpen(false);
            setSelectedUploadImage(null);

            toast.success('Image uploaded successfully!', {
                description: 'Your image has been uploaded and set as thumbnail.'
            });
        } catch (error: any) {
            setError(error.message);
            toast.error('Upload failed', {
                description: error.message
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <Card className="w-full border-sky-200 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-sky-500 rounded-lg">
                            <Image className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-sky-800">
                                Blog Thumbnail
                            </CardTitle>
                            <p className="text-sm text-sky-600 mt-1">
                                Choose an eye-catching image for your blog post
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Tab Selection */}
                    <div className="flex space-x-1 bg-sky-50 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('url')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'url'
                                ? 'bg-white text-sky-700 shadow-sm'
                                : 'text-sky-600 hover:text-sky-700'
                                }`}
                        >
                            <Link className="w-4 h-4" />
                            <span>URL</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'search'
                                ? 'bg-white text-sky-700 shadow-sm'
                                : 'text-sky-600 hover:text-sky-700'
                                }`}
                        >
                            <Search className="w-4 h-4" />
                            <span>Search</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'upload'
                                ? 'bg-white text-sky-700 shadow-sm'
                                : 'text-sky-600 hover:text-sky-700'
                                }`}
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                        </button>
                    </div>

                    {/* URL Tab */}
                    {activeTab === 'url' && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="thumbnail" className="text-sm font-medium text-gray-700">
                                    Image URL
                                </Label>
                                <Input
                                    id="thumbnail"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    onChange={handleThumbnailChange}
                                    value={thumbnail || ''}
                                    className="mt-1 border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Paste a direct link to an image
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Search Tab */}
                    {activeTab === 'search' && (
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">
                                    Search Unsplash
                                </Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        placeholder="Search for images..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleImageSearch()}
                                        className="border-sky-200 focus:border-sky-400 focus:ring-sky-400"
                                    />
                                    <Button
                                        onClick={handleImageSearch}
                                        disabled={isLoading}
                                        className="bg-sky-500 hover:bg-sky-600 shrink-0"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Search millions of free high-quality images
                                </p>
                            </div>

                            {/* Quick Search Results Preview */}
                            {images.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Quick Preview
                                        </Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsModalOpen(true)}
                                            className="text-sky-600 border-sky-200 hover:bg-sky-50"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View All
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {images.slice(0, 3).map((img) => (
                                            <div
                                                key={img.id}
                                                className="aspect-video relative rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-sky-400 transition-all"
                                                onClick={() => handleImageSelect(img)}
                                            >
                                                <img
                                                    src={img.urls.thumb}
                                                    alt={img.alt_description || `Photo by ${img.user.name}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                                    <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Upload Tab */}
                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <Button
                                onClick={() => setIsUploadModalOpen(true)}
                                variant="outline"
                                className="w-full h-24 border-2 border-dashed border-sky-200 hover:border-sky-400 hover:bg-sky-50 transition-all"
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <Upload className="w-8 h-8 text-sky-500" />
                                    <span className="text-sky-700 font-medium">Upload Image</span>
                                    <span className="text-xs text-gray-500">Click to select from your device</span>
                                </div>
                            </Button>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive" className="border-red-200">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading State */}
                    {(previewLoading || isLoading) && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                                <span className="text-sky-600">
                                    {previewLoading ? 'Loading preview...' : 'Processing...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {thumbnail && !error && !previewLoading && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium text-gray-700">Preview</Label>
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-100 border border-sky-200">
                                <img
                                    src={thumbnail}
                                    alt="Thumbnail preview"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute top-2 right-2">
                                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                                        <Check className="w-3 h-3" />
                                        <span>Selected</span>
                                    </div>
                                </div>
                            </div>
                            {selectedImage && (
                                <div className="flex items-center justify-between p-3 bg-sky-50 rounded-lg">
                                    <div className="flex items-center space-x-2">
                                        <Camera className="w-4 h-4 text-sky-600" />
                                        <span className="text-sm text-sky-700">
                                            Photo by{" "}
                                            <a
                                                href={`https://unsplash.com/@${selectedImage.user.username}?utm_source=PromptlyBlog&utm_medium=referral`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:underline"
                                            >
                                                {selectedImage.user.name}
                                            </a>
                                        </span>
                                    </div>
                                    <a
                                        href="https://unsplash.com/?utm_source=PromptlyBlog&utm_medium=referral"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center space-x-1 text-xs text-sky-600 hover:text-sky-800"
                                    >
                                        <Globe className="w-3 h-3" />
                                        <span>Unsplash</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Unsplash Images Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
                    <DialogHeader className="border-b border-sky-100 pb-4">
                        <DialogTitle className="text-xl font-bold text-sky-800 flex items-center space-x-2">
                            <Search className="w-5 h-5" />
                            <span>Choose from Unsplash</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-sky-400 transition-all duration-200 shadow-md hover:shadow-lg"
                                    onClick={() => handleImageSelect(img)}
                                >
                                    <img
                                        src={img.urls.small}
                                        alt={img.alt_description || `Photo by ${img.user.name}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-white text-sm font-medium">{img.user.name}</p>
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-sky-500 text-white px-4 py-2 rounded-full font-medium flex items-center space-x-2">
                                                <Check className="w-4 h-4" />
                                                <span>Select</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {images.length > 0 && (
                            <div className="flex justify-center py-6 border-t border-sky-100">
                                <Button
                                    onClick={handleLoadMore}
                                    variant="outline"
                                    disabled={isLoading}
                                    className="border-sky-200 text-sky-600 hover:bg-sky-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                    )}
                                    Load More Images
                                </Button>
                            </div>
                        )}

                        {images.length === 0 && !isLoading && query && (
                            <div className="text-center py-12">
                                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">No images found for "{query}"</p>
                                <p className="text-sm text-gray-400 mt-1">Try searching with different keywords</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Upload Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-sky-800 flex items-center space-x-2">
                            <Upload className="w-5 h-5" />
                            <span>Upload Image</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-sky-200 rounded-lg p-6">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    setSelectedUploadImage(file);
                                }}
                                className="hidden"
                                id="file-upload"
                            />
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center space-y-2 cursor-pointer"
                            >
                                <Upload className="w-12 h-12 text-sky-400" />
                                <span className="text-sky-700 font-medium">Click to select image</span>
                                <span className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</span>
                            </label>
                        </div>

                        {selectedUploadImage && (
                            <div className="p-4 bg-sky-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Image className="w-5 h-5 text-sky-600" />
                                    <div>
                                        <p className="font-medium text-sky-800">{selectedUploadImage.name}</p>
                                        <p className="text-sm text-sky-600">
                                            {(selectedUploadImage.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleUploadImageToCloudinary}
                            disabled={!selectedUploadImage || isUploading}
                            className="w-full bg-sky-500 hover:bg-sky-600"
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Image
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ThumbnailSection;