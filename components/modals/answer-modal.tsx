"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Loader2 } from "lucide-react"
import { cleanupJsonResponse, formatCodeBlock, preprocessCodeInAnswer } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {github} from "react-syntax-highlighter/dist/esm/styles/hljs";

interface AnswerModalProps {
  answer: string
  language: string
  onClose: () => void
  isStreaming?: boolean
  onRetry?: () => void
}

export default function AnswerModal({ answer, language, onClose, isStreaming = false, onRetry }: AnswerModalProps) {
  const { t } = useTranslation()
  const [parsedAnswer, setParsedAnswer] = useState<any>(null)

  useEffect(() => {
    try {
      if (!isStreaming) {
        const cleanedResults = cleanupJsonResponse(answer)
        const parsed = JSON.parse(cleanedResults)
        // Apply our preprocessor to fix code blocks
        const processedAnswer = preprocessCodeInAnswer(parsed)
        setParsedAnswer(processedAnswer)
      }else {
        setParsedAnswer(answer)
      }
    } catch (e) {
      if (!isStreaming) {
        setParsedAnswer(answer)
      }
    }
  }, [answer, isStreaming])

  // 显示加载状态
  if (isStreaming) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>{t("answer.modalTitle")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("answer.generating")}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Use parsed answer if available, otherwise fall back to the original answer
  const displayAnswer = parsedAnswer || answer

  // If we're still getting string data but couldn't parse it yet
  if (typeof displayAnswer === "string") {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-4xl md:max-w-5xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>{t("answer.modalTitle")}</DialogTitle>
          </DialogHeader>
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
                      
                      if (!inline) {
                        // Format code using our utility function 
                        const { code, language: detectedLanguage } = formatCodeBlock(String(children));
                        // Use either the detected language or the one from className
                        const langToUse = match ? match[1] : detectedLanguage;
                        
                        return (
                          <SyntaxHighlighter
                            style={github}
                            language={langToUse || 'text'}
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
                  {displayAnswer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="flex justify-between">
            <div>
              {onRetry && (
                <Button onClick={onRetry} variant="outline" disabled={isStreaming}>
                  <Loader2 className={`h-4 w-4 mr-2 ${isStreaming ? 'animate-spin' : 'hidden'}`} />
                  {t("button.regenerate")}
                </Button>
              )}
            </div>
            <Button onClick={onClose}>{t("button.close")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const answerContent = typeof displayAnswer === "string" ?
      displayAnswer : displayAnswer.answer?.[language] || displayAnswer.answer?.en || displayAnswer

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-4xl md:max-w-5xl max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("answer.modalTitle")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
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
                          style={github}
                          language={langToUse || 'text'}
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
        </div>

        <div className="flex justify-between">
          <div>
            {onRetry && (
              <Button onClick={onRetry} variant="outline" disabled={isStreaming}>
                <Loader2 className={`h-4 w-4 mr-2 ${isStreaming ? 'animate-spin' : 'hidden'}`} />
                {t("button.regenerate")}
              </Button>
            )}
          </div>
          <Button onClick={onClose}>{t("button.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

