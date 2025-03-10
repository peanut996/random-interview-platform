import { generateQuestion } from "./api"
import type { Question } from "./types"

// In-memory storage for generated questions
let generatedQuestions: Question[] = []

export async function generateRandomQuestion(): Promise<Question> {
  const type = ["Coding", "Question"]
  const category = ["Algorithms", "TCP", "Data Structures", "System Design", "Behavioral", "Java", "Operation System"]
  const difficulty = ["Easy", "Medium", "Hard"]
  const randomType = type[Math.floor(Math.random() * type.length)]
  const randomCategory = category[Math.floor(Math.random() * category.length)]
  const randomDifficulty = difficulty[Math.floor(Math.random() * difficulty.length)]
  return await generateQuestion(randomType, [randomCategory], randomDifficulty)
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question)
}
