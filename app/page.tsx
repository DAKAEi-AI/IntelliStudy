import React from "react";
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, MessageSquare, PenTool, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "@/components/navbar"

export const metadata: Metadata = {
  title: "IntelliStudy - AI Tools for Students",
  description: "AI-powered learning platform with tools for students",
}

export default function HomePage() {
  const tools = [
    {
      title: "Text Summarization",
      description: "Condense lengthy articles, research papers, and study materials into concise summaries.",
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      href: "/tools/summarize",
    },
    {
      title: "Content Rewriter",
      description: "Paraphrase and rewrite content to improve clarity, avoid plagiarism, and enhance your writing.",
      icon: <PenTool className="h-8 w-8 text-primary" />,
      href: "/tools/rewrite",
    },
    {
      title: "AI Chatbot",
      description: "Get instant answers to your questions and receive personalized learning assistance.",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      href: "/tools/chat",
    },
    {
      title: "Quiz Generator",
      description: "Create custom quizzes and practice tests to test your knowledge and prepare for exams.",
      icon: <Zap className="h-8 w-8 text-primary" />,
      href: "/tools/quiz",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-10">
        <section className="w-full py-6 md:py-12">
          <div className="container">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16 md:mb-24">
              <div className="flex items-center justify-center mb-4">
                <Image 
                  src="https://i.ibb.co/v49kzqvJ/Logo.png" 
                  alt="IntelliStudy Logo" 
                  width={140}
                  height={140}
                  className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain select-none pointer-events-none"
                  draggable="false"
                  priority
                />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  <span className="gradient-text">IntelliStudy</span> - AI Tools for Students
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Boost your learning with our AI-powered tools designed specifically for students.
                </p>
              </div>
              <div className="space-x-4 mt-6">
                <Button asChild size="lg" className="animate-pulse">
                  <Link href="#tools">
                    Explore Tools <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Updated tool section with responsive classes that work with our media queries */}
            <div id="tools" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 px-4 md:px-8 lg:px-0 mt-12">
              {tools.map((tool, index) => (
                <Link href={tool.href} key={index} className="block h-full">
                  {/* Card with reduced padding */}
                  <Card className="h-full gradient-border tool-card bg-secondary/50 backdrop-blur-sm p-3 md:p-4 flex flex-col">
                    <CardHeader className="pb-1 md:pb-2 px-3 pt-3">
                      <div className="flex items-center justify-between">
                        {/* Smaller icon wrapper */}
                        <div className="rounded-full bg-primary/10 p-3 floating">
                          {/* Smaller icon size */}
                          {React.cloneElement(tool.icon, { className: "h-8 w-8 text-primary" })}
                        </div>
                      </div>
                      {/* Title with less margin */}
                      <CardTitle className="mt-4 text-xl">{tool.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow py-2 px-3">
                      <CardDescription className="text-muted-foreground text-sm">{tool.description}</CardDescription>
                    </CardContent>
                    <CardFooter className="pt-1 pb-3 px-3">
                      {/* Smaller button padding */}
                      <Button 
                        className="w-full bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(300,100%,60%)] text-white shadow-md hover:shadow-lg transition-all duration-300 animate-shimmer group overflow-hidden relative py-4"
                      >
                        <span className="relative z-10 text-base font-medium">Try Now</span>
                        <ArrowRight className="ml-2 h-4 w-4 relative z-10 animate-bounce-x" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 transform -translate-x-full" />
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
