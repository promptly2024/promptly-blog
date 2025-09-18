import { fetchAllPostsByUserId } from '@/actions/fetchAllPostByUser'
import { showError } from '@/app/(non-dashboard)/edit/[id]/page';
import { BlogType } from '@/types/blog';
import { getUserIdFromClerk } from '@/utils/blog-helper'
import React from 'react'

const ManageBlogs = async () => {
    let Blogs: BlogType[] = [];
    try {
        const userId = await getUserIdFromClerk();
        const data = await fetchAllPostsByUserId(userId, false);
        // Blogs = data;
    } catch (err) {
        showError('Error fetching blogs. Please try again later.');
        console.error('Error fetching user ID:', err);
    }
    return (
        <div>
            <h1>Manage Blogs</h1>
            <p>Welcome to the Manage Blogs section of your dashboard!</p>
            {JSON.stringify(Blogs)}
        </div>
    )
}

export default ManageBlogs
