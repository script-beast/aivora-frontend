"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, CheckCircle2, Calendar, MessageSquare, Clock, Target, Brain } from "lucide-react";

interface Progress {
  _id: string;
  goalId: string;
  day: number;
  completed: boolean;
  comment?: string;
  hoursSpent?: number;
  timestamp?: string;
  createdAt?: string;
  sentimentScore?: number;
}

interface DayPlan {
  day: number;
  task: string;
  focus: string;
  difficulty: string;
  estimatedHours: number;
  isRestDay?: boolean;
}

interface CompletedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: Progress[];
  plan: DayPlan[];
}

export function CompletedTasksModal({
  isOpen,
  onClose,
  progress,
  plan,
}: CompletedTasksModalProps) {
  const completedProgress = progress.filter((p) => p.completed);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      case "hard":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getSentimentEmoji = (score?: number) => {
    if (!score && score !== 0) return null;
    if (score >= 0.5) return '😊';
    if (score >= 0) return '😐';
    return '😔';
  };

  const getSentimentLabel = (score?: number) => {
    if (!score && score !== 0) return 'N/A';
    if (score >= 0.5) return 'Positive';
    if (score >= 0) return 'Neutral';
    return 'Negative';
  };

  const getSentimentColor = (score?: number) => {
    if (!score && score !== 0) return 'text-muted-foreground';
    if (score >= 0.5) return 'text-green-500';
    if (score >= 0) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHoursComparisonColor = (actual?: number, estimated?: number) => {
    if (!actual || !estimated) return 'text-primary';
    if (actual <= estimated) return 'text-green-500';
    if (actual <= estimated * 1.2) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHoursComparisonBg = (actual?: number, estimated?: number) => {
    if (!actual || !estimated) return 'bg-primary/10';
    if (actual <= estimated) return 'bg-green-500/10';
    if (actual <= estimated * 1.2) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            >
              <Card className="glass-card shadow-2xl">
                <CardHeader className="border-b sticky top-0 bg-card/95 backdrop-blur-lg z-10 p-3 sm:p-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <span className="truncate">Day {completedProgress[0]?.day} Details</span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                  {completedProgress.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        No completed tasks yet
                      </h3>
                      <p className="text-muted-foreground">
                        Start tracking your progress to see completed tasks here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {completedProgress.map((prog) => {
                        const dayPlan = plan.find((p) => p.day === prog.day);
                        return (
                          <motion.div
                            key={prog._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            {/* Success Header */}
                            <div className="text-center">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white mb-4 shadow-lg"
                              >
                                <CheckCircle2 className="w-10 h-10" />
                              </motion.div>
                              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                                Day {prog.day} Completed! 🎉
                              </h2>
                              <p className="text-muted-foreground">
                                {formatDate(prog.timestamp || prog.createdAt)}
                              </p>
                            </div>

                            {/* Task Details Card */}
                            {dayPlan && (
                              <Card className="border-2 border-primary/20">
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between flex-wrap gap-2">
                                    <div className="flex items-center space-x-2">
                                      <Target className="w-5 h-5 text-primary" />
                                      <CardTitle className="text-lg sm:text-xl">Task Overview</CardTitle>
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                                        dayPlan.difficulty
                                      )}`}
                                    >
                                      {dayPlan.difficulty}
                                    </span>
                                  </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Task</h4>
                                    <p className="font-medium text-base sm:text-lg">{dayPlan.task}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Focus Area</h4>
                                    <p className="text-muted-foreground">{dayPlan.focus}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="bg-muted/50 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 text-muted-foreground mb-1">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">Estimated</span>
                                      </div>
                                      <p className="text-lg font-bold">{dayPlan.estimatedHours}h</p>
                                    </div>
                                    {prog.hoursSpent !== undefined && prog.hoursSpent !== null && (
                                      <div className={`rounded-lg p-3 ${getHoursComparisonBg(prog.hoursSpent, dayPlan.estimatedHours)}`}>
                                        <div className={`flex items-center space-x-2 mb-1 ${getHoursComparisonColor(prog.hoursSpent, dayPlan.estimatedHours)}`}>
                                          <Clock className="w-4 h-4" />
                                          <span className="text-xs font-medium">Actual</span>
                                        </div>
                                        <p className={`text-lg font-bold ${getHoursComparisonColor(prog.hoursSpent, dayPlan.estimatedHours)}`}>
                                          {prog.hoursSpent}h
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Sentiment Score */}
                            {prog.sentimentScore !== undefined && prog.sentimentScore !== null && (
                              <Card className="border-2 border-purple-500/20 bg-purple-500/5">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="text-4xl">{getSentimentEmoji(prog.sentimentScore)}</div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-muted-foreground">Sentiment Analysis</h4>
                                        <p className={`text-xl font-bold ${getSentimentColor(prog.sentimentScore)}`}>
                                          {getSentimentLabel(prog.sentimentScore)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-3xl font-bold ${getSentimentColor(prog.sentimentScore)}`}>
                                        {(prog.sentimentScore * 100).toFixed(0)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Score</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {/* Progress Notes */}
                            {prog.comment && (
                              <Card className="border-2 border-blue-500/20 bg-blue-500/5">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center space-x-2">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                    <CardTitle className="text-lg sm:text-xl">Your Reflections</CardTitle>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {prog.comment}
                                  </p>
                                </CardContent>
                              </Card>
                            )}

                            {/* Achievement Stats */}
                            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                                <Brain className="w-5 h-5" />
                                <p className="text-sm font-medium">
                                  Great work on completing this milestone! Keep up the momentum! 🚀
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
