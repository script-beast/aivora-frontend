"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { useGoalStore } from "@/store/goalStore";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  day: number;
  existingProgress?: {
    completed: boolean;
    comment?: string;
    hoursSpent?: number;
  };
}

export default function ProgressModal({
  isOpen,
  onClose,
  goalId,
  day,
  existingProgress,
}: ProgressModalProps) {
  const { updateProgress, isLoading } = useGoalStore();

  const [formData, setFormData] = useState({
    completed: existingProgress?.completed || false,
    comment: existingProgress?.comment || "",
    hoursSpent: existingProgress?.hoursSpent || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProgress({
        goalId,
        day,
        completed: formData.completed,
        comment: formData.comment,
        hoursSpent: formData.hoursSpent,
      });
      onClose();
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative glass rounded-2xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto modal-scroll"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Track Progress - Day {day}
            </h2>
            <p className="text-gray-600">
              Update your progress and share how it went
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Completion Toggle */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div
                  className={`relative w-14 h-7 rounded-full transition ${
                    formData.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.completed ? "translate-x-7" : "translate-x-0"
                    }`}
                  />
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    {formData.completed ? "Completed" : "Mark as Complete"}
                  </span>
                  {formData.completed && (
                    <CheckCircle className="inline h-5 w-5 text-green-500 ml-2" />
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={formData.completed}
                  onChange={(e) =>
                    setFormData({ ...formData, completed: e.target.checked })
                  }
                  className="sr-only"
                />
              </label>
            </div>

            {/* Hours Spent */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Clock className="inline h-5 w-5 mr-2 text-indigo-600" />
                Hours Spent
              </label>
              <input
                type="number"
                value={formData.hoursSpent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hoursSpent: parseFloat(e.target.value) || 0,
                  })
                }
                min={0}
                max={24}
                step={0.5}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white/50 backdrop-blur-sm"
                placeholder="0.0"
              />
              <div className="mt-3 flex gap-2">
                {[0.5, 1, 2, 3, 4].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, hoursSpent: hours })
                    }
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      formData.hoursSpent === hours
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare className="inline h-5 w-5 mr-2 text-indigo-600" />
                Notes & Reflections (Optional)
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                placeholder="How did it go? Any challenges or breakthroughs?"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-gray-900 bg-white/50 backdrop-blur-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                {formData.comment.length}/500 characters
              </p>
            </div>

            {/* Sentiment Preview (if comment exists) */}
            {formData.comment && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    AI Sentiment Analysis
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  Your note will be analyzed to track mood trends and provide
                  personalized insights
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Progress"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
