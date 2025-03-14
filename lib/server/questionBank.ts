import fs from 'fs';
import path from 'path';
import { QuestionType, QuestionDifficulty, QuestionCategories } from '@/lib/types';
import { caseInsensitiveEqual } from '../utils';

// Define the structure for QuestionBank items
export interface QuestionBankItem {
  title: string;
  type: QuestionType;
  category: string[];
  difficulty: QuestionDifficulty;
  questionTitle: string;
}

// Path to the JSON file that contains question bank data
const questionBankPath = path.join(process.cwd(), 'data', 'questionBank.json');

// Function to load questions from the question bank
async function loadQuestionBank(): Promise<QuestionBankItem[]> {
  try {
    // Check if the file exists
    if (!fs.existsSync(questionBankPath)) {
      // Create an empty question bank file if it doesn't exist
      fs.writeFileSync(questionBankPath, JSON.stringify([], null, 2));
      return [];
    }

    // Read the file
    const data = fs.readFileSync(questionBankPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading question bank:', error);
    return [];
  }
}

// Function to find a matching question based on type, category, and difficulty
export async function findMatchingQuestion(
  type: QuestionType,
  category: QuestionCategories,
  difficulty: QuestionDifficulty
): Promise<QuestionBankItem | null> {
  try {
    const questions = await loadQuestionBank();

    // Filter questions based on criteria
    const matchingQuestions = questions.filter(question => {
      // Match type
      if (!caseInsensitiveEqual(type, question.type)) return false;

      // Match difficulty
      if (!caseInsensitiveEqual(difficulty, question.difficulty)) return false;

      // Match category with case-insensitive comparison
      if (!question.category.some(cat => caseInsensitiveEqual(cat, category))) return false;

      return true;
    });

    // If no matching questions, return null
    if (matchingQuestions.length === 0) {
      return null;
    }

    // Return a random matching question
    return matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
  } catch (error) {
    console.error('Error finding matching question:', error);
    return null;
  }
}

// Function to save a new question to the question bank
export async function addQuestionToBank(question: QuestionBankItem): Promise<boolean> {
  try {
    const questions = await loadQuestionBank();

    // Check if a similar question already exists using case-insensitive comparison
    const exists = questions.some(q =>
      caseInsensitiveEqual(q.questionTitle, question.questionTitle)
    );

    if (!exists) {
      questions.push(question);
      fs.writeFileSync(questionBankPath, JSON.stringify(questions, null, 2));
    }

    return !exists; // Return true if the question was added, false if it already existed
  } catch (error) {
    console.error('Error adding question to bank:', error);
    return false;
  }
}
