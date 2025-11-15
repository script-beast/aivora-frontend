"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Sparkles, Clock, CheckCircle, Brain } from "lucide-react";
import { progressAPI } from "@/lib/api";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  goalId: string;
  day: number;
  onSuccess?: () => void;
}

export function ProgressModal({
  isOpen,
  onClose,
  goalId,
  day,
  onSuccess,
}: ProgressModalProps) {
  const [completed, setCompleted] = useState(true);
  const [hoursSpent, setHoursSpent] = useState<string>("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Quick hour buttons
  const quickHours = [0.5, 1, 2, 3, 4];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await progressAPI.create({
        goalId,
        day,
        completed,
        comment: comment || undefined,
        hoursSpent: hoursSpent ? parseFloat(hoursSpent) : undefined,
      });

      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        setCompleted(true);
        setHoursSpent("");
        setComment("");
        setShowSuccess(false);
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Failed to add progress:", error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state without showing success animation
    setCompleted(true);
    setHoursSpent("");
    setComment("");
    setShowSuccess(false);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-lg"
            >
              <Card className="glass-card shadow-2xl max-h-[95vh] sm:max-h-none overflow-y-auto">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      <span>Day {day} Progress</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClose}
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <AnimatePresence mode="wait">
                    {!showSuccess ? (
                      <motion.form
                        key="form"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                      >
                        {/* Completion Toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-indigo-50 via-purple-50/50 to-indigo-50 dark:from-primary/10 dark:via-primary/5 dark:to-primary/10 border border-indigo-200 dark:border-primary/30 shadow-sm">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-primary" />
                            <div>
                              <Label className="text-base font-semibold text-foreground">Mark as Completed</Label>
                              <p className="text-sm text-muted-foreground">Did you complete this day's tasks?</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCompleted(!completed)}
                            className={`relative inline-flex h-9 w-16 sm:h-8 sm:w-14 items-center rounded-full transition-all shadow-inner ${
                              completed 
                                ? "bg-primary shadow-primary/20" 
                                : "bg-gray-300 dark:bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                                completed ? "translate-x-7" : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>

                        {/* Hours Spent */}
                        <div className="space-y-3">
                          <Label htmlFor="hoursSpent" className="text-base flex items-center space-x-2 text-foreground">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>Hours Spent (Optional)</span>
                          </Label>
                          <div className="space-y-2">
                            <input
                              id="hoursSpent"
                              type="number"
                              step="0.5"
                              min="0"
                              max="24"
                              placeholder="0.0"
                              value={hoursSpent}
                              onChange={(e) => setHoursSpent(e.target.value)}
                              disabled={isSubmitting}
                              className="flex w-full rounded-xl border border-gray-300 dark:border-input bg-white dark:bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm"
                            />
                            <div className="flex gap-2 flex-wrap">
                              {quickHours.map((hours) => (
                                <Button
                                  key={hours}
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setHoursSpent(hours.toString())}
                                  disabled={isSubmitting}
                                  className="text-xs sm:text-sm hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                                >
                                  {hours}h
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Notes & Reflections */}
                        <div className="space-y-3">
                          <Label htmlFor="comment" className="text-base text-foreground">
                            Notes & Reflections
                          </Label>
                          <div className="relative">
                            <textarea
                              id="comment"
                              rows={5}
                              maxLength={500}
                              placeholder="Share your progress, learnings, challenges, or any thoughts about today's work..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              required
                              disabled={isSubmitting}
                              className="flex w-full rounded-xl border border-gray-300 dark:border-input bg-white dark:bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none shadow-sm"
                            />
                            <div className="absolute bottom-3 right-4 text-xs text-gray-600 dark:text-muted-foreground bg-white/90 dark:bg-background/80 px-1.5 py-0.5 rounded">
                              {comment.length}/500
                            </div>
                          </div>
                        </div>

                        {/* AI Sentiment Preview */}
                        {comment.trim() && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 rounded-xl bg-gradient-to-r from-purple-100 via-blue-50 to-purple-50 dark:from-purple-500/10 dark:to-blue-500/10 border border-purple-300 dark:border-purple-500/20 shadow-sm"
                          >
                            <div className="flex items-start space-x-3">
                              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-500 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold mb-1 text-purple-900 dark:text-purple-100">AI Sentiment Analysis</h4>
                                <p className="text-xs text-purple-700/80 dark:text-muted-foreground">
                                  Your reflection will be analyzed to track mood, motivation, and identify patterns in your journey.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="w-full sm:w-auto"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="gradient"
                            disabled={isSubmitting || !comment.trim()}
                            className="w-full sm:w-auto"
                          >
                            {isSubmitting ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 1,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Progress
                              </>
                            )}
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="py-12 text-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 mb-4"
                        >
                          <motion.div
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                          >
                            <svg
                              className="w-10 h-10 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <motion.path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                              />
                            </svg>
                          </motion.div>
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-2">
                          Progress Saved! 🎉
                        </h3>
                        <p className="text-muted-foreground">
                          Keep up the great work!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
