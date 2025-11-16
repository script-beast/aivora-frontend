"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Brain,
  Target,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Github,
  Code,
  Info,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-purple-500/10" />

      {/* Floating orbs animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/30 dark:bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 dark:bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Brain className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold gradient-glow bg-clip-text text-transparent">
              Aivora
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              Plan. Track. Grow.{" "}
              <span className="gradient-glow bg-clip-text text-transparent">
                With AI.
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto"
          >
            Your personal AI-powered goal intelligence system. Turn ambitions
            into actionable plans with smart insights and daily progress
            tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="gradient"
                className="text-lg px-8 py-6 group"
              >
                Launch Dashboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Get Started Free
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto"
        >
          {[
            {
              icon: Target,
              title: "AI-Generated Roadmaps",
              description:
                "Get personalized, step-by-step plans powered by advanced AI to achieve any goal.",
            },
            {
              icon: TrendingUp,
              title: "Smart Progress Tracking",
              description:
                "Visual heatmaps and analytics that show your momentum and keep you motivated.",
            },
            {
              icon: Sparkles,
              title: "Intelligent Insights",
              description:
                "AI analyzes your progress and provides actionable tips to optimize your journey.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              className="glass-card rounded-2xl p-8 text-center group cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Developer and Project Information - Footer */}
      <footer className="relative z-10 border-t bg-card/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto"
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
                  href="https://aprajapati.vercel.app/"
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
              Prajapati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
