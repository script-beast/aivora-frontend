"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Loader2, CheckCircle2, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { goalAPI } from "@/lib/api";
import { ThemeToggle } from "@/components/ThemeToggle";

type FormStep = "details" | "config" | "generating" | "success";

export default function CreateGoalPage() {
  const router = useRouter();
  const [step, setStep] = useState<FormStep>("details");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: 30,
    hoursPerDay: 2,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newGoalId, setNewGoalId] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "title" || name === "description" ? value : parseFloat(value) || 0,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateDetails = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Goal title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Goal title must be at least 3 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateConfig = () => {
    const newErrors: Record<string, string> = {};

    if (formData.duration < 1 || formData.duration > 365) {
      newErrors.duration = "Duration must be between 1 and 365 days";
    }

    if (formData.hoursPerDay < 0.5 || formData.hoursPerDay > 12) {
      newErrors.hoursPerDay = "Hours per day must be between 0.5 and 12";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === "details" && validateDetails()) {
      setStep("config");
    }
  };

  const handleSubmit = async () => {
    if (!validateConfig()) return;

    // Start the button animation sequence
    setStep("generating");

    try {
      const response = await goalAPI.create({
        title: formData.title,
        description: formData.description || undefined,
        duration: formData.duration,
        hoursPerDay: formData.hoursPerDay,
      });
      
      const goalId = response.goal?._id || response._id;
      setNewGoalId(goalId);

      // Show success animation
      setTimeout(() => {
        setStep("success");
      }, 1500);

      // Navigate after success animation
      setTimeout(() => {
        router.push(`/goal/${goalId}`);
      }, 3000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to create goal. Please try again.";
      setErrors({ submit: errorMessage });
      setStep("config");
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold mb-3">Create New Goal</h1>
          <p className="text-muted-foreground text-lg">
            Let AI help you build a personalized roadmap to success
          </p>
        </motion.div>

        {/* Progress Indicator */}
        {(step === "details" || step === "config") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center space-x-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === "details"
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/20 text-primary"
                }`}
              >
                1
              </div>
              <div className="h-1 w-24 bg-border" />
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step === "config"
                    ? "bg-primary text-primary-foreground"
                    : "bg-border text-muted-foreground"
                }`}
              >
                2
              </div>
            </div>
            <div className="flex justify-between mt-4 px-4 max-w-md mx-auto">
              <span className="text-sm font-medium text-muted-foreground">
                Goal Details
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Configuration
              </span>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Goal Details */}
          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span>What&apos;s Your Goal?</span>
                  </CardTitle>
                  <CardDescription>
                    Tell us what you want to achieve
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-base">
                      Goal Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="e.g., Learn Web Development, Run a Marathon, Start a Business"
                      value={formData.title}
                      onChange={handleChange}
                      className="text-base h-12"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base">
                      Description (Optional)
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Add any specific details, constraints, or preferences..."
                      value={formData.description}
                      onChange={handleChange}
                      className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleNext}
                      variant="gradient"
                      size="lg"
                    >
                      Next Step
                      <ArrowLeft className="ml-2 w-4 h-4 rotate-180" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Configuration */}
          {step === "config" && (
            <motion.div
              key="config"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>Time Commitment</span>
                  </CardTitle>
                  <CardDescription>
                    How much time can you dedicate?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {errors.submit && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                    >
                      {errors.submit}
                    </motion.div>
                  )}

                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Duration (days) *
                    </Label>
                    <Input
                      id="duration"
                      name="duration"
                      type="number"
                      min={1}
                      max={365}
                      value={formData.duration}
                      onChange={handleChange}
                      className="text-base h-12"
                    />
                    {errors.duration && (
                      <p className="text-sm text-destructive">{errors.duration}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {[7, 14, 30, 60, 90].map((days) => (
                        <Button
                          key={days}
                          type="button"
                          variant={formData.duration === days ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, duration: days }))
                          }
                        >
                          {days}d
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="hoursPerDay" className="text-base flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Hours per day *
                    </Label>
                    <Input
                      id="hoursPerDay"
                      name="hoursPerDay"
                      type="number"
                      min={0.5}
                      max={12}
                      step={0.5}
                      value={formData.hoursPerDay}
                      onChange={handleChange}
                      className="text-base h-12"
                    />
                    {errors.hoursPerDay && (
                      <p className="text-sm text-destructive">
                        {errors.hoursPerDay}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {[1, 2, 3, 4, 6].map((hours) => (
                        <Button
                          key={hours}
                          type="button"
                          variant={formData.hoursPerDay === hours ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, hoursPerDay: hours }))
                          }
                        >
                          {hours}h
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm">
                      <strong>Total commitment:</strong> Approximately{" "}
                      {Math.round(formData.duration * formData.hoursPerDay)} hours
                      over {formData.duration} days
                    </p>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      onClick={() => setStep("details")}
                      variant="outline"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    
                    <Button
                      onClick={handleSubmit}
                      variant="gradient"
                      size="lg"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Generating State */}
          {step === "generating" && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="mb-6"
              >
                <Loader2 className="w-16 h-16 text-primary" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">
                Creating Your Roadmap
              </h2>
              <p className="text-muted-foreground text-center max-w-md">
                AI is analyzing your goal and generating a personalized action plan...
              </p>
            </motion.div>
          )}

          {/* Success State */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className="mb-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Goal Created! 🎉</h2>
              <p className="text-muted-foreground mb-4">
                Your personalized roadmap is ready
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to your goal...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Section */}
        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">💡 Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>
                      Be specific: &quot;Learn React in 3 months&quot; works better than &quot;Learn programming&quot;
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Include your current level: &quot;Beginner to Intermediate Python&quot;</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Add constraints: &quot;30 minutes daily&quot; or &quot;Weekend project&quot;</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
