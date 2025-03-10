import { generateQuestion } from "./api"
import {Question, QuestionCategory, QuestionDifficulty, QuestionType} from "./types"

// In-memory storage for generated questions
let generatedQuestions: Question[] = []

export async function generateRandomQuestion(): Promise<Question> {
  const type = Object.keys(QuestionType).filter(key => isNaN(Number(key))) as QuestionType[]
  const category =Object.keys(QuestionCategory).filter(key => isNaN(Number(key))) as QuestionCategory[]
  const difficulty =  Object.keys(QuestionDifficulty).filter(key => isNaN(Number(key))) as QuestionDifficulty[]
  const randomType = type[Math.floor(Math.random() * type.length)]
  const randomCategory = category[Math.floor(Math.random() * category.length)]
  const randomDifficulty = difficulty[Math.floor(Math.random() * difficulty.length)]
  return await generateQuestion(randomType, randomCategory, randomDifficulty)
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question)
}
