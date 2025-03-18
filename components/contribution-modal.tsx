'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Loader2, GitMerge, ExternalLink, CheckCircle2, CheckIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuestionType, QuestionDifficulty, QuestionCategory, QuestionShell } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { parseTextToQuestions, contributeQuestionBank } from '@/lib/api';

interface ContributionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContributionModal({ isOpen, onOpenChange }: ContributionModalProps) {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isParsingInput, setIsParsingInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<
    Array<
      QuestionShell & {
        selected: boolean;
        newCategory: string;
        showCategoryInput: boolean;
        editingTitle: boolean;
      }
    >
  >([]);
  const maxTextLength = 5000;
  const maxUrlLength = 500;

  // 分类对照表：英文到中文
  const categoryTranslations: Record<string, string> = {
    Algorithms: '算法',
    'Data Structures': '数据结构',
    Stack: '栈',
    Queue: '队列',
    'Linked List': '链表',
    Tree: '树',
    'Binary Tree': '二叉树',
    'Binary Search Tree': '二叉搜索树',
    Heap: '堆',
    'Hash Table': '哈希表',
    Graph: '图',
    Sorting: '排序',
    Searching: '搜索',
    'Dynamic Programming': '动态规划',
    Greedy: '贪心算法',
    Backtracking: '回溯',
    'Divide and Conquer': '分治法',
    Recursion: '递归',
    String: '字符串',
    Array: '数组',
    Matrix: '矩阵',
    'Bit Manipulation': '位运算',
    Math: '数学',
    Database: '数据库',
    'Operating System': '操作系统',
    Networking: '网络',
    'System Design': '系统设计',
    'Object-Oriented Design': '面向对象设计',
    Concurrency: '并发',
    'Design Pattern': '设计模式',
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTextInput('');
      setUrlInput('');
      setPrUrl(null);
      setParsedQuestions([]);
      setIsParsingInput(false);
    }
    onOpenChange(open);
  };

  const handleParseInput = async () => {
    const input = inputType === 'text' ? textInput : urlInput;

    if (!input.trim()) {
      toast({
        title: t('contribution.error.title'),
        description: t('contribution.error.emptyInput'),
        variant: 'destructive',
      });
      return;
    }

    setIsParsingInput(true);

    try {
      const parsedData = await parseTextToQuestions(input, inputType);

      // Mark all questions as selected by default and add newCategory field
      const questionsWithSelection = parsedData.map(q => ({
        ...q,
        selected: true,
        newCategory: '',
        showCategoryInput: false,
        editingTitle: false,
      }));

      setParsedQuestions(questionsWithSelection);

      toast({
        title: t('contribution.parse.success'),
        description: t('contribution.parse.foundQuestions') + `: ${questionsWithSelection.length}`,
      });
    } catch (error) {
      console.error('Parsing error:', error);
      toast({
        title: t('contribution.error.title'),
        description: t('contribution.error.parsing'),
        variant: 'destructive',
      });
    } finally {
      setIsParsingInput(false);
    }
  };

  // Submit selected questions as contribution
  const handleSubmitContribution = async () => {
    const selectedQuestions = parsedQuestions
      .filter(q => q.selected)
      .map(q => {
        return {
          type: q.type,
          category: q.category,
          difficulty: q.difficulty,
          title: q.title,
        };
      });

    if (selectedQuestions.length === 0) {
      toast({
        title: t('contribution.error.title'),
        description: t('contribution.error.noQuestionsSelected'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contributeQuestionBank(selectedQuestions);

      const { url } = await response.json();
      setPrUrl(url);

      toast({
        title: t('contribution.success.title'),
        description: t('contribution.success.description'),
      });
    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: t('contribution.error.title'),
        description: t('contribution.error.submission'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update question field
  const updateQuestionField = (
    index: number,
    field: string,
    value: string | boolean | Array<string>
  ) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value,
      };
      return updatedQuestions;
    });
  };

  // Update a specific question's newCategory field
  const updateNewCategory = (index: number, value: string) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        newCategory: value,
      };
      return updatedQuestions;
    });
  };

  // Toggle category input visibility
  const toggleCategoryInput = (index: number) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        showCategoryInput: !updatedQuestions[index].showCategoryInput,
      };
      return updatedQuestions;
    });
  };

  // Add bilingual category to a question
  const addCategory = (index: number, category: string) => {
    if (!category.trim()) return;

    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const currentCategories = Array.isArray(updatedQuestions[index].category)
        ? [...updatedQuestions[index].category]
        : [];

      // Add the original category
      const categoriesToAdd = [category];

      // Try to find a translation
      const lowerCategory = category.toLowerCase();

      // Check if we have a translation from English to Chinese
      Object.entries(categoryTranslations).forEach(([en, zh]) => {
        if (en.toLowerCase() === lowerCategory) {
          // English matched, add Chinese translation
          if (!categoriesToAdd.includes(zh)) {
            categoriesToAdd.push(zh);
          }
        } else if (zh.toLowerCase() === lowerCategory) {
          // Chinese matched, add English translation
          if (!categoriesToAdd.includes(en)) {
            categoriesToAdd.push(en);
          }
        }
      });

      // Add all new categories that are not already in the array
      const newCategories = [...currentCategories];
      categoriesToAdd.forEach(cat => {
        if (!newCategories.includes(cat as QuestionCategory)) {
          newCategories.push(cat as QuestionCategory);
        }
      });

      updatedQuestions[index] = {
        ...updatedQuestions[index],
        category: newCategories,
        newCategory: '', // Clear the input field after adding
        showCategoryInput: false, // Hide the input after adding
      };

      return updatedQuestions;
    });
  };

  // Remove category from a question
  const removeCategory = (questionIndex: number, categoryIndex: number) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      const currentCategories = Array.isArray(updatedQuestions[questionIndex].category)
        ? [...updatedQuestions[questionIndex].category]
        : [];

      currentCategories.splice(categoryIndex, 1);

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        category: currentCategories,
      };

      return updatedQuestions;
    });
  };

  // Toggle title editing state
  const toggleTitleEditing = (index: number) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        editingTitle: !updatedQuestions[index].editingTitle,
      };
      return updatedQuestions;
    });
  };

  // Handle title input blur - save changes and exit edit mode
  const handleTitleBlur = (index: number) => {
    setParsedQuestions(prevQuestions => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        editingTitle: false,
      };
      return updatedQuestions;
    });
  };

  // Handle title key press - save on Enter
  const handleTitleKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleTitleBlur(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5 text-primary" />
            <DialogTitle>{t('contribution.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('contribution.enhancedDescription')}</DialogDescription>
        </DialogHeader>

        {prUrl ? (
          // Success state with PR URL
          <div className="space-y-6 py-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-400 mb-1">
                    {t('contribution.prCreated')}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500">
                    {t('contribution.prCreatedDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center w-full">
              <div className="py-2 px-5 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-800/30 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#f43f5e"
                  className="h-5 w-5 mr-2.5"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                <span className="text-base font-medium text-rose-700 dark:text-rose-300">
                  {t('contribution.thankYou')}
                </span>
              </div>
            </div>
          </div>
        ) : parsedQuestions.length > 0 ? (
          // Show parsed questions for editing and selection
          <div className="flex flex-col flex-1 overflow-hidden">
            <h3 className="text-lg font-medium mb-3">
              {t('contribution.parsedQuestions')}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({parsedQuestions.filter(q => q.selected).length}/{parsedQuestions.length}{' '}
                {t('contribution.selected')})
              </span>
            </h3>

            {/* Scrollable question list with card styling */}
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div className="space-y-4">
                {parsedQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg shadow-sm overflow-hidden ${
                      question.selected ? 'bg-card' : 'bg-muted/30 opacity-75'
                    }`}
                  >
                    {/* Question header with checkbox and title */}
                    <div className="border-b p-3 bg-muted/20">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`select-${index}`}
                          checked={question.selected}
                          onCheckedChange={checked => {
                            updateQuestionField(index, 'selected', !!checked);
                          }}
                        />

                        <div className="flex-1">
                          {question.editingTitle ? (
                            <Input
                              value={question.title}
                              onChange={e => updateQuestionField(index, 'title', e.target.value)}
                              onBlur={() => handleTitleBlur(index)}
                              onKeyDown={e => handleTitleKeyDown(index, e)}
                              autoFocus
                              disabled={!question.selected}
                              className="text-base font-medium"
                            />
                          ) : (
                            <div
                              onClick={() => question.selected && toggleTitleEditing(index)}
                              className={`text-base font-medium py-1 px-2 -mx-2 rounded ${
                                question.selected ? 'hover:bg-background cursor-pointer' : ''
                              }`}
                            >
                              {question.title}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Question details with type, difficulty, and category */}
                    <div className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Type */}
                        <div>
                          <label className="text-xs block mb-1 text-muted-foreground">
                            {t('question.type')}
                          </label>
                          <Select
                            value={question.type}
                            onValueChange={value => updateQuestionField(index, 'type', value)}
                            disabled={!question.selected}
                          >
                            <SelectTrigger className="w-full h-8">
                              <SelectValue>
                                {question.type === QuestionType.Coding
                                  ? t('question.typeCoding')
                                  : t('question.typeQuestion')}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={QuestionType.Coding}>
                                {t('question.typeCoding')}
                              </SelectItem>
                              <SelectItem value={QuestionType.Question}>
                                {t('question.typeQuestion')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Difficulty */}
                        <div>
                          <label className="text-xs block mb-1 text-muted-foreground">
                            {t('question.difficulty')}
                          </label>
                          <Select
                            value={question.difficulty}
                            onValueChange={value => updateQuestionField(index, 'difficulty', value)}
                            disabled={!question.selected}
                          >
                            <SelectTrigger className="w-full h-8">
                              <SelectValue>
                                {question.difficulty === QuestionDifficulty.Easy
                                  ? t('difficulty.easy')
                                  : question.difficulty === QuestionDifficulty.Medium
                                    ? t('difficulty.medium')
                                    : t('difficulty.hard')}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={QuestionDifficulty.Easy}>
                                {t('difficulty.easy')}
                              </SelectItem>
                              <SelectItem value={QuestionDifficulty.Medium}>
                                {t('difficulty.medium')}
                              </SelectItem>
                              <SelectItem value={QuestionDifficulty.Hard}>
                                {t('difficulty.hard')}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Category */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs text-muted-foreground font-medium">
                              {t('question.category')}
                            </label>
                            {question.selected && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0 rounded-full hover:bg-muted/80 transition-colors"
                                onClick={() => toggleCategoryInput(index)}
                                disabled={!question.selected}
                              >
                                <span className="sr-only">Add category</span>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M5 12h14" />
                                  <path d="M12 5v14" />
                                </svg>
                              </Button>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-1 min-h-8 p-1 border rounded-md bg-background/70 border-muted-foreground/20 shadow-sm">
                              {Array.isArray(question.category) && question.category.length > 0 ? (
                                question.category.map((cat, catIndex) => (
                                  <Badge
                                    key={catIndex}
                                    variant="secondary"
                                    className="text-xs py-0 h-6 pr-1 flex items-center gap-1 bg-muted/60 hover:bg-muted/80 transition-colors"
                                  >
                                    {cat}
                                    <button
                                      onClick={() => removeCategory(index, catIndex)}
                                      className="ml-1 hover:text-destructive transition-colors rounded-full w-4 h-4 inline-flex items-center justify-center"
                                      disabled={!question.selected}
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground/60 px-1">
                                  {t('contribution.noCategories')}
                                </span>
                              )}
                            </div>

                            {question.selected && question.showCategoryInput && (
                              <div className="flex gap-2">
                                <Input
                                  value={question.newCategory}
                                  onChange={e => updateNewCategory(index, e.target.value)}
                                  placeholder={t('question.addCategory')}
                                  className="h-9 text-sm rounded-md bg-background/70 border-muted-foreground/20 shadow-sm focus-visible:ring-primary/30"
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  onClick={() => addCategory(index, question.newCategory)}
                                  disabled={!question.newCategory.trim()}
                                  className="h-9 px-3 rounded-md shadow-sm hover:shadow transition-all font-medium"
                                >
                                  {t('button.add')}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Input state for text or URL
          <div className="space-y-6 my-4">
            <Tabs
              value={inputType}
              onValueChange={value => setInputType(value as 'text' | 'url')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="text">{t('contribution.inputText')}</TabsTrigger>
                <TabsTrigger value="url">{t('contribution.inputUrl')}</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="pt-2">
                <div className="space-y-3">
                  <Textarea
                    placeholder={t('contribution.textPlaceholder')}
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="min-h-32 font-mono text-sm"
                    maxLength={maxTextLength}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('contribution.textHint')} ({textInput.length}/{maxTextLength})
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="url" className="pt-2">
                <div className="space-y-3">
                  <Input
                    placeholder={t('contribution.urlPlaceholder')}
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    maxLength={maxUrlLength}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('contribution.urlHint')} ({urlInput.length}/{maxUrlLength})
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-2">
              <Button onClick={handleParseInput} className="w-full" disabled={isParsingInput}>
                {isParsingInput ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('contribution.parsing')}
                  </>
                ) : (
                  t('contribution.parse')
                )}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter
          className={`mt-4 pt-3 border-t ${parsedQuestions.length === 0 && !prUrl ? 'hidden' : ''}`}
        >
          {prUrl ? (
            <Button
              asChild
              className="w-full h-11 rounded-lg font-medium transition-all bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg"
            >
              <a
                href={prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                {t('contribution.viewPR')}
              </a>
            </Button>
          ) : (
            parsedQuestions.length > 0 && (
              <Button
                onClick={handleSubmitContribution}
                disabled={isSubmitting || parsedQuestions.filter(q => q.selected).length === 0}
                className="w-full h-11 rounded-lg font-medium transition-all bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('contribution.submitting')}
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-5 w-5" />
                    {t('contribution.submit')}
                  </>
                )}
              </Button>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
