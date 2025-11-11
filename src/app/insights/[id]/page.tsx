"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated, params.id, router]);

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
  const completionRate = goal ? Math.round((completedDays / goal.duration) * 100) : 0;

  // Prepare chart data
  const progressChartData = progress
    .sort((a, b) => a.day - b.day)
    .map((p) => ({
      day: `Day ${p.day}`,
      completed: p.completed ? 1 : 0,
      dayNumber: p.day,
    }));

  const moodTrendData = insights.length > 0 && insights[0].moodTrend
    ? insights[0].moodTrend.map((m) => ({
        day: `Day ${m.day}`,
        mood: (m.score * 100).toFixed(0),
        score: m.score,
      }))
    : [];

  const motivationData = insights.map((insight) => ({
    week: `Week ${insight.weekNumber}`,
    motivation: insight.motivationLevel,
  }));

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
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/goal/${params.id}`}>
              <Button variant="ghost" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Goal
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGenerateInsights}
                disabled={isGenerating || completedDays === 0}
                variant="gradient"
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
          </div>
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
              <h1 className="text-3xl font-bold">Insights & Analytics</h1>
              <p className="text-muted-foreground">{goal.title}</p>
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
            <Card className="glass-card">
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
            <Card className="glass-card">
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
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-8 h-8 text-orange-500" />
                  <span className="text-3xl font-bold">{insights.length}</span>
                </div>
                <p className="text-sm text-muted-foreground">Generated Insights</p>
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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Daily Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={progressChartData}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
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
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Mood Trend Chart */}
          {moodTrendData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Smile className="w-5 h-5 text-primary" />
                    <span>Mood Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Motivation Level Chart */}
          {motivationData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-primary" />
                    <span>Motivation Levels</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={motivationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="week" 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <Bar 
                        dataKey="motivation" 
                        fill="hsl(var(--primary))"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Overall Completion</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    data={[{ name: 'Progress', value: completionRate, fill: 'hsl(var(--primary))' }]}
                    startAngle={180}
                    endAngle={0}
                  >
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
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
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* AI Insights */}
        {insights.length > 0 ? (
          <div className="space-y-6">
            {insights.map((insight, index) => (
              <motion.div
                key={insight._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Week {insight.weekNumber} Analysis</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(insight.generatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getMoodIcon(insight.moodTrend.length > 0 ? insight.moodTrend[insight.moodTrend.length - 1].score : 0)}
                        <span className="text-sm font-medium">
                          {insight.motivationLevel}% motivated
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Summary */}
                    <div>
                      <p className="text-foreground leading-relaxed">
                        {insight.summary}
                      </p>
                    </div>

                    {/* Highlights */}
                    {insight.highlights.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <h4 className="font-semibold">Highlights</h4>
                        </div>
                        <ul className="space-y-2">
                          {insight.highlights.map((highlight, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2 text-green-500">•</span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Blockers */}
                    {insight.blockers.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <h4 className="font-semibold">Challenges</h4>
                        </div>
                        <ul className="space-y-2">
                          {insight.blockers.map((blocker, idx) => (
                            <li key={idx} className="text-sm flex items-start">
                              <span className="mr-2 text-red-500">•</span>
                              <span>{blocker}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insight.recommendations.length > 0 && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <Lightbulb className="w-5 h-5 text-blue-500" />
                          <h4 className="font-semibold">Recommendations</h4>
                        </div>
                        <ul className="space-y-2">
                          {insight.recommendations.map((rec, idx) => (
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
            ))}
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
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
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
