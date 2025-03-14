'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { QuestionCategory, CodingCategory, QuestionType } from '@/lib/types';
import {
  addCustomCategory,
  removeCustomCategory,
  loadCustomCategories,
  safeLocalStorage,
} from '@/lib/question';
import { PlusIcon, XIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { jsonrepair } from 'jsonrepair';

interface SettingsModalProps {
  language: string;
  onClose: () => void;
  onReload?: () => Promise<void> | void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [newCustomCategory, setNewCustomCategory] = useState('');

  // Load saved settings from localStorage
  const [openAISettings, setOpenAISettings] = useState({
    endpoint: safeLocalStorage.getItem('openai_endpoint') || '',
    model: safeLocalStorage.getItem('openai_model') || 'gpt-4o',
    token: safeLocalStorage.getItem('openai_token') || '',
  });

  // Track if custom model is selected
  const [isCustomModel, setIsCustomModel] = useState(
    !['gpt-4', 'gpt-4o', 'gpt-3.5-turbo'].includes(openAISettings.model)
  );

  // Load system prompts from localStorage
  const [systemPrompts, setSystemPrompts] = useState({
    questionPrompt: safeLocalStorage.getItem('system_prompt_question') || '',
    answerPrompt: safeLocalStorage.getItem('system_prompt_answer') || '',
  });

  const [questionSettings, setQuestionSettings] = useState({
    type: safeLocalStorage.getItem('question_type') || 'all',
    category: safeLocalStorage.getItem('question_category') || 'all',
    difficulty: safeLocalStorage.getItem('question_difficulty') || 'all',
    weightedMistakes: safeLocalStorage.getItem('weighted_mistakes') === 'true',
  });

  const [customCategories, setCustomCategories] = useState<{
    [QuestionType.Question]: string[];
    [QuestionType.Coding]: string[];
  }>({
    [QuestionType.Question]: [],
    [QuestionType.Coding]: [],
  });

  // Track if custom category is selected
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  // Load custom categories on mount
  useEffect(() => {
    loadCustomCategories();
    const saved = safeLocalStorage.getItem('custom_categories');
    if (saved) {
      try {
        setCustomCategories(JSON.parse(jsonrepair(saved)));
      } catch (e) {
        console.error('Failed to parse custom categories', e);
      }
    }

    // Check if the saved category is custom
    const savedCategory = safeLocalStorage.getItem('question_category') || '';
    const savedType = safeLocalStorage.getItem('question_type');

    if (savedCategory && savedType && savedType !== 'all') {
      const selectedType = savedType === 'coding' ? QuestionType.Coding : QuestionType.Question;

      const standardCategories =
        selectedType === QuestionType.Coding
          ? (Object.values(CodingCategory) as string[])
          : (Object.values(QuestionCategory) as string[]);

      // If the saved category is not in standard categories, it must be custom
      if (
        savedCategory !== 'all' &&
        !standardCategories.includes(savedCategory) &&
        savedCategory !== 'custom'
      ) {
        setIsCustomCategory(true);
      }
    }
  }, []);

  // Define different categories based on question type
  const getCategories = () => {
    const selectedType =
      questionSettings.type === 'coding'
        ? QuestionType.Coding
        : questionSettings.type === 'question'
          ? QuestionType.Question
          : null;

    if (questionSettings.type === 'all' || !selectedType) {
      // If no specific type selected, return all categories
      return [
        ...Object.values(QuestionCategory).map(value => ({ key: value, value })),
        ...Object.values(CodingCategory).map(value => ({ key: value, value })),
      ];
    }

    // Return categories specific to the selected type
    const standardCategories =
      selectedType === QuestionType.Coding
        ? Object.values(CodingCategory).map(value => ({ key: value, value }))
        : Object.values(QuestionCategory).map(value => ({ key: value, value }));

    return standardCategories;
  };

  // Check if all OpenAI fields are filled
  const allOpenAIFieldsFilled =
    openAISettings.endpoint && openAISettings.model && openAISettings.token;

  // Effect to update status message when fields change
  useEffect(() => {
    // This is just to trigger a re-render when fields change
  }, [openAISettings.endpoint, openAISettings.model, openAISettings.token]);

  const handleSave = () => {
    // Always save question settings
    safeLocalStorage.setItem('question_type', questionSettings.type);
    safeLocalStorage.setItem('question_category', questionSettings.category);
    safeLocalStorage.setItem('question_difficulty', questionSettings.difficulty);
    safeLocalStorage.setItem('weighted_mistakes', questionSettings.weightedMistakes.toString());

    // Only save OpenAI settings if all three fields are filled
    if (allOpenAIFieldsFilled) {
      safeLocalStorage.setItem('openai_endpoint', openAISettings.endpoint);
      safeLocalStorage.setItem('openai_model', openAISettings.model);
      safeLocalStorage.setItem('openai_token', openAISettings.token);
    }

    // Save system prompts if they exist
    if (systemPrompts.questionPrompt) {
      safeLocalStorage.setItem('system_prompt_question', systemPrompts.questionPrompt);
    }
    if (systemPrompts.answerPrompt) {
      safeLocalStorage.setItem('system_prompt_answer', systemPrompts.answerPrompt);
    }

    toast({
      title: t('toast.settings.title'),
      description: t('toast.settings.description'),
      duration: 3000,
    });

    onClose();
  };

  const handleAddCustomCategory = () => {
    if (newCustomCategory.trim() && questionSettings.type !== 'all') {
      const type = questionSettings.type === 'coding' ? QuestionType.Coding : QuestionType.Question;

      addCustomCategory(type, newCustomCategory.trim());

      // Update local state to reflect the change
      setCustomCategories({
        ...customCategories,
        [type]: [...customCategories[type], newCustomCategory.trim()],
      });

      // Set the new custom category as the selected category
      setQuestionSettings({
        ...questionSettings,
        category: newCustomCategory.trim(),
      });

      setNewCustomCategory('');

      toast({
        title: t('settings.customCategoryAdded') || 'Custom Category Added',
        description: (
          t('settings.customCategoryAddedDesc') || 'Added "{category}" to your categories'
        ).replace('{category}', newCustomCategory.trim()),
        duration: 3000,
      });
    } else if (questionSettings.type === 'all') {
      // Show a toast notification that a type must be selected
      toast({
        title: t('settings.cannotAddCategory') || 'Cannot Add Category',
        description:
          t('settings.selectTypeForCustomCategory') ||
          'Please select a question type (Coding or Question) to add custom categories.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleRemoveCustomCategory = (category: string) => {
    if (questionSettings.type === 'all') return;

    const type = questionSettings.type === 'coding' ? QuestionType.Coding : QuestionType.Question;

    removeCustomCategory(type, category);

    // Update local state to reflect the change
    setCustomCategories({
      ...customCategories,
      [type]: customCategories[type].filter(c => c !== category),
    });

    // If the currently selected category is being removed, set to "custom"
    if (questionSettings.category === category) {
      setQuestionSettings({
        ...questionSettings,
        category: 'custom',
      });
    }

    toast({
      title: t('settings.customCategoryRemoved') || 'Custom Category Removed',
      description: (
        t('settings.customCategoryRemovedDesc') || 'Removed "{category}" from your categories'
      ).replace('{category}', category),
      duration: 3000,
    });
  };

  // Function to reset all settings to default
  const resetSettings = () => {
    setShowResetConfirmation(true);
  };

  const confirmReset = () => {
    // Reset question settings
    setQuestionSettings({
      type: 'all',
      category: 'all',
      difficulty: 'all',
      weightedMistakes: false,
    });

    // Reset OpenAI settings
    setOpenAISettings({
      endpoint: '',
      model: 'gpt-4o',
      token: '',
    });

    // Reset system prompts
    setSystemPrompts({
      questionPrompt: '',
      answerPrompt: '',
    });

    // Reset custom model flag
    setIsCustomModel(false);

    // Reset custom category flag
    setIsCustomCategory(false);

    // Reset custom categories
    setCustomCategories({
      [QuestionType.Question]: [],
      [QuestionType.Coding]: [],
    });
    safeLocalStorage.removeItem('custom_categories');

    // Clear settings from localStorage
    safeLocalStorage.removeItem('question_type');
    safeLocalStorage.removeItem('question_category');
    safeLocalStorage.removeItem('question_difficulty');
    safeLocalStorage.removeItem('weighted_mistakes');
    safeLocalStorage.removeItem('openai_endpoint');
    safeLocalStorage.removeItem('openai_model');
    safeLocalStorage.removeItem('openai_token');
    safeLocalStorage.removeItem('system_prompt_question');
    safeLocalStorage.removeItem('system_prompt_answer');

    setShowResetConfirmation(false);

    toast({
      title: t('toast.reset.title') || 'Settings Reset',
      description: t('toast.reset.description') || 'All settings have been reset to default',
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
            <DialogTitle>{t('settings.title')}</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="questions">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="questions">{t('settings.questions')}</TabsTrigger>
              <TabsTrigger value="openai">{t('settings.openai')}</TabsTrigger>
              <TabsTrigger value="prompts">{t('settings.prompts')}</TabsTrigger>
            </TabsList>

            <TabsContent value="questions" className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.questionType')}</Label>
                <Select
                  value={questionSettings.type}
                  onValueChange={value => {
                    // Only reset the category if switching to "all" from a specific type
                    const newCategory = value === 'all' ? 'all' : questionSettings.category;

                    // Reset custom category flag if changing types
                    if (value !== questionSettings.type) {
                      setIsCustomCategory(false);
                    }

                    setQuestionSettings({
                      ...questionSettings,
                      type: value,
                      category: newCategory,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings.all')}</SelectItem>
                    <SelectItem value="coding">{t('settings.coding')}</SelectItem>
                    <SelectItem value="question">{t('settings.question')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('settings.category')}</Label>
                <Select
                  value={isCustomCategory ? 'custom' : questionSettings.category}
                  onValueChange={value => {
                    if (value === 'custom') {
                      setIsCustomCategory(true);
                      // Keep the current category if it's already custom
                    } else {
                      setIsCustomCategory(false);
                      setQuestionSettings({
                        ...questionSettings,
                        category: value,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings.all')}</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category.key} value={category.value}>
                        {category.value}
                      </SelectItem>
                    ))}
                    {/* Always show the custom option */}
                    <SelectItem value="custom">{t('settings.custom')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Category Section - only shown when Custom is selected */}
              {isCustomCategory && (
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <Label>{t('settings.customCategory') || 'Custom Category'}</Label>
                  {/* If "all" is selected, show a note that a type must be chosen */}
                  {questionSettings.type === 'all' ? (
                    <div className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                      {t('settings.selectTypeForCustomCategory') ||
                        'Please select a question type (Coding or Question) to add custom categories.'}
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        placeholder={t('settings.addCustomCategory') || 'Add custom category...'}
                        value={newCustomCategory}
                        onChange={e => setNewCustomCategory(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            handleAddCustomCategory();
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddCustomCategory}
                        disabled={!newCustomCategory.trim()}
                      >
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Show both types of custom categories when "all" is selected */}
                  {questionSettings.type === 'all' ? (
                    <>
                      {/* Show Coding custom categories */}
                      {customCategories[QuestionType.Coding].length > 0 && (
                        <div className="mt-4">
                          <Label className="mb-2 block">
                            {t('settings.codingCustomCategories') || 'Custom Coding Categories'}
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {customCategories[QuestionType.Coding].map(category => (
                              <div
                                key={category}
                                className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
                              >
                                <span>{category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show Question custom categories */}
                      {customCategories[QuestionType.Question].length > 0 && (
                        <div className="mt-4">
                          <Label className="mb-2 block">
                            {t('settings.questionCustomCategories') || 'Custom Question Categories'}
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {customCategories[QuestionType.Question].map(category => (
                              <div
                                key={category}
                                className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
                              >
                                <span>{category}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Display existing custom categories for the selected type */
                    customCategories[
                      questionSettings.type === 'coding'
                        ? QuestionType.Coding
                        : QuestionType.Question
                    ].length > 0 && (
                      <div>
                        <Label className="mt-4 mb-2 block">
                          {t('settings.existingCustomCategories') || 'Your Custom Categories'}
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {customCategories[
                            questionSettings.type === 'coding'
                              ? QuestionType.Coding
                              : QuestionType.Question
                          ].map(category => (
                            <div
                              key={category}
                              className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
                            >
                              <span
                                className={
                                  questionSettings.category === category
                                    ? 'font-bold text-primary'
                                    : ''
                                }
                                role="button"
                                onClick={() => {
                                  setQuestionSettings({
                                    ...questionSettings,
                                    category: category,
                                  });
                                }}
                              >
                                {category}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 ml-1"
                                onClick={() => handleRemoveCustomCategory(category)}
                              >
                                <XIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>{t('settings.difficulty')}</Label>
                <Select
                  value={questionSettings.difficulty}
                  onValueChange={value =>
                    setQuestionSettings({
                      ...questionSettings,
                      difficulty: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.all')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('settings.all')}</SelectItem>
                    <SelectItem value="easy">{t('settings.easy')}</SelectItem>
                    <SelectItem value="medium">{t('settings.medium')}</SelectItem>
                    <SelectItem value="hard">{t('settings.hard')}</SelectItem>
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
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400'
                }`}
              >
                {allOpenAIFieldsFilled
                  ? t('settings.willBeSaved') || 'OpenAI settings will be saved'
                  : t('settings.willNotBeSaved') || 'OpenAI settings will not be saved'}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {t('settings.endpoint')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="https://api.openai.com/v1"
                    value={openAISettings.endpoint}
                    onChange={e =>
                      setOpenAISettings({
                        ...openAISettings,
                        endpoint: e.target.value,
                      })
                    }
                    onFocus={e => {
                      // If the user clicks into an empty field, don't pre-fill with placeholder
                      if (!openAISettings.endpoint) {
                        e.target.placeholder = '';
                      }
                    }}
                    onBlur={e => {
                      // Restore placeholder when field loses focus
                      if (!openAISettings.endpoint) {
                        e.target.placeholder = 'https://api.openai.com/v1';
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('settings.model')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={isCustomModel ? 'custom' : openAISettings.model}
                    onValueChange={value => {
                      if (value === 'custom') {
                        setIsCustomModel(true);
                        // Keep the current model value if it's already custom
                        if (!isCustomModel) {
                          setOpenAISettings({ ...openAISettings, model: '' });
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
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="custom">{t('settings.custom')}</SelectItem>
                    </SelectContent>
                  </Select>

                  {isCustomModel && (
                    <Input
                      className="mt-2"
                      placeholder={t('settings.customModel')}
                      value={openAISettings.model}
                      onChange={e =>
                        setOpenAISettings({
                          ...openAISettings,
                          model: e.target.value,
                        })
                      }
                      onFocus={e => {
                        e.target.placeholder = '';
                      }}
                      onBlur={e => {
                        if (!e.target.value) {
                          e.target.placeholder = t('settings.customModel');
                        }
                      }}
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('settings.token')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="password"
                    placeholder="sk-..."
                    value={openAISettings.token}
                    onChange={e =>
                      setOpenAISettings({
                        ...openAISettings,
                        token: e.target.value,
                      })
                    }
                    onFocus={e => {
                      if (!openAISettings.token) {
                        e.target.placeholder = '';
                      }
                    }}
                    onBlur={e => {
                      if (!openAISettings.token) {
                        e.target.placeholder = 'sk-...';
                      }
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('settings.tokenDescription')}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompts" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    {t('settings.questionSystemPrompt') || 'Question Generation System Prompt'}
                  </Label>
                  <Textarea
                    placeholder={
                      t('settings.questionSystemPromptPlaceholder') ||
                      'Enter system prompt for question generation...'
                    }
                    value={systemPrompts.questionPrompt}
                    onChange={e =>
                      setSystemPrompts({
                        ...systemPrompts,
                        questionPrompt: e.target.value,
                      })
                    }
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('settings.questionSystemPromptHelp') ||
                      'This prompt guides the AI in generating interview questions.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>
                    {t('settings.answerSystemPrompt') || 'Answer Generation System Prompt'}
                  </Label>
                  <Textarea
                    placeholder={
                      t('settings.answerSystemPromptPlaceholder') ||
                      'Enter system prompt for answer generation...'
                    }
                    value={systemPrompts.answerPrompt}
                    onChange={e =>
                      setSystemPrompts({
                        ...systemPrompts,
                        answerPrompt: e.target.value,
                      })
                    }
                    className="min-h-24"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('settings.answerSystemPromptHelp') ||
                      'This prompt guides the AI in generating model answers to questions.'}
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSystemPrompts({
                      questionPrompt: '',
                      answerPrompt: '',
                    });
                    safeLocalStorage.removeItem('system_prompt_question');
                    safeLocalStorage.removeItem('system_prompt_answer');
                    toast({
                      title: t('settings.promptsReset') || 'Prompts Reset',
                      description:
                        t('settings.promptsResetDesc') ||
                        'System prompts have been reset to default',
                      duration: 3000,
                    });
                  }}
                  className="w-full"
                >
                  {t('settings.resetPrompts') || 'Reset Prompts to Default'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={resetSettings}>
                {t('button.resetToDefault') || 'Reset to Default'}
              </Button>
              <Button onClick={handleSave}>{t('button.save')}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      {showResetConfirmation && (
        <Dialog open={showResetConfirmation} onOpenChange={setShowResetConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('settings.resetConfirmTitle') || 'Reset All Settings?'}</DialogTitle>
              <DialogDescription>
                {t('settings.resetConfirmDescription') ||
                  'This will clear all your custom settings. This action cannot be undone.'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex w-full justify-between">
                <Button variant="outline" onClick={cancelReset}>
                  {t('button.cancel') || 'Cancel'}
                </Button>
                <Button variant="destructive" onClick={confirmReset}>
                  {t('button.reset') || 'Reset'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
