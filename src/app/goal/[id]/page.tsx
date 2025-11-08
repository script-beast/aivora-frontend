'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle,
  Circle,
  MessageSquare,
  Zap,
  BarChart3,
  Download,
  RefreshCw,
  Target,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGoalStore } from '@/store/goalStore';
import { formatDate, getDifficultyColor } from '@/lib/utils';
import { exportGoalReport } from '@/lib/pdfExport';
import ProgressModal from '@/components/ProgressModal';

export default function GoalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const goalId = params.id as string;

  const { isAuthenticated } = useAuthStore();
  const { goals, progress, insights, stats, fetchGoals, fetchProgress, fetchInsights, fetchStats, regeneratePlan, isLoading } =
    useGoalStore();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [trackingDay, setTrackingDay] = useState<number | null>(null);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

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

  const handleExportPDF = async () => {
    if (!goalId) return;
    
    setIsExporting(true);
    try {
      await exportGoalReport(goalId);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleTrackToday = () => {
    if (!goal) return;
    
    // Find the next incomplete day or the last day
    const nextDay = goal.plan.find((day) => {
      const dayProgress = goalProgress.find((p) => p.day === day.day);
      return !dayProgress || !dayProgress.completed;
    });

    if (nextDay) {
      setTrackingDay(nextDay.day);
      setIsProgressModalOpen(true);
    }
  };

  const handleTrackSpecificDay = (day: number) => {
    setTrackingDay(day);
    setIsProgressModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsProgressModalOpen(false);
    setTrackingDay(null);
    // Refresh progress data after closing modal
    if (goalId) {
      fetchProgress(goalId);
      fetchStats(goalId);
    }
  };

  const handleRegeneratePlan = async () => {
    if (!goalId) return;
    
    setIsRegenerating(true);
    try {
      await regeneratePlan(goalId, regenerateFeedback || undefined);
      setIsRegenerateModalOpen(false);
      setRegenerateFeedback('');
      // Refresh goal data
      await fetchGoals();
      alert('Plan regenerated successfully! Your roadmap has been updated based on your progress.');
    } catch (error) {
      console.error('Error regenerating plan:', error);
      alert('Failed to regenerate plan. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading || !goal) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading goal details...</p>
        </div>
      </div>
    );
  }

  const completedDays = goalProgress.filter((p) => p.completed).length;
  const completionRate = Math.round((completedDays / goal.duration) * 100);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => router.push(`/insights/${goalId}`)}
                className="p-2 rounded-lg hover:bg-gray-100 transition" 
                title="View Insights"
              >
                <BarChart3 className="h-5 w-5 text-gray-600" />
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isExporting}
                className="p-2 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Export PDF"
              >
                {isExporting ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="h-5 w-5 text-gray-600" />
                )}
              </button>
              <button 
                onClick={() => setIsRegenerateModalOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition" 
                title="Regenerate Plan"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Goal Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-8 w-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">{goal.title}</h1>
              </div>
              {goal.description && (
                <p className="text-gray-600 text-lg mb-4">{goal.description}</p>
              )}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="h-5 w-5" />
                  <span>{goal.duration} days</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="h-5 w-5" />
                  <span>{goal.hoursPerDay}h per day</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>Started {formatDate(goal.startDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-600">{completionRate}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-linear-to-r from-indigo-600 to-purple-600"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{completedDays} of {goal.duration} days completed</span>
              <span>{goal.duration - completedDays} days remaining</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Day Plan List */}
          <div className="lg:col-span-2">
            <div className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Roadmap</h2>
              <div className="space-y-4">
                {goal.plan.map((day, index) => {
                  const dayProgress = goalProgress.find((p) => p.day === day.day);
                  const isCompleted = dayProgress?.completed || false;

                  return (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setSelectedDay(day.day);
                        handleTrackSpecificDay(day.day);
                      }}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition ${
                        selectedDay === day.day
                          ? 'border-indigo-500 bg-indigo-50'
                          : isCompleted
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : (
                            <Circle className="h-6 w-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Day {day.day}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                                day.difficulty
                              )}`}
                            >
                              {day.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-900 font-medium mb-2">{day.task}</p>
                          <p className="text-gray-600 mb-3">{day.focus}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{day.estimatedHours}h</span>
                            </div>
                            {dayProgress?.comment && (
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>Has note</span>
                              </div>
                            )}
                            {day.isRestDay && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                Rest Day
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats & Insights */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-gray-700">Completed</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{completedDays}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="text-gray-700">Progress</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{completionRate}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                    <span className="text-gray-700">Streak</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {/* Calculate current streak */}
                    {(() => {
                      let streak = 0;
                      const sorted = [...goalProgress].sort((a, b) => b.day - a.day);
                      for (const p of sorted) {
                        if (p.completed) streak++;
                        else break;
                      }
                      return streak;
                    })()}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Insights */}
            {goalInsights.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Latest Insights</h3>
                <div className="space-y-4">
                  {goalInsights.slice(0, 3).map((insight) => (
                    <div key={insight._id} className="border-l-4 border-indigo-500 pl-4">
                      <p className="text-sm text-gray-700 mb-2">{insight.summary}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Week {insight.weekNumber}</span>
                        <span>•</span>
                        <span>{formatDate(insight.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={handleTrackToday}
                  className="w-full px-4 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition font-medium"
                >
                  Track Today&apos;s Progress
                </button>
                <button 
                  onClick={() => router.push(`/insights/${goalId}`)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  View All Insights
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Generating PDF...' : 'Export PDF Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {trackingDay && (
        <ProgressModal
          isOpen={isProgressModalOpen}
          onClose={handleCloseModal}
          goalId={goalId}
          day={trackingDay}
          existingProgress={goalProgress.find((p) => p.day === trackingDay)}
        />
      )}

      {/* Regenerate Plan Modal */}
      <AnimatePresence>
        {isRegenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRegenerateModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative glass rounded-2xl shadow-2xl p-8 max-w-lg w-full"
          >
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Regenerate Plan</h2>
              </div>
              <p className="text-gray-600">
                AI will analyze your progress and create an updated roadmap for the remaining days.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <textarea
                value={regenerateFeedback}
                onChange={(e) => setRegenerateFeedback(e.target.value)}
                placeholder="Any specific adjustments or feedback for the AI? (e.g., 'Make it more challenging', 'Add more practice time', etc.)"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-900"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="shrink-0">
                  <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                    This will update your remaining roadmap
                  </h3>
                  <p className="text-sm text-yellow-800">
                    Completed days will remain unchanged. Only future days will be regenerated based on your progress.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsRegenerateModalOpen(false);
                  setRegenerateFeedback('');
                }}
                disabled={isRegenerating}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRegeneratePlan}
                disabled={isRegenerating}
                className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRegenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate Plan'
                )}
              </button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </div>
  );
}
