"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  TrendingUp,
  Smile,
  Frown,
  Meh,
  Zap,
  Target,
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Activity,
  BarChart3,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Loader } from "@/components/Loader";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface Insight {
  _id: string;
  goalId: string;
  weekNumber: number;
  summary: string;
  highlights: string[];
  blockers: string[];
  recommendations: string[];
  motivationLevel: number;
  moodTrend: Array<{ day: number; score: number }>;
  generatedAt: string;
}

interface Goal {
  _id: string;
  title: string;
  description?: string;
  duration: number;
}

interface Progress {
  day: number;
  completed: boolean;
  comment?: string;
  date: string;
}

export default function InsightsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, params.id, router]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (insights.length <= 1) return;
      
      if (e.key === 'ArrowLeft') {
        handlePreviousInsight();
      } else if (e.key === 'ArrowRight') {
        handleNextInsight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insights.length, currentInsightIndex]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError("");

      const [goalRes, insightsRes, progressRes] = await Promise.all([
        api.getGoal(params.id),
        api.getInsightsByGoal(params.id),
        api.getProgressByGoal(params.id),
      ]);

      setGoal(goalRes.goal || goalRes);
      setInsights(insightsRes.insights || []);
      setProgress(progressRes.progress || []);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load insights");
      console.error("Error fetching insights:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      setIsGenerating(true);
      await api.generateInsights(params.id);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to generate insights");
    } finally {
      setIsGenerating(false);
    }
  };

  const completedDays = progress.filter((p) => p.completed).length;
  const completionRate = goal
    ? Math.round((completedDays / goal.duration) * 100)
    : 0;

  // Prepare chart data
  const progressChartData = progress
    .sort((a, b) => a.day - b.day)
    .map((p) => ({
      day: `Day ${p.day}`,
      completed: p.completed ? 1 : 0,
      dayNumber: p.day,
    }));

  // Create day-wise motivation data from all insights combined
  const allMoodData: Array<{
    day: string;
    mood: string;
    score: number;
    dayNumber: number;
  }> = [];
  insights.forEach((insight) => {
    if (insight.moodTrend) {
      insight.moodTrend.forEach((m) => {
        allMoodData.push({
          day: `Day ${m.day}`,
          mood: (m.score * 100).toFixed(0),
          score: m.score,
          dayNumber: m.day,
        });
      });
    }
  });

  // Sort by day number and remove duplicates (keep latest)
  const dayWiseMoodData = allMoodData
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.dayNumber === item.dayNumber)
    );

  const getMoodIcon = (score: number) => {
    if (score > 0.3) return <Smile className="w-6 h-6 text-green-500" />;
    if (score < -0.3) return <Frown className="w-6 h-6 text-red-500" />;
    return <Meh className="w-6 h-6 text-yellow-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePreviousInsight = () => {
    setCurrentInsightIndex((prev) => (prev > 0 ? prev - 1 : insights.length - 1));
  };

  const handleNextInsight = () => {
    setCurrentInsightIndex((prev) => (prev < insights.length - 1 ? prev + 1 : 0));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader message="Loading insights..." size="lg" />
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
          <h2 className="text-2xl font-bold mb-2">Error Loading Insights</h2>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href={`/goal/${params.id}`}>
              <Button variant="ghost" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden sm:inline">Back to Goal</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            
            {/* Desktop Menu */}
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating || completedDays === 0}
                variant="gradient"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
              <ThemeToggle />
            </div>
            
            {/* Mobile Menu Button */}
            <div className="flex sm:hidden items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden pt-4 pb-2 border-t mt-3"
            >
              <Button
                onClick={() => {
                  handleGenerateInsights();
                  setMobileMenuOpen(false);
                }}
                disabled={isGenerating || completedDays === 0}
                variant="gradient"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-xl">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Insights & Analytics</h1>
              <p className="text-sm sm:text-base text-muted-foreground">{goal.title}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                  <span className="text-3xl font-bold">{completedDays}</span>
                </div>
                <p className="text-sm text-muted-foreground">Days Completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Target className="w-8 h-8 text-blue-500" />
                  <span className="text-3xl font-bold">{completionRate}%</span>
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-orange-500" />
                  <span className="text-3xl font-bold">{insights.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated Insights
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Progress Over Time Chart */}
          {progressChartData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Daily Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div style={{ minWidth: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressChartData}>
                      <defs>
                        <linearGradient
                          id="colorCompleted"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        domain={[0, (da: number) => da + 1]}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        domain={[0, 2]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mood Trend Chart */}
          {dayWiseMoodData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smile className="w-5 h-5 text-primary" />
                    <span>Daily Mood</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dayWiseMoodData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        domain={[
                          0,
                          (dataMax: number) => Math.ceil(dataMax * 1.2),
                        ]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value: any) => [`${value}%`, "Mood Score"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    📊 This chart shows your daily mood and motivation levels
                    based on your progress notes
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Day-wise Motivation Chart */}
          {dayWiseMoodData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card h-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <span>Motivation Levels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div style={{ minWidth: '400px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dayWiseMoodData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        domain={[
                          0,
                          (dataMax: number) => Math.ceil(dataMax * 1.2),
                        ]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                        formatter={(value: any) => [`${value}%`, "Motivation"]}
                      />
                      <Bar
                        dataKey="mood"
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    📈 Track your daily motivation levels based on sentiment
                    analysis of your progress notes
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Completion Rate Radial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Overall Completion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={[
                      {
                        name: "Progress",
                        value: completionRate,
                        fill: "hsl(var(--primary))",
                      },
                    ]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background
                      dataKey="value"
                      cornerRadius={10}
                      fill="hsl(var(--primary))"
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-4xl font-bold fill-foreground"
                    >
                      {completionRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>{completedDays} of {goal.duration} days completed</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span>{goal.duration - completedDays} days remaining</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights Carousel */}
        {insights.length > 0 ? (
          <div className="relative">
            {/* Carousel Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">AI Insights</h2>
                  <p className="text-sm text-muted-foreground">
                    {insights.length} {insights.length === 1 ? 'insight' : 'insights'} generated
                  </p>
                </div>
              </div>
              
              {/* Navigation Controls */}
              {insights.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousInsight}
                    className="rounded-full"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                    {currentInsightIndex + 1} / {insights.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextInsight}
                    className="rounded-full"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>

            {/* Carousel Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentInsightIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Activity className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">
                            Week {insights[currentInsightIndex].weekNumber} Analysis
                          </CardTitle>
                          <div className="flex items-center space-x-3 mt-1 text-sm text-muted-foreground">
                            <span>{formatDate(insights[currentInsightIndex].generatedAt)}</span>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(insights[currentInsightIndex].generatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMoodIcon(
                          insights[currentInsightIndex].moodTrend.length > 0
                            ? insights[currentInsightIndex].moodTrend[
                                insights[currentInsightIndex].moodTrend.length - 1
                              ].score
                            : 0
                        )}
                        <span className="text-sm font-medium">
                          {insights[currentInsightIndex].motivationLevel}% motivated
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div>
                      <p className="text-foreground leading-relaxed">
                        {insights[currentInsightIndex].summary}
                      </p>
                    </div>

                    {/* Highlights */}
                    {insights[currentInsightIndex].highlights.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <h4 className="font-semibold">Highlights</h4>
                        </div>
                        <ul className="space-y-2">
                          {insights[currentInsightIndex].highlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2 text-green-500">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Blockers */}
                    {insights[currentInsightIndex].blockers.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <h4 className="font-semibold">Challenges</h4>
                        </div>
                        <ul className="space-y-2">
                          {insights[currentInsightIndex].blockers.map((blocker, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2 text-red-500">•</span>
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insights[currentInsightIndex].recommendations.length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-500" />
                          <h4 className="font-semibold">Recommendations</h4>
                        </div>
                        <ul className="space-y-2">
                          {insights[currentInsightIndex].recommendations.map((rec, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2 text-blue-500">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Dots Indicator */}
            {insights.length > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-6">
                {insights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentInsightIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentInsightIndex
                        ? "w-8 bg-primary"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
                <p className="text-muted-foreground mb-6">
                  {completedDays === 0
                    ? "Start tracking your progress to unlock AI-powered insights!"
                    : "Click 'Generate Insights' to get AI-powered analysis of your progress."}
                </p>
                {completedDays > 0 && (
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={isGenerating}
                    variant="gradient"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Generating Insights...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Your First Insight
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
