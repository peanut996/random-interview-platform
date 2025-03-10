import { generateQuestion } from "./api"
import {Question, QuestionCategory, QuestionDifficulty, QuestionType} from "./types"

// In-memory storage for generated questions
let generatedQuestions: Question[] = []

export async function generateRandomQuestion(): Promise<Question> {
  const type = Object.keys(QuestionType).filter(key => isNaN(Number(key))) as QuestionType[]
  const allCategories = Object.keys(QuestionCategory).filter(key => isNaN(Number(key))) as QuestionCategory[]
  const difficulty = Object.keys(QuestionDifficulty).filter(key => isNaN(Number(key))) as QuestionDifficulty[]
  
  // 获取用户选择的分类
  const selectedCategoriesStr = localStorage.getItem('selected_categories')
  const selectedCategories = selectedCategoriesStr ? JSON.parse(selectedCategoriesStr) : []
  
  // 如果用户选择了分类，则使用选择的分类；否则随机选择一个分类
  let categoryToUse: string[]
  if (selectedCategories.length > 0) {
    categoryToUse = selectedCategories
  } else {
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)]
    categoryToUse = [randomCategory]
  }
  
  const randomType = type[Math.floor(Math.random() * type.length)]
  const randomDifficulty = difficulty[Math.floor(Math.random() * difficulty.length)]
  
  return await generateQuestion(randomType, categoryToUse, randomDifficulty)
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question)
}
