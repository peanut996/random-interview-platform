"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, RefreshCw } from "lucide-react"
import { jsonrepair } from "jsonrepair"
import { useState, useEffect } from "react"

interface AssessmentDisplayProps {
  results: any
  language: string
  isStreaming?: boolean
  onViewAnswer: () => void
  onClose?: () => void  // Optional prop for closing the assessment
  onRetry?: () => void  // Optional prop for retrying the assessment
}

export default function AssessmentDisplay({ 
  results, 
  language, 
  isStreaming = false,
  onViewAnswer,
  onClose,
  onRetry
}: AssessmentDisplayProps) {
  const { t } = useTranslation()
  const [parsedResults, setParsedResults] = useState<any>(null)
  
  useEffect(() => {
    try {
      if (!isStreaming) {
        const parsed = JSON.parse(jsonrepair(results))
        setParsedResults(parsed)
      } else {
        setParsedResults(results)
      }
    } catch (e) {
      if (!isStreaming) {
        setParsedResults(results)
      }
    }
  }, [results, isStreaming])

  // Show loading state if streaming or no results
  if (isStreaming || !parsedResults) {
    return (
      <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">{t("results.title")}</h3>
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              AI
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("results.analyzing")}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Handle raw string results (error case)
  if (typeof parsedResults === "string") {
    return (
      <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">{t("results.title")}</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                AI
              </Badge>
              {onClose && (
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title={t("common.close")}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>{t("results.processFailure")}</p>
            <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-w-full">
              {parsedResults}
            </pre>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayResults = parsedResults;
  const feedback = displayResults.feedback[language] || displayResults.feedback.en
  const suggestions = displayResults.improvementSuggestions.map(
    (suggestion: any) => suggestion[language] || suggestion.en,
  )

  const overallScorePercentage = Math.round(displayResults.overallScore * 100)

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium">{t("results.title")}</h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              AI
            </Badge>
            {onRetry && (
              <Button variant="ghost" size="icon" onClick={onRetry} className="h-8 w-8" title={t("button.regenerate")}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8" title={t("common.close")}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
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
          
          <div className="flex justify-end gap-3">
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                {t("common.close")}
              </Button>
            )}
            <Button onClick={onViewAnswer}>
              {t("button.viewAnswer")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}