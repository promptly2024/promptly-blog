"use client";

import React from 'react';
import { FileText, Eye, Heart, TrendingUp, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { KPIMetric } from '@/types/analytics';

interface AnalyticsKPICardsProps {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  engagementRate: number;
  loading?: boolean;
}

const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  totalBlogs,
  totalViews,
  totalLikes,
  engagementRate,
  loading = false,
}) => {
  const metrics: KPIMetric[] = [
    {
      label: 'Total Blogs',
      value: totalBlogs,
      change: 0, // month-over-month change here
      trend: 'neutral',
      icon: FileText,
    },
    {
      label: 'Total Views',
      value: totalViews.toLocaleString(),
      change: 0, // Placeholder
      trend: 'neutral',
      icon: Eye,
    },
    {
      label: 'Total Likes',
      value: totalLikes,
      change: 0, // Placeholder
      trend: 'neutral',
      icon: Heart,
    },
    {
      label: 'Engagement Rate',
      value: `${engagementRate}%`,
      change: 0, // Placeholder
      trend: 'neutral',
      icon: TrendingUp,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
                <div className="w-4 h-4 bg-slate-200 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-slate-200 rounded mb-2"></div>
              <div className="w-24 h-4 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-slate-100 rounded-lg">
                <IconComponent className="w-5 h-5 text-slate-600" />
              </div>
              {metric.trend === 'up' && (
                <div className="flex items-center text-green-600 text-sm">
                  <ArrowUpIcon className="w-4 h-4 mr-1" />
                  {Math.abs(metric.change)}%
                </div>
              )}
              {metric.trend === 'down' && (
                <div className="flex items-center text-red-600 text-sm">
                  <ArrowDownIcon className="w-4 h-4 mr-1" />
                  {Math.abs(metric.change)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">{metric.value}</div>
            <div className="text-sm text-slate-600">{metric.label}</div>
            <div className="text-xs text-slate-500 mt-1">
              {index === 0 && '+0 this month'}
              {index > 0 && 'Likes to views ratio'}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsKPICards;
