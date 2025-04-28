"use client"

import { useState } from "react"
import { Loader2, PenTool, Download, FileText, FileType, FilePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import { rewriteContent } from "@/lib/api"

// Function to parse and format markdown-style text
const formatText = (text: string) => {
  if (!text) return text;
  
  // Handle bold text: Convert ***text*** or **text** to bold
  let formattedText = text.replace(/\*\*\*(.*?)\*\*\*/g, '<b>$1</b>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  
  // Handle italic text: Convert *text* to italic
  formattedText = formattedText.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<i>$1</i>');
  
  // Handle headings: Convert # Heading to proper headings
  formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Handle lists: Convert - item to proper list items
  formattedText = formattedText.replace(/^- (.*$)/gm, '• $1');
  
  // Replace line breaks with proper HTML line breaks
  formattedText = formattedText.replace(/\n/g, '<br/>');
  
  return formattedText;
};

// Function to get plain text from formatted text for txt files
const stripHtml = (html: string) => {
  if (!html) return html;
  return html
    .replace(/<b>(.*?)<\/b>/g, '$1')
    .replace(/<i>(.*?)<\/i>/g, '$1')
    .replace(/<h[1-3]>(.*?)<\/h[1-3]>/g, '$1')
    .replace(/<br\/>/g, '\n');
};

// Function to get clean text by removing both HTML and Markdown formatting
const stripFormatting = (text: string) => {
  if (!text) return text;
  
  // First strip HTML tags (if any)
  let cleanText = text
    .replace(/<b>(.*?)<\/b>/g, '$1')
    .replace(/<i>(.*?)<\/i>/g, '$1')
    .replace(/<h[1-3]>(.*?)<\/h[1-3]>/g, '$1')
    .replace(/<br\/>/g, '\n');
  
  // Then strip Markdown formatting
  cleanText = cleanText
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '$1')
    .replace(/^# (.*$)/gm, '$1')
    .replace(/^## (.*$)/gm, '$1')
    .replace(/^### (.*$)/gm, '$1')
    .replace(/^- (.*$)/gm, '• $1');
  
  return cleanText;
};

export default function RewritePage() {
  const [inputText, setInputText] = useState("")
  const [rewrittenText, setRewrittenText] = useState("")
  const [style, setStyle] = useState("academic")
  const [isLoading, setIsLoading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const styles = [
    { value: "academic", label: "Academic" },
    { value: "casual", label: "Casual" },
    { value: "professional", label: "Professional" },
    { value: "creative", label: "Creative" },
    { value: "simplified", label: "Simplified" },
  ]

  async function handleRewrite() {
    if (!inputText.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some text to rewrite.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await rewriteContent(inputText, style)
      setRewrittenText(result)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rewrite text. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle file downloads
  const handleDownload = async (fileType: string) => {
    if (!rewrittenText) return;

    setIsDownloading(true);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    
    try {
      switch (fileType) {
        case 'txt': {
          // Plain text file - use the stripFormatting function to remove all formatting symbols
          const cleanText = stripFormatting(rewrittenText);
          const blob = new Blob([cleanText], { type: 'text/plain' });
          const fileName = `rewritten-${timestamp}.txt`;
          
          // Create a download link and trigger the download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Download Complete",
            description: "Text file downloaded successfully.",
          });
          break;
        }
        
        case 'docx': {
          // Need to use docx library to create proper Word document
          const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import('docx');
          
          // Parse markdown-style text to get formatting information
          const formattedText = formatText(rewrittenText);
          
          // Create sections for the document
          const children = [];
          
          // Process text into paragraphs with proper formatting
          // For simplicity, split by <br/> tags which were converted from newlines
          const paragraphs = formattedText.split('<br/>').filter(para => para.trim() !== '');
          
          for (let para of paragraphs) {
            // Check if it's a heading
            const headingMatch = para.match(/<h([1-3])>(.*?)<\/h([1-3])>/);
            if (headingMatch) {
              // It's a heading
              const headingLevel = parseInt(headingMatch[1]);
              const headingText = headingMatch[2];
              
              children.push(
                new Paragraph({
                  text: headingText,
                  heading: headingLevel === 1 ? HeadingLevel.HEADING_1 : 
                           headingLevel === 2 ? HeadingLevel.HEADING_2 : 
                           HeadingLevel.HEADING_3,
                })
              );
              continue;
            }
            
            // Regular paragraph with possible formatting
            const textRuns = [];
            let currentText = para;
            
            // Process bold text
            while (currentText.includes('<b>')) {
              const boldStart = currentText.indexOf('<b>');
              const boldEnd = currentText.indexOf('</b>');
              
              if (boldStart > 0) {
                // Add text before bold
                textRuns.push(
                  new TextRun({
                    text: currentText.substring(0, boldStart),
                    size: 24, // 12pt font
                  })
                );
              }
              
              // Add bold text
              textRuns.push(
                new TextRun({
                  text: currentText.substring(boldStart + 3, boldEnd),
                  bold: true,
                  size: 24, // 12pt font
                })
              );
              
              // Update current text to remaining text
              currentText = currentText.substring(boldEnd + 4);
            }
            
            // Add any remaining text
            if (currentText) {
              // Process italic in remaining text
              while (currentText.includes('<i>')) {
                const italicStart = currentText.indexOf('<i>');
                const italicEnd = currentText.indexOf('</i>');
                
                if (italicStart > 0) {
                  // Add text before italic
                  textRuns.push(
                    new TextRun({
                      text: currentText.substring(0, italicStart),
                      size: 24, // 12pt font
                    })
                  );
                }
                
                // Add italic text
                textRuns.push(
                  new TextRun({
                    text: currentText.substring(italicStart + 3, italicEnd),
                    italics: true,
                    size: 24, // 12pt font
                  })
                );
                
                // Update current text to remaining text
                currentText = currentText.substring(italicEnd + 4);
              }
              
              // Add any final remaining text
              if (currentText) {
                textRuns.push(
                  new TextRun({
                    text: currentText,
                    size: 24, // 12pt font
                  })
                );
              }
            }
            
            // Create paragraph from text runs
            if (textRuns.length > 0) {
              children.push(
                new Paragraph({
                  children: textRuns
                })
              );
            } else {
              // Fallback if no formatting was found
              children.push(
                new Paragraph({
                  children: [
                    new TextRun({
                      text: stripHtml(para),
                      size: 24, // 12pt font
                    }),
                  ],
                })
              );
            }
          }
          
          // Create a new document
          const doc = new Document({
            sections: [
              {
                properties: {},
                children
              },
            ],
          });
          
          // Generate the .docx file
          const buffer = await Packer.toBuffer(doc);
          const blob = new Blob([buffer], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          
          // Trigger download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `rewritten-${timestamp}.docx`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Download Complete",
            description: "Word document downloaded successfully.",
          });
          break;
        }
        
        case 'pdf': {
          // Need to use jsPDF to create proper PDF document
          const JsPDF = await import('jspdf');
          const pdf = new JsPDF.default();
          
          // Set document properties
          pdf.setProperties({
            title: 'Rewritten Content',
            subject: 'Content Rewriter',
            creator: 'IntelliStudy',
            author: 'IntelliStudy'
          });
          
          try {
            // Parse the markdown-style formatting
            const formattedText = formatText(rewrittenText);
            
            // Split into paragraphs by <br/> tags
            const paragraphs = formattedText.split('<br/>').filter(para => para.trim() !== '');
            
            let y = 20; // Starting y position
            const normalLineHeight = 7;
            const headingLineHeight = 12;
            const margin = 10;
            const pageWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
            
            // Process each paragraph with its formatting
            for (let i = 0; i < paragraphs.length; i++) {
              let para = paragraphs[i];
              let lineHeight = normalLineHeight;
              
              // Check for headings
              const headingMatch = para.match(/<h([1-3])>(.*?)<\/h([1-3])>/);
              if (headingMatch) {
                const headingLevel = parseInt(headingMatch[1]);
                const headingText = headingMatch[2];
                
                // Set appropriate font size based on heading level
                switch(headingLevel) {
                  case 1:
                    pdf.setFontSize(18);
                    pdf.setFont("helvetica", 'bold');
                    lineHeight = headingLineHeight;
                    break;
                  case 2:
                    pdf.setFontSize(16);
                    pdf.setFont("helvetica", 'bold');
                    lineHeight = headingLineHeight;
                    break;
                  case 3:
                    pdf.setFontSize(14);
                    pdf.setFont("helvetica", 'bold');
                    lineHeight = headingLineHeight;
                    break;
                }
                
                // Check if we need a new page
                if (y + lineHeight > 280) {
                  pdf.addPage();
                  y = 20;
                }
                
                // Add heading text
                pdf.text(headingText, margin, y);
                y += lineHeight * 1.5; // More space after headings
                
                // Reset font for normal text
                pdf.setFontSize(12);
                pdf.setFont("helvetica", 'normal');
                continue;
              }
              
              // Process formatting for regular paragraphs
              // For simplicity, we'll extract text without HTML tags for PDF
              const plainText = stripHtml(para);
              const lines = pdf.splitTextToSize(plainText, pageWidth);
              
              // Check if we need a new page
              if (y + (lines.length * lineHeight) > 280) {
                pdf.addPage();
                y = 20;
              }
              
              // Add text lines
              for (let j = 0; j < lines.length; j++) {
                pdf.text(lines[j], margin, y);
                y += lineHeight;
                
                // Check if we need a new page before the next line
                if (y > 280 && (j < lines.length - 1 || i < paragraphs.length - 1)) {
                  pdf.addPage();
                  y = 20;
                }
              }
              
              // Add extra space between paragraphs
              y += 3;
            }
          } catch (pdfError) {
            console.error("PDF rendering error:", pdfError);
            // Fallback to simpler rendering if the detailed approach fails
            pdf.setFontSize(12);
            pdf.text(stripHtml(rewrittenText), 10, 20);
          }
          
          // Save and download the PDF
          pdf.save(`rewritten-${timestamp}.pdf`);
          
          toast({
            title: "Download Complete",
            description: "PDF document downloaded successfully.",
          });
          break;
        }
        
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="rounded-full bg-primary/10 p-4 mb-4 floating">
            <PenTool className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Content Rewriter</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-2xl">
            Paraphrase and rewrite content to improve clarity, avoid plagiarism, and enhance your writing.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-border bg-secondary/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Input Text</CardTitle>
              <CardDescription>Paste the text you want to rewrite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter or paste your text here..."
                className="min-h-[250px] resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="space-y-2">
                <label className="text-sm font-medium">Writing Style</label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a writing style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleRewrite} disabled={isLoading || !inputText.trim()} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  "Rewrite Content"
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="gradient-border bg-secondary/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Rewritten Content</CardTitle>
              <CardDescription>Your rewritten text will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="min-h-[300px] p-4 rounded-md bg-background/50 border">
                {rewrittenText ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatText(rewrittenText) }} />
                ) : (
                  <div className="text-muted-foreground italic">
                    Your rewritten content will appear here after processing...
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {rewrittenText && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        className={`${isDownloading ? 'animate-pulse bg-blue-50' : ''} transition-all duration-200`}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Downloading...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownload('txt')} className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Text File (.txt)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('docx')} className="cursor-pointer">
                        <FilePlus className="mr-2 h-4 w-4" />
                        <span>Word Document (.docx)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload('pdf')} className="cursor-pointer">
                        <FileType className="mr-2 h-4 w-4" />
                        <span>PDF Document (.pdf)</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    className={`relative ${isCopying ? 'scale-95 bg-green-50' : ''} transition-all duration-200`}
                    onClick={() => {
                      setIsCopying(true);
                      // Use stripFormatting to remove all formatting symbols when copying to clipboard
                      navigator.clipboard.writeText(stripFormatting(rewrittenText));
                      toast({
                        title: "Copied!",
                        description: "Rewritten text copied to clipboard",
                      });
                      
                      setTimeout(() => {
                        setIsCopying(false);
                      }, 1000);
                    }}
                  >
                    {isCopying ? (
                      <>
                        <span className="animate-pulse text-green-600">Copied!</span>
                        <span className="absolute inset-0 border-2 border-green-500 rounded-md animate-ping opacity-50"></span>
                      </>
                    ) : (
                      "Copy to Clipboard"
                    )}
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
