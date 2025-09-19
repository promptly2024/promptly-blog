"use client";
import { EditorSection } from '@/components/Write/ContentMD';
import ThumbnailSection from '@/components/Write/Thumbnail';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react";
import { toast } from 'sonner';
import {
    Save,
    Eye,
    Calendar,
    Globe,
    Lock,
    FileText,
    Image,
    Clock,
    CheckCircle,
    Send,
    Edit3,
    Sparkles,
    Crown,
    Tag,
    Wand2,
} from 'lucide-react';
import { BlogType, CategoryType } from '@/types/blog';
import { makeValidSlug } from '@/utils/helper-blog';

// Loading Spinner Component
const LoadingSpinner = ({ className = "" }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
    </svg>
);

// Form Field Component
const FormField = ({
    label,
    icon: Icon,
    required = false,
    children,
    error,
    description,
    premium = false
}: {
    label: string;
    icon?: React.ElementType;
    required?: boolean;
    children: React.ReactNode;
    error?: string;
    description?: string;
    premium?: boolean;
}) => (
    <div className="space-y-3">
        <label className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-semibold text-slate-700">
                {Icon && <Icon className="w-4 h-4 text-sky-500" />}
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
            </div>
            {premium && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Premium</span>
                </div>
            )}
        </label>
        {description && (
            <p className="text-sm text-slate-500">{description}</p>
        )}
        {children}
        {error && <p className="text-red-500 text-sm flex items-center space-x-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            <span>{error}</span>
        </p>}
    </div>
);

// AI Button Component
const AIButton = ({ onClick, loading, children }: { onClick: () => void; loading: boolean; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm font-medium"
    >
        {loading ? (
            <LoadingSpinner className="w-4 h-4" />
        ) : (
            <Sparkles className="w-4 h-4" />
        )}
        <span>{children}</span>
    </button>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
        draft: { icon: Edit3, color: 'bg-gray-100 text-gray-700 border-gray-200', text: 'Draft' },
        submitted: { icon: Send, color: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Submitted' },
        scheduled: { icon: Clock, color: 'bg-orange-100 text-orange-700 border-orange-200', text: 'Scheduled' },
        published: { icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200', text: 'Published' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
        <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <IconComponent className="w-3 h-3" />
            <span>{config.text}</span>
        </div>
    );
};

interface BlogEditorProps {
    post?: BlogType;
    categories?: CategoryType[];
    selectedCategoriesIds?: CategoryType[];
    mode?: 'create' | 'edit';
}

export default function BlogEditor({ post, categories = [], mode = 'create', selectedCategoriesIds }: BlogEditorProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
    const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        contentMd: post?.contentMd || "",
        coverImageId: post?.coverImageId || "",
        status: post?.status || "draft",
        visibility: post?.visibility || "public",
        scheduledAt: post?.scheduledAt || "",
        categoryId: selectedCategoriesIds ? selectedCategoriesIds.map(c => c.id) : [],
        metaTitle: post?.metaTitle || "",
        metaDescription: post?.metaDescription || "",
        excerpt: post?.excerpt || "",
    });
    const router = useRouter();

    useEffect(() => {
        if (formData?.slug) {
            const handler = setTimeout(() => {
                const validSlug = makeValidSlug(formData.slug);
                setFormData(prev => ({ ...prev, slug: validSlug }));
            }, 1000);
            return () => clearTimeout(handler);
        }
    }, [formData?.slug]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, multiple, options } = e.target as HTMLSelectElement;
        if (name === "categoryId" && multiple) {
            const selected = Array.from(options)
                .filter(option => option.selected)
                .map(option => option.value);
            setFormData(prev => ({ ...prev, categoryId: selected }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleContentMdChange = (value: string) => {
        setFormData(prev => ({ ...prev, contentMd: value }));
        if (errors.contentMd) {
            setErrors(prev => ({ ...prev, contentMd: '' }));
        }
    };

    const generateAITitle = async () => {
        if (!formData.contentMd.trim()) {
            toast.error('Please add some content first to generate a title');
            return;
        }
        setIsGeneratingTitle(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const mockTitles = [
                "The Ultimate Guide to Modern Web Development",
                "10 Essential Tips for Better Code Quality",
                "Understanding the Future of Technology",
                "Building Scalable Applications with React",
                "The Art of Clean Architecture"
            ];
            const generatedTitle = mockTitles[Math.floor(Math.random() * mockTitles.length)];
            setFormData(prev => ({ ...prev, title: generatedTitle }));
            toast.success('Title generated successfully!');
        } catch (error) {
            toast.error('Failed to generate title. Please try again.');
        } finally {
            setIsGeneratingTitle(false);
        }
    };

    const generateAIMeta = async () => {
        if (!formData.contentMd.trim()) {
            toast.error('Please add some content first to generate meta data');
            return;
        }
        setIsGeneratingMeta(true);
        try {
            const response = await fetch('/api/generate-meta', {  // Sample API route for AI generation
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: formData.contentMd })
            });
            if (!response.ok) {
                throw new Error('Failed to generate metadata');
            }
            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                metaTitle: data.metaTitle || prev.metaTitle,
                metaDescription: data.metaDescription || prev.metaDescription,
                excerpt: data.excerpt || prev.excerpt,
            }));
            toast.success('Metadata generated successfully!');
        } catch (error) {
            toast.error('Could not generate metadata. Please try again.');
        } finally {
            setIsGeneratingMeta(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.contentMd.trim()) newErrors.contentMd = "Content is required";
        if (formData.status === "scheduled" && !formData.scheduledAt) newErrors.scheduledAt = "Scheduled date and time are required for scheduled posts";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        setIsSubmitting(true);
        try {
            const endpoint = mode === 'edit' ? `/api/blog/${post?.id}` : '/api/blog';
            const method = mode === 'edit' ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${mode} post`);
            }

            const data = await response.json();
            const action = mode === 'edit' ? 'updated' : 'created';

            toast.success(`Post ${action} successfully!`);
            router.push(`/blog/${data.post.slug}`);

            if (mode === 'create') {
                setFormData({
                    title: "",
                    slug: "",
                    contentMd: "",
                    coverImageId: "",
                    status: "draft",
                    visibility: "public",
                    scheduledAt: "",
                    categoryId: selectedCategoriesIds ? selectedCategoriesIds.map(c => c.id) : [],
                    metaTitle: "",
                    metaDescription: "",
                    excerpt: "",
                });
            }
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(errorMessage, {
                description: "Please try again later or contact support if the issue persists.",
                action: {
                    label: 'Retry',
                    onClick: () => handleSubmit(e)
                }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePreview = () => {
        toast.info('Preview feature coming soon!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 bg-sky-500 rounded-xl shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                    {mode === 'edit' ? "Edit Post" : "Create New Post"}
                                </h1>
                                <p className="text-slate-600 text-sm sm:text-base">
                                    {mode === 'edit' ? "Update your existing post" : "Share your thoughts with the world"}
                                </p>
                            </div>
                        </div>
                        {post?.status && (
                            <StatusBadge status={post.status} />
                        )}
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <FormField label="Post Title" icon={FileText} required error={errors.title}>
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter your post title..."
                                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        required
                                    />
                                    <AIButton
                                        onClick={generateAITitle}
                                        loading={isGeneratingTitle}
                                    >
                                        {isGeneratingTitle ? 'Generating...' : 'Generate with AI'}
                                    </AIButton>
                                </div>
                                <p className="text-sm text-slate-500 flex items-center space-x-1">
                                    <Wand2 className="w-4 h-4" />
                                    <span>Let AI create an engaging title based on your content</span>
                                </p>
                            </div>
                        </FormField>

                        {categories.length > 0 && (
                            <FormField label="Category" icon={Tag}>
                                <select
                                    id="categoryId"
                                    name="categoryId"
                                    multiple
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="">Select categories</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </FormField>
                        )}

                        <FormField label="Cover Image" icon={Image}>
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <ThumbnailSection
                                    thumbnailId={formData.coverImageId}
                                    setThumbnailId={(id) => setFormData(prev => ({ ...prev, coverImageId: id ?? "" }))}
                                />
                            </div>
                        </FormField>

                        <FormField label="Content" icon={Edit3} required error={errors.contentMd}>
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <EditorSection
                                    contentMd={formData.contentMd}
                                    handleContentChange={handleContentMdChange}
                                />
                            </div>
                        </FormField>

                        <FormField
                            label="Custom URL"
                            icon={Globe}
                            description="Customize your post URL for better SEO and branding"
                            error={errors.slug}
                        >
                            <div className="space-y-3">
                                <div className="relative">
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center px-3 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-sm text-slate-600">
                                            Promptlyblog.co.in/blog/
                                        </span>
                                        <input
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="custom-url-slug"
                                            className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                    <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="text-amber-700">Create custom URLs for better SEO and professional branding. Your post will be published at your custom URL.</p>
                                    </div>
                                </div>
                            </div>
                        </FormField>

                        {/* AI Generated Meta Fields */}
                        <FormField label="Meta Title" icon={FileText} description="SEO meta title for your post">
                            <div className="flex space-x-3">
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder="Enter meta title or generate with AI"
                                    className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <AIButton onClick={generateAIMeta} loading={isGeneratingMeta}>Generate</AIButton>
                            </div>
                        </FormField>

                        <FormField label="Meta Description" icon={FileText} description="SEO meta description for your post">
                            <textarea
                                name="metaDescription"
                                value={formData.metaDescription}
                                onChange={handleChange}
                                placeholder="Enter meta description or generate with AI"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </FormField>

                        <FormField label="Excerpt" icon={FileText} description="Short excerpt shown in post previews">
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                placeholder="Enter excerpt or generate with AI"
                                rows={3}
                                className="w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="Status" icon={CheckCircle}>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
                                </select>
                            </FormField>

                            <FormField label="Visibility" icon={formData.visibility === 'public' ? Globe : Lock}>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    value={formData.visibility}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </FormField>

                            {formData.status === "scheduled" && (
                                <FormField label="Schedule Date" icon={Calendar} required error={errors.scheduledAt}>
                                    <input
                                        type="datetime-local"
                                        id="scheduledAt"
                                        name="scheduledAt"
                                        value={formData.scheduledAt}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        required
                                    />
                                </FormField>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-200">
                            <div className="flex items-center space-x-4">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800"
                                    disabled={isSubmitting}
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto px-6 py-3 text-slate-600 hover:text-slate-800"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <LoadingSpinner className="w-4 h-4" />
                                            <span>{mode === 'edit' ? 'Updating...' : 'Publishing...'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{mode === 'edit' ? 'Update Post' : 'Create Post'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
