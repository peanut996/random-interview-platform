export interface Question {
    id: string
    type: QuestionType
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

export enum QuestionType {
    Coding = "Coding",
    Question = "Question"
}

export enum QuestionDifficulty {
    Easy = "Easy",
    Medium = "Medium",
    Hard = "Hard"
}

export enum QuestionCategory {
    Algorithms = "Algorithms",
    TCP = "TCP",
    UDP = "UDP",
    IP = "IP",
    Spring = "Spring",
    Redis = "Redis",
    MySQL = "MySQL",
    RocketMQ = "RocketMQ",
    Kafka = "Kafka",
    Java = "Java",
    OperationSystem = "Operation System",
    SystemDesign = "System Design",
}

export enum CodingCategory{
    LeetCode = "LeetCode",
    LeetCodeHot100 = "LeetCode Hot 100"
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

