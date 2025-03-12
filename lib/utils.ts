import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanupJsonResponse(text: string): string {
  // Step 1: Remove any outer code blocks like ```json, ```js, etc.
  const cleaned = text.replace(/^```(?:json|javascript|js)?\s*|\s*```$/gm, '').trim();
  
  // Step 2: Extract and store code blocks for later restoration
  const codeBlocks: string[] = [];
  const codeBlockPlaceholders: string[] = [];
  
  // Replace code blocks with placeholders
  let processedText = cleaned.replace(/```([\s\S]*?)```/gm, (match, codeContent) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(match);
    codeBlockPlaceholders.push(placeholder);
    return placeholder;
  });
  
  // Step 3: Try to find valid JSON in the processed text
  // First, try with the processed text as is
  try {
    JSON.parse(processedText);
    
    // If parsing succeeds, restore the code blocks in the JSON string
    for (let i = 0; i < codeBlocks.length; i++) {
      // We need to JSON escape the code blocks properly
      const escapedCode = codeBlocks[i].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      processedText = processedText.replace(codeBlockPlaceholders[i], escapedCode);
    }
    
    return processedText;
  } catch (e) {
    // If parsing fails, try to extract a JSON object
    const jsonMatch = processedText.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) {
      let jsonObject = jsonMatch[0];
      
      try {
        JSON.parse(jsonObject);
        
        // If parsing succeeds, restore the code blocks in the JSON string
        for (let i = 0; i < codeBlocks.length; i++) {
          // We need to JSON escape the code blocks properly
          const escapedCode = codeBlocks[i].replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
          jsonObject = jsonObject.replace(codeBlockPlaceholders[i], escapedCode);
        }
        
        return jsonObject;
      } catch (e) {
        // If all attempts fail, just try to clean up the JSON
        console.warn("Failed to parse JSON even after extraction:", e);
      }
    }
    
    // Last resort: search for patterns in each field that might contain code
    try {
      // Parse the JSON with a more lenient approach
      let jsonObj = JSON.parse(processedText.replace(/```[\s\S]*?```/g, '```code```'));
      
      // Function to recursively scan the object for placeholders and replace them
      const restoreCodeBlocks = (obj: any): any => {
        if (!obj) return obj;
        
        if (typeof obj === 'string') {
          // Check if this string contains any of our placeholders
          let result = obj;
          for (let i = 0; i < codeBlockPlaceholders.length; i++) {
            if (result.includes(codeBlockPlaceholders[i])) {
              // Replace the placeholder with the actual code block
              result = result.replace(codeBlockPlaceholders[i], codeBlocks[i]);
            }
          }
          return result;
        } else if (Array.isArray(obj)) {
          return obj.map(item => restoreCodeBlocks(item));
        } else if (typeof obj === 'object') {
          const newObj: Record<string, any> = {};
          for (const key in obj) {
            newObj[key] = restoreCodeBlocks(obj[key]);
          }
          return newObj;
        }
        
        return obj;
      };
      
      // Restore code blocks in the parsed object
      jsonObj = restoreCodeBlocks(jsonObj);
      
      // Stringify it back
      return JSON.stringify(jsonObj);
    } catch (e) {
      console.warn("Failed to parse JSON with lenient approach:", e);
      // If everything fails, return the initial cleaned text
      return cleaned;
    }
  }
}

// Add this function to help with category display
export function formatCategories(categories: string[]): string {
  if (!categories || categories.length === 0) {
    return "";
  }
  
  if (categories.length === 1) {
    return categories[0];
  }
  
  const lastCategory = categories[categories.length - 1];
  const otherCategories = categories.slice(0, categories.length - 1);
  
  return `${otherCategories.join(", ")} and ${lastCategory}`;
}

// Function to clean up test case displays by removing extra quotes
export function cleanupTestCase(value: any): string {
  if (typeof value !== 'string') {
    return JSON.stringify(value);
  }
  
  // If the value is a string that starts and ends with quotes and contains escaped quotes
  if (value.startsWith('"') && value.endsWith('"')) {
    try {
      // Try to parse the JSON string to get the actual value
      const parsed = JSON.parse(value);
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed);
    } catch (e) {
      // If parsing fails, just return the original with basic cleanup
      return value.replace(/\\"/g, '"');
    }
  }
  
  return value;
}

// Function to format code blocks for display
export function formatCodeBlock(codeText: string): { code: string; language: string } {
  // Default values
  let code = codeText;
  let language = '';
  
  // Handle double escaped characters first (\\n -> \n)
  code = code.replace(/\\\\n/g, '\n')
             .replace(/\\\\t/g, '\t')
             .replace(/\\\\\\/g, '\\')
             .replace(/\\\\"/g, '"');
  
  // Then handle single escaped characters
  code = code.replace(/\\n/g, '\n')
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
    'python', 'javascript', 'js', 'typescript', 'ts', 'java', 'c', 'cpp', 'csharp', 'cs',
    'go', 'ruby', 'rust', 'php', 'swift', 'kotlin', 'scala', 'html', 'css', 'sql'
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

// Helper function to preprocess code blocks in answer content
export function preprocessCodeInAnswer(answer: any): any {
  if (!answer) return answer;
  
  // Handle string content with code blocks
  if (typeof answer === 'string') {
    // Try to find code blocks in the content and preprocess them
    return answer;
  }
  
  // Functions to thoroughly clean code blocks
  const cleanCodeContent = (code: string): string => {
    // First remove any escaped backticks
    let cleaned = code.replace(/\\`/g, '`');
    
    // Triple backslash handling - needs to be done before double
    cleaned = cleaned.replace(/\\\\\\/g, '\\');
    
    // Escaped quotes should be turned into regular quotes
    cleaned = cleaned.replace(/\\"/g, '"');
    
    // Double backslash handling
    cleaned = cleaned.replace(/\\\\/g, '\\');
    
    // Replace escaped newlines with real newlines
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    // Replace escaped tabs with real tabs
    cleaned = cleaned.replace(/\\t/g, '\t');
    
    // Handle any other common escape sequences that might appear
    cleaned = cleaned.replace(/\\r/g, '\r');
    
    return cleaned;
  };
  
  // Handle object with nested answer structure
  if (typeof answer === 'object' && answer.answer) {
    const processedAnswer = { ...answer };
    
    // Common programming language identifiers
    const languageIdentifiers = [
      'python', 'javascript', 'js', 'typescript', 'ts', 'java', 'c', 'cpp', 'csharp', 'cs',
      'go', 'ruby', 'rust', 'php', 'swift', 'kotlin', 'scala', 'html', 'css', 'sql'
    ];
    
    // Process English answer
    if (processedAnswer.answer.en) {
      let content = processedAnswer.answer.en;
      
      // First, identify all code blocks with regex
      const codeBlockRegex = /```([a-zA-Z]*)([\s\S]*?)```/g;
      const codeBlocks: Array<{lang: string, code: string}> = [];
      const placeholders: string[] = [];
      
      // Extract all code blocks and replace with placeholders
      content = content.replace(codeBlockRegex, (match: string, lang: string, code: string) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({ lang, code: cleanCodeContent(code) });
        placeholders.push(placeholder);
        return placeholder;
      });
      
      // Reinsert cleaned code blocks
      for (let i = 0; i < codeBlocks.length; i++) {
        const { lang, code } = codeBlocks[i];
        content = content.replace(
          placeholders[i],
          `\`\`\`${lang}\n${code}\n\`\`\``
        );
      }
      
      processedAnswer.answer.en = content;
    }
    
    // Process Chinese answer
    if (processedAnswer.answer.zh) {
      let content = processedAnswer.answer.zh;
      
      // First, identify all code blocks with regex
      const codeBlockRegex = /```([a-zA-Z]*)([\s\S]*?)```/g;
      const codeBlocks: Array<{lang: string, code: string}> = [];
      const placeholders: string[] = [];
      
      // Extract all code blocks and replace with placeholders
      content = content.replace(codeBlockRegex, (match: string, lang: string, code: string) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push({ lang, code: cleanCodeContent(code) });
        placeholders.push(placeholder);
        return placeholder;
      });
      
      // Reinsert cleaned code blocks
      for (let i = 0; i < codeBlocks.length; i++) {
        const { lang, code } = codeBlocks[i];
        content = content.replace(
          placeholders[i],
          `\`\`\`${lang}\n${code}\n\`\`\``
        );
      }
      
      processedAnswer.answer.zh = content;
    }
    
    return processedAnswer;
  }
  
  return answer;
}

