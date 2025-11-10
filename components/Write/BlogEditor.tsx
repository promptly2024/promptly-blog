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
import { checkAndMakeValidSlug } from '@/utils/helper-blog';
import { CategoryMultiSelect } from './CategoryMultiSelect';

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
    <div className="space-y-2 sm:space-y-3">
        <label className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-slate-700">
                {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 flex-shrink-0" />}
                <span>{label} {required && <span className="text-red-500">*</span>}</span>
            </div>
            {premium && (
                <div className="flex items-center space-x-1 px-2 py-0.5 sm:py-1 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-full">
                    <Crown className="w-3 h-3 text-amber-600" />
                    <span className="text-xs font-medium text-amber-700">Premium</span>
                </div>
            )}
        </label>
        {description && (
            <p className="text-xs sm:text-sm text-slate-500">{description}</p>
        )}
        {children}
        {error && <p className="text-red-500 text-xs sm:text-sm flex items-center space-x-1">
            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            <span>{error}</span>
        </p>}
    </div>
);

const AIButton = ({ onClick, loading, children }: { onClick: () => void; loading: boolean; children: React.ReactNode }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xs sm:text-sm font-medium whitespace-nowrap"
    >
        {loading ? (
            <LoadingSpinner className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        )}
        <span className="hidden sm:inline">{children}</span>
        <span className="sm:hidden">AI Generate</span>
    </button>
);

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
        <div className={`inline-flex items-center space-x-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
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
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        contentMd: post?.contentMd || "",
        coverImageId: post?.coverImageId || "",
        status: post?.status || "draft",
        scheduledAt: post?.scheduledAt || "",
        categoryId: selectedCategoriesIds ? selectedCategoriesIds.map(c => c.id) : [],
    });
    const router = useRouter();

    useEffect(() => {
        if (formData?.slug) {
            const handler = setTimeout(() => {
                const validSlug = checkAndMakeValidSlug(formData.slug);
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
        if (!formData.contentMd.trim() && !formData.title.trim()) {
            toast.error('Please add some content or enter a title first');
            return;
        }
        
        setIsGeneratingTitle(true);
        
        try {
            const response = await fetch('/api/ai/generate-title', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    content: formData.contentMd,
                    currentTitle: formData.title 
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate title');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, title: data.title }));
            if (formData.title.trim() && formData.contentMd.trim()) {
                toast.success('Title improved based on your content!');
            } else if (formData.title.trim()) {
                toast.success('Title enhanced successfully!');
            } else {
                toast.success('Title generated from content!');
            }
            
        } catch (error) {
            console.error('Error generating title:', error);
            toast.error('Failed to generate title. Please try again.');
        } finally {
            setIsGeneratingTitle(false);
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
                    scheduledAt: "",
                    categoryId: selectedCategoriesIds ? selectedCategoriesIds.map(c => c.id) : [],
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
            <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-sky-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-sky-500 rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                                    {mode === 'edit' ? "Edit Post" : "Create New Post"}
                                </h1>
                                <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-0.5">
                                    {mode === 'edit' ? "Update your existing post" : "Share your thoughts with the world"}
                                </p>
                            </div>
                        </div>
                        {post?.status && (
                            <StatusBadge status={post.status} />
                        )}
                    </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-3 sm:p-4 md:p-6 lg:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 md:space-y-8">
                        {/* Post Title with AI Button */}
                        <FormField label="Post Title" icon={FileText} required error={errors.title}>
                            <div className="space-y-2 sm:space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter your post title..."
                                        className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        required
                                    />
                                    <AIButton
                                        onClick={generateAITitle}
                                        loading={isGeneratingTitle}
                                    >
                                        {isGeneratingTitle ? 'Generating...' : 'Generate with AI'}
                                    </AIButton>
                                </div>
                                <p className="text-xs sm:text-sm text-slate-500 flex items-start sm:items-center space-x-1">
                                    <Wand2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5 sm:mt-0" />
                                    <span>
                                        {formData.title.trim() && formData.contentMd.trim() 
                                            ? "Improve your title based on content" 
                                            : formData.title.trim() 
                                                ? "Enhance your existing title" 
                                                : "Generate title from your content"
                                        }
                                    </span>
                                </p>
                            </div>
                        </FormField>

                        {categories.length > 0 && (
                            <FormField label="Categories" icon={Tag}>
                                <CategoryMultiSelect
                                    categories={categories}
                                    selectedCategories={formData.categoryId}
                                    onChange={(selected) => setFormData(prev => ({ ...prev, categoryId: selected }))}
                                    placeholder="Select categories for your post..."
                                    className="w-full"
                                />
                            </FormField>
                        )}

                        <FormField label="Cover Image" icon={Image}>
                            <div className="p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                                <ThumbnailSection
                                    thumbnailId={formData.coverImageId}
                                    setThumbnailId={(id) => setFormData(prev => ({ ...prev, coverImageId: id ?? "" }))}
                                />
                            </div>
                        </FormField>

                        <FormField label="Content" icon={Edit3} required error={errors.contentMd}>
                            <div className="border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden">
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
                            <div className="space-y-2 sm:space-y-3">
                                <div className="relative">
                                    <div className="flex flex-col sm:flex-row items-stretch">
                                        <span className="inline-flex items-center px-2 sm:px-3 py-2 sm:py-3 bg-slate-100 border border-slate-200 sm:border-r-0 rounded-t-lg sm:rounded-l-xl sm:rounded-tr-none text-xs sm:text-sm text-slate-600 break-all sm:break-normal">
                                            Promptlyblog.co.in/blog/
                                        </span>
                                        <input
                                            id="slug"
                                            name="slug"
                                            value={formData.slug}
                                            onChange={handleChange}
                                            placeholder="custom-url-slug"
                                            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 border-t-0 sm:border-t rounded-b-lg sm:rounded-r-xl sm:rounded-bl-none focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-xs sm:text-sm">
                                        <p className="text-amber-700">Create custom URLs for better SEO and professional branding. Your post will be published at your custom URL.</p>
                                    </div>
                                </div>
                            </div>
                        </FormField>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <FormField label="Status" icon={CheckCircle}>
                                <select
                                    id="status"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="scheduled">Scheduled</option>
                                    <option value="published">Published</option>
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
                                        className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400"
                                        required
                                    />
                                </FormField>
                            )}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between space-y-reverse space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-slate-200">
                            <div className="flex items-center justify-center sm:justify-start space-x-4">
                                <button
                                    type="button"
                                    onClick={handlePreview}
                                    className="flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm text-slate-600 hover:text-slate-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>Preview</span>
                                </button>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center space-y-reverse space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-slate-600 hover:text-slate-800 transition-colors rounded-lg sm:rounded-xl border border-slate-200 sm:border-0"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="w-full sm:w-auto flex items-center justify-center space-x-1.5 sm:space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
