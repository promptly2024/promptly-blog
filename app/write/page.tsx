"use client";
import React from 'react';
import { useState } from "react";
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

    const handleChange = (e: any) => {
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
            toast.success('Post created successfully!', {
                description: `${JSON.stringify(data)}`,
                action: { label: 'View Post', onClick: () => { window.location.href = `/blog/${data.slug}`; } }
            });
            setFormData({ title: "", slug: "", excerpt: "", contentMd: "", coverImageId: "", metaTitle: "", metaDescription: "", status: "draft", visibility: "public", scheduledAt: "" });
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast.error(errorMessage, {
                description: "Please try again later or contact support if the issue persists.",
                action: {
                    label: 'Retry',
                    onClick: () => {
                        handleSubmit(e);
                    }
                }
            });
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <p className="text-red-500">{error}</p>}
            <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full border p-2 rounded"
            />
            <textarea
                name="contentMd"
                value={formData.contentMd}
                onChange={handleChange}
                placeholder="Write markdown..."
                className="w-full border p-2 rounded h-64"
            />
            <select name="status" value={formData.status} onChange={handleChange}>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
            </select>
            {formData.status === "scheduled" && (
                <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={handleChange}
                />
            )}
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                {isSubmitting ? "Posting..." : post ? "Update Post" : "Create Post"}
            </button>
        </form>
    );
}
