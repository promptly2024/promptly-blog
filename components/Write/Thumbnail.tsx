import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    Download,
    Sparkles,
    Wand2,
    RefreshCw,
    Stars,
    Palette,
    Zap,
    WandSparkles,
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
    setThumbnailId?: (id: string | null) => void;
    // Add these props for AI generation context
    title?: string;
    contentMD?: string;
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

interface GenerateImageOptions {
    title?: string;
    contentMD?: string;
    type?: 'blog-cover' | 'social';
    platform?: 'twitter' | 'linkedin' | 'instagram';
    customPrompt?: string;
    aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
    style?: string;
}

const ThumbnailSection = ({
    thumbnailId,
    setThumbnailId,
    title = "",
    contentMD = ""
}: ThumbnailSectionProps) => {
    // Existing state
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
    const [previewLoading, setPreviewLoading] = useState(false);

    // Enhanced state with AI generation tab
    const [activeTab, setActiveTab] = useState<'url' | 'search' | 'upload' | 'generate'>('url');
    
    // AI Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generateType, setGenerateType] = useState<'blog-cover' | 'social'>('blog-cover');
    const [socialPlatform, setSocialPlatform] = useState<'twitter' | 'linkedin' | 'instagram'>('twitter');
    const [customPrompt, setCustomPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('16:9');
    const [imageStyle, setImageStyle] = useState('modern-professional');
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [usedPrompt, setUsedPrompt] = useState<string>('');
    const [generationHistory, setGenerationHistory] = useState<Array<{
        prompt: string;
        imageUrl: string;
        timestamp: Date;
        style: string;
    }>>([]);

    // Predefined styles for better results
    const imageStyles = [
        { value: 'modern-professional', label: 'Modern Professional', description: 'Clean, minimalist business style' },
        { value: 'vibrant-colorful', label: 'Vibrant & Colorful', description: 'Bold colors and dynamic composition' },
        { value: 'abstract-artistic', label: 'Abstract Artistic', description: 'Creative and artistic interpretation' },
        { value: 'photography-realistic', label: 'Photography Style', description: 'Realistic photographic look' },
        { value: 'illustration-flat', label: 'Flat Illustration', description: 'Modern flat design illustration' },
        { value: 'gradient-modern', label: 'Gradient Modern', description: 'Contemporary gradient backgrounds' },
        { value: 'tech-futuristic', label: 'Tech Futuristic', description: 'Technology and innovation focused' },
        { value: 'nature-organic', label: 'Nature & Organic', description: 'Natural elements and textures' }
    ];

    // Tab configuration
    const tabs = [
        { id: 'url', label: 'URL', icon: Link, description: 'Paste image URL' },
        { id: 'search', label: 'Search', icon: Search, description: 'Find on Unsplash' },
        { id: 'upload', label: 'Upload', icon: Upload, description: 'Upload from device' },
        { id: 'generate', label: 'AI Generate', icon: Sparkles, description: 'Create with AI' }
    ];

    // Existing functions (unchanged)
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

    const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            await uploadImage(url, 'Thumbnail from URL', 'url');
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

        await uploadImage(image.urls.regular, image.alt_description || image.description || `Photo by ${image.user.name}`, 'unsplash');
    };

    const uploadImage = async (url: string, alt: string, provider: string) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/media/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl: url,
                    altText: alt,
                    provider: provider,
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
            toast.success('Image saved to media library!', {
                description: 'You can now use this image as your blog thumbnail.'
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

    const handleRemoveImage = () => {
        setThumbnail(null);
        setSelectedImage(null);
        if (setThumbnailId) {
            setThumbnailId(null);
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
            const media: DBResponse = data.media;
            setThumbnail(media.url);
            if (setThumbnailId) {
                setThumbnailId(media.id);
            }
            setIsUploadModalOpen(false);
            toast.success('Image uploaded and saved!', {
                description: 'You can now use this image as your blog thumbnail.'
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

    // NEW: AI Generation Functions
    const handleGenerateImage = async () => {
        if (!title && !customPrompt.trim()) {
            toast.error('Content Required', {
                description: 'Please provide a blog title or custom prompt to generate images.'
            });
            return;
        }

        setIsGenerating(true);
        setError(null);

        const options: GenerateImageOptions = {
            title: title || 'Blog Post',
            contentMD,
            type: generateType,
            platform: generateType === 'social' ? socialPlatform : undefined,
            customPrompt: customPrompt.trim() || undefined,
            aspectRatio: aspectRatio,
            style: imageStyle
        };

        try {
            const response = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate image');
            }

            const data = await response.json();
            const media: DBResponse = data.media;

            // Update state with generated image
            setThumbnail(media.url);
            setGeneratedImages(prev => [media.url, ...prev.slice(0, 4)]); // Keep last 5
            setUsedPrompt(data.prompt);
            
            // Add to generation history
            setGenerationHistory(prev => [{
                prompt: data.prompt,
                imageUrl: media.url,
                timestamp: new Date(),
                style: imageStyle
            }, ...prev.slice(0, 9)]); // Keep last 10

            if (setThumbnailId) {
                setThumbnailId(media.id);
            }

            toast.success('🎨 Image Generated Successfully!', {
                description: `Created using Imagen 4 Fast with ${imageStyle.replace('-', ' ')} style.`
            });

        } catch (error: any) {
            setError(error.message);
            toast.error('Generation Failed', {
                description: error.message
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerateWithSamePrompt = async () => {
        if (!usedPrompt) return;
        
        setCustomPrompt(usedPrompt);
        await handleGenerateImage();
    };

    const handleUseGeneratedImage = async (imageUrl: string, historyItem?: any) => {
        setThumbnail(imageUrl);
        
        // Upload the generated image to get a media ID
        await uploadImage(
            imageUrl, 
            historyItem ? `AI Generated: ${historyItem.prompt.slice(0, 50)}...` : 'AI Generated Image', 
            'imagen4'
        );
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
                    {/* Enhanced Tab Selection */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 bg-sky-50 p-2 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    type="button"
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex flex-col items-center justify-center space-y-1 py-3 px-2 rounded-md text-sm font-medium transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-white text-sky-700 shadow-sm'
                                            : 'text-sky-600 hover:text-sky-700 hover:bg-sky-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-xs font-medium">{tab.label}</span>
                                    {tab.id === 'generate' }
                                </button>
                            );
                        })}
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

                    {/* Search Tab - Same as before */}
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
                                        type="button"
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

                            {images.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-medium text-gray-700">
                                            Quick Preview
                                        </Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            type="button"
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

                    {/* Upload Tab - Same as before */}
                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <Button
                                onClick={() => setIsUploadModalOpen(true)}
                                type="button"
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

                    {/* NEW: AI Generation Tab */}
                    {activeTab === 'generate' && (
                        <div className="space-y-6">
                            {/* Generation Type Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <WandSparkles className="w-4 h-4 text-purple-500" />
                                    Content Type
                                </Label>
                                <Select value={generateType} onValueChange={(value: 'blog-cover' | 'social') => {
                                    setGenerateType(value);
                                    // Auto-adjust aspect ratio based on type
                                    if (value === 'social' && socialPlatform === 'instagram') {
                                        setAspectRatio('1:1');
                                    } else {
                                        setAspectRatio('16:9');
                                    }
                                }}>
                                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="blog-cover">
                                            <div className="flex items-center gap-2">
                                                <Image className="w-4 h-4" />
                                                Blog Cover Image
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="social">
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                Social Media Image
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Social Platform Selection */}
                            {generateType === 'social' && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Social Platform
                                    </Label>
                                    <Select value={socialPlatform} onValueChange={(value: 'twitter' | 'linkedin' | 'instagram') => {
                                        setSocialPlatform(value);
                                        setAspectRatio(value === 'instagram' ? '1:1' : '16:9');
                                    }}>
                                        <SelectTrigger className="border-purple-200 focus:border-purple-400">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="twitter">Twitter/X (16:9)</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn (16:9)</SelectItem>
                                            <SelectItem value="instagram">Instagram (1:1)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Style Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Palette className="w-4 h-4 text-purple-500" />
                                    Visual Style
                                </Label>
                                <Select value={imageStyle} onValueChange={setImageStyle}>
                                    <SelectTrigger className="border-purple-200 focus:border-purple-400">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-60">
                                        {imageStyles.map((style) => (
                                            <SelectItem key={style.value} value={style.value}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{style.label}</span>
                                                    <span className="text-xs text-gray-500">{style.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Aspect Ratio Selection */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    Aspect Ratio
                                </Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {['1:1', '3:4', '4:3', '9:16', '16:9'].map((ratio) => (
                                        <button
                                            type="button"
                                            key={ratio}
                                            onClick={() => setAspectRatio(ratio as any)}
                                            className={`p-2 text-xs font-medium rounded border-2 transition-all ${
                                                aspectRatio === ratio
                                                    ? 'border-purple-400 bg-purple-50 text-purple-700'
                                                    : 'border-gray-200 hover:border-purple-200'
                                            }`}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Prompt */}
                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">
                                    Custom Prompt (Optional)
                                </Label>
                                <Textarea
                                    placeholder={`Describe the image you want... or leave empty to auto-generate from "${title || 'your blog content'}"`}
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-400 min-h-[80px]"
                                    rows={3}
                                />
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Stars className="w-3 h-3" />
                                    <span>
                                        AI will enhance your prompt with the selected style and format
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleGenerateImage}
                                    disabled={isGenerating || (!title && !customPrompt.trim())}
                                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4 mr-2" />
                                            Generate with AI
                                        </>
                                    )}
                                </Button>
                                
                                {usedPrompt && !isGenerating && (
                                    <Button
                                        onClick={handleRegenerateWithSamePrompt}
                                        variant="outline"
                                        className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>

                            {/* Generation Info */}
                            {usedPrompt && (
                                <div className="p-4 bg-purple-50 rounded-lg space-y-2">
                                    <Label className="text-xs font-medium text-purple-700">
                                        Generated Prompt:
                                    </Label>
                                    <p className="text-xs text-purple-600 leading-relaxed">
                                        {usedPrompt}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-purple-500">
                                        <Zap className="w-3 h-3" />
                                        <span>Powered by Imagen 4 Fast • {aspectRatio} • {imageStyle.replace('-', ' ')}</span>
                                    </div>
                                </div>
                            )}

                            {/* Generation History */}
                            {generationHistory.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium text-gray-700">
                                        Recent Generations
                                    </Label>
                                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                        {generationHistory.slice(0, 4).map((item, index) => (
                                            <div
                                                key={index}
                                                className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-purple-400 transition-all"
                                                onClick={() => handleUseGeneratedImage(item.imageUrl, item)}
                                            >
                                                <img
                                                    src={item.imageUrl}
                                                    alt={`Generated ${index + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <div className="absolute bottom-1 left-1 bg-purple-600 text-white px-1 py-0.5 rounded text-xs">
                                                    {item.style.split('-')[0]}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
                    {(previewLoading || isLoading || isGenerating) && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                                <span className="text-sky-600">
                                    {previewLoading ? 'Loading preview...' : 
                                     isGenerating ? 'Creating your image...' : 'Processing...'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Preview and Remove Button */}
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
                                <div className="absolute top-2 right-2 flex space-x-2">
                                    <div className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1">
                                        <Check className="w-3 h-3" />
                                        <span>Selected</span>
                                    </div>
                                    <button
                                        onClick={handleRemoveImage}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center space-x-1"
                                        aria-label="Remove selected image"
                                        type="button"
                                    >
                                        <X className="w-3 h-3" />
                                        <span>Remove</span>
                                    </button>
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

            {/* Rest of the modals remain the same */}
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
                                    className="aspect-video relative rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-sky-400 transition-all duration-200"
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

// ThumbnailSection only uploads/selects/removes images and updates the thumbnailId.
// It does NOT trigger blog creation. Blog creation only happens when the user submits the post form.

export default ThumbnailSection;
