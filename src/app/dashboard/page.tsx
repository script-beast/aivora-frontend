"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
  Loader2,
  Code,
  Github,
  Info,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader } from "@/components/Loader";
import { goalAPI, api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

// Staggered animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface Goal {
  _id: string;
  title: string;
  description?: string;
  duration: number;
  hoursPerDay: number;
  status: "active" | "completed" | "paused";
  createdAt: string;
  plan?: Array<{
    day: number;
    tasks: Array<{ description: string; completed?: boolean }>;
  }>;
}

interface Progress {
  _id: string;
  goalId: string;
  day: number;
  completed: boolean;
  comment?: string;
  timestamp?: string;
  createdAt?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [progressData, setProgressData] = useState<Record<string, Progress[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchGoals();
  }, [isAuthenticated, router]);

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await goalAPI.getAll();
      const fetchedGoals = response.goals || [];
      setGoals(fetchedGoals);

      // Fetch progress for each goal
      const progressPromises = fetchedGoals.map((goal: Goal) =>
        api.getProgressByGoal(goal._id).catch(() => ({ progress: [] }))
      );
      const progressResults = await Promise.all(progressPromises);

      // Create progress map
      const progressMap: Record<string, Progress[]> = {};
      fetchedGoals.forEach((goal: Goal, index: number) => {
        progressMap[goal._id] = progressResults[index]?.progress || [];
      });
      setProgressData(progressMap);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load goals");
      console.error("Error fetching goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (goal: Goal) => {
    const progress = progressData[goal._id] || [];
    if (!goal.duration || goal.duration === 0) return 0;

    const completedDays = progress.filter((p) => p.completed).length;
    return Math.round((completedDays / goal.duration) * 100);
  };

  const calculateDaysActive = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateAverageProgress = () => {
    if (goals.length === 0) return 0;
    const total = goals.reduce((sum, goal) => sum + calculateProgress(goal), 0);
    return Math.round(total / goals.length);
  };

  const calculateStreak = () => {
    if (goals.length === 0) return 0;

    // Collect all completed progress with dates
    const allCompletedDates: Date[] = [];
    goals.forEach((goal) => {
      const progress = progressData[goal._id] || [];
      progress
        .filter((p) => p.completed && (p.timestamp || p.createdAt))
        .forEach((p) => {
          const dateStr = p.timestamp || p.createdAt;
          if (dateStr) {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            allCompletedDates.push(date);
          }
        });
    });

    if (allCompletedDates.length === 0) return 0;

    // Sort by date descending and remove duplicates
    const uniqueDates = Array.from(
      new Set(allCompletedDates.map((d) => d.getTime()))
    )
      .sort((a, b) => b - a)
      .map((time) => new Date(time));

    // Check if streak starts from today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecentDate = uniqueDates[0];
    const daysSinceRecent = Math.floor(
      (today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Streak is broken if more than 1 day has passed
    if (daysSinceRecent > 1) return 0;

    // Count consecutive days
    let streak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const prevDate = uniqueDates[i - 1];
      const dayDiff = Math.floor(
        (prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader message="Loading your dashboard..." size="lg" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Aivora
              </h1>
            </motion.div>
            <div className="flex items-center space-x-2">
              <Link href="/create-goal">
                <Button
                  variant="gradient"
                  size="sm"
                  className="group hidden sm:flex"
                >
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  New Goal
                </Button>
                <Button variant="gradient" size="icon" className="sm:hidden">
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="hidden sm:flex"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="sm:hidden"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg">
            {goals.length > 0
              ? "Here's your progress overview. Keep up the great work!"
              : "Start your journey by creating your first goal!"}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive"
          >
            {error}
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div variants={item}>
            <Card animated className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Active Goals
                  </span>
                  <Target className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {goals.filter((g) => g.status === "active").length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {goals.length} total goals
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card animated className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Avg Progress
                  </span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculateAverageProgress()}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Across all goals
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card animated className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Longest Streak
                  </span>
                  <Calendar className="w-5 h-5 text-primary" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {calculateStreak()} days
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {calculateStreak() > 7 ? "🔥 Keep it up!" : "Keep going!"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Goals Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Your Goals</h2>
            {goals.length > 3 && <Button variant="ghost">View All</Button>}
          </div>

          {goals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first goal to start your journey
              </p>
              <Link href="/create-goal">
                <Button variant="gradient" size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Goal
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {goals.map((goal) => (
                <motion.div key={goal._id} variants={item}>
                  <Link href={`/goal/${goal._id}`}>
                    <Card animated tilt className="cursor-pointer group h-full">
                      <CardHeader>
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {goal.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-sm font-semibold">
                                {calculateProgress(goal)}%
                              </span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${calculateProgress(goal)}%`,
                                }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 dark:from-cyan-500 dark:to-blue-500 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {calculateDaysActive(goal.createdAt)} days active
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                goal.status === "active"
                                  ? "bg-green-500/10 text-green-500"
                                  : goal.status === "completed"
                                  ? "bg-blue-500/10 text-blue-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              }`}
                            >
                              {goal.status}
                            </span>
                          </div>

                          {/* Additional Info */}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{goal.duration} days plan</span>
                            <span>{goal.hoursPerDay}h/day</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}

              {/* Add New Goal Card */}
              <motion.div variants={item}>
                <Link href="/create-goal">
                  <Card
                    animated
                    className="cursor-pointer border-dashed border-2 hover:border-primary transition-colors h-full flex items-center justify-center min-h-[200px]"
                  >
                    <CardContent className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Plus className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Create New Goal</h3>
                      <p className="text-sm text-muted-foreground">
                        Start your journey to success
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* AI Insights Section */}
        {goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>Quick Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {goals.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="p-4 bg-primary/5 rounded-lg border border-primary/10"
                    >
                      <p className="text-sm">
                        💡{" "}
                        <strong>
                          You have {goals.length} active goal
                          {goals.length > 1 ? "s" : ""}!
                        </strong>{" "}
                        {calculateAverageProgress() > 50
                          ? "Great progress! Keep maintaining this momentum."
                          : "Stay consistent and track your progress daily for better results."}
                      </p>
                    </motion.div>
                  )}

                  {goals.some((g) => calculateProgress(g) > 70) && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="p-4 bg-primary/5 rounded-lg border border-primary/10"
                    >
                      <p className="text-sm">
                        🎯 You&apos;re making excellent progress on{" "}
                        <strong>
                          {goals.find((g) => calculateProgress(g) > 70)?.title}
                        </strong>
                        . Keep up the great work!
                      </p>
                    </motion.div>
                  )}

                  {goals.length === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="p-4 bg-primary/5 rounded-lg border border-primary/10"
                    >
                      <p className="text-sm">
                        📈 Consider adding more goals to diversify your learning
                        journey and stay motivated!
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Developer and Project Information - Bottom Section */}
      <footer className="border-t bg-card/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Developer Information */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">Developer</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                <span className="font-semibold text-foreground">
                  Ankit Prajapati
                </span>
                <br />
                Full-stack developer passionate about building AI-powered
                applications
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://github.com/script-beast"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/aprajapati028/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
                <a
                  href="https://www.aprajapati.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                >
                  <Info className="w-4 h-4" />
                  <span>Profile</span>
                </a>
              </div>
            </div>

            {/* Project Information */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold">About Aivora</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                An intelligent goal-tracking platform powered by AI to help you
                achieve your learning objectives with personalized roadmaps,
                progress tracking, and AI-generated insights.
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full font-medium">
                      Next.js 14
                    </span>
                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium">
                      Node.js
                    </span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full font-medium">
                      OpenAI GPT
                    </span>
                    <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-xs rounded-full font-medium">
                      TypeScript
                    </span>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium">
                      MongoDB
                    </span>
                    <span className="px-2 py-1 bg-pink-500/10 text-pink-500 text-xs rounded-full font-medium">
                      Tailwind CSS
                    </span>
                  </div>
                </div>
                <div>
                  <a
                    href="https://github.com/script-beast/aivora-backend"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
                  >
                    <Github className="w-4 h-4" />
                    <span>View on GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="text-center mt-8 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Aivora. Built with ❤️ by Ankit
              Prajapati
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
