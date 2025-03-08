export interface OpenAISettings {
  endpoint: string
  model: string
  customModel?: string
  token: string
  temperature: number
}

export function getOpenAISettings(): OpenAISettings {
  if (typeof window === "undefined") {
    return {
      endpoint: "https://api.openai.com/v1",
      model: "gpt-4",
      token: "",
      temperature: 0.7,
    }
  }

  return {
    endpoint: localStorage.getItem("openai-endpoint") || "https://api.openai.com/v1",
    model: localStorage.getItem("openai-model") || "gpt-4",
    customModel: localStorage.getItem("openai-custom-model") || "",
    token: localStorage.getItem("openai-token") || "",
    temperature: Number.parseFloat(localStorage.getItem("openai-temperature") || "0.7"),
  }
}

export async function evaluateAnswer(question: any, userAnswer: string): Promise<any> {
  const settings = getOpenAISettings()

  // In a real application, this would make an API call to OpenAI
  // For this prototype, we'll return mock data
  console.log("Evaluating answer with settings:", settings)

  // Mock evaluation result
  return {
    overallScore: 0.85,
    categoryScores: {
      correctness: 0.9,
      efficiency: 0.8,
      readability: 0.85,
    },
    feedback: {
      en: "Good solution! Your code is correct and efficient.",
      zh: "好的解决方案！您的代码正确且高效。",
    },
    improvementSuggestions: [
      {
        en: "Consider adding more comments to explain your approach.",
        zh: "考虑添加更多注释来解释您的方法。",
      },
      {
        en: "You could optimize the space complexity further.",
        zh: "您可以进一步优化空间复杂度。",
      },
    ],
  }
}

export async function getModelAnswer(question: any): Promise<any> {
  const settings = getOpenAISettings()

  // In a real application, this would make an API call to OpenAI
  // For this prototype, we'll return mock data
  console.log("Getting model answer with settings:", settings)

  // Mock answer
  return {
    answer: {
      en: "```python\ndef reverse_string(s):\n    return s[::-1]\n```\n\nThis solution uses Python's slice notation with a step of -1 to reverse the string efficiently.",
      zh: "```python\ndef reverse_string(s):\n    return s[::-1]\n```\n\n此解决方案使用Python的切片表示法，步长为-1，以高效地反转字符串。",
    },
  }
}

