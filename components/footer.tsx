import Link from "next/link"
import Image from "next/image"
import { Github, Linkedin, Mail, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t bg-background/50 backdrop-blur-sm">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Logo and About Section */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-start">
              <Image 
                src="https://i.ibb.co/v49kzqvJ/Logo.png" 
                alt="IntelliStudy Logo" 
                width={140}
                height={140}
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain select-none pointer-events-none"
                draggable="false"
              />
            </div>
            <p className="text-sm text-muted-foreground max-w-md text-left">
              IntelliStudy is an advanced AI-powered learning platform designed to transform your educational experience. 
              We offer tools to summarize texts, rewrite content, generate quizzes, and provide intelligent chat assistance
              to enhance your learning efficiency and comprehension.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-medium">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-sm hover:underline underline-offset-4 w-fit">
                Home
              </Link>
              <Link href="/tools/summarize" className="text-sm hover:underline underline-offset-4 w-fit">
                Summarize
              </Link>
              <Link href="/tools/rewrite" className="text-sm hover:underline underline-offset-4 w-fit">
                Rewrite
              </Link>
              <Link href="/tools/chat" className="text-sm hover:underline underline-offset-4 w-fit">
                Chat
              </Link>
              <Link href="/tools/quiz" className="text-sm hover:underline underline-offset-4 w-fit">
                Quiz
              </Link>
            </nav>
          </div>
          
          {/* Connect */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-lg font-medium">Connect With Us</h3>
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/NouradinAbdurahman" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="GitHub"
                className="hover:opacity-80 transition-opacity"
              >
                <Github className="h-6 w-6 text-[#333]" />
              </a>
              <a 
                href="https://www.linkedin.com/in/nouraddin/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="LinkedIn"
                className="hover:opacity-80 transition-opacity"
              >
                <Linkedin className="h-6 w-6 text-[#0077B5]" />
              </a>
              <a 
                href="https://www.instagram.com/nouradiin_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Instagram"
                className="hover:opacity-80 transition-opacity"
              >
                <Instagram className="h-6 w-6 text-[#E4405F]" />
              </a>
              <a 
                href="mailto:n.aden1208@gmil.com" 
                aria-label="Email"
                className="hover:opacity-80 transition-opacity"
              >
                <Mail className="h-6 w-6 text-[#EA4335]" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Copyright - Bottom */}
        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            © {currentYear} IntelliStudy. Created by Nouraddin. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
