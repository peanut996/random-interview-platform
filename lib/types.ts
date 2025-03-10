export interface Question {
  id: string
  type: "Coding" | "Question"
  category: string
  difficulty: "Easy" | "Medium" | "Hard"
  translations: {
    [key: string]: {
      title: string
      description: string
      topic: string
    }
  }
  testCases?: Array<{
    input: any
    output: any
  }>
}

export interface UserAnswer {
  content: string
}

export interface QuestionHistory {
  id: string
  title: string
  timestamp: string
  answered: boolean
  language: string
  question: Question
}

