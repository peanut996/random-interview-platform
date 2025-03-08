// Create a new file for API calls that use the OpenAI settings
"use client"

// Default server-side settings (will be loaded from environment variables)
const DEFAULT_OPENAI_ENDPOINT = process.env.NEXT_PUBLIC_OPENAI_ENDPOINT || "https://api.openai.com/v1"
const DEFAULT_OPENAI_MODEL = process.env.NEXT_PUBLIC_OPENAI_MODEL || "gpt-4"

export async function callOpenAI(prompt: string, systemPrompt?: string) {
  try {
    // First try to get settings from localStorage (user preferences)
    const endpoint = localStorage.getItem("openai_endpoint") || DEFAULT_OPENAI_ENDPOINT
    const model = localStorage.getItem("openai_model") || DEFAULT_OPENAI_MODEL

    // For token, first check localStorage, then fallback to environment variable
    let token = localStorage.getItem("openai_token")

    // If no token in localStorage, use the server-side token
    if (!token) {
      // In a real app, this would be a server-side API call to get the token
      // For this demo, we'll use the public env variable if available
      token = process.env.NEXT_PUBLIC_OPENAI_TOKEN || ""
    }

    if (!token) {
      throw new Error(
        "OpenAI API token not found. Please set it in the settings or configure server environment variables.",
      )
    }

    // Add a small delay to prevent rapid consecutive calls
    await new Promise((resolve) => setTimeout(resolve, 100))

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || "Failed to call OpenAI API")
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    throw error
  }
}

export async function evaluateAnswer(question: any, userAnswer: string, language: string) {
  const systemPrompt = `You are an expert technical interviewer. Evaluate the candidate's answer to the following question. 
  Provide a score from 0 to 1 for correctness, efficiency, and readability. 
  Also provide feedback and improvement suggestions. 
  Return your evaluation in JSON format with the following structure:
  {
    "overallScore": 0.85,
    "categoryScores": {
      "correctness": 0.9,
      "efficiency": 0.8,
      "readability": 0.85
    },
    "feedback": {
      "en": "English feedback here",
      "zh": "Chinese feedback here"
    },
    "improvementSuggestions": [
      {
        "en": "English suggestion 1",
        "zh": "Chinese suggestion 1"
      },
      {
        "en": "English suggestion 2",
        "zh": "Chinese suggestion 2"
      }
    ]
  }`

  const questionTitle = question.translations[language]?.title || question.translations.en.title
  const questionDescription = question.translations[language]?.description || question.translations.en.description

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ""}
  
  User's Answer:
  ${userAnswer}
  
  Evaluate this answer and provide your assessment in the required JSON format.
  `

  try {
    const result = await callOpenAI(prompt, systemPrompt)
    return JSON.parse(result)
  } catch (error) {
    console.error("Error evaluating answer:", error)
    // Return a fallback evaluation if API call fails
    return {
      overallScore: 0.5,
      categoryScores: {
        correctness: 0.5,
        efficiency: 0.5,
        readability: 0.5,
      },
      feedback: {
        en: "We couldn't evaluate your answer due to an error. Please check your OpenAI API settings.",
        zh: "由于错误，我们无法评估您的答案。请检查您的 OpenAI API 设置。",
      },
      improvementSuggestions: [
        {
          en: "Make sure your OpenAI API token is correct in the settings.",
          zh: "确保您在设置中的 OpenAI API 令牌正确。",
        },
      ],
    }
  }
}

export async function getModelAnswer(question: any, language: string) {
  const systemPrompt = `You are an expert in technical interviews. Provide a model answer to the following question.
  Your answer should be clear, efficient, and follow best practices.
  If it's a coding question, include well-commented code.
  If it's a conceptual question, provide a comprehensive explanation.
  Return your answer in both English and Chinese.`

  const questionTitle = question.translations[language]?.title || question.translations.en.title
  const questionDescription = question.translations[language]?.description || question.translations.en.description

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ""}
  
  Provide a model answer to this question in both English and Chinese.
  Format your response as a JSON object with this structure:
  {
    "answer": {
      "en": "Your English answer here",
      "zh": "Your Chinese answer here"
    }
  }
  `

  try {
    const result = await callOpenAI(prompt, systemPrompt)
    return JSON.parse(result)
  } catch (error) {
    console.error("Error getting model answer:", error)
    // Return a fallback answer if API call fails
    return {
      answer: {
        en: "We couldn't generate a model answer due to an error. Please check your OpenAI API settings.",
        zh: "由于错误，我们无法生成模型答案。请检查您的 OpenAI API 设置。",
      },
    }
  }
}

