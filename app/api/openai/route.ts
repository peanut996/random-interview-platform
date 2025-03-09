import { NextRequest, NextResponse } from 'next/server';

// 从环境变量获取API密钥（注意没有NEXT_PUBLIC_前缀）
const apiKey = process.env.OPENAI_TOKEN;
const DEFAULT_OPENAI_ENDPOINT = process.env.OPENAI_ENDPOINT || "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4";

export async function POST(request: NextRequest) {
  try {
    const { prompt, systemPrompt, model, customEndpoint, customToken, messages, stream = false } = await request.json();
    
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

    // 准备消息数组
    let messageArray;
    if (messages) {
      // 如果直接提供了messages数组，使用它
      messageArray = messages;
    } else {
      // 否则使用传统的prompt和systemPrompt构建消息
      messageArray = [
        ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
        { role: "user", content: prompt },
      ];
    }

    // 准备请求体
    const requestBody = {
      model: openaiModel,
      messages: messageArray,
      temperature: 0.7,
      stream: stream, // 根据请求参数决定是否使用流式响应
    };

    // 如果是流式请求
    if (stream) {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        return NextResponse.json(
          { error: error.error?.message || "Failed to call OpenAI API" },
          { status: response.status }
        );
      }

      // 创建一个新的 ReadableStream 转发 OpenAI 的流式响应
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          "Connection": "keep-alive",
        },
      });
    } 
    // 非流式请求，保持原有逻辑
    else {
      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
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
      
      try {
        // 解析但不重新序列化，直接返回解析后的对象
        const parsed = JSON.parse(result);
        return NextResponse.json({ result: parsed });
      } catch (e) {
        // 如果不是有效的JSON，保持原样返回文本
        console.warn("Response is not valid JSON:", result);
        return NextResponse.json({ result });
      }
    }
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 