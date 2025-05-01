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
        // model: "deepseek-chat",
        model: "qwen3-32b",
        messages,
        stream: true,
      }),
    })

    // Handle streaming response
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";
      let result = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        let lines = buffer.split("\n");
        buffer = lines.pop()!; // last line may be incomplete
        for (let line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              done = true;
              break;
            }
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta;
              if (delta?.content) {
                result += delta.content;
              }
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
      return result;
    } else {
      // fallback to normal JSON response
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }
      const data: ApiResponse = await response.json();
      return data.choices[0].message.content;
    }
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
      content: "You are IntelliBot, a helpful AI assistant for students. Respond quickly and concisely, prioritizing clarity.\n\nFormatting Guidelines:\n- Avoid using LaTeX syntax, including backslashes (\\), dollar signs ($), and environments like \\begin{align*}...\\end{align*}.\n- Do not use decorative symbols such as:\n  - Triple hashes (###)\n  - Asterisks (****)\n  - Backticks (```) \n  - Tildes (~~~)\n  - Angle brackets (<> or <<>>)\n  - Curly braces ({})\n  - Vertical bars (|)\n  - Square brackets ([])\n  - Underscores (_)\n  - Equal signs (===)\n  - Dashes (---)\n  - Arrows (e.g., ->, <-, =>)\n- Present information using clear, human-friendly formatting:\n  - Use plain text for mathematical expressions.\n  - Organize content with headings and bullet points.\n  - Separate sections with simple line breaks.\n- Ensure all responses are easy to read and understand, avoiding unexplained symbols or complex formatting.\n- Whenever you introduce yourself or mention your name, always format 'IntelliBot' in bold using double asterisks (e.g., **IntelliBot**).\n\nWhen you see mathematical expressions in LaTeX (such as align* environments or within \\[ ... \\]), convert them to plain text or easy-to-read lists. Replace decorative symbols with clear, human-friendly formatting such as headings, bullet points, or separators. Never output raw LaTeX or unexplained symbols. Always make your answers easy to read and understand."
    },
    ...chatHistory,
    {
      role: "user",
      content: userMessage
    }
  ];

  return callDakaeiApi(messages);
}
