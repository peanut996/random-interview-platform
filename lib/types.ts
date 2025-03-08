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

