import { NextRequest, NextResponse } from 'next/server';

// 从环境变量获取API密钥（注意没有NEXT_PUBLIC_前缀）
const apiKey = process.env.OPENAI_TOKEN;
const DEFAULT_OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4";

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt, model, customEndpoint, customToken } = await request.json();
    
    // 使用自定义设置或默认设置
    const endpoint = customEndpoint || DEFAULT_OPENAI_ENDPOINT;
    const token = customToken || apiKey;
    const openaiModel = model || DEFAULT_OPENAI_MODEL;
    
    if (!token) {
      return NextResponse.json(
        { error: "OpenAI API token not configured. Please set it in the settings or configure server environment variables." },
        { status: 500 }
      );
    }

    const response = await fetch(`${endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error?.message || "Failed to call OpenAI API" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // 检查是否是纯JSON响应
    let result = data.choices[0].message.content;
    
    // 尝试解析并重新序列化，以确保是纯JSON
    try {
      const parsed = JSON.parse(result);
      result = JSON.stringify(parsed);
    } catch (e) {
      // 如果不是有效的JSON，保持原样
      console.warn("Response is not valid JSON:", result);
    }
    
    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 