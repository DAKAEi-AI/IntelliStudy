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

      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="rounded-full bg-primary/10 p-4 mb-4 floating">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">AI Chatbot</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-2xl">
            Get instant answers to your questions and receive personalized learning assistance.
          </p>
        </div>

        <Card className="max-w-4xl mx-auto gradient-border bg-secondary/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Chat with Robotum</CardTitle>
            <CardDescription>Your AI study assistant is ready to help with your questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto p-4 rounded-md bg-background/50 border mb-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <Bot className="h-16 w-16 text-primary mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Welcome to Robotum!</h3>
                  <p className="text-muted-foreground max-w-md">
                    I'm your AI study assistant. Ask me anything about your studies, homework, or academic concepts, and
                    I'll do my best to help you succeed!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-4",
                        message.role === "user" ? "bg-secondary ml-12" : "bg-primary/10 mr-12",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-full p-2 flex-shrink-0",
                          message.role === "user" ? "bg-background" : "bg-primary/20",
                        )}
                      >
                        {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="w-full flex gap-2">
              <Input
                placeholder="Type your message here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
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
