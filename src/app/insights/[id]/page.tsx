'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  Lightbulb,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from 'recharts';
import { useAuthStore } from '@/store/authStore';
import { useGoalStore } from '@/store/goalStore';
import { formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function InsightsPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;
  const [isGenerating, setIsGenerating] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { goals, progress, insights, stats, fetchGoals, fetchProgress, fetchInsights, fetchStats, generateInsights, isLoading } =
    useGoalStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchGoals();
    if (goalId) {
      fetchProgress(goalId);
      fetchInsights(goalId);
      fetchStats(goalId);
    }
  }, [isAuthenticated, goalId, router, fetchGoals, fetchProgress, fetchInsights, fetchStats]);

  const goal = goals.find((g) => g._id === goalId);
  const goalProgress = progress.filter((p) => p.goalId === goalId);
  const goalInsights = insights.filter((i) => i.goalId === goalId);

  if (isLoading || !goal) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const moodChartData = goalProgress
    .filter((p) => p.sentimentScore !== undefined)
    .map((p) => ({
      day: `Day ${p.day}`,
      sentiment: ((p.sentimentScore || 0) * 100).toFixed(0),
      hours: p.hoursSpent || 0,
    }));

  const completionChartData = Array.from({ length: Math.min(goal.duration, 30) }, (_, i) => {
    const day = i + 1;
    const dayProgress = goalProgress.find((p) => p.day === day);
    return {
      day: `${day}`,
      completed: dayProgress?.completed ? 1 : 0,
      hours: dayProgress?.hoursSpent || 0,
    };
  });

  const motivationData = goalInsights.length > 0 
    ? [{
        name: 'Motivation',
        value: goalInsights[0].motivationLevel,
        fill: '#8b5cf6',
      }]
    : [{
        name: 'Motivation',
        value: 0,
        fill: '#8b5cf6',
      }];

  const getMoodIcon = (score: number) => {
    if (score > 0.3) return <Smile className="h-6 w-6 text-green-500" />;
    if (score < -0.3) return <Frown className="h-6 w-6 text-red-500" />;
    return <Meh className="h-6 w-6 text-yellow-500" />;
  };

  const getSentimentIcon = getMoodIcon;

  const handleGenerateInsights = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      await generateInsights(goalId);
      await fetchInsights(goalId);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push(`/goal/${goalId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Goal</span>
            </button>
            <button
              onClick={handleGenerateInsights}
              disabled={isGenerating || goalProgress.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Generate Insights</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Insights & Analytics</h1>
          </div>
          <p className="text-gray-600">Track your progress and understand your journey</p>
        </motion.div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold text-gray-900">{stats.completedDays}</span>
              </div>
              <p className="text-sm text-gray-600">Days Completed</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <Target className="h-8 w-8 text-blue-500" />
                <span className="text-3xl font-bold text-gray-900">{stats.completionRate}%</span>
              </div>
              <p className="text-sm text-gray-600">Completion Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-8 w-8 text-orange-500" />
                <span className="text-3xl font-bold text-gray-900">{stats.currentStreak}</span>
              </div>
              <p className="text-sm text-gray-600">Current Streak</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                {getSentimentIcon(stats.averageSentiment)}
                <span className="text-3xl font-bold text-gray-900">
                  {stats.averageSentiment > 0 ? '+' : ''}
                  {(stats.averageSentiment * 100).toFixed(0)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Avg. Sentiment</p>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mood Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Mood Trend</h2>
            {moodChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={moodChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sentiment data yet. Add notes to your progress updates!
              </div>
            )}
          </motion.div>

          {/* Completion Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Completion</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={completionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Motivation Level */}
        {goalInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass p-6 rounded-2xl mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Motivation Level</h2>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="100%"
                  data={motivationData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-4xl font-bold fill-gray-900"
                  >
                    {motivationData[0].value}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* AI Insights */}
        {goalInsights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass p-6 rounded-2xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">AI-Generated Insights</h2>
            <div className="space-y-6">
              {goalInsights.map((insight) => (
                <div key={insight._id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Week {insight.weekNumber} Summary
                      </h3>
                      <p className="text-gray-600 mb-4">{insight.summary}</p>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(insight.generatedAt)}</span>
                  </div>

                  {/* Highlights */}
                  {insight.highlights.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Highlights</h4>
                      </div>
                      <ul className="space-y-2">
                        {insight.highlights.map((highlight, index) => (
                          <li key={index} className="text-sm text-green-800 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Blockers */}
                  {insight.blockers.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <h4 className="font-semibold text-red-900">Challenges</h4>
                      </div>
                      <ul className="space-y-2">
                        {insight.blockers.map((blocker, index) => (
                          <li key={index} className="text-sm text-red-800 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{blocker}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {insight.recommendations.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Recommendations</h4>
                      </div>
                      <ul className="space-y-2">
                        {insight.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start">
                            <span className="mr-2">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {goalInsights.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-12 rounded-2xl text-center"
          >
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Insights Yet</h3>
            <p className="text-gray-600">
              Insights are generated weekly based on your progress. Keep tracking your progress to
              unlock AI-powered insights!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
