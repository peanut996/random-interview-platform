import { generateQuestion } from "./api";
import {
  Question,
  QuestionCategory,
  QuestionDifficulty,
  QuestionType,
} from "./types";

// In-memory storage for generated questions
let generatedQuestions: Question[] = [];

export async function generateRandomQuestion(): Promise<Question> {
  // Load settings from localStorage, with defaults
  const savedQuestionType = localStorage.getItem("question_type") || "";
  const savedQuestionCategory = localStorage.getItem("question_category") || "";
  const savedQuestionDifficulty =
    localStorage.getItem("question_difficulty") || "";

  // Define possible values for each setting, based on enums in types.ts.
  const types = Object.keys(QuestionType).filter((key) =>
    isNaN(Number(key)),
  ) as QuestionType[];
  const allCategories = Object.keys(QuestionCategory).filter((key) =>
    isNaN(Number(key)),
  ) as QuestionCategory[];
  const difficulties = Object.keys(QuestionDifficulty).filter((key) =>
    isNaN(Number(key)),
  ) as QuestionDifficulty[];

  const questionType = savedQuestionType || types[Math.random() * types.length];
  const questionCategory =
    savedQuestionCategory ||
    allCategories[Math.floor(Math.random() * allCategories.length)];
  const questionDifficulty =
    savedQuestionDifficulty ||
    difficulties[Math.floor(Math.random() * difficulties.length)];

  return await generateQuestion(
    questionType,
    questionCategory,
    questionDifficulty,
  );
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question);
}
