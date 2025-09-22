"use client";

import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import DateRangeSelector from '@/components/Analytics/DateRangeSelector';
import AnalyticsKPICards from '@/components/Analytics/AnalyticsKPICards';
import EngagementChart from '@/components/Analytics/EngagementChart';
import TopPostsTable from '@/components/Analytics/TopPostsTable';

const AnalyticsClient: React.FC = () => {
  const defaultDateRange = {
    from: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months ago
    to: new Date(),
  };

  const { data, loading, error, dateRange, updateDateRange, refreshData } = useAnalytics(defaultDateRange);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Analytics</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                Analytics
              </h1>
              <p className="text-slate-600">
                Track your blog performance with detailed insights and metrics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangeSelector 
                dateRange={dateRange}
                onDateRangeChange={updateDateRange}
              />
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <AnalyticsKPICards
          totalBlogs={data?.totalBlogs || 0}
          totalViews={data?.totalViews || 0}
          totalLikes={data?.totalLikes || 0}
          engagementRate={data?.engagementRate || 0}
          loading={loading}
        />

        {/* Engagement Chart */}
        <EngagementChart
          data={data?.monthlyData || []}
          loading={loading}
        />

        {/* Top Posts Table */}
        <TopPostsTable
          posts={data?.topPosts || []}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default AnalyticsClient;
