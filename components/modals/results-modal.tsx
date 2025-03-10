"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"
import { cleanupJsonResponse } from "@/lib/utils"

interface ResultsModalProps {
  results: any
  language: string
  onClose: () => void
  isStreaming?: boolean
}

export default function ResultsModal({ results, language, onClose, isStreaming = false }: ResultsModalProps) {
  const { t } = useTranslation()
  const [parsedResults, setParsedResults] = useState<any>(null)

  useEffect(() => {
    if (!results) return
    if(isStreaming) return
    try{
      const cleanedResults = cleanupJsonResponse(results)
      const parsed = JSON.parse(cleanedResults)
      setParsedResults(parsed)
    } catch (e) {
      setParsedResults(results)
    }
  }, [results, isStreaming])

  if (!results) return null

  // Show loading state while streaming and before we have parsed results
  if (isStreaming) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>{t("results.title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("results.analyzing")}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Use parsed results if available, otherwise fall back to the original results
  const displayResults = parsedResults || results

  // If we're still getting string data but couldn't parse it yet
  if (typeof displayResults === "string") {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>{t("results.title")}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("results.processing")}</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const feedback = displayResults.feedback[language] || displayResults.feedback.en
  const suggestions = displayResults.improvementSuggestions.map(
    (suggestion: any) => suggestion[language] || suggestion.en,
  )

  const overallScorePercentage = Math.round(displayResults.overallScore * 100)

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("results.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <div className="inline-flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 p-6 mb-4">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{overallScorePercentage}%</div>
            </div>
            <h3 className="text-lg font-medium mb-2">{t("results.overallScore")}</h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>{t("results.correctness")}</span>
                <span>{Math.round(displayResults.categoryScores.correctness * 100)}%</span>
              </div>
              <Progress value={displayResults.categoryScores.correctness * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>{t("results.efficiency")}</span>
                <span>{Math.round(displayResults.categoryScores.efficiency * 100)}%</span>
              </div>
              <Progress value={displayResults.categoryScores.efficiency * 100} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>{t("results.readability")}</span>
                <span>{Math.round(displayResults.categoryScores.readability * 100)}%</span>
              </div>
              <Progress value={displayResults.categoryScores.readability * 100} className="h-2" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t("results.feedback")}</h3>
            <p className="text-gray-700 dark:text-gray-300">{feedback}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">{t("results.suggestions")}</h3>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
              {suggestions.map((suggestion: string, index: number) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>{t("button.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

