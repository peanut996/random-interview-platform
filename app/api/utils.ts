import { createOpenAI } from '@ai-sdk/openai';
import { MessageRole } from '@/lib/types';
import { z } from 'zod';

// Schema definitions
export const translationSchema = z.record(
  z.object({
    title: z.string(),
    description: z.string(),
    topic: z.string(),
  })
);

export const testCaseSchema = z
  .array(
    z.object({
      input: z.any(),
      output: z.any(),
    })
  )
  .optional();

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['Coding', 'Question']),
  category: z.string(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  translations: translationSchema,
  testCases: testCaseSchema,
});

export const modelAnswerSchema = z.object({
  answer: z.object({
    en: z.string(),
    zh: z.string(),
  }),
});

export const evaluationResultSchema = z.object({
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
});

export const DEFAULT_OPENAI_API_KEY = process.env.OPENAI_TOKEN || '';
export const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4';
export const DEFAULT_OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || 'https://api.openai.com/v1';

export function prepareMessages(prompt: string, systemPrompt?: string, useJsonSchema = true) {
  const enhancedSystemPrompt = useJsonSchema
    ? systemPrompt
      ? `${systemPrompt}\n\nIMPORTANT: Return a valid structured object according to the provided schema. DO NOT use markdown formatting such as code blocks with backticks (\`\`\`). The response must be pure, parseable JSON without any markdown formatting or extra text surrounding it. Ensure all special characters in strings are properly escaped according to JSON standards.`
      : 'IMPORTANT: Return a valid structured object according to the provided schema. DO NOT use markdown formatting such as code blocks with backticks (```). The response must be pure, parseable JSON without any markdown formatting or extra text surrounding it. Ensure all special characters in strings are properly escaped according to JSON standards.'
    : systemPrompt
      ? `${systemPrompt}\n\nIMPORTANT: Format your response as pure markdown. DO NOT wrap your entire response in markdown code blocks with \`\`\`markdown tags. The output should be directly renderable as markdown.`
      : 'Format your response as pure markdown. DO NOT wrap your entire response in markdown code blocks with ```markdown tags. The output should be directly renderable as markdown.';

  return [
    { role: MessageRole.system, content: enhancedSystemPrompt },
    { role: MessageRole.user, content: prompt },
  ];
}

export function createOpenAIClient(customSettings?: any) {
  const apiKey = customSettings?.token || DEFAULT_OPENAI_API_KEY;
  const endpoint = customSettings?.endpoint || DEFAULT_OPENAI_ENDPOINT;

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return {
    client: createOpenAI({
      apiKey,
      baseURL: endpoint,
    }),
    model: customSettings?.model || DEFAULT_OPENAI_MODEL,
  };
}
