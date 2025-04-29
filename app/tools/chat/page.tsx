"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, Send, Loader2, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import { chatWithAI } from "@/lib/api"
import { cn } from "@/lib/utils"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Modified scroll function to handle scrolling better
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight
    }
  }

  // Scroll when messages change
  useEffect(() => {
    // Use a small timeout to ensure content has rendered
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const chatHistory = messages.filter((m) => m.role !== "system")
      const response = await chatWithAI(input, chatHistory)

      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[100vh]">
      <Navbar />

      {/* Fixed height container with header */}
      <div className="flex-1 overflow-hidden flex flex-col container max-w-screen-xl mx-auto px-4 py-4">
        <div className="text-center mb-4">
          <div className="inline-flex rounded-full bg-primary/10 p-2 mb-2">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold gradient-text">AI Chatbot</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl mx-auto">
            Get instant answers to your questions and receive personalized learning assistance.
          </p>
        </div>

        {/* Chat container with fixed dimensions */}
        <Card className="flex-1 flex flex-col w-full max-w-4xl mx-auto gradient-border bg-secondary/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="px-3 py-2 sm:px-6 sm:py-3 shrink-0">
            <CardTitle className="text-lg">Chat with <span className="gradient-text">IntelliBot</span></CardTitle>
            <CardDescription className="text-xs">Your AI study assistant is ready to help with your questions</CardDescription>
          </CardHeader>
          
          {/* Scrollable message area */}
          <CardContent 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto px-3 sm:px-6 py-2"
          >
            <div className="rounded-md bg-background/50 border p-2 sm:p-3 min-h-full">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-3 opacity-50" />
                  <h3 className="text-base sm:text-lg font-semibold mb-1">Welcome to <span className="gradient-text">IntelliBot</span>!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    I'm your AI study assistant. Ask me anything about your studies, homework, or academic concepts, and
                    I'll do my best to help you succeed!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2 rounded-lg p-2",
                        message.role === "user" ? "bg-secondary ml-4 sm:ml-8" : "bg-primary/10 mr-4 sm:mr-8",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-full p-1 flex-shrink-0",
                          message.role === "user" ? "bg-background" : "bg-primary/20",
                        )}
                      >
                        {message.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </div>
                      <div className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          
          {/* Fixed input area */}
          <CardFooter className="px-3 py-2 sm:px-6 sm:py-3 border-t shrink-0">
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <Input
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm h-9"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-9 px-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
