"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface HistoryModalProps {
  language: string
  onClose: () => void
}

export default function HistoryModal({ language, onClose }: HistoryModalProps) {
  const { t } = useTranslation()

  // Mock history data
  const historyItems = [
    {
      id: 1,
      date: "2023-08-24",
      title: {
        en: "Reverse a String",
        zh: "反转字符串",
      },
      category: "Algorithms",
      difficulty: "Easy",
      score: 0.85,
      feedback: {
        en: "Good solution with minor improvements needed.",
        zh: "良好的解决方案，需要小的改进。",
      },
    },
    {
      id: 2,
      date: "2023-08-23",
      title: {
        en: "Explain TCP Handshake",
        zh: "解释 TCP 握手",
      },
      category: "TCP",
      difficulty: "Medium",
      score: 0.72,
      feedback: {
        en: "Decent explanation but missing some key details.",
        zh: "解释不错，但缺少一些关键细节。",
      },
    },
  ]

  const handleReportMistake = (id: number) => {
    console.log("Report mistake for item:", id)
    // In a real app, this would open a GitHub issue creation form
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-2xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("history.title")}</DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {historyItems.map((item) => (
            <Card key={item.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    {item.title[language as keyof typeof item.title] || item.title.en}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">{item.date}</div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline">{item.category}</Badge>
                  <Badge
                    variant="outline"
                    className={`
                    ${item.difficulty === "Easy" ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" : ""}
                    ${item.difficulty === "Medium" ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" : ""}
                    ${item.difficulty === "Hard" ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : ""}
                  `}
                  >
                    {item.difficulty}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                  >
                    {Math.round(item.score * 100)}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.feedback[language as keyof typeof item.feedback] || item.feedback.en}
                </p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 dark:text-red-400"
                  onClick={() => handleReportMistake(item.id)}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {t("history.reportMistake")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>{t("button.close")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

