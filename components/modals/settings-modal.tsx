"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { QuestionCategory } from "@/lib/types";

interface SettingsModalProps {
  language: string;
  onClose: () => void;
}

export default function SettingsModal({
  language,
  onClose,
}: SettingsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Load saved settings from localStorage
  const [openAISettings, setOpenAISettings] = useState({
    endpoint: localStorage.getItem("openai_endpoint") || "",
    model: localStorage.getItem("openai_model") || "gpt-4o",
    token: localStorage.getItem("openai_token") || "",
  });

  // Track if custom model is selected
  const [isCustomModel, setIsCustomModel] = useState(
    !["gpt-4", "gpt-4o", "gpt-3.5-turbo"].includes(openAISettings.model),
  );

  const [questionSettings, setQuestionSettings] = useState({
    type: localStorage.getItem("question_type") || "",
    category: localStorage.getItem("question_category") || "",
    difficulty: localStorage.getItem("question_difficulty") || "",
    weightedMistakes: localStorage.getItem("weighted_mistakes") === "true",
  });

  const [activeTab, setActiveTab] = useState("questions");

  // Define different categories based on question type

  const categories = (
    Object.keys(QuestionCategory) as (keyof typeof QuestionCategory)[]
  ).map((k) => ({ key: k, value: QuestionCategory[k] }));

  // Check if all OpenAI fields are filled
  const allOpenAIFieldsFilled =
    openAISettings.endpoint && openAISettings.model && openAISettings.token;

  // Effect to update status message when fields change
  useEffect(() => {
    // This is just to trigger a re-render when fields change
  }, [openAISettings.endpoint, openAISettings.model, openAISettings.token]);

  const handleSave = () => {
    // Always save question settings
    localStorage.setItem("question_type", questionSettings.type);
    localStorage.setItem("question_category", questionSettings.category);
    localStorage.setItem("question_difficulty", questionSettings.difficulty);
    localStorage.setItem(
      "weighted_mistakes",
      questionSettings.weightedMistakes.toString(),
    );

    // Only save OpenAI settings if all three fields are filled
    if (allOpenAIFieldsFilled) {
      localStorage.setItem("openai_endpoint", openAISettings.endpoint);
      localStorage.setItem("openai_model", openAISettings.model);
      localStorage.setItem("openai_token", openAISettings.token);
    }

    toast({
      title: t("toast.settings.title"),
      description: t("toast.settings.description"),
      duration: 3000,
    });

    onClose();
  };

  // Function to reset all settings to default
  const resetSettings = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    // Reset question settings
    setQuestionSettings({
      type: "",
      category: "",
      difficulty: "",
      weightedMistakes: false,
    });

    // Reset OpenAI settings
    setOpenAISettings({
      endpoint: "",
      model: "gpt-4o",
      token: "",
    });

    // Reset custom model flag
    setIsCustomModel(false);

    // Clear settings from localStorage
    localStorage.removeItem("question_type");
    localStorage.removeItem("question_category");
    localStorage.removeItem("question_difficulty");
    localStorage.removeItem("weighted_mistakes");
    localStorage.removeItem("openai_endpoint");
    localStorage.removeItem("openai_model");
    localStorage.removeItem("openai_token");

    setShowResetConfirmation(false);

    toast({
      title: t("toast.reset.title") || "Settings Reset",
      description:
        t("toast.reset.description") ||
        "All settings have been reset to default",
      duration: 3000,
    });
  };

  const cancelReset = () => {
    setShowResetConfirmation(false);
  };

  return (
    <>
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>{t("settings.title")}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="questions" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="questions">
                {t("settings.questions")}
              </TabsTrigger>
              <TabsTrigger value="openai">{t("settings.openai")}</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <div className="space-y-2">
                <Label>{t("settings.questionType")}</Label>
                <Select
                  value={questionSettings.type}
                  onValueChange={(value) =>
                    setQuestionSettings({ ...questionSettings, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("settings.all")}</SelectItem>
                    <SelectItem value="coding">
                      {t("settings.coding")}
                    </SelectItem>
                    <SelectItem value="question">
                      {t("settings.question")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.category")}</Label>
                <Select
                  value={questionSettings.category}
                  onValueChange={(value) =>
                    setQuestionSettings({
                      ...questionSettings,
                      category: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.key} value={category.value}>
                        {category.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("settings.difficulty")}</Label>
                <Select
                  value={questionSettings.difficulty}
                  onValueChange={(value) =>
                    setQuestionSettings({
                      ...questionSettings,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("settings.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("settings.all")}</SelectItem>
                    <SelectItem value="easy">{t("settings.easy")}</SelectItem>
                    <SelectItem value="medium">
                      {t("settings.medium")}
                    </SelectItem>
                    <SelectItem value="hard">{t("settings.hard")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settings.weightedMistakes")}</Label>
                  <div className="text-sm text-muted-foreground">{t("settings.weightedMistakesDescription")}</div>
                </div>
                <Switch
                  checked={questionSettings.weightedMistakes}
                  onCheckedChange={(checked) => setQuestionSettings({ ...questionSettings, weightedMistakes: checked })}
                />
              </div> */}
            </TabsContent>

            <TabsContent value="openai" className="space-y-4">
              <div
                className={`p-3 rounded-md text-sm mb-4 ${
                  allOpenAIFieldsFilled
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400"
                }`}
              >
                {allOpenAIFieldsFilled
                  ? t("settings.willBeSaved") || "OpenAI settings will be saved"
                  : t("settings.willNotBeSaved") ||
                    "OpenAI settings will not be saved"}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {t("settings.endpoint")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="https://api.openai.com/v1"
                    value={openAISettings.endpoint}
                    onChange={(e) =>
                      setOpenAISettings({
                        ...openAISettings,
                        endpoint: e.target.value,
                      })
                    }
                    onFocus={(e) => {
                      // If the user clicks into an empty field, don't pre-fill with placeholder
                      if (!openAISettings.endpoint) {
                        e.target.placeholder = "";
                      }
                    }}
                    onBlur={(e) => {
                      // Restore placeholder when field loses focus
                      if (!openAISettings.endpoint) {
                        e.target.placeholder = "https://api.openai.com/v1";
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("settings.model")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={isCustomModel ? "custom" : openAISettings.model}
                    onValueChange={(value) => {
                      if (value === "custom") {
                        setIsCustomModel(true);
                        // Keep the current model value if it's already custom
                        if (!isCustomModel) {
                          setOpenAISettings({ ...openAISettings, model: "" });
                        }
                      } else {
                        setIsCustomModel(false);
                        setOpenAISettings({ ...openAISettings, model: value });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="gpt-4o" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">
                        GPT-3.5 Turbo
                      </SelectItem>
                      <SelectItem value="custom">
                        {t("settings.custom")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustomModel && (
                    <Input
                      className="mt-2"
                      placeholder={t("settings.customModel")}
                      value={openAISettings.model}
                      onChange={(e) =>
                        setOpenAISettings({
                          ...openAISettings,
                          model: e.target.value,
                        })
                      }
                      onFocus={(e) => {
                        e.target.placeholder = "";
                      }}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.placeholder = t("settings.customModel");
                        }
                      }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t("settings.token")}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openAISettings.token}
                    onChange={(e) =>
                      setOpenAISettings({
                        ...openAISettings,
                        token: e.target.value,
                      })
                    }
                    onFocus={(e) => {
                      if (!openAISettings.token) {
                        e.target.placeholder = "";
                      }
                    }}
                    onBlur={(e) => {
                      if (!openAISettings.token) {
                        e.target.placeholder = "sk-...";
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.tokenDescription")}
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={resetSettings}>
                {t("button.resetToDefault") || "Reset to Default"}
              </Button>
              <Button onClick={handleSave}>{t("button.save")}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      {showResetConfirmation && (
        <Dialog
          open={showResetConfirmation}
          onOpenChange={setShowResetConfirmation}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t("settings.resetConfirmTitle") || "Reset All Settings?"}
              </DialogTitle>
              <DialogDescription>
                {t("settings.resetConfirmDescription") ||
                  "This will clear all your custom settings. This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex w-full justify-between">
                <Button variant="outline" onClick={cancelReset}>
                  {t("button.cancel") || "Cancel"}
                </Button>
                <Button variant="destructive" onClick={confirmReset}>
                  {t("button.reset") || "Reset"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
