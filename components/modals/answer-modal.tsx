"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"

interface AnswerModalProps {
  answer: any
  language: string
  onClose: () => void
}

export default function AnswerModal({ answer, language, onClose }: AnswerModalProps) {
  const { t } = useTranslation()

  if (!answer) return null

  const answerContent = answer.answer[language] || answer.answer.en

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("answer.modalTitle")}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="prose dark:prose-invert max-w-none">
            <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto">{answerContent}</pre>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>{t("button.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

