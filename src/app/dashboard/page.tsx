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
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader } from "@/components/Loader";
import { goalAPI } from "@/lib/api";
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

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [goals, setGoals] = useState<Goal[]>([]);
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
      setGoals(response.goals || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load goals");
      console.error("Error fetching goals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.plan || goal.plan.length === 0) return 0;

    const totalTasks = goal.plan.reduce(
      (sum, day) => sum + (day.tasks?.length || 0),
      0
    );
    const completedTasks = goal.plan.reduce(
      (sum, day) =>
        sum + (day.tasks?.filter((task) => task.completed).length || 0),
      0
    );

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
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
    // This would ideally come from progress tracking data
    // For now, return a placeholder
    return goals.length > 0
      ? Math.max(...goals.map((g) => calculateDaysActive(g.createdAt)))
      : 0;
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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Target className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">Dashboard</span>
            </motion.div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/create-goal">
                <Button variant="gradient" className="group">
                  <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                  New Goal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome back{user?.name ? `, ${user.name}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
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
    </div>
  );
}
