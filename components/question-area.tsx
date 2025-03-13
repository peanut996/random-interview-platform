"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/lib/i18n"
import type { Question } from "@/lib/types"
import ReactMarkdown from "react-markdown"

interface QuestionAreaProps {
  question: Question
  language: string
}

export default function QuestionArea({
  question,
  language,
}: QuestionAreaProps) {
  const { t } = useTranslation()
  
  // Get the localized content or fall back to English
  const title = question.translations[language]?.title || question.translations.en.title
  const description = question.translations[language]?.description || question.translations.en.description
  const topic = question.translations[language]?.topic || question.translations.en.topic

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Title and badges in same flex container with justification */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">{title}</h2>
            
            {/* Badges positioned to the right of the title */}
            <div className="flex flex-wrap gap-2 items-center">
              <Badge 
                variant="outline"
                className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-medium"
              >
                {question.type}
              </Badge>
              
              <Badge 
                variant="outline"
                className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 font-medium"
              >
                {topic}
              </Badge>
              
              <Badge 
                variant="outline"
                className={`font-medium ${
                  question.difficulty === "Easy" 
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
                    : question.difficulty === "Medium" 
                      ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" 
                      : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800"
                }`}
              >
                {question.difficulty}
              </Badge>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <ReactMarkdown>{description}</ReactMarkdown>
          </div>

          {question.testCases && question.testCases.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">{t("question.testCases")}</h3>
              <div className="space-y-2">
                {question.testCases.map((testCase, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md"
                  >
                    <div>
                      <strong>{t("question.input")}:</strong>{" "}
                      {testCase.input}
                    </div>
                    <div>
                      <strong>{t("question.output")}:</strong>{" "}
                      {testCase.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
