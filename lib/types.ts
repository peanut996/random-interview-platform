export const All = 'All';
export const Custom = 'Custom';
export interface QuestionShell {
  id?: string;
  type: QuestionType;
  title: string;
  category?: QuestionCategories[];
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

export type QuestionCategories =
  | QuestionCategory
  | CodingCategory
  | string
  | typeof All
  | typeof Custom;

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

  //  新增的 HTML 相关分类
  HTML = 'HTML',
  BasicConcepts = 'Basic Concepts',
  Meta = 'Meta',
  DOM = 'DOM',
  SemanticHTML = 'Semantic HTML',
  DOMManipulation = 'DOM Manipulation',
  EventHandling = 'Event Handling',
  Performance = 'Performance',

  // 新增的 CSS 相关分类
  CSS = 'CSS',
  Selectors = 'Selectors',
  BoxModel = 'Box Model',
  Layout = 'Layout',
  TextStyling = 'Text Styling',
  Positioning = 'Positioning',
  Visibility = 'Visibility',
  Units = 'Units',
  UI = 'UI',
  ZIndex = 'Z-index',

  // 通用分类 (如果需要)
  Frameworks = 'Frameworks',
  Tools = 'Tools',

  // 编程语言
  JavaScript = 'JavaScript',
  TypeScript = 'TypeScript',
  Python = 'Python',
  C = 'C',
  Cpp = 'C++',
  Go = 'Go',
  Rust = 'Rust',
  PHP = 'PHP',
  CSharp = 'C#',
  Kotlin = 'Kotlin',
  Swift = 'Swift',
  Ruby = 'Ruby',
}

export enum CodingCategory {
  LeetCode = 'LeetCode',
  LeetCodeHot100 = 'LeetCode Hot 100',

  // 常见数据结构
  Array = 'Array',
  String = 'String',
  LinkedList = 'Linked List',
  Stack = 'Stack',
  Queue = 'Queue',
  Tree = 'Tree',
  Graph = 'Graph',
  Heap = 'Heap',
  HashTable = 'Hash Table',

  // 常见算法思想
  Recursion = 'Recursion',
  DynamicProgramming = 'Dynamic Programming',
  Greedy = 'Greedy',
  Backtracking = 'Backtracking',
  DivideAndConquer = 'Divide and Conquer',
  TwoPointers = 'Two Pointers',
  SlidingWindow = 'Sliding Window',

  // 排序算法
  Sorting = 'Sorting',
  BubbleSort = 'Bubble Sort',
  InsertionSort = 'Insertion Sort',
  SelectionSort = 'Selection Sort',
  MergeSort = 'Merge Sort',
  QuickSort = 'Quick Sort',

  // 查找算法
  Searching = 'Searching',
  BinarySearch = 'Binary Search',

  // 位运算
  BitManipulation = 'Bit Manipulation',

  // 数学
  Math = 'Math',

  // 设计模式 (如果需要)
  DesignPatterns = 'Design Patterns',
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

export enum PromptUsage {
  Question = 'question',
  Answer = 'answer',
}
