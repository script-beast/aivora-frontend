'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, Brain, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Planning',
      description: 'Generate structured daily roadmaps for any goal with GPT-4',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Beautiful charts and insights tracking your journey',
    },
    {
      icon: Zap,
      title: 'Sentiment Analysis',
      description: 'Real-time mood tracking and personalized recommendations',
    },
    {
      icon: Sparkles,
      title: 'Adaptive Plans',
      description: 'AI adjusts your roadmap based on actual progress',
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo-text.svg" 
                alt="Aivora Logo" 
                width={140} 
                height={42}
                priority
              />
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <button className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition">
                  Login
                </button>
              </Link>
              <Link href="/register">
                <button className="px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition transform hover:scale-105">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
              <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Achieve Your Goals
              </span>
              <br />
              <span className="text-gray-900">With AI Guidance</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform any goal into a structured roadmap. Track progress, get insights, and stay
              motivated with your AI-powered mentor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <button className="group px-8 py-4 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-2xl transition transform hover:scale-105 flex items-center space-x-2 text-lg font-semibold">
                  <span>Start Your Journey</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image/Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-purple-500 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="aspect-video bg-linear-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="h-24 w-24 text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">AI Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Powered by AI</h2>
          <p className="text-xl text-gray-600">Everything you need to achieve your goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-6 rounded-2xl hover:shadow-xl transition group"
            >
              <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Target className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">Aivora</span>
            </div>
            <p className="text-gray-600">&copy; 2025 Aivora. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
