"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Loader2 } from "lucide-react"
import { cleanupJsonResponse } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { useTheme } from "next-themes"

interface AnswerModalProps {
  answer: string
  language: string
  onClose: () => void
  isStreaming?: boolean
}

export default function AnswerModal({ answer, language, onClose, isStreaming = false }: AnswerModalProps) {
  const { t } = useTranslation()
  const [parsedAnswer, setParsedAnswer] = useState<any>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (!answer) return
    if(isStreaming) return
    try{
      const cleanedResults = cleanupJsonResponse(answer)
      const parsed = JSON.parse(cleanedResults)
      setParsedAnswer(parsed)
    } catch (e) {
      setParsedAnswer(answer)
    }
  }, [answer, isStreaming])

  if (!answer) return null

  // Show loading state while streaming and before we have parsed answer
  if (isStreaming && !parsedAnswer) {
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
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("answer.processing")}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const answerContent = displayAnswer.answer[language] || displayAnswer.answer.en

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
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={isDark ? vscDarkPlus : vs}
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
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>{t("button.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

