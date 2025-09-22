"use client";

import React, { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonthlyData } from '@/types/analytics';

interface EngagementChartProps {
  data: MonthlyData[];
  loading?: boolean;
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data, loading = false }) => {
  const [viewType, setViewType] = React.useState<'views' | 'likes'>('views');

  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      displayMonth: new Date(item.month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: '2-digit' 
      })
    }));
  }, [data]);

  const maxValue = useMemo(() => {
    const values = viewType === 'views' 
      ? chartData.map(d => d.views)
      : chartData.map(d => d.likes);
    return Math.max(...values, 1);
  }, [chartData, viewType]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="w-48 h-6 bg-slate-200 rounded"></div>
            <div className="w-32 h-10 bg-slate-200 rounded"></div>
          </div>
          <div className="h-80 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            Monthly Engagement Metrics
          </h2>
          <p className="text-slate-600 text-sm">
            Detailed breakdown of views, likes, and engagement rates
          </p>
        </div>
        <Select value={viewType} onValueChange={(value: 'views' | 'likes') => setViewType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">Views & Likes</SelectItem>
            <SelectItem value="likes">Likes Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative h-80">
        {/* Chart Container */}
        <div className="absolute inset-0 flex items-end justify-between px-4 pb-8">
          {chartData.map((item, index) => {
            const viewsHeight = (item.views / maxValue) * 100;
            const likesHeight = (item.likes / maxValue) * 100;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-3 py-2 rounded text-sm mb-2 whitespace-nowrap">
                  <div className="text-blue-400">Views: {item.views}</div>
                  <div className="text-green-400">Likes: {item.likes}</div>
                </div>
                
                {/* Bars */}
                <div className="flex items-end gap-1 w-full max-w-12">
                  {viewType === 'views' && (
                    <>
                      <div 
                        className="bg-blue-500 hover:bg-blue-600 transition-colors flex-1 min-h-[4px] rounded-t"
                        style={{ height: `${viewsHeight}%` }}
                      />
                      <div 
                        className="bg-green-500 hover:bg-green-600 transition-colors flex-1 min-h-[4px] rounded-t"
                        style={{ height: `${likesHeight}%` }}
                      />
                    </>
                  )}
                  {viewType === 'likes' && (
                    <div 
                      className="bg-green-500 hover:bg-green-600 transition-colors w-full min-h-[4px] rounded-t"
                      style={{ height: `${likesHeight}%` }}
                    />
                  )}
                </div>
                
                {/* Labels */}
                <div className="mt-2 text-xs text-slate-600 text-center">
                  {item.displayMonth}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 pr-2">
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue * 0.75)}</span>
          <span>{Math.floor(maxValue * 0.5)}</span>
          <span>{Math.floor(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 25, 50, 75, 100].map((percent) => (
            <div
              key={percent}
              className="absolute left-8 right-4 border-t border-slate-100"
              style={{ bottom: `${percent}%` }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-slate-600">Views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-slate-600">Likes</span>
        </div>
      </div>
    </div>
  );
};

export default EngagementChart;
