'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Target,
  Plus,
  TrendingUp,
  Calendar,
  Zap,
  LogOut,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGoalStore } from '@/store/goalStore';
import { formatDate, getStatusBadgeColor } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { goals, fetchGoals, isLoading } = useGoalStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchGoals();
  }, [isAuthenticated, router, fetchGoals]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const filteredGoals = goals.filter((goal) =>
    goal.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <div className="flex items-center">
              <Image 
                src="/logo-text.svg" 
                alt="Aivora" 
                width={140} 
                height={42}
                priority
              />
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 transition group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-600">Track your progress and achieve your goals with AI guidance</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Target className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{activeGoals.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Goals</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{completedGoals.length}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Completed</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass p-6 rounded-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (completedGoals.length / (goals.length || 1)) * 100
                )}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
          </motion.div>
        </div>

        {/* Search & Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your goals..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <button
            onClick={() => router.push('/create-goal')}
            className="group px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition transform hover:scale-105 flex items-center justify-center space-x-2 font-semibold"
          >
            <Plus className="h-5 w-5" />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Goals List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Goals</h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredGoals.length === 0 ? (
            <div className="glass p-12 rounded-xl text-center">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? 'No goals match your search'
                  : 'Create your first goal to get started with AI-powered planning'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push('/create-goal')}
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105"
                >
                  Create Your First Goal
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredGoals.map((goal, index) => (
                <motion.div
                  key={goal._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/goal/${goal._id}`)}
                  className="glass p-6 rounded-xl hover:shadow-xl transition cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition">
                          {goal.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                            goal.status
                          )}`}
                        >
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{goal.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {goal.duration} days
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {goal.plan?.length || 0} days planned
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Created {formatDate(goal.createdAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
