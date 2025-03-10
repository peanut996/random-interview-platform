"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTranslation } from "@/lib/i18n"
import { Loader2 } from "lucide-react"

interface LoadingQuestionModalProps {
  isOpen: boolean
}

export default function LoadingQuestionModal({ isOpen }: LoadingQuestionModalProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("question.generatingTitle")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("question.generating")}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 