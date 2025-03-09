"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { Question, UserAnswer } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

interface AnswerAreaProps {
  question: Question
  userAnswer: UserAnswer
  setUserAnswer: (answer: UserAnswer) => void
}

interface CodeEditorProps {
  userAnswer: UserAnswer
  setUserAnswer: (answer: UserAnswer) => void
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  activeTab: string
  t: (key: string) => string
}

const CodeEditor = ({ userAnswer, setUserAnswer, textareaRef, activeTab, t }: CodeEditorProps) => {
  return (
    <div className="relative h-[300px] font-mono text-sm">
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden">
        <div className="flex h-full">
          <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2 text-right w-10 select-none">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <Textarea
            ref={textareaRef}
            className="flex-1 p-2 bg-gray-50 dark:bg-gray-900 border-0 focus-visible:ring-0 resize-none h-full font-mono"
            placeholder={t("answer.codePlaceholder")}
            value={userAnswer.content}
            onChange={(e) => setUserAnswer({ content: e.target.value })}
            onClick={(e) => e.currentTarget.focus()}
            autoFocus={activeTab === "editor"}
          />
        </div>
      </div>
    </div>
  )
};

export default function AnswerArea({ question, userAnswer, setUserAnswer }: AnswerAreaProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("editor")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (activeTab === "editor" && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }, [activeTab])

  
  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">{t("answer.title")}</h3>

        {question.type === "Coding" ? (
          <Tabs defaultValue="editor" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="editor">{t("answer.editor")}</TabsTrigger>
              <TabsTrigger value="preview">{t("answer.preview")}</TabsTrigger>
            </TabsList>
            <TabsContent value="editor">
              <CodeEditor
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                textareaRef={textareaRef}
                activeTab={activeTab}
                t={t}
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md h-[300px] overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm">{userAnswer.content || t("answer.noCode")}</pre>
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

