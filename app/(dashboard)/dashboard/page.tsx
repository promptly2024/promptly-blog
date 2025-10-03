'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Edit, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Heart,
  Image as ImageIcon, 
  XCircle,
  Archive,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  iconBgColor, 
  iconColor,
  trend 
}) => (
  <div className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <h3 className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</h3>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} className={`mr-1 ${!trend.isPositive && 'rotate-180'}`} />
            <span>{Math.abs(trend.value)}% vs last month</span>
          </div>
        )}
      </div>
      <div className={`${iconBgColor} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  </div>
);

interface DashboardStats {
  totalPosts: number;
  draftPosts: number;
  underReview: number;
  approvedPosts: number;
  scheduledPosts: number;
  rejectedPosts: number;
  archivedPosts: number;
  totalComments: number;
  totalReactions: number;
  mediaUploads: number;
}

const DashboardHomePage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/dashboard/stats');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      setStats(result.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-96"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 h-36"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={24} />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-1">Unable to load dashboard</h3>
              <p className="text-sm text-red-700 mb-4">{error}</p>
              <button 
                onClick={fetchDashboardStats}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const hasUnderReview = stats.underReview > 0;
  const hasRejected = stats.rejectedPosts > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">
            My Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Welcome back! Here's an overview of your content performance.
          </p>
        </div>

        {/* Alerts Section */}
        {(hasUnderReview || hasRejected) && (
          <div className="space-y-4">
            {hasUnderReview && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-5 flex items-start gap-4">
                <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={22} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                    Posts Awaiting Review
                  </h3>
                  <p className="text-sm text-yellow-800">
                    You have <strong>{stats.underReview}</strong> post{stats.underReview > 1 ? 's' : ''} currently under admin review.
                  </p>
                </div>
              </div>
            )}
            
            {hasRejected && (
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-5 flex items-start gap-4">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={22} />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-900 mb-1">
                    Action Required
                  </h3>
                  <p className="text-sm text-red-800">
                    <strong>{stats.rejectedPosts}</strong> post{stats.rejectedPosts > 1 ? 's' : ''} need{stats.rejectedPosts === 1 ? 's' : ''} revision. Review admin feedback and resubmit.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FileText size={24} />}
            label="Total Posts"
            value={stats.totalPosts}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            trend={{ value: 12, isPositive: true }}
          />
          
          <StatCard
            icon={<Edit size={24} />}
            label="Draft Posts"
            value={stats.draftPosts}
            iconBgColor="bg-gray-100"
            iconColor="text-gray-600"
          />
          
          <StatCard
            icon={<Clock size={24} />}
            label="Under Review"
            value={stats.underReview}
            iconBgColor="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          
          <StatCard
            icon={<CheckCircle size={24} />}
            label="Approved"
            value={stats.approvedPosts}
            iconBgColor="bg-green-100"
            iconColor="text-green-600"
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<Calendar size={24} />}
            label="Scheduled"
            value={stats.scheduledPosts}
            iconBgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
          
          <StatCard
            icon={<XCircle size={24} />}
            label="Rejected"
            value={stats.rejectedPosts}
            iconBgColor="bg-red-100"
            iconColor="text-red-600"
          />

          <StatCard
            icon={<Archive size={24} />}
            label="Archived"
            value={stats.archivedPosts}
            iconBgColor="bg-gray-100"
            iconColor="text-gray-500"
          />
        </div>

        {/* Engagement Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Engagement Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              icon={<MessageSquare size={24} />}
              label="Total Comments"
              value={stats.totalComments}
              iconBgColor="bg-pink-100"
              iconColor="text-pink-600"
              trend={{ value: 15, isPositive: true }}
            />
            
            <StatCard
              icon={<Heart size={24} />}
              label="Total Reactions"
              value={stats.totalReactions}
              iconBgColor="bg-rose-100"
              iconColor="text-rose-600"
              trend={{ value: 23, isPositive: true }}
            />

            <StatCard
              icon={<ImageIcon size={24} />}
              label="Media Files"
              value={stats.mediaUploads}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to create?</h2>
              <p className="text-blue-100">
                Start writing your next amazing post and share your ideas with the world.
              </p>
            </div>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg whitespace-nowrap"
              onClick={() => {
                router.push('/write');
              }}
            >
              Create New Post
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHomePage;
