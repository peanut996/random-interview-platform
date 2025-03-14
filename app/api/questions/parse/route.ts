import { type NextRequest, NextResponse } from 'next/server';
import { LanguageModel, LanguageModelV1, streamObject } from 'ai';
import { createOpenAIClient, prepareMessages } from '../../utils';
import { z } from 'zod';
import { QuestionType, QuestionDifficulty } from '@/lib/types';

// Define the schema for the question parsing result
const questionParseSchema = z.object({
  type: z.enum([QuestionType.Coding.toString(), QuestionType.Question.toString()]),
  category: z.array(z.string()),
  difficulty: z.enum([
    QuestionDifficulty.Easy.toString(),
    QuestionDifficulty.Medium.toString(),
    QuestionDifficulty.Hard.toString(),
  ]),
  title: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Question title is required and must be a string' },
        { status: 400 }
      );
    }

    // System prompt for parsing a question
    const systemPrompt = `You are an AI assistant that helps categorize interview questions.
    Given a question title, determine:
    1. The type (Coding or Question)
    2. The category as an array of relevant categories (e.g., ["LeetCode","Array", "String", and etc])
    3. The difficulty level (Easy, Medium, or Hard)
    
    IMPORTANT: Return pure, parseable JSON without any markdown formatting. DO NOT wrap your response in code blocks with backticks (\`\`\`json or any other format).
    The response MUST be directly parseable as JSON without any cleanup needed.
    Ensure all special characters in strings are properly escaped according to JSON standards.
    Just return one candidate answer based on the given question title.`;

    // User prompt for parsing the question
    const userPrompt = `Parse the following interview question title and categorize it:
    "${title}"
    
    Return your analysis in the following JSON format:
    {
      "type": "Coding" or "Question",
      "category": ["Primary category", "Secondary category"...],
      "difficulty": "Easy" or "Medium" or "Hard",
      "title": "${title}"
    }`;

    // Create OpenAI client
    const { client, model } = createOpenAIClient();
    const completion: LanguageModelV1 = client.chat(model);

    const messages = prepareMessages(userPrompt, systemPrompt);

    // Use streamObject to parse the question with schema validation
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: questionParseSchema,
      messages,
      temperature: 0.3, // Lower temperature for more deterministic responses
      mode: 'json',
    });

    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in question parsing API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while processing your request';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
