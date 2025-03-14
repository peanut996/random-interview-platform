import { generateQuestion } from "./api";
import {
  Question,
  QuestionCategory,
  CodingCategory,
  QuestionDifficulty,
  QuestionType,
  QuestionCategories,
} from "./types";
import {jsonrepair} from "jsonrepair";

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

// In-memory storage for generated questions
let generatedQuestions: Question[] = [];

// In-memory storage for custom categories
const customCategories: { [key: string]: string[] } = {
  [QuestionType.Question]: [],
  [QuestionType.Coding]: []
};

// Function to save custom categories to localStorage
export function saveCustomCategories() {
  safeLocalStorage.setItem("custom_categories", JSON.stringify(customCategories));
}

// Function to load custom categories from localStorage
export function loadCustomCategories() {
  const saved = safeLocalStorage.getItem("custom_categories");
  if (saved) {
    try {
      const parsed = JSON.parse(jsonrepair(saved));
      Object.assign(customCategories, parsed);
    } catch (e) {
      console.error("Failed to parse custom categories", e);
    }
  }
}

if (typeof window !== 'undefined') {
  loadCustomCategories();
}
const getRandomQuestionShell = async (): Promise<{ type: QuestionType; category: QuestionCategories; difficulty: QuestionDifficulty; }> => {
    // Load settings from localStorage, with defaults
    const savedQuestionType = safeLocalStorage.getItem("question_type") || "all";
    const savedQuestionCategory = safeLocalStorage.getItem("question_category") || "all";
    const savedQuestionDifficulty =
      safeLocalStorage.getItem("question_difficulty") || "all";
  
    // Define possible values for each setting, based on enums in types.ts.
    const types = Object.keys(QuestionType).filter((key) =>
      isNaN(Number(key)),
    ) as QuestionType[];
    
    // Get standard categories from enums
    const questionCategories = Object.keys(QuestionCategory).filter((key) =>
      isNaN(Number(key)),
    ) as (keyof typeof QuestionCategory)[];
    
    const codingCategories = Object.keys(CodingCategory).filter((key) =>
      isNaN(Number(key)),
    ) as (keyof typeof CodingCategory)[];
    
    const difficulties = Object.keys(QuestionDifficulty).filter((key) =>
      isNaN(Number(key)),
    ) as QuestionDifficulty[];
  
    // Select random question type or use saved value
    const questionType = savedQuestionType === "all" ? 
      types[Math.floor(Math.random() * types.length)] : 
      savedQuestionType === "coding" ? QuestionType.Coding : QuestionType.Question;
    
    // Select category based on question type
    let questionCategory;
    
    if (savedQuestionCategory === "all") {
      // If no specific category is saved, pick randomly based on question type
      if (questionType === QuestionType.Coding) {
        // For coding questions, use coding categories + custom coding categories
        const allCodingCategories = [
          ...codingCategories.map(k => CodingCategory[k]),
          ...customCategories[QuestionType.Coding]
        ];
        questionCategory = allCodingCategories[Math.floor(Math.random() * allCodingCategories.length)];
      } else if (questionType === QuestionType.Question) {
        // For regular questions, use question categories + custom question categories
        const allQuestionCategories = [
          ...questionCategories.map(k => QuestionCategory[k]),
          ...customCategories[QuestionType.Question]
        ];
        questionCategory = allQuestionCategories[Math.floor(Math.random() * allQuestionCategories.length)];
      } else {
        // If no specific type is selected, pick randomly from all categories
        const allCategories = [
          ...questionCategories.map(k => QuestionCategory[k]),
          ...codingCategories.map(k => CodingCategory[k]),
          ...customCategories[QuestionType.Question],
          ...customCategories[QuestionType.Coding]
        ];
        questionCategory = allCategories[Math.floor(Math.random() * allCategories.length)];
      }
    } else if (savedQuestionCategory === "custom") {
      // If custom is selected, pick a random custom category from the appropriate type
      const type = savedQuestionType === "coding" ? QuestionType.Coding :
                   savedQuestionType === "question" ? QuestionType.Question :
                   types[Math.floor(Math.random() * types.length)];
                   
      const customCats = customCategories[type];
      
      if (customCats.length > 0) {
        // Pick a random custom category
        questionCategory = customCats[Math.floor(Math.random() * customCats.length)];
      } else {
        // Fallback to standard categories if no custom categories exist
        const standardCategories = type === QuestionType.Coding
          ? codingCategories.map(k => CodingCategory[k])
          : questionCategories.map(k => QuestionCategory[k]);
          
        questionCategory = standardCategories[Math.floor(Math.random() * standardCategories.length)];
      }
    } else {
      // Use the saved category
      questionCategory = savedQuestionCategory;
    }
  
    const questionDifficulty =
      savedQuestionDifficulty === "all" ?
      difficulties[Math.floor(Math.random() * difficulties.length)] :
      savedQuestionDifficulty as QuestionDifficulty;
  
    return {
      type: questionType,
      category: questionCategory,
      difficulty: questionDifficulty,
    };
  }

export async function generateRandomQuestion(onStream?: (chunk: any) => {}): Promise<Question> {
  const { type, category, difficulty } = await getRandomQuestionShell();

  try {
    const res: string = await generateQuestion(
      type,
      category,
      difficulty,
      onStream
    );

    const preprocessedResult = res
      .replace(/""""/g, "\"\\\"\\\"\"")
      .replace(/(?<!\\)""/g, "\"\\\"\\\"\"");

    return JSON.parse(jsonrepair(preprocessedResult))
  }catch(e){
    console.error("[Client] Error generating question", e);
    throw e;
  }
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question);
}

// Function to add custom category
export function addCustomCategory(type: QuestionType, category: string): void {
  if (!customCategories[type].includes(category)) {
    customCategories[type].push(category);
    saveCustomCategories();
  }
}

// Function to remove custom category
export function removeCustomCategory(type: QuestionType, category: string): void {
  const index = customCategories[type].indexOf(category);
  if (index !== -1) {
    customCategories[type].splice(index, 1);
    saveCustomCategories();
  }
}

// Function to get all categories for a specific question type
export function getCategoriesForType(type: QuestionType): string[] {
  const standard = type === QuestionType.Coding 
    ? Object.values(CodingCategory)
    : Object.values(QuestionCategory);
    
  return [...standard, ...customCategories[type]];
}
