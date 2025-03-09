"use client"

import { cleanupJsonResponse } from "./utils"

// Default server-side settings (will be loaded from environment variables on the server)
const DEFAULT_OPENAI_MODEL = "gpt-4"

// Helper function to get custom settings from localStorage
function getCustomSettings() {
  if (typeof window === "undefined") return null

  const endpoint = localStorage.getItem("openai_endpoint") || undefined
  const model = localStorage.getItem("openai_model") || undefined
  const token = localStorage.getItem("openai_token") || undefined

  // Only return settings that are actually set
  const settings: Record<string, string> = {}
  if (endpoint) settings.endpoint = endpoint
  if (model) settings.model = model
  if (token) settings.token = token

  return Object.keys(settings).length > 0 ? settings : null
}

// Function to call our backend API endpoint
export async function callOpenAI(prompt: string, systemPrompt?: string, onStream?: (chunk: string) => void) {
  try {
    const customSettings = getCustomSettings()

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        customSettings,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Failed to call OpenAI API")
    }

    // If we have a streaming handler, process the stream
    if (onStream && response.body) {
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false
      let accumulatedText = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading

        if (value) {
          const chunkText = decoder.decode(value)
          accumulatedText += chunkText
          onStream(accumulatedText)
        }
      }

      return accumulatedText
    } else {
      // Non-streaming response
      const text = await response.text()
      return text
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    throw error
  }
}

export async function evaluateAnswer(
  question: any,
  userAnswer: string,
  language: string,
  onStream?: (chunk: string) => void,
) {
  const systemPrompt = `You are an expert technical interviewer. Evaluate the candidate's answer to the following question. 
  Provide a score from 0 to 1 for correctness, efficiency, and readability. 
  Also provide feedback and improvement suggestions. 
  IMPORTANT: Do not wrap your response in markdown code blocks like \`\`\`json or any other format.
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
    let finalResult = ""

    // If we have a streaming handler, use it
    if (onStream) {
      finalResult = await callOpenAI(prompt, systemPrompt, (chunk) => {
        try {
          // Try to parse the JSON as it comes in
          // This might fail for partial chunks, which is expected
          console.log(chunk)
          const parsedJson = JSON.parse(chunk)
          onStream(chunk)
        } catch (e) {
          // If parsing fails, just pass the raw chunk
          onStream(chunk)
        }
      })
    } else {
      finalResult = await callOpenAI(prompt, systemPrompt)
    }

    // Clean up the final result before parsing
    const cleanedResult = cleanupJsonResponse(finalResult);
    console.log(cleanedResult)
    return JSON.parse(cleanedResult);
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

export async function getModelAnswer(question: any, language: string, onStream?: (chunk: string) => void) {
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
    let finalResult = ""

    // If we have a streaming handler, use it
    if (onStream) {
      finalResult = await callOpenAI(prompt, systemPrompt, onStream)
    } else {
      finalResult = await callOpenAI(prompt, systemPrompt)
    }

    // Clean up the final result before parsing
    const cleanedResult = cleanupJsonResponse(finalResult);
    return cleanedResult;
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

export async function generateQuestion(type: string, category: string, difficulty: string, language: string = 'en') {
  const systemPrompt = `You are an expert at creating technical interview questions. 
  Generate a new ${type} question in the ${category} category with ${difficulty} difficulty.
  The question should be challenging but solvable within a reasonable time frame.
  Return your response in JSON format exactly matching the structure provided, with no additional text.`

  const prompt = `
  Create a new technical interview question with the following parameters:
  - Type: (e.g., Must be "Coding" or "Question")
  - Category: (e.g., "Algorithms", "TCP", "Data Structures", etc.)
  - Difficulty: (e.g., Must be "Easy", "Medium", "Hard")
  
  Generate a question that follows this exact JSON structure:
  {
    "id": "generated_unique_id",
    "type": "",
    "category": "",
    "difficulty": "",
    "translations": {
      "en": {
        "title": "English title here",
        "description": "Detailed English description here",
        "topic": "Relevant topic here"
      },
      "zh": {
        "title": "Chinese title here",
        "description": "Detailed Chinese description here",
        "topic": "Relevant topic in Chinese here"
      }
    }${type === 'Coding' ? `,
    "testCases": [
      { "input": "example input 1", "output": "expected output 1" },
      { "input": "example input 2", "output": "expected output 2" }
    ]` : ''}
  }
  
  Make sure the question is appropriate for the difficulty level and category specified.
  `

  try {
    const result = await callOpenAI(prompt, systemPrompt)
    const cleanedResult = cleanupJsonResponse(result)
    
    // Parse the result to ensure it's valid JSON
    const questionData = JSON.parse(cleanedResult)
    
    // Generate a more reliable unique ID
    questionData.id = `generated_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    
    return questionData
  } catch (error) {
    console.error("Error generating question:", error)
    throw new Error("Failed to generate question. Please check your API settings and try again.")
  }
}

