"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Download,
  Plus,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  Circle,
  MessageSquare,
  Zap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProgressModal } from "@/components/ProgressModal";
import { ConfettiEffect } from "@/components/ConfettiEffect";
import { Loader } from "@/components/Loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface DayPlan {
  day: number;
  task: string;
  focus: string;
  difficulty: string;
  estimatedHours: number;
  isRestDay?: boolean;
}

interface Goal {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  hoursPerDay: number;
  status: string;
  createdAt: string;
  plan: DayPlan[];
}

interface Progress {
  _id: string;
  goalId: string;
  day: number;
  completed: boolean;
  comment?: string;
  date: string;
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateFeedback, setRegenerateFeedback] = useState("");
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGoalData();
  }, [isAuthenticated, params.id, router]);

  const fetchGoalData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [goalRes, progressRes] = await Promise.all([
        api.getGoal(params.id),
        api.getProgressByGoal(params.id),
      ]);

      setGoal(goalRes.goal || goalRes);
      setProgress(progressRes.progress || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load goal");
      console.error("Error fetching goal:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegeneratePlan = async () => {
    try {
      setIsRegenerating(true);
      await api.regenerateGoalPlan(params.id, regenerateFeedback || undefined);
      await fetchGoalData();
      setShowRegenerateModal(false);
      setRegenerateFeedback("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to regenerate plan");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleTrackProgress = (day: number) => {
    // Check if previous day is completed (except for day 1)
    if (day > 1) {
      const previousDay = day - 1;
      const previousDayProgress = progress.find((p) => p.day === previousDay);
      if (!previousDayProgress || !previousDayProgress.completed) {
        alert(`Please complete Day ${previousDay} before tracking Day ${day}`);
        return;
      }
    }
    
    setSelectedDay(day);
    setIsProgressModalOpen(true);
  };

  const handleProgressModalClose = () => {
    setIsProgressModalOpen(false);
    setSelectedDay(null);
    setShowConfetti(true);
    fetchGoalData(); // Refresh data
  };

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      await api.downloadGoalReport(params.id);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const calculateProgress = () => {
    if (!goal) return 0;
    const completedDays = progress.filter((p) => p.completed).length;
    return Math.round((completedDays / goal.duration) * 100);
  };

  const calculateStreak = () => {
    const sorted = [...progress]
      .filter((p) => p.completed)
      .sort((a, b) => b.day - a.day);
    
    let streak = 0;
    for (const p of sorted) {
      if (p.completed) streak++;
      else break;
    }
    return streak;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-500 dark:bg-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 dark:bg-yellow-500/20";
      case "hard":
        return "bg-red-500/10 text-red-500 dark:bg-red-500/20";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader message="Loading goal details..." size="lg" />
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Error Loading Goal</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Goal not found"}
          </p>
          <Button onClick={() => router.push("/dashboard")} variant="gradient">
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  const completedDays = progress.filter((p) => p.completed).length;
  const progressPercentage = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Confetti Effect */}
      <ConfettiEffect
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
      />

      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <Button variant="ghost" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRegenerateModal(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                    />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </>
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Goal Details & Days */}
          <div className="lg:col-span-2 space-y-6">
            {/* Goal Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-3xl mb-2">{goal.title}</CardTitle>
                      {goal.description && (
                        <p className="text-muted-foreground text-lg">
                          {goal.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 mt-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{goal.duration} days plan</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{goal.hoursPerDay}h per day</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>Started {formatDate(goal.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-muted-foreground">
                        Overall Progress
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className="h-4 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-cyan-500 dark:to-blue-500 rounded-full relative"
                      >
                        <motion.div
                          className="absolute inset-0"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{
                            background:
                              "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {completedDays} of {goal.duration} days completed
                      </span>
                      <span>{goal.duration - completedDays} remaining</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Daily Roadmap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Daily Roadmap</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {completedDays}/{goal.duration} days
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <AnimatePresence>
                      {goal.plan.map((day, index) => {
                        const dayProgress = progress.find((p) => p.day === day.day);
                        const isCompleted = dayProgress?.completed || false;
                        
                        // Check if previous day is completed
                        const canAccess = day.day === 1 || progress.find((p) => p.day === day.day - 1)?.completed;

                        return (
                          <motion.div
                            key={day.day}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => canAccess && handleTrackProgress(day.day)}
                            className={`group ${canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                          >
                            <Card
                              animated
                              className={`border-2 transition-all ${
                                isCompleted
                                  ? "border-green-500/30 bg-green-500/5"
                                  : canAccess
                                  ? "border-border hover:border-primary/50"
                                  : "border-border/50 bg-muted/30"
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                  <div
                                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                                      isCompleted
                                        ? "bg-green-500 text-white"
                                        : "bg-secondary text-muted-foreground"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                      <Circle className="w-5 h-5" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="font-semibold text-lg">
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
                                    <p className="font-medium mb-1">{day.task}</p>
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {day.focus}
                                    </p>
                                    <div className="flex items-center flex-wrap gap-3 text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Clock className="w-4 h-4" />
                                        <span>{day.estimatedHours}h</span>
                                      </div>
                                      {dayProgress?.comment && (
                                        <div className="flex items-center space-x-1">
                                          <MessageSquare className="w-4 h-4" />
                                          <span>Has note</span>
                                        </div>
                                      )}
                                      {day.isRestDay && (
                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                                          Rest Day
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Stats & Actions */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <span className="text-muted-foreground">Completed</span>
                    </div>
                    <span className="text-2xl font-bold">{completedDays}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      </div>
                      <span className="text-muted-foreground">Progress</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {progressPercentage}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Zap className="w-5 h-5 text-purple-500" />
                      </div>
                      <span className="text-muted-foreground">Streak</span>
                    </div>
                    <span className="text-2xl font-bold">
                      {calculateStreak()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="gradient"
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      const nextDay = goal.plan.find(
                        (d) => !progress.find((p) => p.day === d.day && p.completed)
                      );
                      if (nextDay) handleTrackProgress(nextDay.day);
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Track Today&apos;s Progress
                  </Button>
                  <Link href={`/insights/${params.id}`} className="block">
                    <Button variant="outline" className="w-full">
                      <Sparkles className="w-4 h-4 mr-2" />
                      View AI Insights
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                        />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF Report
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>Aivora Says</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 1 }}
                    className="text-muted-foreground leading-relaxed"
                  >
                    {progressPercentage < 30 && (
                      <>
                        🚀 You&apos;re just getting started! Focus on building a
                        consistent daily habit. Even 30 minutes of focused work makes a
                        difference.
                      </>
                    )}
                    {progressPercentage >= 30 && progressPercentage < 70 && (
                      <>
                        💪 Great momentum! You&apos;re {progressPercentage}% through
                        your goal. Keep up the consistency and don&apos;t hesitate to
                        adjust the plan if needed.
                      </>
                    )}
                    {progressPercentage >= 70 && progressPercentage < 100 && (
                      <>
                        🎉 Outstanding progress! You&apos;re in the final stretch at{" "}
                        {progressPercentage}%. Maintain your streak and finish strong!
                      </>
                    )}
                    {progressPercentage === 100 && (
                      <>
                        🏆 Congratulations! You&apos;ve completed your {goal.duration}-day journey! 
                        Take a moment to celebrate, then consider setting your next goal.
                      </>
                    )}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Completion Card */}
            {progressPercentage === 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="glass-card border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
                  <CardContent className="p-6 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                        delay: 0.7,
                      }}
                      className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">
                      Goal Completed! 🎉
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Congratulations on completing your {goal.duration}-day journey!
                    </p>
                    <div className="flex flex-col gap-2">
                      <Link href="/create-goal">
                        <Button variant="gradient" size="lg" className="w-full">
                          Create New Goal
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
                            />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            View Completion Report
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      {selectedDay && (
        <ProgressModal
          isOpen={isProgressModalOpen}
          onClose={handleProgressModalClose}
          goalId={params.id}
          day={selectedDay}
          onSuccess={() => {
            setShowConfetti(true);
          }}
        />
      )}

      {/* Regenerate Plan Modal */}
      <AnimatePresence>
        {showRegenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegenerateModal(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative glass-card rounded-2xl shadow-2xl p-8 max-w-lg w-full"
            >
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <RefreshCw className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">
                    Regenerate Plan
                  </h2>
                </div>
                <p className="text-muted-foreground">
                  AI will analyze your progress and create an updated roadmap
                  for the remaining days.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2">
                  Feedback (Optional)
                </label>
                <textarea
                  value={regenerateFeedback}
                  onChange={(e) => setRegenerateFeedback(e.target.value)}
                  placeholder="Any specific adjustments or feedback for the AI? (e.g., 'Make it more challenging', 'Add more practice time', etc.)"
                  rows={4}
                  className="w-full px-4 py-3 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold mb-1">
                      This will update your remaining roadmap
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Completed days will remain unchanged. Only future days
                      will be regenerated based on your progress.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setRegenerateFeedback("");
                  }}
                  disabled={isRegenerating}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleRegeneratePlan}
                  disabled={isRegenerating}
                  variant="gradient"
                  className="flex-1"
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    "Regenerate Plan"
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
