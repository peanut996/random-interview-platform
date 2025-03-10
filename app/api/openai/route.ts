import { type NextRequest, NextResponse } from "next/server"
import { createOpenAI } from '@ai-sdk/openai'
import { LanguageModel, streamText } from 'ai'


// Default server-side settings from environment variables
const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_TOKEN || ""
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4"
const DEFAULT_OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1"

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, customSettings } = await req.json()

    // Use custom settings if provided, otherwise use defaults
    const apiKey = customSettings?.token || DEFAULT_OPENAI_API_KEY
    const model = customSettings?.model || DEFAULT_OPENAI_MODEL
    const endpoint = customSettings?.endpoint || DEFAULT_OPENAI_ENDPOINT

    if (!apiKey) {
      return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
    }

    // Add instruction to not use markdown code blocks in the system prompt
    const enhancedSystemPrompt = systemPrompt 
      ? `${systemPrompt}\n\nIMPORTANT: Do not wrap your response in markdown code blocks like \`\`\`json or any other format. Return raw JSON without any markdown formatting.`
      : "IMPORTANT: Do not wrap your response in markdown code blocks like ```json or any other format. Return raw JSON without any markdown formatting.";

    const messages = [
      { role: "system" as const, content: enhancedSystemPrompt },
      { role: "user" as const, content: prompt },
    ]
    const openaiClient = createOpenAI({
      apiKey,
      baseURL: endpoint,
    });
    const completion = openaiClient.chat(model)
    const { textStream } = await streamText({
      model: completion as LanguageModel,
      messages,
      temperature: 0.7,
    })

    return new Response(textStream)
  } catch (error: any) {
    console.error("Error in OpenAI API route:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}

