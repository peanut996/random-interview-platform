import { QuestionType, QuestionCategories, QuestionDifficulty, CustomPrompt } from "@/lib/types";


const defaultQuestionSystemPrompt = (type: string, category: string, difficulty: string) => `You are an expert at creating technical interview questions. 
  Generate a new ${type} question in the ${category} category with ${difficulty} difficulty.
  The question should be challenging but solvable within a reasonable time frame.
  
  IMPORTANT: Return pure, parseable JSON without any markdown formatting. DO NOT wrap your response in code blocks with backticks (\`\`\`json or any other format).
  The response MUST be directly parseable as JSON without any cleanup needed.
  Ensure all special characters in strings are properly escaped according to JSON standards.
  
  When creating coding questions with test cases, format the input as a plain string rather than a JSON object.
  For example, use 'a = "helloworld", b = "world"' rather than {a: "helloworld", b: "world"}.
  
  IMPORTANT: If a test case output is a string, you MUST enclose it in additional double quotes and escape them properly in JSON.
  For example: 
  - For string output "hello": { "input": "some input", "output": "\"hello\"" }
  - For empty string: { "input": "some input", "output": "\"\"" }
  - For numbers: { "input": "some input", "output": "42" } (no extra quotes for numbers)
  
  DO NOT leave string outputs without proper double quotes. Only add the extra quotes for string outputs, not for numbers or other types.
  
  Return your response in JSON format exactly matching the structure provided, with no additional text.`;


const defaultQuestionUserPrompt = (type: string, category: string, difficulty: string) => `
  Create a new technical interview question with the following parameters:
  - Type: ${type} (e.g., "Coding" or "Question")
  - Category: ${category} (e.g., "Algorithms", "TCP", "Data Structures", etc.)
  - Difficulty: ${difficulty} (e.g., "Easy", "Medium", "Hard")
  
  Generate a question that follows this exact JSON structure:
  {
    "id": "generated_unique_id",
    "type": "${type}",
    "category": "${category}", // Use the first category as primary
    "difficulty": "${difficulty}",
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
      { "input": "a = \"helloworld\", b = \"world\"", "output": "\"world\"" },
      {"input": "a = \"programming\", b = \"prog\"", "output": "\"prog\"" },
      { "input": "x = 5, y = 10", "output": "50" },
      { "input": "str = \"\"", "output": "\"\"" },
      { "input": "", "output": "\"\"" }
    ]` : ''}
  }
  
  Make sure the question is appropriate for the difficulty level and incorporates concepts from all the specified categories.
  If multiple categories are provided, create a question that combines elements from these categories.
  
  IMPORTANT: For test cases where the output is a string, ALWAYS enclose the output in additional double quotes:
  - For string output: "output": "\"hello\""
  - For empty string: "output": "\"\""
  - For number output: "output": "42" (no extra quotes for numbers)
  
  Pay careful attention to the data type of the expected output and format it accordingly.
  `

export const getQuestionPrompt = (type: QuestionType, category: QuestionCategories, difficulty: QuestionDifficulty,
    customPrompt?: CustomPrompt) => {
    const { userPrompt: customUserPrompt, systemPrompt: customSystemPrompt  } = customPrompt || {};

    const systemPrompt = customSystemPrompt || defaultQuestionSystemPrompt(type, category, difficulty);
    const userPrompt = customUserPrompt || defaultQuestionUserPrompt(type, category, difficulty);

    return { systemPrompt, userPrompt };
}