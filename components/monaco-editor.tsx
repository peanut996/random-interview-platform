"use client"

import { useRef, useState, useEffect } from "react"
import Editor, { type Monaco, type OnMount } from "@monaco-editor/react"
import { Loader2 } from "lucide-react"
import { useTheme } from "next-themes"

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: string
  fontSize?: number
  theme?: string
  autoFocus?: boolean
}

export default function MonacoEditor({
  value,
  onChange,
  language = "javascript",
  height = "300px",
  fontSize = 14,
  theme: editorTheme = "vs-dark",
  autoFocus = false,
}: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const { theme: systemTheme } = useTheme()
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null)

  // Configure Monaco editor on mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    setMonacoInstance(monaco)
    setIsEditorReady(true)

    // Focus the editor if autoFocus is true
    if (autoFocus) {
      editor.focus()
    }

    // Configure editor settings
    editor.updateOptions({
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: "on",
      lineNumbers: "on",
      renderLineHighlight: "all",
      cursorBlinking: "smooth",
    })

    // Configure intellisense
    configureIntellisense(monaco, language)

    // Register custom themes
    registerCustomThemes(monaco)
  }

  // Register custom editor themes
  const registerCustomThemes = (monaco: Monaco) => {
    // GitHub theme
    monaco.editor.defineTheme("github", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a737d", fontStyle: "italic" },
        { token: "keyword", foreground: "d73a49" },
        { token: "string", foreground: "032f62" },
        { token: "number", foreground: "005cc5" },
        { token: "type", foreground: "6f42c1" },
      ],
      colors: {
        "editor.foreground": "#24292e",
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#f1f8ff",
        "editorCursor.foreground": "#24292e",
        "editorWhitespace.foreground": "#e1e4e8",
      },
    })

    // Monokai theme
    monaco.editor.defineTheme("monokai", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "75715e", fontStyle: "italic" },
        { token: "keyword", foreground: "f92672" },
        { token: "string", foreground: "e6db74" },
        { token: "number", foreground: "ae81ff" },
        { token: "type", foreground: "66d9ef", fontStyle: "italic" },
      ],
      colors: {
        "editor.foreground": "#f8f8f2",
        "editor.background": "#272822",
        "editor.lineHighlightBackground": "#3e3d32",
        "editorCursor.foreground": "#f8f8f2",
        "editorWhitespace.foreground": "#3b3a32",
      },
    })

    // Dracula theme
    monaco.editor.defineTheme("dracula", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
        { token: "type", foreground: "8be9fd", fontStyle: "italic" },
      ],
      colors: {
        "editor.foreground": "#f8f8f2",
        "editor.background": "#282a36",
        "editor.lineHighlightBackground": "#44475a",
        "editorCursor.foreground": "#f8f8f2",
        "editorWhitespace.foreground": "#424450",
      },
    })

    // Nord theme
    monaco.editor.defineTheme("nord", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "616e88", fontStyle: "italic" },
        { token: "keyword", foreground: "81a1c1" },
        { token: "string", foreground: "a3be8c" },
        { token: "number", foreground: "b48ead" },
        { token: "type", foreground: "88c0d0" },
      ],
      colors: {
        "editor.foreground": "#d8dee9",
        "editor.background": "#2e3440",
        "editor.lineHighlightBackground": "#3b4252",
        "editorCursor.foreground": "#d8dee9",
        "editorWhitespace.foreground": "#434c5e",
      },
    })
  }

  // Configure intellisense based on language
  const configureIntellisense = (monaco: Monaco, language: string) => {
    if (language === "javascript" || language === "typescript") {
      // Add TypeScript definitions
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.Latest,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        typeRoots: ["node_modules/@types"],
      })

      // Add common libraries
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        `
        declare class Console {
          log(...data: any[]): void;
          error(...data: any[]): void;
          warn(...data: any[]): void;
          info(...data: any[]): void;
        }
        declare const console: Console;
        
        interface Array<T> {
          map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
          filter(predicate: (value: T, index: number, array: T[]) => unknown): T[];
          reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
          forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
        }
      `,
        "ts:global.d.ts",
      )
    }

    if (language === "python") {
      // Add Python snippets
      monaco.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: "def",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "def ${1:function_name}(${2:parameters}):\n\t${3:pass}",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Define a new function",
              },
              {
                label: "class",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "class ${1:ClassName}:\n\tdef __init__(self, ${2:parameters}):\n\t\t${3:pass}",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "Define a new class",
              },
              {
                label: "for",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "for ${1:item} in ${2:iterable}:\n\t${3:pass}",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "For loop",
              },
              {
                label: "if",
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "if ${1:condition}:\n\t${2:pass}",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: "If statement",
              },
            ],
          }
        },
      })
    }
  }

  // Update language configuration when language changes
  useEffect(() => {
    if (monacoInstance && language) {
      configureIntellisense(monacoInstance, language)
    }
  }, [monacoInstance, language])

  // Detect language from question type or content
  const detectLanguage = (language: string) => {
    switch (language.toLowerCase()) {
      case "javascript":
      case "js":
        return "javascript"
      case "typescript":
      case "ts":
        return "typescript"
      case "python":
      case "py":
        return "python"
      case "java":
        return "java"
      case "c#":
      case "csharp":
        return "csharp"
      case "c++":
      case "cpp":
        return "cpp"
      case "go":
        return "go"
      case "ruby":
        return "ruby"
      case "php":
        return "php"
      case "sql":
        return "sql"
      case "html":
        return "html"
      case "css":
        return "css"
      default:
        return "javascript"
    }
  }

  return (
    <div className="relative h-full w-full border rounded-md overflow-hidden">
      <Editor
        height={height}
        language={detectLanguage(language)}
        value={value}
        onChange={(value) => onChange(value || "")}
        onMount={handleEditorDidMount}
        theme={editorTheme}
        options={{
          readOnly: false,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace',
          fontSize: fontSize,
          lineHeight: 1.5,
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Loading editor...</span>
          </div>
        }
      />
    </div>
  )
}

