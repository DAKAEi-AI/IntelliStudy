"use server"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

type ApiResponse = {
  id: string
  object: string
  created: number
  model: string
  system_fingerprint: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function callDakaeiApi(messages: Message[]): Promise<string> {
  try {
    const apiKey = process.env.DAKAEI_API_KEY;
    
    if (!apiKey) {
      throw new Error("Missing DAKAEI_API_KEY environment variable");
    }
    
    const response = await fetch("https://console.dakaei.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data: ApiResponse = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error calling Dakaei API:", error)
    throw error
  }
}

export async function summarizeText(text: string): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are an AI assistant that specializes in summarizing text. Provide concise, accurate summaries that capture the main points of the given text.",
    },
    {
      role: "user",
      content: `Please summarize the following text:\n\n${text}`,
    },
  ]

  return callDakaeiApi(messages)
}

export async function rewriteContent(text: string, style: string): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are an AI assistant that specializes in rewriting and paraphrasing text. Maintain the original meaning while improving clarity and style.",
    },
    {
      role: "user",
      content: `Please rewrite the following text in a ${style} style:\n\n${text}`,
    },
  ]

  return callDakaeiApi(messages)
}

export async function generateQuiz(topic: string, difficulty: string, questionCount: number): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are an AI assistant that specializes in creating educational quizzes. Generate well-structured quizzes in JSON format that can be used in interactive applications."
    },
    {
      role: "user",
      content: `Please create a ${difficulty} quiz about ${topic} with ${questionCount} questions. 
      
Format your response as a strict JSON object with the following structure:
{
  "title": "Quiz title related to the topic",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": 1,
      "question": "The question text",
      "options": [
        {"id": "A", "text": "First option"},
        {"id": "B", "text": "Second option"},
        {"id": "C", "text": "Third option"},
        {"id": "D", "text": "Fourth option"}
      ],
      "correctAnswer": "B",
      "explanation": "Brief explanation why this is the correct answer"
    }
  ]
}

Make the quiz educational and appropriate for the ${difficulty} difficulty level. Include clear explanations for the correct answers. Return ONLY the valid JSON with no additional text, markdown formatting, or code blocks.`
    }
  ]

  return callDakaeiApi(messages)
}

export async function chatWithAI(userMessage: string, chatHistory: Message[] = []): Promise<string> {
  const messages: Message[] = [
    {
      role: "system",
      content:
        "You are IntelliBot, a helpful AI assistant for students. Provide accurate, educational, and supportive responses to help students learn and succeed in their studies.",
    },
    ...chatHistory,
    {
      role: "user",
      content: userMessage,
    },
  ]

  return callDakaeiApi(messages)
}
