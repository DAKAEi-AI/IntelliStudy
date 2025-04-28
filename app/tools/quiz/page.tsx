"use client"

import { useState } from "react"
import { FileUp, Loader2, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import Navbar from "@/components/navbar"
import { generateQuiz } from "@/lib/api"

type QuizOption = {
  id: string
  text: string
}

type QuizQuestion = {
  id: number
  question: string
  options: QuizOption[]
  correctAnswer: string
  explanation: string
}

type Quiz = {
  title: string
  difficulty: string
  questions: QuizQuestion[]
}

type UserAnswer = {
  questionId: number
  selectedOption: string
}

export default function QuizPage() {
  const [topic, setTopic] = useState("")
  const [difficulty, setDifficulty] = useState("medium")
  const [questionCount, setQuestionCount] = useState(5)
  const [quiz, setQuiz] = useState("")
  const [parsedQuiz, setParsedQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [inputMethod, setInputMethod] = useState<string>("ai")
  const [currentStep, setCurrentStep] = useState(0) // 0 for quiz creation, 1+ for questions
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [isCopying, setIsCopying] = useState(false)
  const { toast } = useToast()

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
  ]

  async function handleGenerateQuiz() {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your quiz.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await generateQuiz(topic, difficulty, questionCount)
      setQuiz(result)
      
      try {
        // Parse the JSON response
        const parsedResult = JSON.parse(result)
        setParsedQuiz(parsedResult)
        setCurrentStep(1) // Move to the first question
        setUserAnswers([])
        setQuizCompleted(false)
        setScore(0)
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", parseError)
        toast({
          title: "Format Error",
          description: "The quiz format is incorrect. Showing plain text instead.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setFileName(file.name)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Mock the file processing - in a real implementation, you would send this to your API
      // For demo purposes, we'll just extract the topic from the filename
      const extractedTopic = selectedFile.name.split('.')[0].replace(/[-_]/g, ' ')
      const result = await generateQuiz(extractedTopic, difficulty, questionCount)
      setQuiz(result)
      
      try {
        // Parse the JSON response
        const parsedResult = JSON.parse(result)
        setParsedQuiz(parsedResult)
        setCurrentStep(1) // Move to the first question
        setUserAnswers([])
        setQuizCompleted(false)
        setScore(0)
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", parseError)
        toast({
          title: "Format Error",
          description: "The quiz format is incorrect. Showing plain text instead.",
          variant: "destructive",
        })
      }
      
      toast({
        title: "File processed",
        description: `Generated quiz based on ${fileName}.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (inputMethod === "ai") {
      handleGenerateQuiz()
    } else {
      handleFileUpload()
    }
  }
  
  const handleAnswerSelect = (questionId: number, selectedOption: string) => {
    const existingAnswerIndex = userAnswers.findIndex(
      (answer) => answer.questionId === questionId
    )
    
    const newAnswer = { questionId, selectedOption }
    
    if (existingAnswerIndex >= 0) {
      const updatedAnswers = [...userAnswers]
      updatedAnswers[existingAnswerIndex] = newAnswer
      setUserAnswers(updatedAnswers)
    } else {
      setUserAnswers([...userAnswers, newAnswer])
    }
  }
  
  const handleNextQuestion = () => {
    if (parsedQuiz && currentStep < parsedQuiz.questions.length) {
      setCurrentStep(currentStep + 1)
    } else {
      calculateScore()
      setQuizCompleted(true)
    }
  }
  
  const handlePreviousQuestion = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  const getCurrentQuestion = () => {
    if (!parsedQuiz || parsedQuiz.questions.length === 0) return null
    return parsedQuiz.questions[currentStep - 1]
  }
  
  const getUserAnswerForCurrentQuestion = () => {
    const question = getCurrentQuestion()
    if (!question) return null
    
    return userAnswers.find((answer) => answer.questionId === question.id)?.selectedOption || null
  }
  
  const calculateScore = () => {
    if (!parsedQuiz) return 0
    
    const totalQuestions = parsedQuiz.questions.length
    const correctAnswers = userAnswers.filter((answer) => {
      const question = parsedQuiz.questions.find((q) => q.id === answer.questionId)
      return question && question.correctAnswer === answer.selectedOption
    }).length
    
    const percentage = Math.round((correctAnswers / totalQuestions) * 100)
    setScore(percentage)
    return percentage
  }
  
  const resetQuiz = () => {
    setQuiz("")
    setParsedQuiz(null)
    setCurrentStep(0)
    setUserAnswers([])
    setQuizCompleted(false)
    setScore(0)
  }
  
  const isCurrentQuestionAnswered = () => {
    const question = getCurrentQuestion()
    if (!question) return false
    
    return userAnswers.some((answer) => answer.questionId === question.id)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="rounded-full bg-primary/10 p-4 mb-4 floating">
            <Zap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Quiz Generator</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-2xl">
            Create custom quizzes and practice tests to test your knowledge and prepare for exams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="gradient-border bg-secondary/50 backdrop-blur-sm lg:col-span-1">
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>Customize your quiz parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="ai" value={inputMethod} onValueChange={setInputMethod} className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Generation</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <FileUp className="h-4 w-4" />
                    <span>File Upload</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="ai">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., World History, Biology, Mathematics"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="file">
                  <div className="space-y-4">
                    <Label htmlFor="file-upload">Upload Document</Label>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md border-primary/20 hover:border-primary/50 transition-colors">
                        <FileUp className="h-8 w-8 mb-2 text-primary/70" />
                        {fileName ? (
                          <span className="text-sm text-muted-foreground">{fileName}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium">Click to upload</span>
                            <span className="text-xs text-muted-foreground mt-1">PDF, DOCX, TXT (Max 10MB)</span>
                          </>
                        )}
                        <Input 
                          id="file-upload" 
                          type="file" 
                          className="sr-only"
                          accept=".pdf,.docx,.doc,.txt"
                          onChange={handleFileChange}
                        />
                      </Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Number of Questions: {questionCount}</Label>
                </div>
                <Slider
                  value={[questionCount]}
                  min={1}
                  max={20}
                  step={1}
                  onValueChange={(value) => setQuestionCount(value[0])}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || (inputMethod === "ai" && !topic.trim()) || (inputMethod === "file" && !selectedFile)} 
                className="w-full bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(300,100%,60%)] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {inputMethod === "ai" ? "Generating..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {inputMethod === "ai" ? (
                      <>Generate Quiz<Sparkles className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Process File<FileUp className="ml-2 h-4 w-4" /></>
                    )}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="gradient-border bg-secondary/50 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              {parsedQuiz && currentStep > 0 ? (
                <>
                  <CardTitle>{parsedQuiz.title}</CardTitle>
                  <CardDescription>
                    {quizCompleted 
                      ? "Quiz completed! See your results below."
                      : `Question ${currentStep} of ${parsedQuiz.questions.length} • ${parsedQuiz.difficulty} difficulty`
                    }
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle>Generated Quiz</CardTitle>
                  <CardDescription>Your custom quiz will appear here</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {parsedQuiz && currentStep > 0 ? (
                <div className="min-h-[500px] p-4 rounded-md bg-background/50 border overflow-y-auto">
                  {quizCompleted ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                      <div className="rounded-full p-4 bg-primary/10">
                        <Zap className="h-12 w-12 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-center">Quiz Completed!</h2>
                      
                      <div className="w-full max-w-md">
                        <div className="relative h-4 w-full bg-secondary rounded-full overflow-hidden">
                          <div 
                            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out rounded-full ${
                              score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">Your Score</span>
                          <span className="font-medium">{score}%</span>
                        </div>
                      </div>
                      
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          {score >= 90 ? 'Excellent work! You aced it!' : 
                           score >= 70 ? 'Great job! You know your stuff.' :
                           score >= 50 ? 'Good effort. Keep studying to improve!' :
                           'You might need more practice with this topic.'}
                        </p>
                        
                        <Button onClick={resetQuiz} variant="outline" className="mt-6">
                          Create Another Quiz
                        </Button>
                      </div>
                      
                      <div className="w-full mt-8 space-y-6">
                        <h3 className="text-xl font-semibold">Answer Review</h3>
                        {parsedQuiz.questions.map((question, index) => {
                          const userAnswer = userAnswers.find(a => a.questionId === question.id)?.selectedOption
                          const isCorrect = userAnswer === question.correctAnswer
                          
                          return (
                            <div key={question.id} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                                  isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                  {index + 1}
                                </span>
                                <h4 className="font-medium">{question.question}</h4>
                              </div>
                              
                              <div className="mt-3 space-y-1.5">
                                {question.options.map(option => (
                                  <div key={option.id} className="flex items-center">
                                    <div className={`ml-8 flex items-center px-3 py-1.5 rounded-md ${
                                      option.id === question.correctAnswer ? 'bg-green-100 text-green-700' :
                                      option.id === userAnswer ? 'bg-red-100 text-red-700' : ''
                                    }`}>
                                      <span className="mr-2 font-medium">{option.id}.</span>
                                      <span>{option.text}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="mt-3 ml-8 text-sm text-muted-foreground">
                                <span className="font-medium">Explanation: </span>
                                {question.explanation}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Question */}
                      {getCurrentQuestion() && (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">{getCurrentQuestion()?.question}</h3>
                          
                          <RadioGroup
                            value={getUserAnswerForCurrentQuestion() || ""}
                            onValueChange={(value) => 
                              handleAnswerSelect(getCurrentQuestion()?.id || 0, value)
                            }
                            className="space-y-3"
                          >
                            {getCurrentQuestion()?.options.map((option) => (
                              <div key={option.id} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                                <Label htmlFor={`option-${option.id}`} className="cursor-pointer">
                                  <span className="font-medium mr-2">{option.id}.</span> {option.text}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="min-h-[500px] p-4 rounded-md bg-background/50 border overflow-y-auto">
                  {quiz ? (
                    <div className="whitespace-pre-wrap">{quiz}</div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <Zap className="h-16 w-16 text-primary mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">No Quiz Generated Yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Fill in the quiz settings and click "Generate Quiz" to create your custom quiz.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className={`flex ${quizCompleted || currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
              {parsedQuiz && currentStep > 0 && !quizCompleted && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handlePreviousQuestion}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>
                  
                  <Button 
                    onClick={handleNextQuestion}
                    disabled={!isCurrentQuestionAnswered()}
                    className="bg-gradient-to-r from-[hsl(252,100%,69%)] to-[hsl(300,100%,60%)] text-white"
                  >
                    {currentStep === parsedQuiz.questions.length ? "Finish Quiz" : "Next Question"}
                  </Button>
                </>
              )}
              
              {quiz && currentStep === 0 && (
                <Button
                  variant="outline"
                  className={`relative ${isCopying ? 'scale-95 bg-green-50' : ''} transition-all duration-200`}
                  onClick={() => {
                    setIsCopying(true);
                    navigator.clipboard.writeText(quiz);
                    toast({
                      title: "Copied!",
                      description: "Quiz copied to clipboard",
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
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
