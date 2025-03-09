import { generateQuestion } from "./api"
import type { Question } from "./types"

// In-memory storage for generated questions
let generatedQuestions: Question[] = []

export async function generateRandomQuestion(): Promise<Question> {
  const type = ["Coding", "Question"]
  const category = ["Algorithms", "TCP", "Data Structures", "System Design", "Behavioral", "Java", "Operation System"]
  const difficulty = ["Easy", "Medium", "Hard"]
  const randomType = type[Math.floor(Math.random() * type.length)]
  const randomCategory = category[Math.floor(Math.random() * category.length)]
  const randomDifficulty = difficulty[Math.floor(Math.random() * difficulty.length)]
  return await generateQuestion(randomType, randomCategory, randomDifficulty)
}

export function getQuestions(): Question[] {
  // This would typically fetch from an API or JSON file
  const predefinedQuestions: Question[] = [
    {
      id: "1",
      type: "Coding",
      category: "Algorithms",
      difficulty: "Easy",
      translations: {
        en: {
          title: "Reverse a String",
          description:
            "Write a function to reverse a given string. For example, if the input is 'hello', the output should be 'olleh'.",
          topic: "Strings",
        },
        zh: {
          title: "反转字符串",
          description: "编写一个函数来反转给定的字符串。例如，如果输入是 'hello'，输出应该是 'olleh'。",
          topic: "字符串",
        },
      },
      testCases: [
        { input: "hello", output: "olleh" },
        { input: "world", output: "dlrow" },
      ],
    },
    {
      id: "2",
      type: "Question",
      category: "TCP",
      difficulty: "Medium",
      translations: {
        en: {
          title: "Explain TCP Handshake",
          description:
            "Describe the three-way handshake process in TCP. What happens at each step, and why is this process necessary?",
          topic: "Networking",
        },
        zh: {
          title: "解释 TCP 握手",
          description: "描述 TCP 三次握手过程。每一步发生了什么，为什么这个过程是必要的？",
          topic: "网络",
        },
      },
    },
  ]
  
  // Combine predefined and generated questions
  return [...predefinedQuestions, ...generatedQuestions]
}

// Add a new function to add a generated question to our collection
export function addGeneratedQuestion(question: Question): void {
  generatedQuestions.push(question)
}

// Add a function to get questions by type and category
export function getQuestionsByFilter(type?: string, category?: string, difficulty?: string): Question[] {
  const questions = getQuestions()
  
  return questions.filter(q => 
    (!type || q.type === type) && 
    (!category || q.category === category) &&
    (!difficulty || q.difficulty === difficulty)
  )
}

