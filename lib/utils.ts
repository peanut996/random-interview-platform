import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { All } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 改进版本，处理转义字符
export function processAnswerWithRegexImproved(jsonData: string): string {
  const regex = /("en"|"zh"):\s*"((?:[^"\\]|\\.)*)"/g;

  return jsonData.replace(regex, (match, key, value) => {
    const unescapedValue = value.replace(/\\(.)/g, '$1');
    // 使用 encodeURIComponent 和 btoa 进行 Base64 编码
    const encodedValue = btoa(encodeURIComponent(unescapedValue));

    // 3. 重新添加转义字符（如果需要）- 通常不需要，因为 Base64 编码后的字符串通常不需要转义
    // const reescapedValue = encodedValue.replace(/([\\"])/g, '\\$1'); // 如果确实需要
    return `${key}: "${encodedValue}"`; // 通常返回这个就足够了
  });
}

export function decodeProcessedAnswer(jsonData: string): string {
  const regex = /("en"|"zh"|"code"):\s*"((?:[^"\\]|\\.)*)"/g;

  return jsonData.replace(regex, (match, key, value) => {
    try {
      // 使用 atob 和 decodeURIComponent 进行 Base64 解码
      const decodedValue = decodeURIComponent(atob(value));
      return `${key}: "${decodedValue}"`;
    } catch (error) {
      console.error('Base64 decoding failed:', error);
      return match;
    }
  });
}

// Encode code blocks to Base64
export function encodeCodeBlocks(text: string): string {
  return processAnswerWithRegexImproved(text);
}

// Function to format code blocks for display
export function formatCodeBlock(codeText: string): { code: string; language: string } {
  // Default values
  let code = codeText;
  let language = '';

  // Handle double escaped characters first (\\n -> \n)
  code = code
    .replace(/\\\\n/g, '\n')
    .replace(/\\\\t/g, '\t')
    .replace(/\\\\\\/g, '\\')
    .replace(/\\\\"/g, '"');

  // Then handle single escaped characters
  code = code
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
    .replace(/\\"/g, '"');

  // Remove triple backticks if they exist
  code = code.replace(/^```|```$/g, '');

  // Check if the first line contains a language identifier
  const lines = code.split('\n');
  const firstLine = lines[0].trim();

  // Common programming language identifiers
  const languageIdentifiers = [
    'python',
    'javascript',
    'js',
    'typescript',
    'ts',
    'java',
    'c',
    'cpp',
    'csharp',
    'cs',
    'go',
    'ruby',
    'rust',
    'php',
    'swift',
    'kotlin',
    'scala',
    'html',
    'css',
    'sql',
  ];

  // Check if the first line is just a language identifier
  if (languageIdentifiers.includes(firstLine.toLowerCase())) {
    language = firstLine;
    // Remove the language line from the code
    code = lines.slice(1).join('\n');
  }

  // Check for code blocks that might be nested within the content
  const codeBlockMatch = code.match(/```([a-zA-Z]*)\s*\n([\s\S]*?)```/);
  if (codeBlockMatch) {
    language = codeBlockMatch[1] || language;
    code = codeBlockMatch[2];
  }

  // Trim any extra whitespace
  code = code.trim();

  return { code, language };
}

export function caseInsensitiveEqual(str1: string, str2: string): boolean {
  return str1.toLowerCase() === str2.toLowerCase();
}
