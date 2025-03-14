import { type NextRequest, NextResponse } from "next/server"
import {LanguageModel, LanguageModelV1, streamObject} from 'ai'
import { 
  createOpenAIClient, 
  prepareMessages, 
  questionSchema
} from '../utils'
import { GenerateQuestionParams } from "@/lib/types"
import { getQuestionPrompt } from "@/lib/server/prompt"

export async function POST(req: NextRequest) {
  try {
    const params: GenerateQuestionParams = await req.json()
    const { type, category, difficulty, customSettings, customPrompt } = params;

    const {userPrompt, systemPrompt} = getQuestionPrompt(type, category, difficulty, customPrompt)

    const { client, model } = createOpenAIClient(customSettings)
    const completion: LanguageModelV1 = client.chat(model)
    
    const messages = prepareMessages(userPrompt, systemPrompt)
    
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: questionSchema,
      messages,
      temperature: 0.7,
      mode: "json",
    })

    return new Response(result.textStream)
  } catch (error: any) {
    console.error("Error in question API route:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request" },
      { status: 500 },
    )
  }
}
