'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard = ({ title, value, loading }) => (
  <Card className="bg-white p-6">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    {loading ? (
      <div className="mt-2 h-9 w-24 animate-pulse rounded bg-gray-200"></div>
    ) : (
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    )}
  </Card>
);

const ActivityItem = ({ type, title, timestamp, loveCount, loading }) => {
  const getIcon = () => {
    switch (type) {
      case 'story_created':
        return '📖';
      case 'story_loved':
        return '❤️';
      default:
        return '📝';
    }
  };

  const getMessage = () => {
    switch (type) {
      case 'story_created':
        return `New story created: ${title}`;
      case 'story_loved':
        return `Story "${title}" received ${loveCount} ${loveCount === 1 ? 'love' : 'loves'}`;
      default:
        return title;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-4 border-b border-gray-100 py-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 border-b border-gray-100 py-3">
      <span className="text-2xl">{getIcon()}</span>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{getMessage()}</p>
        <p className="text-sm text-gray-500">
          {new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

const ChartSkeleton = () => (
  <div className="h-[300px] w-full animate-pulse rounded-lg bg-gray-200"></div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalStats: {
      totalWordsTranslated: 0,
      totalStoriesWritten: 0,
      totalChatInteractions: 0,
      totalLoves: 0,
    },
    timeSeriesData: [],
    storyLengthStats: {
      shortStories: 0,
      mediumStories: 0,
      longStories: 0,
      avgWordCount: 0
    },
    recentActivities: [],
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analyticsRes = await fetch('/api/analytics');
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  // Transform story length stats for bar chart
  const storyLengthData = [
    { category: 'Short Stories (<500)', count: analytics.storyLengthStats.shortStories },
    { category: 'Medium Stories (500-2000)', count: analytics.storyLengthStats.mediumStories },
    { category: 'Long Stories (2000+)', count: analytics.storyLengthStats.longStories },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        
        {/* Key Metrics */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Words Translated" 
            value={analytics.totalStats.totalWordsTranslated} 
            loading={loading}
          />
          <StatCard 
            title="Stories Written" 
            value={analytics.totalStats.totalStoriesWritten} 
            loading={loading}
          />
          <StatCard 
            title="Chat Interactions" 
            value={analytics.totalStats.totalChatInteractions} 
            loading={loading}
          />
          <StatCard 
            title="Story Loves" 
            value={analytics.totalStats.totalLoves} 
            loading={loading}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Activity Over Time</h3>
              <div className="h-[300px]">
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="stories" stroke="#0088FE" name="Stories" />
                      <Line type="monotone" dataKey="chats" stroke="#00C49F" name="Chats" />
                      <Line type="monotone" dataKey="canvases" stroke="#FFBB28" name="Canvases" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>

            <Card className="bg-white p-6">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Story Length Distribution</h3>
              <p className="text-sm text-gray-500 mb-4">
                {loading ? (
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                ) : (
                  `Average word count: ${analytics.storyLengthStats.avgWordCount} words`
                )}
              </p>
              <div className="h-[300px]">
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storyLengthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0088FE" name="Number of Stories" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Recent Activities</h3>
            <div className="space-y-1">
              {loading ? (
                // Loading skeleton for activities
                Array.from({ length: 5 }).map((_, index) => (
                  <ActivityItem key={index} loading={true} />
                ))
              ) : (
                analytics.recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    timestamp={activity.timestamp}
                    loveCount={activity.loveCount}
                    loading={false}
                  />
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
