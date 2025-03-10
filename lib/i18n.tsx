"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

// Define translations
const translations = {
  en: {
    "app.title": "AI Interview Simulator",
    "question.testCases": "Test Cases",
    "question.input": "Input",
    "question.output": "Output",
    "question.generating": "Generating your question...",
    "question.generatingTitle": "Loading Question",
    "question.error": "Failed to load question. Please try again.",
    "toast.error.questionLoad": "Failed to load question. Please check your API settings and try again.",
    "answer.title": "Your Answer",
    "answer.editor": "Editor",
    "answer.preview": "Preview",
    "answer.codePlaceholder": "Write your code here...",
    "answer.textPlaceholder": "Write your answer here...",
    "answer.noCode": "No code entered yet",
    "answer.modalTitle": "AI-Generated Answer",
    "answer.generating": "Generating model answer...",
    "answer.processing": "Processing answer...",
    "button.notMyStack": "Not My Stack",
    "button.submit": "Submit",
    "button.nextQuestion": "Next Question",
    "button.viewAnswer": "View Answer",
    "button.close": "Close",
    "button.save": "Save",
    "button.yes": "Yes",
    "button.no": "No",
    "button.copy": "Copy",
    "button.copied": "Copied!",
    "results.title": "Results",
    "results.overallScore": "Overall Score",
    "results.correctness": "Correctness",
    "results.efficiency": "Efficiency",
    "results.readability": "Readability",
    "results.feedback": "Feedback",
    "results.suggestions": "Improvement Suggestions",
    "results.analyzing": "Analyzing your answer...",
    "results.processing": "Processing results...",
    "confirmation.step1.title": "View Answer?",
    "confirmation.step1.description":
      "Are you sure you want to see the answer? You won't be able to submit your own solution after viewing.",
    "confirmation.step2.title": "Seriously?",
    "confirmation.step2.description": "Give it another try! Solving it yourself will help you learn better.",
    "confirmation.step3.title": "Last Chance!",
    "confirmation.step3.description": "Are you absolutely sure you want to see the answer?",
    "history.title": "Interview History",
    "history.reportMistake": "Report Mistake",
    "history.empty": "No history records yet",
    "history.answered": "Answered",
    "history.unanswered": "Unanswered",
    "history.clearAll": "Clear All",
    "common.close": "Close",
    "settings.title": "Settings",
    "settings.questions": "Questions",
    "settings.openai": "OpenAI",
    "settings.gemini": "Gemini API",
    "settings.geminiNote": "Configure Google's Gemini API settings",
    "settings.questionType": "Question Type",
    "settings.all": "All",
    "settings.coding": "Coding",
    "settings.question": "Question",
    "settings.category": "Category",
    "settings.difficulty": "Difficulty",
    "settings.easy": "Easy",
    "settings.medium": "Medium",
    "settings.hard": "Hard",
    "settings.weightedMistakes": "Weighted Mistakes Mode",
    "settings.weightedMistakesDescription": "Prioritize questions you've answered incorrectly",
    "settings.endpoint": "API Endpoint",
    "settings.model": "Model",
    "settings.custom": "Custom",
    "toast.notMyStack.title": "Marked as Not My Stack",
    "toast.notMyStack.description": "Moving to the next question",
    "toast.settings.title": "Settings Saved",
    "toast.settings.description": "Your preferences have been updated",
    "toast.copied.title": "Copied!",
    "toast.copied.description": "Code copied to clipboard",
    "settings.token": "API Key",
    "settings.tokenDescription": "Your API key is stored locally and never sent to our servers",
    "settings.customModel": "Enter custom model name",
    "toast.error.title": "Error",
    "toast.error.description": "Something went wrong. Please check your API settings and try again.",
    "toast.error.copyFailed": "Failed to copy to clipboard",
    "toast.loading.title": "Loading",
    "toast.loading.description": "Generating model answer...",
    "settings.apiNote":
      "Default API settings are loaded from server environment variables. Custom settings below will override defaults.",
    "editor.loading": "Loading editor...",
    "editor.language": "Language",
    "editor.theme": "Theme",
    "editor.fontSize": "Font Size",
    "editor.selectLanguage": "Select language",
    "editor.selectTheme": "Select theme",
  },
  zh: {
    "app.title": "AI 面试模拟器",
    "question.testCases": "测试用例",
    "question.input": "输入",
    "question.output": "输出",
    "question.generating": "正在生成您的问题...",
    "question.generatingTitle": "加载问题中",
    "question.error": "加载问题失败。请重试。",
    "toast.error.questionLoad": "加载问题失败。请检查您的 API 设置并重试。",
    "answer.title": "你的回答",
    "answer.editor": "编辑器",
    "answer.preview": "预览",
    "answer.codePlaceholder": "在这里编写代码...",
    "answer.textPlaceholder": "在这里写下你的回答...",
    "answer.noCode": "尚未输入代码",
    "answer.modalTitle": "AI 生成的答案",
    "answer.generating": "正在生成模型答案...",
    "answer.processing": "正在处理答案...",
    "button.notMyStack": "不是我的技术栈",
    "button.submit": "提交",
    "button.nextQuestion": "下一题",
    "button.viewAnswer": "查看答案",
    "button.close": "关闭",
    "button.save": "保存",
    "button.yes": "是",
    "button.no": "否",
    "button.copy": "复制",
    "button.copied": "已复制！",
    "results.title": "结果",
    "results.overallScore": "总分",
    "results.correctness": "正确性",
    "results.efficiency": "效率",
    "results.readability": "可读性",
    "results.feedback": "反馈",
    "results.suggestions": "改进建议",
    "results.analyzing": "正在分析您的答案...",
    "results.processing": "正在处理结果...",
    "confirmation.step1.title": "查看答案？",
    "confirmation.step1.description": "你确定要查看答案吗？查看后将无法提交自己的解决方案。",
    "confirmation.step2.title": "认真的吗？",
    "confirmation.step2.description": "再试一次吧！自己解决问题将帮助你更好地学习。",
    "confirmation.step3.title": "最后机会！",
    "confirmation.step3.description": "你确定要查看答案吗？",
    "history.title": "面试历史",
    "history.reportMistake": "报告错误",
    "history.empty": "暂无历史记录",
    "history.answered": "已回答",
    "history.unanswered": "未回答",
    "history.clearAll": "清除全部",
    "common.close": "关闭",
    "settings.title": "设置",
    "settings.questions": "问题",
    "settings.openai": "OpenAI",
    "settings.gemini": "Gemini API",
    "settings.geminiNote": "配置 Google 的 Gemini API 设置",
    "settings.questionType": "问题类型",
    "settings.all": "全部",
    "settings.coding": "编程",
    "settings.question": "问答",
    "settings.category": "类别",
    "settings.difficulty": "难度",
    "settings.easy": "简单",
    "settings.medium": "中等",
    "settings.hard": "困难",
    "settings.weightedMistakes": "加权错误模式",
    "settings.weightedMistakesDescription": "优先显示你回答错误的问题",
    "settings.endpoint": "API 端点",
    "settings.model": "模型",
    "settings.custom": "自定义",
    "toast.notMyStack.title": "已标记为不是我的技术栈",
    "toast.notMyStack.description": "正在跳转到下一题",
    "toast.settings.title": "设置已保存",
    "toast.settings.description": "您的偏好已更新",
    "toast.copied.title": "已复制！",
    "toast.copied.description": "代码已复制到剪贴板",
    "settings.token": "API 密钥",
    "settings.tokenDescription": "您的 API 密钥存储在本地，永远不会发送到我们的服务器",
    "settings.customModel": "输入自定义模型名称",
    "toast.error.title": "错误",
    "toast.error.description": "出现了问题。请检查您的 API 设置并重试。",
    "toast.error.copyFailed": "复制到剪贴板失败",
    "toast.loading.title": "加载中",
    "toast.loading.description": "正在生成模型答案...",
    "settings.apiNote": "默认 API 设置从服务器环境变量加载。下面的自定义设置将覆盖默认值。",
    "editor.loading": "正在加载编辑器...",
    "editor.language": "编程语言",
    "editor.theme": "主题",
    "editor.fontSize": "字体大小",
    "editor.selectLanguage": "选择编程语言",
    "editor.selectTheme": "选择主题",
  },
}

// Create context
const I18nContext = createContext<{
  t: (key: string) => string
  language: string
  setLanguage: (lang: string) => void
}>({
  t: () => "",
  language: "zh", // Default to Chinese
  setLanguage: () => {},
})

// Provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("zh") // Default to Chinese

  // Load language from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("language", language)
  }, [language])

  // Translation function
  const t = (key: string) => {
    return (
      (translations[language as keyof typeof translations] as Record<string, string>)?.[key] || 
      (translations.en as Record<string, string>)[key] || 
      key
    )
  }

  return <I18nContext.Provider value={{ t, language, setLanguage }}>{children}</I18nContext.Provider>
}

// Hook for using translations
export function useTranslation() {
  return useContext(I18nContext)
}

