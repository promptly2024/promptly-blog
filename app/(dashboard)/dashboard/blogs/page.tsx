import { fetchAllPostsByUserId, UsersBlogType } from '@/actions/fetchAllPostByUser'
import { showError } from '@/app/(non-dashboard)/edit/[id]/page';
import { getUserIdFromClerk } from '@/utils/blog-helper'
import React from 'react'
import ShowUserblogs from '../component/blogs/ShowUserblogs';

const ManageBlogs = async () => {
    let Blogs: UsersBlogType[] = [];
    let errorMessages: string | null = null;
    try {
        const userId = await getUserIdFromClerk();
        const data = await fetchAllPostsByUserId(userId, false);
        Blogs = data;
    } catch (err) {
        errorMessages = err instanceof Error ? err.message : String(err);
    }
    if (errorMessages) {
        return showError(errorMessages);
    }
    return (
        <ShowUserblogs blogs={Blogs} />
    )
}

export default ManageBlogs
