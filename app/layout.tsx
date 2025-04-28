import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import Footer from "@/components/footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "IntelliStudy - AI Tools for Students",
  description: "AI-powered learning platform with tools for students",
  generator: 'v0.dev',
  icons: {
    icon: [
      { url: "https://i.ibb.co/v49kzqvJ/Logo.png", sizes: "32x32" },
      { url: "https://i.ibb.co/v49kzqvJ/Logo.png", sizes: "any" }
    ],
    apple: "/logo.png",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
          <div className="flex-1 flex flex-col">
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
