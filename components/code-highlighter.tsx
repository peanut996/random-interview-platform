"use client"

import 'highlight.js/styles/github.css';

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"


interface CodeHighlighterProps {
  code: string
  language: string
  fontSize?: number
  theme?: string
}

export default function CodeHighlighter({ code, language, fontSize = 14, theme = "vs-dark" }: CodeHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let hljs: any;
    import("highlight.js").then(async (module) => {
      hljs = module.default;

      try {
        const themeFile = getHighlightTheme(theme);
        console.log("Theme file:", themeFile); // Debugging: Check the value of themeFile


        const highlighted = hljs.highlight(code, {
          language: mapLanguage(language),
          ignoreIllegals: true,
        }).value;
        setHighlightedCode(highlighted);
      } catch (error) {
        console.error("Highlighting error:", error);
        const highlighted = hljs.highlightAuto(code).value;
        setHighlightedCode(highlighted);
      } finally {
        setIsLoading(false);
      }
    });
  }, [code, language, theme]);

  const getHighlightTheme = (monacoTheme: string): string => {
    const themeMap: Record<string, string> = {
      vs: "github",
      "vs-dark": "github-dark",
      "hc-black": "github-dark-dimmed",
      "hc-light": "github",
      github: "github",
      monokai: "monokai",
      dracula: "dracula",
      nord: "nord",
    };

    const resolvedTheme = themeMap[monacoTheme];
    console.log(`Resolved theme for ${monacoTheme}: ${resolvedTheme}`); // Debugging
    return resolvedTheme || ""; // Return empty string if theme not found
  };

  const mapLanguage = (monacoLanguage: string): string => {
    const languageMap: Record<string, string> = {
      csharp: "cs",
      cpp: "cpp",
      javascript: "javascript",
      typescript: "typescript",
      python: "python",
      java: "java",
      go: "go",
      ruby: "ruby",
      php: "php",
      sql: "sql",
      html: "html",
      css: "css",
    };
    return languageMap[monacoLanguage] || monacoLanguage;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <pre className="font-mono" style={{ fontSize: `${fontSize}px` }}>
      <code
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
        className={`hljs language-${mapLanguage(language)}`}
      />
    </pre>
  );
}
