"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BookOpen, Menu, MessageSquare, PenTool, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Navbar() {
  const isMobile = useMobile()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const tools = [
    {
      name: "Text Summarization",
      href: "/tools/summarize",
      icon: BookOpen,
    },
    {
      name: "Content Rewriter",
      href: "/tools/rewrite",
      icon: PenTool,
    },
    {
      name: "AI Chatbot",
      href: "/tools/chat",
      icon: MessageSquare,
    },
    {
      name: "Quiz Generator",
      href: "/tools/quiz",
      icon: Zap,
    },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/50">
      <div className="container flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image 
            src="/logo.png" 
            alt="IntelliStudy Logo" 
            width={80}
            height={80}
            className="h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 object-contain select-none pointer-events-none"
            draggable="false"
            priority
          />
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="lg" className="p-2">
                  <Menu className="h-8 w-8" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {tools.map((tool, i) => (
                    <Link
                      key={i}
                      href={tool.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-secondary transition-colors",
                        pathname === tool.href && "bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(300,100%,60%)] text-white font-medium"
                      )}
                    >
                      <tool.icon className="h-5 w-5" />
                      <span>{tool.name}</span>
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {tools.map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-md",
                    pathname === tool.href 
                      ? "bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(300,100%,60%)] text-white" 
                      : "hover:bg-secondary/50"
                  )}
                >
                  <tool.icon className="h-4 w-4" />
                  {tool.name}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  )
}
