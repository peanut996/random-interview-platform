"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"
import { Loader2, X, Edit } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {github} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface AnswerDisplayProps {
  answer: string
  language: string
  isStreaming?: boolean
  parsedAnswer: any
  onClose?: () => void
  onEdit?: () => void
}

export default function AnswerDisplay({ 
  answer, 
  language, 
  isStreaming = false,
  parsedAnswer,
  onClose,
  onEdit
}: AnswerDisplayProps) {
  const { t } = useTranslation()

  // Display loading state
  if (isStreaming) {
    return (
      <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{t("answer.modalTitle")}</h3>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              AI
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("answer.generating")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Use parsed answer if available, otherwise fall back to the original answer
  const displayAnswer = parsedAnswer || answer

  // If we're getting string data but couldn't parse it
  if (typeof displayAnswer === "string") {
    return (
      <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">{t("answer.modalTitle")}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                AI
              </Badge>
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title={t("answer.editAnswer")}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title={t("answer.closeAnswer")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-md">
              <p>{t("answer.processFailure")}</p>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <div className="markdown-content">
                <ReactMarkdown
                  components={{
                    code({node, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      const inline = !match
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={github}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {displayAnswer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const answerContent = typeof displayAnswer === "string" ?
    displayAnswer : displayAnswer.answer?.[language] || displayAnswer.answer?.en || displayAnswer

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t("answer.modalTitle")}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              AI
            </Badge>
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8" title={t("answer.editAnswer")}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title={t("answer.closeAnswer")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="prose dark:prose-invert max-w-none">
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                code({node, className, children, ...props}: any) {
                  const match = /language-(\w+)/.exec(className || '')
                  const inline = !match
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={github}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {answerContent}
            </ReactMarkdown>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 