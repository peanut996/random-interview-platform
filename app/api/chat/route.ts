import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from '@ai-sdk/openai'
import {LanguageModel, LanguageModelV1, streamObject, streamText} from 'ai'
import { z } from 'zod'
import { Message, MessageRole } from "@/lib/types"

// Define the schema for the Question object
const translationSchema = z.record(z.object({
  title: z.string(),
  description: z.string(),
  topic: z.string(),
}))

const testCaseSchema = z.array(z.object({
  input: z.any(),
  output: z.any(),
})).optional()

const questionSchema = z.object({
  id: z.string(),
  type: z.enum(["Coding", "Question"]),
  category: z.string(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  translations: translationSchema,
  testCases: testCaseSchema,
})

// Define the schema for model answers
const modelAnswerSchema = z.object({
  answer: z.object({
    en: z.string(),
    zh: z.string(),
  }),
})

const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_TOKEN || ""
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4"
const DEFAULT_OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1"


// Define the schema for evaluation results
const evaluationResultSchema = z.object({
  overallScore: z.number().min(0).max(1),
  categoryScores: z.object({
    correctness: z.number().min(0).max(1),
    efficiency: z.number().min(0).max(1),
    readability: z.number().min(0).max(1),
  }),
  feedback: z.object({
    en: z.string(),
    zh: z.string(),
  }),
  improvementSuggestions: z.array(
    z.object({
      en: z.string(),
      zh: z.string(),
    })
  ),
})


export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, customSettings, requestType = "question" } = await req.json()

    // Use custom settings if provided, otherwise use defaults
    const apiKey = customSettings?.token || DEFAULT_OPENAI_API_KEY
    const model = customSettings?.model || DEFAULT_OPENAI_MODEL
    const endpoint = customSettings?.endpoint || DEFAULT_OPENAI_ENDPOINT

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // Update system prompt to reflect we're using structured data
    const enhancedSystemPrompt = requestType === "modelAnswerText"
      ? systemPrompt ? 
        `${systemPrompt}\n\nIMPORTANT: Format your response as pure markdown. DO NOT wrap your entire response in markdown code blocks with \`\`\`markdown tags. The output should be directly renderable as markdown.` 
        : "Format your response as pure markdown. DO NOT wrap your entire response in markdown code blocks with ```markdown tags. The output should be directly renderable as markdown."
      : systemPrompt 
        ? `${systemPrompt}\n\nIMPORTANT: Return a valid structured object according to the provided schema. DO NOT use markdown formatting such as code blocks with backticks (\`\`\`). The response must be pure, parseable JSON without any markdown formatting or extra text surrounding it. Ensure all special characters in strings are properly escaped according to JSON standards.`
        : "IMPORTANT: Return a valid structured object according to the provided schema. DO NOT use markdown formatting such as code blocks with backticks (```). The response must be pure, parseable JSON without any markdown formatting or extra text surrounding it. Ensure all special characters in strings are properly escaped according to JSON standards.";

    const messages = [
      { role: MessageRole.system, content: enhancedSystemPrompt },
      { role: MessageRole.user, content: prompt },
    ]
    const openaiClient = createOpenAI({
      apiKey,
      baseURL: endpoint,
    });
    const completion: LanguageModelV1 = openaiClient.chat(model)
    
    let streamResult = await streamChatCompletion(requestType, completion, messages)

    return new Response(streamResult)
  } catch (error: any) {
    console.error("Error in OpenAI API route:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}

async function streamChatCompletion(requestType: string, completion: LanguageModelV1 , messages: Message[]) {
  let streamResult

  if (requestType === "modelAnswer") {
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: modelAnswerSchema,
      messages,
      temperature: 0.7,
      mode: "json",
    })
    streamResult = result.textStream
  } else if (requestType === "modelAnswerText") {
    // For text/markdown response, use the raw completion without schema validation
    const result = await streamText({
      model: completion as LanguageModel,
      messages,
      temperature: 0.7,
    })
    streamResult = result.textStream
  } else if (requestType === "evaluation") {
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: evaluationResultSchema,
      messages,
      temperature: 0.7,
      mode: "json",
    })
    streamResult = result.textStream
  } else {
    // Default to question schema
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: questionSchema,
      messages,
      temperature: 0.7,
      mode: "json",
    })
    streamResult = result.textStream
  }
  return streamResult
}

