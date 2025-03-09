// Create a new file for API calls that use the OpenAI settings
"use client"

// Default model (will be overridden by server-side value)
const DEFAULT_OPENAI_MODEL = "gpt-4"

export async function callOpenAI(prompt: string, systemPrompt?: string, options?: {
  onChunk?: (chunk: string) => void;
}) {
  try {
    // Get user preferences from localStorage
    const model = localStorage.getItem("openai_model") || DEFAULT_OPENAI_MODEL
    const customEndpoint = localStorage.getItem("openai_endpoint")
    const customToken = localStorage.getItem("openai_token")
    
    // Add a small delay to prevent rapid consecutive calls
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 构建消息数组
    const messages = [
      ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
      { role: "user", content: prompt },
    ]

    // 如果提供了 onChunk 回调，使用流式响应
    if (options?.onChunk) {
      return sendMessageToOpenAI(messages, {
        onChunk: options.onChunk,
        model,
        customEndpoint,
        customToken
      })
    } else {
      // 否则使用传统的非流式响应
      // Call our backend API route instead of OpenAI directly
      const response = await fetch('/api/openai', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          model,
          customEndpoint,
          customToken,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to call API")
      }

      const data = await response.json()
      return data.result
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error)
    throw error
  }
}

export async function evaluateAnswer(question: any, userAnswer: string, language: string, options?: {
  onChunk?: (chunk: string) => void;
}) {
  const systemPrompt = `You are an expert technical interviewer. Evaluate the candidate's answer to the following question. 
  Provide a score from 0 to 1 for correctness, efficiency, and readability. 
  Also provide feedback and improvement suggestions. 
  
  IMPORTANT FORMATTING INSTRUCTIONS:
  1. Return your evaluation as raw JSON without any markdown formatting
  2. DO NOT wrap your response in \`\`\`json or any code blocks
  3. Your entire response must be valid JSON only
  4. No text before or after the JSON
  
  Use this exact structure:
  {
    "overallScore": 0.85,
    "categoryScores": {
      "correctness": 0.9,
      "efficiency": 0.8,
      "readability": 0.85
    },
    "feedback": {
      "en": "English feedback here",
      "zh": "Chinese feedback here"
    },
    "improvementSuggestions": [
      {
        "en": "English suggestion 1",
        "zh": "Chinese suggestion 1"
      },
      {
        "en": "English suggestion 2",
        "zh": "Chinese suggestion 2"
      }
    ]
  }`

  const questionTitle = question.translations[language]?.title || question.translations.en.title
  const questionDescription = question.translations[language]?.description || question.translations.en.description

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ""}
  
  User's Answer:
  ${userAnswer}
  
  Evaluate this answer and provide your assessment in the required JSON format.
  `

  try {
    // 如果提供了 onChunk 回调，使用流式响应
    if (options?.onChunk) {
      const result = await callOpenAI(prompt, systemPrompt, {
        onChunk: options.onChunk
      })
      try {
        return JSON.parse(result)
      } catch (e) {
        console.error("Error parsing JSON result:", e)
        return result
      }
    } else {
      // 否则使用传统的非流式响应
      const result = await callOpenAI(prompt, systemPrompt)
      return result
    }
  } catch (error) {
    console.error("Error evaluating answer:", error)
    // Return a fallback evaluation if API call fails
    return {
      overallScore: 0.5,
      categoryScores: {
        correctness: 0.5,
        efficiency: 0.5,
        readability: 0.5,
      },
      feedback: {
        en: "We couldn't evaluate your answer due to an error. Please check your OpenAI API settings.",
        zh: "由于错误，我们无法评估您的答案。请检查您的 OpenAI API 设置。",
      },
      improvementSuggestions: [
        {
          en: "Make sure your OpenAI API token is correct in the settings.",
          zh: "确保您在设置中的 OpenAI API 令牌正确。",
        },
      ],
    }
  }
}

export async function getModelAnswer(question: any, language: string, options?: {
  onChunk?: (chunk: string) => void;
}) {
  const systemPrompt = `You are an expert in technical interviews. Provide a model answer to the following question.
  Your answer should be clear, efficient, and follow best practices.
  If it's a coding question, include well-commented code.
  If it's a conceptual question, provide a comprehensive explanation.
  
  IMPORTANT FORMATTING INSTRUCTIONS:
  1. Return your answer as raw JSON without any markdown formatting
  2. DO NOT wrap your response in \`\`\`json or any code blocks
  3. Your entire response must be valid JSON only
  4. No text before or after the JSON
  
  Format your response with this exact structure:
  {
    "answer": {
      "en": "Your English answer here",
      "zh": "Your Chinese answer here"
    }
  }`

  const questionTitle = question.translations[language]?.title || question.translations.en.title
  const questionDescription = question.translations[language]?.description || question.translations.en.description

  const prompt = `
  Question: ${questionTitle}
  Description: ${questionDescription}
  ${question.testCases ? `Test Cases: ${JSON.stringify(question.testCases)}` : ""}
  
  Provide a model answer to this question in both English and Chinese.
  Format your response as a JSON object with this structure:
  {
    "answer": {
      "en": "Your English answer here",
      "zh": "Your Chinese answer here"
    }
  }
  `

  try {
    // 如果提供了 onChunk 回调，使用流式响应
    if (options?.onChunk) {
      const result = await callOpenAI(prompt, systemPrompt, {
        onChunk: options.onChunk
      })
      try {
        return JSON.parse(result)
      } catch (e) {
        console.error("Error parsing JSON result:", e)
        return { answer: { en: result, zh: result } }
      }
    } else {
      // 否则使用传统的非流式响应
      const result = await callOpenAI(prompt, systemPrompt)
      return JSON.parse(result)
    }
  } catch (error) {
    console.error("Error getting model answer:", error)
    // Return a fallback answer if API call fails
    return {
      answer: {
        en: "We couldn't generate a model answer due to an error. Please check your OpenAI API settings.",
        zh: "由于错误，我们无法生成模型答案。请检查您的 OpenAI API 设置。",
      },
    }
  }
}

// 修改 sendMessageToOpenAI 函数以支持自定义设置
export async function sendMessageToOpenAI(
  messages: any[],
  options?: {
    onChunk?: (chunk: string) => void;
    model?: string;
    customEndpoint?: string;
    customToken?: string;
  }
) {
  try {
    // 获取用户首选项
    const model = options?.model || localStorage.getItem("openai_model") || DEFAULT_OPENAI_MODEL;
    const customEndpoint = options?.customEndpoint || localStorage.getItem("openai_endpoint");
    const customToken = options?.customToken || localStorage.getItem("openai_token");
    
    // 添加小延迟以防止快速连续调用
    await new Promise((resolve) => setTimeout(resolve, 100));

    const response = await fetch("/api/openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        model,
        customEndpoint,
        customToken,
        stream: !!options?.onChunk, // 如果提供了onChunk回调，则启用流式响应
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to fetch from OpenAI");
    }

    // 处理流式响应
    if (options?.onChunk && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value, { stream: true });
        
        // 处理SSE格式的响应
        const lines = text.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                result += content;
                options.onChunk(content);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
      
      return result;
    } else {
      // 如果没有提供 onChunk 回调，则等待整个响应
      const data = await response.json();
      return data.result;
    }
  } catch (error) {
    console.error("Error sending message to OpenAI:", error);
    throw error;
  }
}

