import { type NextRequest, NextResponse } from 'next/server';
import { LanguageModel, LanguageModelV1, streamObject } from 'ai';
import { createOpenAIClient, prepareMessages, evaluationResultSchema } from '../utils';

export async function POST(req: NextRequest) {
  try {
    const { prompt, systemPrompt, customSettings } = await req.json();

    // Create OpenAI client
    const { client, model } = createOpenAIClient(customSettings);
    const completion: LanguageModelV1 = client.chat(model);

    // Prepare messages with a JSON schema
    const messages = prepareMessages(prompt, systemPrompt);

    // Use evaluation schema
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: evaluationResultSchema,
      messages,
      temperature: 0.7,
      mode: 'json',
    });

    return new Response(result.textStream);
  } catch (error: any) {
    console.error('Error in evaluation API route:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
