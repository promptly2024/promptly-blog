"use client";

import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Heart, MessageCircle, TrendingUp } from 'lucide-react';
import { TopPost } from '@/types/analytics';

interface TopPostsTableProps {
  posts: TopPost[];
  loading?: boolean;
}

const TopPostsTable: React.FC<TopPostsTableProps> = ({ posts, loading = false }) => {
  const [sortBy, setSortBy] = useState<'views' | 'likes' | 'comments' | 'engagement'>('likes');

  const sortedPosts = React.useMemo(() => {
    return [...posts].sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.views - a.views;
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'engagement':
          return b.engagementRate - a.engagementRate;
        default:
          return 0;
      }
    });
  }, [posts, sortBy]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="animate-pulse">
            <div className="flex justify-between items-center">
              <div className="w-48 h-6 bg-slate-200 rounded"></div>
              <div className="w-32 h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse flex justify-between items-center py-3">
                <div className="flex-1">
                  <div className="w-3/4 h-5 bg-slate-200 rounded mb-2"></div>
                  <div className="w-1/4 h-4 bg-slate-200 rounded"></div>
                </div>
                <div className="flex gap-6">
                  <div className="w-12 h-4 bg-slate-200 rounded"></div>
                  <div className="w-12 h-4 bg-slate-200 rounded"></div>
                  <div className="w-12 h-4 bg-slate-200 rounded"></div>
                  <div className="w-12 h-4 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-1">
              Top Performing Posts
            </h2>
            <p className="text-slate-600 text-sm">
              Your most viewed and liked blog posts
            </p>
          </div>
          <Select value={sortBy} onValueChange={(value: typeof sortBy) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="views">Most Recent</SelectItem>
              <SelectItem value="likes">Most Liked</SelectItem>
              <SelectItem value="comments">Most Commented</SelectItem>
              <SelectItem value="engagement">Highest Engagement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">TITLE</th>
              <th className="text-left py-3 px-6 text-sm font-medium text-slate-600">CATEGORY</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">VIEWS</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">LIKES</th>
              <th className="text-center py-3 px-6 text-sm font-medium text-slate-600">ENGAGE</th>
            </tr>
          </thead>
          <tbody>
            {sortedPosts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-slate-500">
                  No posts found for the selected date range
                </td>
              </tr>
            ) : (
              sortedPosts.map((post, index) => (
                <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900 hover:text-sky-600 cursor-pointer line-clamp-2">
                      {post.title}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {post.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-900 font-medium">{post.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-slate-900 font-medium">{post.likes}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-slate-900 font-medium">{post.engagementRate}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopPostsTable;
