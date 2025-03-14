export interface QuestionShell {
  id?: string;
  type: QuestionType;
  title: string;
  category?: QuestionCategory[];
  difficulty: QuestionDifficulty;
}

export interface CustomPrompt {
  userPrompt?: string;
  systemPrompt?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  category: string;
  difficulty: QuestionDifficulty;
  translations: {
    [key: string]: {
      title: string;
      description: string;
      topic: string;
    };
  };
  testCases?: Array<{
    input: string;
    output: string;
  }>;
}

export enum QuestionType {
  Coding = 'Coding',
  Question = 'Question',
}

export enum QuestionDifficulty {
  Easy = 'Easy',
  Medium = 'Medium',
  Hard = 'Hard',
}

export type QuestionCategories = QuestionCategory | CodingCategory | string;

export enum QuestionCategory {
  Algorithms = 'Algorithms',
  TCP = 'TCP',
  UDP = 'UDP',
  IP = 'IP',
  Spring = 'Spring',
  Redis = 'Redis',
  MySQL = 'MySQL',
  RocketMQ = 'RocketMQ',
  Kafka = 'Kafka',
  Java = 'Java',
  OperationSystem = 'Operation System',
  SystemDesign = 'System Design',
}

export enum CodingCategory {
  LeetCode = 'LeetCode',
  LeetCodeHot100 = 'LeetCode Hot 100',
}

export interface UserAnswer {
  content: string;
}

export interface AIAnswer {
  answer: {
    [key: string]: string;
  };
}

export interface QuestionHistory {
  id: string;
  title: string;
  timestamp: string;
  answered: boolean;
  language: string;
  question: Question;
}

export interface Message {
  role: MessageRole;
  content: string;
}

export enum MessageRole {
  user = 'user',
  system = 'system',
}

export interface CustomSettings {
  token?: string;
  endpoint?: string;
  model?: string;
}

export interface GenerateQuestionParams {
  type: QuestionType;
  category: QuestionCategories;
  difficulty: QuestionDifficulty;
  customPrompt?: CustomPrompt;
  useQuestionBank: boolean;

  customSettings?: CustomSettings;
  customePrompt?: CustomPrompt;
}

export interface EvaluateResult {
  overallScore: number;
  categoryScores: {
    correctness: number;
    efficiency: number;
    readability: number;
  };
  feedback: {
    [key: string]: string;
  };
  improvementSuggestions: Array<{
    [key: string]: string;
  }>;
}
