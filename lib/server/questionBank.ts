import fs from 'fs';
import path from 'path';
import { QuestionType, QuestionDifficulty, QuestionCategories } from '@/lib/types';
import { caseInsensitiveEqual } from '../utils';

let questionBank: QuestionBankItem[];

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
function loadQuestionBank() {
  if (questionBank && questionBank.length > 0) {
    return;
  }
  try {
    if (!fs.existsSync(questionBankPath)) {
      fs.writeFileSync(questionBankPath, JSON.stringify([], null, 2));
      console.log('[Server] Question bank file created:', questionBankPath);
      questionBank = [];
    }

    const data = fs.readFileSync(questionBankPath, 'utf8');
    questionBank = JSON.parse(data);
  } catch (error) {
    console.error('[Server] Error loading question bank:', error);
  }
}

// Function to find a matching question based on type, category, and difficulty
export async function findMatchingQuestionFromBank(
  type?: QuestionType,
  category?: QuestionCategories,
  difficulty?: QuestionDifficulty
): Promise<QuestionBankItem> {
  loadQuestionBank();
  if (!questionBank || questionBank.length === 0) {
    console.warn('[Server] Question bank is empty or not loaded.');
    throw new Error('Question bank is empty or not loaded');
  }

  if (!type || !category || !difficulty) {
    return questionBank[Math.floor(Math.random() * questionBank.length)];
  }

  const matchedQuestion = getMatchingQuestion(questionBank, type, category, difficulty);
  if (!matchedQuestion) {
    throw new Error('No matching question found');
  }
  return matchedQuestion;
}

/**
 * Finds a question matching the specified criteria with a progressive fallback strategy.
 * Attempts to match all criteria (category, type, difficulty), falling back to broader matches
 * when specific matches aren't available.
 *
 * @param questionBank - The complete array of questions to search through
 * @param type - The desired question type (e.g., 'multiple-choice', 'coding')
 * @param category - The desired question category (e.g., 'javascript', 'algorithms')
 * @param difficulty - The desired difficulty level (e.g., 'easy', 'medium', 'hard')
 * @returns A question that best matches the given criteria
 */
const getMatchingQuestion = (
  questionBank: QuestionBankItem[],
  type: QuestionType,
  category: QuestionCategories,
  difficulty: QuestionDifficulty
): QuestionBankItem => {
  // Helper function to get a random item from an array
  const getRandomItem = (items: QuestionBankItem[]): QuestionBankItem =>
    items[Math.floor(Math.random() * items.length)];

  // Step 1: Filter by category (most important criterion)
  const categoryMatches = questionBank.filter(question =>
    question.category.some(cat => caseInsensitiveEqual(cat, category))
  );

  // If no category matches, return a random question from the entire bank
  if (categoryMatches.length === 0) {
    throw new Error('[Server] No category matches found');
  }

  // Step 2: From category matches, filter by type
  const typeAndCategoryMatches = categoryMatches.filter(question =>
    caseInsensitiveEqual(type, question.type)
  );

  // If no type+category matches, return a random category match
  if (typeAndCategoryMatches.length === 0) {
    return getRandomItem(categoryMatches);
  }

  // Step 3: From type+category matches, filter by difficulty
  const fullMatches = typeAndCategoryMatches.filter(question =>
    caseInsensitiveEqual(difficulty, question.difficulty)
  );

  // Return the most specific match available
  return fullMatches.length > 0
    ? getRandomItem(fullMatches)
    : getRandomItem(typeAndCategoryMatches);
};
