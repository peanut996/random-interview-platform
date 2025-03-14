import fs from 'fs';
import path from 'path';
import { QuestionShell } from '../types';

/**
 * Loads questions from the data/question.json file
 * @returns An array of questions
 */
export function loadQuestions(): QuestionShell[] {
  try {
    // Resolve the path to the JSON file
    const filePath = path.resolve(process.cwd(), 'data/question.json');

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions = JSON.parse(fileContent) as QuestionShell[];

    return questions;
  } catch (error) {
    // Return an empty array in case of error
    return [];
  }
}
