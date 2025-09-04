"use client";
import React from 'react'

interface FormData {
    title: string;
    contentMd: string;
    excerpt: string;
    slug: string;
}
const Write = () => {
    const [formData, setFormData] = React.useState<FormData>({
        title: '',
        contentMd: '',
        excerpt: '',
        slug: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/write', {
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
            console.log('Post created successfully:', data);
        } catch (error: any) {
            console.error('Error creating post:', error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Title
                    </label>
                    <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="contentMd" className="block text-sm font-medium text-gray-700">
                        Content
                    </label>
                    <textarea
                        name="contentMd"
                        id="contentMd"
                        value={formData.contentMd}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows={4}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700">
                        Excerpt
                    </label>
                    <textarea
                        name="excerpt"
                        id="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows={2}
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                        Slug
                    </label>
                    <input
                        type="text"
                        name="slug"
                        id="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="mt-4 w-full bg-blue-600 text-white p-2 rounded-md"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating...' : 'Create Post'}
                </button>
            </form>
        </div>
    )
}

export default Write
