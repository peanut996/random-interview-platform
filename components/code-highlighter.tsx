'use client';

import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  githubGist,
  monokai,
  dracula,
  nord,
  vs,
  defaultStyle,
  dark,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CodeHighlighterProps {
  code: string;
  language: string;
  fontSize?: number;
  theme?: string;
}

const mapLanguage = (monacoLanguage: string): string => {
  const languageMap: Record<string, string> = {
    csharp: 'csharp', // Keep consistent casing
    cpp: 'cpp',
    javascript: 'javascript',
    typescript: 'typescript',
    python: 'python',
    java: 'java',
    go: 'go',
    ruby: 'ruby',
    php: 'php',
    sql: 'sql',
    html: 'html',
    css: 'css',
  };
  // Use the mapped language, but fall back to the original *and* check for supported languages.
  return languageMap[monacoLanguage] || monacoLanguage;
};

export default function CodeHighlighter({
  code,
  language,
  fontSize = 14,
  theme = 'oneDark',
}: CodeHighlighterProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false); // react-syntax-highlighter handles highlighting, set loading false.
  }, []);

  const getTheme = (themeName: string) => {
    switch (themeName.toLowerCase()) {
      case 'vs':
        return vs;
      case 'vs-dark':
        return dark;
      case 'github':
        return githubGist;
      case 'monokai':
        return monokai;
      case 'dracula':
        return dracula;
      case 'nord':
        return nord;
      default:
        return defaultStyle;
    }
  };

  const mappedLanguage = mapLanguage(language);
  const themeStyle = getTheme(theme);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <SyntaxHighlighter
      language={mappedLanguage}
      style={themeStyle}
      customStyle={{ fontSize: `${fontSize}px`, padding: '1em' }} // Apply fontSize and padding
      codeTagProps={{ style: { fontSize: 'inherit' } }} // Inherit fontSize for code
      showLineNumbers
      wrapLines
      useInlineStyles
    >
      {code}
    </SyntaxHighlighter>
  );
}
