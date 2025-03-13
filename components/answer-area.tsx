"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Question, UserAnswer } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import dynamic from "next/dynamic"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Type, Palette, Copy, Check } from "lucide-react"
import CodeHighlighter from "./code-highlighter"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(() => import("./monaco-editor"), { ssr: false })

interface AnswerAreaProps {
  question: Question
  userAnswer: UserAnswer
  setUserAnswer: (answer: UserAnswer) => void
  onEditorLanguageChange?: (language: string) => void
}

export default function AnswerArea({ question, userAnswer, setUserAnswer, onEditorLanguageChange }: AnswerAreaProps) {
  const { t } = useTranslation()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("editor")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [editorLanguage, setEditorLanguage] = useState("java")
  const [editorFontSize, setEditorFontSize] = useState(14)
  const [editorTheme, setEditorTheme] = useState("vs")
  const [isCopied, setIsCopied] = useState(false)

  // Detect language based on question category or content
  useEffect(() => {
    if (question.category) {
      const category = question.category.toLowerCase()
      if (category.includes("javascript") || category.includes("js")) {
        setEditorLanguage("javascript")
      } else if (category.includes("python") || category.includes("py")) {
        setEditorLanguage("python")
      } else if (category.includes("java")) {
        setEditorLanguage("java")
      } else if (category.includes("c#") || category.includes("csharp")) {
        setEditorLanguage("csharp")
      } else if (category.includes("c++") || category.includes("cpp")) {
        setEditorLanguage("cpp")
      } else {
        // Default to Java for other categories
        setEditorLanguage("java")
      }
    }
  }, [question.category])

  // Notify parent component when editor language changes
  useEffect(() => {
    if (onEditorLanguageChange) {
      onEditorLanguageChange(editorLanguage);
    }
  }, [editorLanguage, onEditorLanguageChange]);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("editor_font_size")
    if (savedFontSize) {
      setEditorFontSize(Number(savedFontSize))
    }

    const savedTheme = localStorage.getItem("editor_theme")
    if (savedTheme) {
      setEditorTheme(savedTheme)
    }
  }, [])

  // Focus the textarea when the component mounts or when switching to editor tab
  useEffect(() => {
    if (activeTab === "editor" && question.type !== "Coding" && textareaRef.current) {
      // Small delay to ensure the DOM is ready
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [activeTab, question.type])

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0]
    setEditorFontSize(newSize)
    localStorage.setItem("editor_font_size", newSize.toString())
  }

  const handleThemeChange = (theme: string) => {
    setEditorTheme(theme)
    localStorage.setItem("editor_theme", theme)
  }

  const handleCopyCode = () => {
    if (!userAnswer.content) return

    navigator.clipboard
      .writeText(userAnswer.content)
      .then(() => {
        setIsCopied(true)
        toast({
          title: t("toast.copied.title"),
          description: t("toast.copied.description"),
          duration: 2000,
        })

        // Reset the copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false)
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
        toast({
          title: t("toast.error.title"),
          description: t("toast.error.copyFailed"),
          variant: "destructive",
          duration: 3000,
        })
      })
  }

  // Available programming languages for the editor
  const programmingLanguages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "csharp", label: "C#" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "ruby", label: "Ruby" },
    { value: "php", label: "PHP" },
    { value: "sql", label: "SQL" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ]

  // Available themes for the editor
  const editorThemes = [
    { value: "vs", label: "Light" },
    { value: "vs-dark", label: "Dark" },
    { value: "hc-black", label: "High Contrast Dark" },
    { value: "hc-light", label: "High Contrast Light" },
    { value: "github", label: "GitHub" },
    { value: "monokai", label: "Monokai" },
    { value: "dracula", label: "Dracula" },
    { value: "nord", label: "Nord" },
  ]

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("answer.title")}</h3>

        {question.type === "Coding" ? (
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="editor">{t("answer.editor")}</TabsTrigger>
                <TabsTrigger value="preview">{t("answer.preview")}</TabsTrigger>
              </TabsList>

              {activeTab === "editor" ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <Code className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Select value={editorLanguage} onValueChange={setEditorLanguage}>
                      <SelectTrigger className="w-[140px] h-8">
                        <SelectValue placeholder="Language" />
                      </SelectTrigger>
                      <SelectContent>
                        {programmingLanguages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Type className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">
                          {t("editor.fontSize")}: {editorFontSize}px
                        </h4>
                        <Slider
                          defaultValue={[editorFontSize]}
                          max={24}
                          min={10}
                          step={1}
                          onValueChange={handleFontSizeChange}
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Palette className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{t("editor.theme")}</h4>
                        <Select value={editorTheme} onValueChange={handleThemeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            {editorThemes.map((theme) => (
                              <SelectItem key={theme.value} value={theme.value}>
                                {theme.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleCopyCode}
                  disabled={!userAnswer.content || isCopied}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      {t("button.copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      {t("button.copy")}
                    </>
                  )}
                </Button>
              )}
            </div>

            <TabsContent value="editor" className="h-[300px]">
              <MonacoEditor
                value={userAnswer.content}
                onChange={(value) => setUserAnswer({ content: value })}
                language={editorLanguage}
                height="300px"
                fontSize={editorFontSize}
                theme={editorTheme}
                autoFocus={activeTab === "editor"}
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md h-[300px] overflow-auto">
                {userAnswer.content ? (
                  <CodeHighlighter
                    code={userAnswer.content}
                    language={editorLanguage}
                    fontSize={editorFontSize}
                    theme={editorTheme}
                  />
                ) : (
                  <div className="text-muted-foreground">{t("answer.noCode")}</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <Textarea
            ref={textareaRef}
            className="min-h-[300px]"
            placeholder={t("answer.textPlaceholder")}
            value={userAnswer.content}
            onChange={(e) => setUserAnswer({ content: e.target.value })}
            autoFocus
          />
        )}
      </CardContent>
    </Card>
  )
}

