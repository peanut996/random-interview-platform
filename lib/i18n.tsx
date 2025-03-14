'use client';

import type React from 'react';

import { useState, useEffect, createContext, useContext } from 'react';

// Define translations
const translations = {
  en: {
    'app.title': 'AI Interview Simulator',
    'question.testCases': 'Test Cases',
    'question.input': 'Input',
    'question.output': 'Output',
    'question.generating': 'Generating your question...',
    'question.generatingTitle': 'Loading Question',
    'question.error': 'Failed to load question. Please try again.',
    'question.errorTitle': 'Error', // Added translation
    'question.retry': 'Retry', // Added translation
    'toast.error.questionLoad':
      'Failed to load question. Please check your API settings and try again.',
    'answer.title': 'Your Answer',
    'answer.editor': 'Editor',
    'answer.preview': 'Preview',
    'answer.codePlaceholder': 'Write your code here...',
    'answer.textPlaceholder': 'Write your answer here...',
    'answer.noCode': 'No code entered yet',
    'answer.modalTitle': 'Answer',
    'answer.generating': 'Generating answer...',
    'answer.processing': 'Processing answer...',
    'answer.stillGenerating': 'Still generating content...',
    'answer.processFailure':
      "The answer couldn't be processed properly. Please retry! Showing raw output:",
    'answer.regenerate': 'Regenerate Answer',
    'button.notMyStack': 'Regenerate Question',
    'button.submit': 'Submit',
    'button.nextQuestion': 'Next Question',
    'button.viewAnswer': 'View Answer',
    'button.close': 'Close',
    'button.save': 'Save',
    'button.switchToCode': 'Switch to Code Editor',
    'button.resetToDefault': 'Reset to Default',
    'button.cancel': 'Cancel',
    'button.reset': 'Reset',
    'button.yes': 'Yes',
    'button.no': 'No',
    'button.copy': 'Copy',
    'button.copied': 'Copied!',
    'button.regenerate': 'Regenerate',
    'results.title': 'Results',
    'results.overallScore': 'Overall Score',
    'results.correctness': 'Correctness',
    'results.efficiency': 'Efficiency',
    'results.readability': 'Readability',
    'results.feedback': 'Feedback',
    'results.suggestions': 'Improvement Suggestions',
    'results.analyzing': 'Analyzing your answer...',
    'results.processing': 'Processing results...',
    'results.processFailure': 'Failed to process results. Displaying raw response.',
    'confirmation.step1.title': 'View Answer?',
    'confirmation.step1.description':
      "Are you sure you want to see the answer? You won't be able to submit your own solution after viewing.",
    'confirmation.step2.title': 'Seriously?',
    'confirmation.step2.description':
      'Give it another try! Solving it yourself will help you learn better.',
    'confirmation.step3.title': 'Last Chance!',
    'confirmation.step3.description': 'Are you absolutely sure you want to see the answer?',
    'history.title': 'Interview History',
    'history.reportMistake': 'Report Mistake',
    'history.empty': 'No history records yet',
    'history.answered': 'Answered',
    'history.unanswered': 'Unanswered',
    'history.clearAll': 'Clear All',
    'common.close': 'Close',
    'settings.title': 'Settings',
    'settings.questions': 'Questions',
    'settings.openai': 'OpenAI',
    'settings.gemini': 'Gemini API',
    'settings.geminiNote': "Configure Google's Gemini API settings",
    'settings.questionType': 'Question Type',
    'settings.all': 'All',
    'settings.coding': 'Coding',
    'settings.question': 'Question',
    'settings.category': 'Category',
    'settings.difficulty': 'Difficulty',
    'settings.easy': 'Easy',
    'settings.medium': 'Medium',
    'settings.hard': 'Hard',
    'settings.weightedMistakes': 'Weighted Mistakes Mode',
    'settings.weightedMistakesDescription': "Prioritize questions you've answered incorrectly",
    'settings.endpoint': 'API Endpoint',
    'settings.model': 'Model',
    'settings.custom': 'Custom',
    'settings.useQuestionBank': 'Use Question Bank',
    'settings.useQuestionBankDesc': 'Use predefined questions instead of generating new ones',
    'toast.notMyStack.title': 'Marked as Not My Stack',
    'toast.notMyStack.description': 'Moving to the next question',
    'toast.settings.title': 'Settings Saved',
    'toast.settings.description': 'Your preferences have been updated',
    'toast.reset.title': 'Settings Reset',
    'toast.reset.description': 'All settings have been reset to default',
    'toast.copied.title': 'Copied!',
    'toast.copied.description': 'Code copied to clipboard',
    'toast.switchedToCode.title': 'Switched to Code Editor',
    'toast.switchedToCode.description': 'The question type has been changed to coding',
    'settings.token': 'API Key',
    'settings.tokenDescription': 'Your API key is stored locally and never sent to our servers',
    'settings.customModel': 'Enter custom model name',
    'toast.error.title': 'Error',
    'toast.error.description':
      'Something went wrong. Please check your API settings and try again.',
    'toast.error.copyFailed': 'Failed to copy to clipboard',
    'toast.loading.title': 'Loading',
    'toast.loading.description': 'Generating model answer...',
    'settings.apiNote':
      'Default API settings are loaded from server environment variables. Custom settings below will override defaults.',
    'settings.requiredFields':
      'All three fields (Endpoint, Model, and API Key) must be filled to save OpenAI settings. If any field is empty, OpenAI settings will not be saved.',
    'settings.resetConfirmTitle': 'Reset All Settings?',
    'settings.resetConfirmDescription':
      'This will clear all your custom settings. This action cannot be undone.',
    'settings.willBeSaved': 'OpenAI settings will be saved',
    'settings.willNotBeSaved': 'OpenAI settings will not be saved',
    'settings.customCategory': 'Custom Category',
    'settings.addCustomCategory': 'Add custom category...',
    'settings.customCategoryAdded': 'Custom Category Added',
    'settings.customCategoryAddedDesc': 'Added "{category}" to your categories',
    'settings.customCategoryRemoved': 'Custom Category Removed',
    'settings.customCategoryRemovedDesc': 'Removed "{category}" from your categories',
    'settings.existingCustomCategories': 'Your Custom Categories',
    'settings.selectTypeForCustomCategory':
      'Please select a question type (Coding or Question) to add custom categories.',
    'settings.codingCustomCategories': 'Custom Coding Categories',
    'settings.questionCustomCategories': 'Custom Question Categories',
    'settings.cannotAddCategory': 'Cannot Add Category',
    'settings.prompts': 'AI Prompts',
    'settings.questionSystemPrompt': 'Question Generation System Prompt',
    'settings.questionSystemPromptPlaceholder': 'Enter system prompt for question generation...',
    'settings.questionSystemPromptHelp':
      'This prompt guides the AI in generating interview questions.',
    'settings.answerSystemPrompt': 'Answer Generation System Prompt',
    'settings.answerSystemPromptPlaceholder': 'Enter system prompt for answer generation...',
    'settings.answerSystemPromptHelp':
      'This prompt guides the AI in generating model answers to questions.',
    'settings.resetPrompts': 'Reset Prompts to Default',
    'settings.promptsReset': 'Prompts Reset',
    'settings.promptsResetDesc': 'System prompts have been reset to default',
    'editor.loading': 'Loading editor...',
    'editor.language': 'Language',
    'editor.theme': 'Theme',
    'editor.fontSize': 'Font Size',
    'editor.selectLanguage': 'Select language',
    'editor.selectTheme': 'Select theme',
    'answer.confirm': 'Are you ready to view the answer?',
    'answer.confirmButtonYes': 'Yes, show me the answer',
    'answer.confirmButtonNo': "No, I'll keep working",
    'answer.editAnswer': 'Edit Answer',
    'answer.closeAnswer': 'Close Answer',
    'contribution.tooltip': 'Contribute Question',
    'contribution.title': 'Contribute Interview Question',
    'contribution.description':
      'Submit your interview question to help grow our question bank. Your contribution will be reviewed and added via a Pull Request.',
    'contribution.placeholder': 'Type your interview question here...',
    'contribution.requirementPlaceholder': 'Describe your question idea in one sentence...',
    'contribution.hint':
      "Keep it concise. We'll help translate your idea into a fully-formed question.",
    'contribution.submit': 'Submit',
    'contribution.submitting': 'Submitting...',
    'contribution.success.title': 'Idea Received!',
    'contribution.success.description':
      "Thank you for your contribution! We'll work on creating a question from your idea.",
    'contribution.error.title': 'Submission Failed',
    'contribution.error.emptyRequirement':
      'Please enter a brief description of your question idea.',
    'contribution.error.submission':
      'An error occurred while submitting your idea. Please try again.',
    'contribution.emptyContent': 'Empty content',
    'contribution.emptyContentDesc': 'Please enter a question before submitting.',
    'contribution.prCreated': 'Pull Request Created',
    'contribution.prCreatedDesc':
      'Your question has been successfully submitted as a pull request.',
    'contribution.viewPR': 'View Pull Request',
    'contribution.thankYou': 'Thank you for contributing to our question bank!',
    'contribution.close': 'Close',
  },
  zh: {
    'app.title': 'AI 面试模拟器',
    'question.testCases': '测试用例',
    'question.input': '输入',
    'question.output': '输出',
    'question.generating': '正在生成您的问题...',
    'question.generatingTitle': '加载问题中',
    'question.error': '加载问题失败。请重试。',
    'question.errorTitle': '错误', // Added translation
    'question.retry': '重试', // Added translation
    'toast.error.questionLoad': '加载问题失败。请检查您的 API 设置并重试。',
    'answer.title': '你的回答',
    'answer.editor': '编辑器',
    'answer.preview': '预览',
    'answer.codePlaceholder': '在这里编写代码...',
    'answer.textPlaceholder': '在这里写下你的回答...',
    'answer.noCode': '尚未输入代码',
    'answer.modalTitle': '答案',
    'answer.generating': '生成答案中...',
    'answer.processing': '正在处理答案...',
    'answer.stillGenerating': '正在继续生成内容...',
    'answer.processFailure': '答案无法正确处理。请重试！\n 显示原始输出：',
    'answer.regenerate': '重新生成答案',
    'button.notMyStack': '下一题',
    'button.submit': '提交',
    'button.nextQuestion': '下一题',
    'button.viewAnswer': '查看答案',
    'button.close': '关闭',
    'button.save': '保存',
    'button.switchToCode': '切换到代码编辑器',
    'button.resetToDefault': '恢复默认',
    'button.cancel': '取消',
    'button.reset': '重置',
    'button.yes': '是',
    'button.no': '否',
    'button.copy': '复制',
    'button.copied': '已复制！',
    'button.regenerate': '重新生成',
    'results.title': '结果',
    'results.overallScore': '总分',
    'results.correctness': '正确性',
    'results.efficiency': '效率',
    'results.readability': '可读性',
    'results.feedback': '反馈',
    'results.suggestions': '改进建议',
    'results.analyzing': '正在分析您的答案...',
    'results.processing': '正在处理结果...',
    'results.processFailure': '处理结果失败。显示原始响应。',
    'confirmation.step1.title': '查看答案？',
    'confirmation.step1.description': '你确定要查看答案吗？查看后将无法提交自己的解决方案。',
    'confirmation.step2.title': '认真的吗？',
    'confirmation.step2.description': '再试一次吧！自己解决问题将帮助你更好地学习。',
    'confirmation.step3.title': '最后机会！',
    'confirmation.step3.description': '你确定要查看答案吗？',
    'history.title': '面试历史',
    'history.reportMistake': '报告错误',
    'history.empty': '暂无历史记录',
    'history.answered': '已回答',
    'history.unanswered': '未回答',
    'history.clearAll': '清除全部',
    'common.close': '关闭',
    'settings.title': '设置',
    'settings.questions': '问题',
    'settings.openai': 'OpenAI',
    'settings.gemini': 'Gemini API',
    'settings.geminiNote': '配置 Google 的 Gemini API 设置',
    'settings.questionType': '问题类型',
    'settings.all': '全部',
    'settings.coding': '编程',
    'settings.question': '问答',
    'settings.category': '类别',
    'settings.difficulty': '难度',
    'settings.easy': '简单',
    'settings.medium': '中等',
    'settings.hard': '困难',
    'settings.weightedMistakes': '加权错误模式',
    'settings.weightedMistakesDescription': '优先显示你回答错误的问题',
    'settings.endpoint': 'API 端点',
    'settings.model': '模型',
    'settings.custom': '自定义',
    'settings.useQuestionBank': '使用题库',
    'settings.useQuestionBankDesc': '使用预定义的问题而不是生成新问题',
    'toast.notMyStack.title': '已标记为不是我的技术栈',
    'toast.notMyStack.description': '正在跳转到下一题',
    'toast.settings.title': '设置已保存',
    'toast.settings.description': '您的偏好已更新',
    'toast.reset.title': '设置已重置',
    'toast.reset.description': '所有设置已重置为默认值',
    'toast.copied.title': '已复制！',
    'toast.copied.description': '代码已复制到剪贴板',
    'toast.switchedToCode.title': '已切换到代码编辑器',
    'toast.switchedToCode.description': '问题类型已更改为编程题',
    'settings.token': 'API 密钥',
    'settings.tokenDescription': '您的 API 密钥存储在本地，永远不会发送到我们的服务器',
    'settings.customModel': '输入自定义模型名称',
    'toast.error.title': '错误',
    'toast.error.description': '出现了问题。请检查您的 API 设置并重试。',
    'toast.error.copyFailed': '复制到剪贴板失败',
    'toast.loading.title': '加载中',
    'toast.loading.description': '正在生成模型答案...',
    'settings.apiNote': '默认 API 设置从服务器环境变量加载。下面的自定义设置将覆盖默认值。',
    'settings.requiredFields':
      '必须填写所有三个字段（端点、模型和 API 密钥）才能保存 OpenAI 设置。如果任何字段为空，OpenAI 设置将不会被保存。',
    'settings.resetConfirmTitle': '重置所有设置？',
    'settings.resetConfirmDescription': '这将清除所有自定义设置。此操作无法撤消。',
    'settings.willBeSaved': 'OpenAI 设置将被保存',
    'settings.willNotBeSaved': 'OpenAI 设置将不会被保存',
    'settings.customCategory': '自定义类别',
    'settings.addCustomCategory': '添加自定义类别...',
    'settings.customCategoryAdded': '自定义类别已添加',
    'settings.customCategoryAddedDesc': '已将 "{category}" 添加到您的类别中',
    'settings.customCategoryRemoved': '自定义类别已移除',
    'settings.customCategoryRemovedDesc': '已从您的类别中移除 "{category}"',
    'settings.existingCustomCategories': '您的自定义类别',
    'settings.selectTypeForCustomCategory': '请选择一个问题类型（编程或问答）以添加自定义类别。',
    'settings.codingCustomCategories': '自定义编程类别',
    'settings.questionCustomCategories': '自定义问答类别',
    'settings.cannotAddCategory': '无法添加类别',
    'settings.prompts': 'AI 提示词',
    'settings.questionSystemPrompt': '问题生成系统提示词',
    'settings.questionSystemPromptPlaceholder': '输入问题生成的系统提示词...',
    'settings.questionSystemPromptHelp': '该提示词引导 AI 生成面试问题。',
    'settings.answerSystemPrompt': '答案生成系统提示词',
    'settings.answerSystemPromptPlaceholder': '输入答案生成的系统提示词...',
    'settings.answerSystemPromptHelp': '该提示词引导 AI 生成问题的模型答案。',
    'settings.resetPrompts': '重置提示词为默认值',
    'settings.promptsReset': '提示词已重置',
    'settings.promptsResetDesc': '系统提示词已重置为默认值',
    'editor.loading': '正在加载编辑器...',
    'editor.language': '编程语言',
    'editor.theme': '主题',
    'editor.fontSize': '字体大小',
    'editor.selectLanguage': '选择编程语言',
    'editor.selectTheme': '选择主题',
    'answer.confirm': '准备好查看答案了吗？',
    'answer.confirmButtonYes': '是的，显示答案',
    'answer.confirmButtonNo': '不，我会继续努力',
    'answer.editAnswer': '编辑答案',
    'answer.closeAnswer': '关闭答案',
    'contribution.tooltip': '贡献题库',
    'contribution.title': '贡献面试题目',
    'contribution.description':
      '提交您的面试题目，帮助丰富我们的题库。您的贡献将通过 Pull Request 进行审核和添加。',
    'contribution.placeholder': '在此输入您的面试题目...',
    'contribution.requirementPlaceholder': '用一句话描述您的题目想法...',
    'contribution.hint': '保持简洁。我们将帮助将您的想法转化为完整的问题。',
    'contribution.submit': '提交',
    'contribution.submitting': '提交中...',
    'contribution.success.title': '想法已收到！',
    'contribution.success.description': '感谢您的贡献！我们将根据您的想法创建一个问题。',
    'contribution.error.title': '提交失败',
    'contribution.error.emptyRequirement': '请输入您的题目想法的简短描述。',
    'contribution.error.submission': '提交想法时发生错误，请重试。',
    'contribution.emptyContent': '内容为空',
    'contribution.emptyContentDesc': '请在提交前输入题目内容。',
    'contribution.prCreated': 'Pull Request 已创建',
    'contribution.prCreatedDesc': '您的面试题已成功提交为 Pull Request。',
    'contribution.viewPR': '查看 Pull Request',
    'contribution.thankYou': '感谢您对我们题库的贡献！',
    'contribution.close': '关闭',
  },
};

// Create context
const I18nContext = createContext<{
  t: (key: string) => string;
  language: string;
  setLanguage: (lang: string) => void;
}>({
  t: () => '',
  language: 'zh', // Default to Chinese
  setLanguage: () => {},
});

// Provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('zh'); // Default to Chinese

  // Load language from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Translation function
  const t = (key: string) => {
    return (
      (translations[language as keyof typeof translations] as Record<string, string>)?.[key] ||
      (translations.en as Record<string, string>)[key] ||
      key
    );
  };

  return (
    <I18nContext.Provider value={{ t, language, setLanguage }}>{children}</I18nContext.Provider>
  );
}

// Hook for using translations
export function useTranslation() {
  return useContext(I18nContext);
}
