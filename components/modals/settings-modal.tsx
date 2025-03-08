"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/lib/i18n"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface SettingsModalProps {
  language: string
  onClose: () => void
}

export default function SettingsModal({ language, onClose }: SettingsModalProps) {
  const { t } = useTranslation()
  const { toast } = useToast()

  // Load saved settings from localStorage
  const [openAISettings, setOpenAISettings] = useState({
    endpoint: localStorage.getItem("openai_endpoint") || "https://api.openai.com/v1",
    model: localStorage.getItem("openai_model") || "gpt-4",
    token: localStorage.getItem("openai_token") || "",
  })

  const [questionSettings, setQuestionSettings] = useState({
    type: localStorage.getItem("question_type") || "all",
    category: localStorage.getItem("question_category") || "all",
    difficulty: localStorage.getItem("question_difficulty") || "all",
    weightedMistakes: localStorage.getItem("weighted_mistakes") === "true",
  })

  // Define different categories based on question type
  const codingCategories = [
    { value: "all", label: t("settings.all") },
    { value: "algorithms", label: "Algorithms" },
    { value: "data-structures", label: "Data Structures" },
    { value: "javascript", label: "JavaScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "react", label: "React" },
  ]

  const conceptualCategories = [
    { value: "all", label: t("settings.all") },
    { value: "tcp", label: "TCP/IP" },
    { value: "databases", label: "Databases" },
    { value: "system-design", label: "System Design" },
    { value: "oop", label: "OOP Concepts" },
    { value: "web", label: "Web Technologies" },
  ]

  // Get the appropriate categories based on question type
  const getCategories = () => {
    if (questionSettings.type === "coding") {
      return codingCategories
    } else if (questionSettings.type === "question") {
      return conceptualCategories
    } else {
      // For "all" type, combine both sets of categories
      return [
        { value: "all", label: t("settings.all") },
        ...codingCategories.filter((cat) => cat.value !== "all"),
        ...conceptualCategories.filter((cat) => cat.value !== "all"),
      ]
    }
  }

  // Reset category when question type changes
  useEffect(() => {
    setQuestionSettings((prev) => ({
      ...prev,
      category: "all",
    }))
  }, [questionSettings.type])

  const handleSave = () => {
    // Save OpenAI settings
    localStorage.setItem("openai_endpoint", openAISettings.endpoint)
    localStorage.setItem("openai_model", openAISettings.model)
    localStorage.setItem("openai_token", openAISettings.token)

    // Save question settings
    localStorage.setItem("question_type", questionSettings.type)
    localStorage.setItem("question_category", questionSettings.category)
    localStorage.setItem("question_difficulty", questionSettings.difficulty)
    localStorage.setItem("weighted_mistakes", questionSettings.weightedMistakes.toString())

    toast({
      title: t("toast.settings.title"),
      description: t("toast.settings.description"),
      duration: 3000,
    })

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="questions">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="questions">{t("settings.questions")}</TabsTrigger>
            <TabsTrigger value="openai">{t("settings.openai")}</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.questionType")}</Label>
              <Select
                value={questionSettings.type}
                onValueChange={(value) => setQuestionSettings({ ...questionSettings, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("settings.all")}</SelectItem>
                  <SelectItem value="coding">{t("settings.coding")}</SelectItem>
                  <SelectItem value="question">{t("settings.question")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.category")}</Label>
              <Select
                value={questionSettings.category}
                onValueChange={(value) => setQuestionSettings({ ...questionSettings, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.all")} />
                </SelectTrigger>
                <SelectContent>
                  {getCategories().map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("settings.difficulty")}</Label>
              <Select
                value={questionSettings.difficulty}
                onValueChange={(value) => setQuestionSettings({ ...questionSettings, difficulty: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("settings.all")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("settings.all")}</SelectItem>
                  <SelectItem value="easy">{t("settings.easy")}</SelectItem>
                  <SelectItem value="medium">{t("settings.medium")}</SelectItem>
                  <SelectItem value="hard">{t("settings.hard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("settings.weightedMistakes")}</Label>
                <div className="text-sm text-muted-foreground">{t("settings.weightedMistakesDescription")}</div>
              </div>
              <Switch
                checked={questionSettings.weightedMistakes}
                onCheckedChange={(checked) => setQuestionSettings({ ...questionSettings, weightedMistakes: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="openai" className="space-y-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-sm">
              {t("settings.apiNote") ||
                "Default API settings are loaded from server environment variables. Custom settings below will override defaults."}
            </div>

            <div className="space-y-2">
              <Label>{t("settings.endpoint")}</Label>
              <Input
                placeholder="https://api.openai.com/v1"
                value={openAISettings.endpoint}
                onChange={(e) => setOpenAISettings({ ...openAISettings, endpoint: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("settings.model")}</Label>
              <Select
                value={openAISettings.model}
                onValueChange={(value) => setOpenAISettings({ ...openAISettings, model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="gpt-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="custom">{t("settings.custom")}</SelectItem>
                </SelectContent>
              </Select>

              {openAISettings.model === "custom" && (
                <Input
                  className="mt-2"
                  placeholder={t("settings.customModel")}
                  value={openAISettings.model === "custom" ? "" : openAISettings.model}
                  onChange={(e) => setOpenAISettings({ ...openAISettings, model: e.target.value })}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("settings.token")}</Label>
              <Input
                type="password"
                placeholder="sk-..."
                value={openAISettings.token}
                onChange={(e) => setOpenAISettings({ ...openAISettings, token: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">{t("settings.tokenDescription")}</p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={handleSave}>{t("button.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

