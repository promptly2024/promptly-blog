"use client";

import { useState, useEffect } from 'react';
import { AnalyticsData, DateRange } from '../types/analytics';
import { getAnalyticsData } from '../actions/analyticsActions';

export function useAnalytics(initialDateRange: DateRange) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);

  const fetchAnalytics = async (range: DateRange) => {
    try {
      setLoading(true);
      setError(null);
      const analyticsData = await getAnalyticsData(range.from, range.to);
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange.from, dateRange.to]);

  const updateDateRange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  const refreshData = () => {
    fetchAnalytics(dateRange);
  };

  return {
    data,
    loading,
    error,
    dateRange,
    updateDateRange,
    refreshData,
  };
}
