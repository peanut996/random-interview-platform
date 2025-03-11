"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useTranslation } from "@/lib/i18n"
import { Code } from "lucide-react"

interface FooterAreaProps {
  timeRemaining: number
  timerWarning: boolean
  onSubmit: () => void
  onNextQuestion: () => void
  onViewAnswer: () => void
  onNotMyStack: () => void
  onSwitchToCode?: () => void
  isSubmitted: boolean
  showSwitchTypeButton?: boolean
}

export default function FooterArea({
  timeRemaining,
  timerWarning,
  onSubmit,
  onNextQuestion,
  onViewAnswer,
  onNotMyStack,
  onSwitchToCode,
  isSubmitted,
  showSwitchTypeButton = false,
}: FooterAreaProps) {
  const { t } = useTranslation()

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 p-4 bg-background">
      <Card className="shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className={`text-xl font-mono font-semibold ${timerWarning ? "text-red-500 animate-pulse" : ""}`}>
              {formatTime(timeRemaining)}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={onNotMyStack}>
                {t("button.notMyStack")}
              </Button>
              
              {showSwitchTypeButton && onSwitchToCode && (
                <Button variant="outline" onClick={onSwitchToCode}>
                  <Code className="mr-2 h-4 w-4" />
                  {t("button.switchToCode") || "Switch to Code Editor"}
                </Button>
              )}
              
              <Button variant="outline" onClick={onViewAnswer}>
                {t("button.viewAnswer")}
              </Button>

              <Button variant="outline" onClick={onNextQuestion} disabled={!isSubmitted}>
                {t("button.nextQuestion")}
              </Button>

              <Button onClick={onSubmit} disabled={isSubmitted}>
                {t("button.submit")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

