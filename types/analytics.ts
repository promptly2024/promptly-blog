export interface AnalyticsData {
  totalBlogs: number;
  totalViews: number;
  totalLikes: number;
  engagementRate: number;
  monthlyData: MonthlyData[];
  topPosts: TopPost[];
}

export interface MonthlyData {
  month: string;
  views: number;
  likes: number;
  posts: number;
}

export interface TopPost {
  id: string;
  title: string;
  category: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  publishedAt: Date;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface KPIMetric {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}
