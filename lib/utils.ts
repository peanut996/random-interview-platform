import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanupJsonResponse(text: string): string {
  const cleaned = text.replace(/^```(?:json|javascript|js)?\s*|\s*```$/gm, '').trim();

  try {
    
    JSON.parse(cleaned);
    return cleaned;
  } catch (e) {
    const jsonMatch = cleaned.match(/(\{[\s\S]*\})/);
    if (jsonMatch && jsonMatch[0]) {
      try {
        JSON.parse(jsonMatch[0]);
        return jsonMatch[0];
      } catch (e) {
        return cleaned;
      }
    }
    return cleaned;
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

