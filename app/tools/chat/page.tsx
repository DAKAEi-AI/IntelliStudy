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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-4 sm:py-8">
        <div className="flex flex-col items-center justify-center mb-4 sm:mb-8">
          <div className="rounded-full bg-primary/10 p-3 sm:p-4 mb-2 sm:mb-4 floating">
            <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">AI Chatbot</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 text-center max-w-2xl px-2">
            Get instant answers to your questions and receive personalized learning assistance.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto gradient-border bg-secondary/50 backdrop-blur-sm">
          <CardHeader className="px-3 py-3 sm:px-6 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">Chat with Robotum</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your AI study assistant is ready to help with your questions</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="h-[400px] sm:h-[500px] overflow-y-auto p-2 sm:p-4 rounded-md bg-background/50 border mb-2 sm:mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-8">
                  <Bot className="h-12 w-12 sm:h-16 sm:w-16 text-primary mb-3 sm:mb-4 opacity-50" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">Welcome to Robotum!</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                    I'm your AI study assistant. Ask me anything about your studies, homework, or academic concepts, and
                    I'll do my best to help you succeed!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-2 sm:gap-3 rounded-lg p-2 sm:p-4",
                        message.role === "user" ? "bg-secondary ml-8 sm:ml-12" : "bg-primary/10 mr-8 sm:mr-12",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-full p-1.5 sm:p-2 flex-shrink-0",
                          message.role === "user" ? "bg-background" : "bg-primary/20",
                        )}
                      >
                        {message.role === "user" ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </div>
                      <div className="whitespace-pre-wrap text-xs sm:text-base">{message.content}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="px-3 py-2 sm:px-6 sm:py-4">
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <Input
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base h-9 sm:h-10"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-9 sm:h-10 px-2 sm:px-3">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
