'use client';

import {
  CustomSettings,
  GenerateQuestionParams,
  QuestionCategories,
  QuestionDifficulty,
  QuestionType,
} from './types';
import { jsonrepair } from 'jsonrepair';

function getCustomSettings(): CustomSettings | null {
  if (typeof window === 'undefined') return null;

  const endpoint = localStorage.getItem('openai_endpoint') || undefined;
  const model = localStorage.getItem('openai_model') || undefined;
  const token = localStorage.getItem('openai_token') || undefined;

  // Only return settings that are actually set
  const settings: CustomSettings = {};
  if (endpoint) settings.endpoint = endpoint;
  if (model) settings.model = model;
  if (token) settings.token = token;

  return Object.keys(settings).length > 0 ? settings : null;
}

// Helper function to get custom system prompts
function getCustomSystemPrompt(type: 'question' | 'answer'): string | undefined {
  if (typeof window === 'undefined') return undefined;

  const key = type === 'question' ? 'system_prompt_question' : 'system_prompt_answer';
  const customPrompt = localStorage.getItem(key);

  return customPrompt || undefined;
}

export async function generateQuestion(
  type: QuestionType,
  category: QuestionCategories,
  difficulty: QuestionDifficulty,
  onStream?: (chunk: string) => void
) {
  try {
    const customSettings = getCustomSettings();
    const customSystemPrompt = getCustomSystemPrompt('question');
    const generatedQuestionParam: GenerateQuestionParams = {
      customSettings: customSettings ?? undefined,
      category,
      difficulty,
      type,
      useQuestionBank: false,
      customPrompt: customSystemPrompt
        ? {
            systemPrompt: customSystemPrompt,
          }
        : undefined,
    };

    const response = await fetch('/api/question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generatedQuestionParam),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to call AI API');
    }

    // If we have a streaming handler, process the stream
    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkText = decoder.decode(value);
          accumulatedText += chunkText;
          onStream(accumulatedText);
        }
      }

      return accumulatedText;
    } else {
      // Non-streaming response
      const text = await response.text();
      return text;
    }
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate question. Please check your API settings and try again.');
  }
}

// Function to call our backend API endpoint
export async function callLanguageModel(
  prompt: string,
  systemPrompt?: string,
  onStream?: (chunk: string) => void,
  requestType?: string
) {
  try {
    const customSettings = getCustomSettings();

    // Determine the API endpoint based on requestType
    let endpoint = '/api/question'; // Default is now /api/question

    switch (requestType) {
      case 'modelAnswer':
        endpoint = '/api/model-answer';
        break;
      case 'modelAnswerText':
        endpoint = '/api/model-answer-text';
        break;
      case 'evaluation':
        endpoint = '/api/evaluation';
        break;
      // Default case is now "/api/question"
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemPrompt,
        customSettings,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to call AI API');
    }

    // If we have a streaming handler, process the stream
    if (onStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkText = decoder.decode(value);
          accumulatedText += chunkText;
          onStream(accumulatedText);
        }
      }

      return accumulatedText;
    } else {
      // Non-streaming response
      const text = await response.text();
      return text;
    }
  } catch (error) {
    console.error('Error calling language model:', error);
    throw error;
  }
}

export async function evaluateAnswer(
  question: any,
  userAnswer: string,
  language: string,
  onStream?: (chunk: string) => void
) {
  const systemPrompt = `You are an expert technical interviewer. Evaluate the candidate's answer to the following question. 
  Provide a score from 0 to 1 for correctness, efficiency, and readability. 
  Also provide feedback and improvement suggestions. 
  
  IMPORTANT: Return pure, parseable JSON without any markdown formatting. DO NOT wrap your response in code blocks with backticks (\`\`\`json or any other format). 
  The response MUST be directly parseable as JSON without any cleanup needed.
  Ensure all special characters in strings are properly escaped according to JSON standards.
  
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
  }`;

  const questionTitle = question.translations[language]?.title || question.translations.en.title;
  const questionDescription =
    question.translations[language]?.description || question.translations.en.description;

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ''}
  
  User's Answer:
  ${userAnswer}
  
  Evaluate this answer and provide your assessment in the required JSON format.
  `;

  try {
    let finalResult = '';

    // If we have a streaming handler, use it
    if (onStream) {
      finalResult = await callLanguageModel(
        prompt,
        systemPrompt,
        chunk => {
          onStream(chunk);
        },
        'evaluation'
      );
    } else {
      finalResult = await callLanguageModel(prompt, systemPrompt, undefined, 'evaluation');
    }

    try {
      return JSON.parse(jsonrepair(finalResult));
    } catch (error) {
      console.error('JSON parse error:', error);
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('Error evaluating answer:', error);
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
        zh: '由于错误，我们无法评估您的答案。请检查您的 OpenAI API 设置。',
      },
      improvementSuggestions: [
        {
          en: 'Make sure your OpenAI API token is correct in the settings.',
          zh: '确保您在设置中的 OpenAI API 令牌正确。',
        },
      ],
    };
  }
}

export async function getModelAnswer(
  question: any,
  language: string,
  onStream?: (chunk: string) => void,
  codeLanguage?: string
) {
  // Use custom system prompt if available
  const customSystemPrompt = getCustomSystemPrompt('answer');

  const systemPrompt =
    customSystemPrompt ||
    `You are an expert in technical interviews. Provide a model answer to the following question.
  Your answer should be clear, efficient, and follow best practices.
  If it's a coding question, include well-commented code.
  If it's a conceptual question, provide a comprehensive explanation.
  
  IMPORTANT: You should format your response as markdown text. Use markdown features like **bold**, *italic*, code blocks with \`\`\` for code examples, and other formatting to make your answer clear and readable.
  When including code examples, use proper markdown code blocks with language specification, e.g. \`\`\`javascript.
  DO NOT wrap your entire response in a markdown code block. Your response should be pure markdown without outer \`\`\`markdown tags.
  ${codeLanguage ? `\n\nIf code is required in the answer, prefer to use ${codeLanguage} programming language unless the question specifically requires a different language.` : ''}`;

  const questionTitle = question.translations[language]?.title || question.translations.en.title;
  const questionDescription =
    question.translations[language]?.description || question.translations.en.description;

  // Determine language for the output
  const outputLanguage = language === 'zh' ? 'Chinese' : 'English';
  const languageComment = language === 'zh' ? '请用中文回答' : 'Please answer in English';

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ''}
  ${codeLanguage ? `\nPreferred Code Language: ${codeLanguage}\n` : ''}
  
  ${languageComment}. Provide a model answer to this question in ${outputLanguage}.
  Format your response as markdown text with appropriate formatting.
  IMPORTANT: DO NOT wrap your entire response in a markdown code block with \`\`\`markdown tags. Just provide the raw markdown content.
  `;

  try {
    let finalResult = '';

    // If we have a streaming handler, use it
    if (onStream) {
      finalResult = await callLanguageModel(
        prompt,
        systemPrompt,
        chunk => {
          // Clean the markdown tags from each chunk before sending to stream handler
          onStream(chunk);
        },
        'modelAnswerText'
      );
    } else {
      finalResult = await callLanguageModel(prompt, systemPrompt, undefined, 'modelAnswerText');
    }

    // Return the raw markdown text directly
    return finalResult;
  } catch (error) {
    console.error('Error getting model answer:', error);
    // Return a fallback answer if API call fails
    const fallbackMessage =
      language === 'zh'
        ? '由于错误，我们无法生成模型答案。请检查您的 OpenAI API 设置。'
        : "We couldn't generate a model answer due to an error. Please check your OpenAI API settings.";

    return fallbackMessage;
  }
}
