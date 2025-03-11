import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanupJsonResponse(text: string): string {
  // Step 1: Remove any outer code blocks like ```json, ```js, etc.
  const cleaned = text.replace(/^```(?:json|javascript|js)?\s*|\s*```$/gm, '').trim();
  
  // Step 2: Escape any interior code blocks that use triple backticks, as they would break JSON parsing
  // Replace triple backticks with a temporary placeholder in the content
  const escapedCodeBlocks = cleaned.replace(/```([\s\S]*?)```/gm, function(match) {
    // Escape the backticks by replacing them with a placeholder
    return match.replace(/```/g, '\\`\\`\\`');
  });
  
  try {
    // Try parsing the cleaned JSON
    JSON.parse(escapedCodeBlocks);
    return escapedCodeBlocks;
  } catch (e) {
    // If parsing fails, try to extract a JSON object
    const jsonMatch = escapedCodeBlocks.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch (e) {
        // If all attempts fail, return the escaped version
        return escapedCodeBlocks;
      }
    }
    return escapedCodeBlocks;
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

