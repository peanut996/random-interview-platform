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
  if(questionBank && questionBank.length > 0) {
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
): Promise<QuestionBankItem | null> {
  try {
    loadQuestionBank();
    if (!questionBank || questionBank.length === 0) {
      console.warn('Question bank is empty or not loaded.');
      return null;
    }

    if(!type || !category || !difficulty) {
        return questionBank[Math.floor(Math.random() * questionBank.length)];
    }

    const matchingQuestions = questionBank.filter(question => {
      if (!caseInsensitiveEqual(type, question.type)) return false;

      if (!caseInsensitiveEqual(difficulty, question.difficulty)) return false;

      return question.category.some(cat => caseInsensitiveEqual(cat, category));


    });

    if (matchingQuestions.length === 0) {
      return questionBank[Math.floor(Math.random() * questionBank.length)];
    }

    return matchingQuestions[Math.floor(Math.random() * matchingQuestions.length)];
  } catch (error) {
    console.error('Error finding matching question:', error);
    return null;
  }
}