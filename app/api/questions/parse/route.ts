import { type NextRequest, NextResponse } from 'next/server';
import { LanguageModel, LanguageModelV1, streamObject } from 'ai';
import { createOpenAIClient, prepareMessages } from '../../utils';
import { z } from 'zod';
import { QuestionType, QuestionDifficulty } from '@/lib/types';
import puppeteer from 'puppeteer';
import chromium from '@sparticuz/chromium';
import puppeteerCore from 'puppeteer-core';

// Define the schema for multiple questions parsing result
const questionArraySchema = z.array(
  z.object({
    type: z.enum([QuestionType.Coding.toString(), QuestionType.Question.toString()]),
    category: z.array(z.string()),
    difficulty: z.enum([
      QuestionDifficulty.Easy.toString(),
      QuestionDifficulty.Medium.toString(),
      QuestionDifficulty.Hard.toString(),
    ]),
    title: z.string(),
  })
);

// Function to extract text content from a URL using Puppeteer
async function extractTextFromUrl(url: string): Promise<string> {
  let browser;

  try {
    if (process.env.NODE_ENV === 'development') {
      // For local development on Mac, use the default system Chrome
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
      });
    } else {
      // For production (Vercel/AWS Lambda)
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }

    const page = await browser.newPage();

    // Set a user-agent to avoid being blocked
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate with longer timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    const content = await (page.evaluate as Function)(() => {
      const mainContent =
        document.querySelector('main') ||
        document.querySelector('article') ||
        document.querySelector('.content') ||
        document.body;

      return mainContent ? mainContent.innerText : document.body.innerText;
    });

    return content;
  } catch (error) {
    console.error('Error extracting content from URL:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close().catch(e => console.error('Error closing browser:', e));
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, type } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Extract text from URL if type is 'url'
    let textContent = content;
    if (type === 'url') {
      try {
        textContent = await extractTextFromUrl(content);
      } catch (error) {
        console.error(
          `Error extracting content from URL: ${content}`,
          error instanceof Error ? error.message : error
        );
        return NextResponse.json({ error: 'Failed to extract content from URL' }, { status: 400 });
      }
    }

    // System prompt in English but requesting bilingual/Chinese output
    const systemPrompt = `You are a professional interview question analyzer who can identify and categorize interview questions from text.
    
    Given a block of text, extract potential interview questions and for each question determine:
    1. The type (Coding or Question)
    2. Categories as an array, providing BOTH English AND Chinese translations for each category (e.g., ["Array", "数组", "String", "字符串"])
    3. The difficulty level (Easy, Medium, or Hard)
    4. Question title, PREFERABLY IN CHINESE, or provide both English and Chinese
    
    Common category translations:
    - Algorithms: 算法
    - Data Structures: 数据结构
    - Stack: 栈
    - Queue: 队列
    - Linked List: 链表
    - Tree: 树
    - Binary Tree: 二叉树
    - Binary Search Tree: 二叉搜索树
    - Heap: 堆
    - Hash Table: 哈希表
    - Graph: 图
    - Sorting: 排序
    - Dynamic Programming: 动态规划
    - Greedy: 贪心算法
    - Backtracking: 回溯
    - String: 字符串
    - Array: 数组
    - Operating System: 操作系统
    - Database: 数据库
    - System Design: 系统设计
    - Networking: 网络
    - Concurrency: 并发
    
    IMPORTANT: 
    1. Return pure, parseable JSON without any markdown formatting. DO NOT wrap your response in code blocks with backticks.
    2. The response MUST be an array of question objects, directly parseable as JSON.
    3. Ensure all special characters in strings are properly escaped according to JSON standards.
    4. STRONGLY PRIORITIZE CHINESE for titles and include Chinese category names.
    5. If it's a LeetCode coding question, include the LeetCode problem number in the title and add the LeetCode category.`;

    // User prompt asking for Chinese output
    const userPrompt = `Parse the following text and extract interview questions:
    
    "${textContent}"
    
    Return your analysis as an array of questions in the following JSON format:
    [
      {
        "type": "Coding" or "Question",
        "category": ["Primary category (English)", "Primary category (Chinese)", "Secondary category (English)", "Secondary category (Chinese)"...],
        "difficulty": "Easy" or "Medium" or "Hard",
        "title": "Question title or brief description (PREFERABLY IN CHINESE)"
      },
      ... (more questions)
    ]

    If it's a LeetCode coding question, include the LeetCode problem number in the title and add the LeetCode tag to it's category, like: 
    { 
      "type": "Coding",
      "category": ["LeetCode", "LeetCode", "Array", "数组"],
      "difficulty": "Easy",
      "title": "1. Two Sum"
    }
    
    If no valid interview questions are found, return an empty array.
    IMPORTANT: Please prioritize extracting and generating content in Chinese whenever possible.
    CRITICALLY IMPORTANT: Ensure the JSON is valid and parseable.`;

    // Create OpenAI client
    const { client, model } = createOpenAIClient();
    const completion: LanguageModelV1 = client.chat(model);

    const messages = prepareMessages(userPrompt, systemPrompt);

    // Use the non-streaming version of the API for simplicity
    const result = await streamObject({
      model: completion as LanguageModel,
      schema: questionArraySchema,
      messages,
      temperature: 0.3, // Lower temperature for more deterministic responses
      mode: 'json',
    });

    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in question parsing API route:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred while processing your request';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
