import { type NextRequest, NextResponse } from 'next/server';
import { LanguageModel, LanguageModelV1, streamText } from 'ai';
import { createOpenAIClient, prepareMessages } from '../utils';

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, customSettings } = await req.json();

    // Create OpenAI client
    const { client, model } = createOpenAIClient(customSettings);
    const completion: LanguageModelV1 = client.chat(model);

    // Prepare messages for markdown response (no JSON schema)
    const messages = prepareMessages(prompt, systemPrompt, false);

    // For text/markdown response, use the raw completion without schema validation
    const result = await streamText({
      model: completion as LanguageModel,
      messages,
      temperature: 0.7,
    });

    return new Response(result.textStream);
  } catch (error: any) {
    console.error('Error in model answer text API route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
