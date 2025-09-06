"use client";
import ThumbnailSection from '@/components/Write/Thumbnail';
import { useRouter } from 'next/navigation';
import React, { useState } from "react";
import { toast } from 'sonner';

export default function BlogEditor({ post }: { post?: any }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        excerpt: post?.excerpt || "",
        contentMd: post?.contentMd || "",
        coverImageId: post?.coverImageId || "",
        metaTitle: post?.metaTitle || "",
        metaDescription: post?.metaDescription || "",
        status: post?.status || "draft",
        visibility: post?.visibility || "public",
        scheduledAt: post?.scheduledAt || "",
    });
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            if (!formData.title || !formData.contentMd) {
                throw new Error("Title and content are required.");
            }
            if (formData.status === "scheduled" && !formData.scheduledAt) {
                throw new Error("Scheduled date and time are required for scheduled posts.");
            }
            const response = await fetch('/api/blog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error('Failed to create post');
            }
            const data = await response.json();
            toast.success('Post created successfully!');
            router.push(`/blog/${data.post.slug}`);
            setFormData({ title: "", slug: "", excerpt: "", contentMd: "", coverImageId: "", metaTitle: "", metaDescription: "", status: "draft", visibility: "public", scheduledAt: "" });
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(errorMessage, {
                description: "Please try again later or contact support if the issue persists.",
                action: {
                    label: 'Retry',
                    onClick: () => {
                        // No event to pass here, so just call handleSubmit with a dummy event if needed
                    }
                }
            });
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{post ? "Edit Post" : "New Post"}</h1>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                <div>
                    <label htmlFor="title" className="block font-medium mb-1">Title *</label>
                    <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Title"
                        className="w-full border p-2 rounded"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="slug" className="block font-medium mb-1">Slug</label>
                    <input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        placeholder="Slug (optional)"
                        className="w-full border p-2 rounded"
                    />
                </div>
                <div>
                    <label htmlFor="excerpt" className="block font-medium mb-1">Excerpt</label>
                    <textarea
                        id="excerpt"
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        placeholder="Short summary (optional)"
                        className="w-full border p-2 rounded h-20"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Thumbnail</label>
                    <ThumbnailSection
                        thumbnailId={formData.coverImageId}
                        setThumbnailId={(id) => setFormData({ ...formData, coverImageId: id })}
                    />
                </div>
                <div>
                    <label htmlFor="contentMd" className="block font-medium mb-1">Content *</label>
                    <textarea
                        id="contentMd"
                        name="contentMd"
                        value={formData.contentMd}
                        onChange={handleChange}
                        placeholder="Write markdown..."
                        className="w-full border p-2 rounded h-64"
                        required
                    />
                </div>
              
                <div>
                    <label htmlFor="status" className="block font-medium mb-1">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="draft">Draft</option>
                        <option value="submitted">Submitted</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                    </select>
                </div>
                {formData.status === "scheduled" && (
                    <div>
                        <label htmlFor="scheduledAt" className="block font-medium mb-1">Scheduled At *</label>
                        <input
                            type="datetime-local"
                            id="scheduledAt"
                            name="scheduledAt"
                            value={formData.scheduledAt}
                            onChange={handleChange}
                            className="w-full border p-2 rounded"
                            required
                        />
                    </div>
                )}
                <div>
                    <label htmlFor="visibility" className="block font-medium mb-1">Visibility</label>
                    <select
                        id="visibility"
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Posting..." : post ? "Update Post" : "Create Post"}
                </button>
            </form>
        </div>
    );
}
