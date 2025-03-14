import { type NextRequest, NextResponse } from 'next/server';
import { LanguageModel, LanguageModelV1, streamObject } from 'ai';
import { createOpenAIClient, prepareMessages, questionSchema } from '../utils';
import { GenerateQuestionParams } from '@/lib/types';
import { getQuestionPrompt } from '@/lib/server/prompt';
import { findMatchingQuestion } from '@/lib/server/questionBank';

export async function POST(req: NextRequest) {
  try {
    const params: GenerateQuestionParams = await req.json();
    const { type, category, difficulty, customSettings, customPrompt, useQuestionBank } = params;

    // Check if we should use the QuestionBank
    if (useQuestionBank) {
      try {
        // Try to find a matching question from the QuestionBank
        const matchingQuestion = await findMatchingQuestion(type, category, difficulty);

        if (matchingQuestion) {
          // Use the existing AI infrastructure to enhance the question
          const { userPrompt, systemPrompt } = getQuestionPrompt(
            type,
            category,
            difficulty,
            customPrompt,
            matchingQuestion.title
          );

          const { client, model } = createOpenAIClient(customSettings);
          const completion: LanguageModelV1 = client.chat(model);

          const messages = prepareMessages(userPrompt, systemPrompt);

          const result = await streamObject({
            model: completion as LanguageModel,
            schema: questionSchema,
            messages,
            temperature: 0.7,
            mode: 'json',
          });

          return new Response(result.textStream);
        }
      } catch (bankError) {
        // Log the error but continue with the original logic as fallback
        console.error('Error using QuestionBank:', bankError);
      }
    }

    // Original question generation logic (fallback)
    const { userPrompt, systemPrompt } = getQuestionPrompt(
      type,
      category,
      difficulty,
      customPrompt
    );

    const { client, model } = createOpenAIClient(customSettings);
    const completion: LanguageModelV1 = client.chat(model);

    const messages = prepareMessages(userPrompt, systemPrompt);

    const result = await streamObject({
      model: completion as LanguageModel,
      schema: questionSchema,
      messages,
      temperature: 0.7,
      mode: 'json',
    });

    return new Response(result.textStream);
  } catch (error) {
    console.error('Error in question API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while processing your request';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
