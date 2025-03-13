"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"
import { Loader2, X, Edit } from "lucide-react"
import ReactMarkdown from "react-markdown"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {decodeProcessedAnswer, formatCodeBlock, preprocessCodeInAnswer} from "@/lib/utils"
import { AIAnswer } from "@/lib/types";

interface AnswerDisplayProps {
  answer: string
  language: string
  isStreaming?: boolean
  parsedAnswer: any
  onClose?: () => void
  onEdit?: () => void
  onRetry?: () => void
}


// Decode any encoded code blocks
const processContent = (content: string) => {
  return decodeProcessedAnswer(content);
}

// Process the answer to decode Base64 encoded blocks
const getProcessedContent = (displayAnswer: string | AIAnswer, language: string) => {
  if (typeof displayAnswer === "string") {
    return processContent(displayAnswer);
  } else if (displayAnswer && displayAnswer.answer) {
    const content = displayAnswer.answer[language] || displayAnswer.answer.en || "";
    return processContent(content);
  }
  return "";
}

export default function AnswerDisplay({
  answer,
  language,
  isStreaming = false,
  parsedAnswer,
  onClose,
  onEdit,
  onRetry
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


  const answerContent = answer;

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{t("answer.modalTitle")}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              AI
            </Badge>
            {onRetry && (
              <Button variant="ghost" size="icon" onClick={onRetry} className="h-8 w-8" title={t("answer.regenerate")}>
                <Loader2 className={`h-4 w-4 ${isStreaming ? 'animate-spin' : ''}`} />
              </Button>
            )}
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

                  if (!inline) {
                    // Format code using our utility function
                    const { code, language: detectedLanguage } = formatCodeBlock(String(children));
                    // Use either the detected language or the one from className
                    const langToUse = match ? match[1] : detectedLanguage;

                    return (
                      <SyntaxHighlighter
                        style={githubGist}
                        language={langToUse}
                        PreTag="div"
                        {...props}
                      >
                        {code}
                      </SyntaxHighlighter>
                    );
                  } else {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
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