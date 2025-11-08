'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useGoalStore } from '@/store/goalStore';

export default function CreateGoalPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { createGoal, isLoading } = useGoalStore();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    hoursPerDay: 2,
  });
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    duration?: string;
    hoursPerDay?: string;
  }>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: typeof errors = {};

    if (currentStep === 1) {
      if (!formData.title || formData.title.length < 3) {
        newErrors.title = 'Title must be at least 3 characters';
      }
      if (formData.description && formData.description.length > 500) {
        newErrors.description = 'Description must be less than 500 characters';
      }
    }

    if (currentStep === 2) {
      if (formData.duration < 1 || formData.duration > 365) {
        newErrors.duration = 'Duration must be between 1 and 365 days';
      }
      if (formData.hoursPerDay < 0.5 || formData.hoursPerDay > 24) {
        newErrors.hoursPerDay = 'Hours per day must be between 0.5 and 24';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      const newGoal = await createGoal({
        title: formData.title,
        description: formData.description,
        duration: formData.duration,
        hoursPerDay: formData.hoursPerDay,
      });

      if (newGoal) {
        router.push(`/goal/${newGoal._id}`);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Target className="h-10 w-10 text-indigo-600" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Create New Goal
            </h1>
          </div>
          <p className="text-gray-600">Let AI help you build a personalized roadmap</p>
        </motion.div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center space-x-4">
            <StepIndicator number={1} active={step >= 1} completed={step > 1} />
            <div className={`h-1 w-16 ${step > 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <StepIndicator number={2} active={step >= 2} completed={step > 2} />
            <div className={`h-1 w-16 ${step > 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
            <StepIndicator number={3} active={step >= 3} completed={step > 3} />
          </div>
          <div className="flex justify-between mt-4 px-4">
            <span className="text-sm font-medium text-gray-600">Goal Details</span>
            <span className="text-sm font-medium text-gray-600">Configuration</span>
            <span className="text-sm font-medium text-gray-600">Review</span>
          </div>
        </div>

        {/* Form Card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="glass rounded-2xl shadow-xl p-8 mb-6"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Goal Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Learn React.js, Get Fit, Master Python"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                      errors.title
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide context or specific objectives for better AI planning"
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none text-gray-900 ${
                      errors.description
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 2: Configuration */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="inline h-5 w-5 mr-2 text-indigo-600" />
                    Duration (Days) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                    }
                    min={1}
                    max={365}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                      errors.duration
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {[7, 14, 30, 60, 90].map((days) => (
                      <button
                        key={days}
                        onClick={() => setFormData({ ...formData, duration: days })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.duration === days
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline h-5 w-5 mr-2 text-indigo-600" />
                    Hours Per Day *
                  </label>
                  <input
                    type="number"
                    value={formData.hoursPerDay}
                    onChange={(e) =>
                      setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) || 0 })
                    }
                    min={0.5}
                    max={24}
                    step={0.5}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-gray-900 ${
                      errors.hoursPerDay
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.hoursPerDay && (
                    <p className="mt-1 text-sm text-red-600">{errors.hoursPerDay}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    {[1, 2, 3, 4, 6].map((hours) => (
                      <button
                        key={hours}
                        onClick={() => setFormData({ ...formData, hoursPerDay: hours })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          formData.hoursPerDay === hours
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {hours}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Total commitment:</strong> Approximately{' '}
                    {Math.round(formData.duration * formData.hoursPerDay)} hours over{' '}
                    {formData.duration} days
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <Sparkles className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start!</h2>
                  <p className="text-gray-600">Review your goal and let AI generate your roadmap</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1">GOAL TITLE</p>
                    <p className="text-lg font-semibold text-gray-900">{formData.title}</p>
                  </div>

                  {formData.description && (
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">DESCRIPTION</p>
                      <p className="text-gray-700">{formData.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">DURATION</p>
                      <p className="text-2xl font-bold text-indigo-600">{formData.duration}</p>
                      <p className="text-sm text-gray-600">days</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-1">HOURS/DAY</p>
                      <p className="text-2xl font-bold text-purple-600">{formData.hoursPerDay}</p>
                      <p className="text-sm text-gray-600">hours</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => (step === 1 ? router.push('/dashboard') : prevStep())}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>{step === 1 ? 'Cancel' : 'Previous'}</span>
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition font-semibold"
            >
              <span>Next Step</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Generating Plan...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Generate AI Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  active,
  completed,
}: {
  number: number;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition ${
        completed
          ? 'bg-indigo-600 text-white'
          : active
          ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600'
          : 'bg-gray-200 text-gray-500'
      }`}
    >
      {completed ? <CheckCircle className="h-6 w-6" /> : number}
    </div>
  );
}
