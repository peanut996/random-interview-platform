'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTranslation } from '@/lib/i18n';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { QuestionHistory } from '@/lib/types';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';

interface HistoryModalProps {
  language: string;
  onClose: () => void;
  history: QuestionHistory[];
  onSelectQuestion: (historyItem: QuestionHistory) => void;
  onClearHistory: () => void;
  open?: boolean;
}

export default function HistoryModal({
  language,
  onClose,
  history: initialHistory,
  onSelectQuestion,
  onClearHistory,
}: HistoryModalProps) {
  const { t } = useTranslation();
  const [history, setHistory] = useState<QuestionHistory[]>(initialHistory);

  const getLocale = () => {
    return language === 'zh' ? zhCN : enUS;
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: getLocale(),
      });
    } catch (e) {
      console.error('[Client] Failed to format time', e);
      return timestamp;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Medium':
        return 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'Hard':
        return 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800';
      default:
        return '';
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    onClearHistory();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('history.title')}</DialogTitle>
        </DialogHeader>

        {history.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{t('history.empty')}</div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {history.map(item => (
                <div
                  key={item.id + item.timestamp}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onSelectQuestion(item)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium line-clamp-2">{item.title}</h3>
                    <Badge variant={item.answered ? 'default' : 'outline'}>
                      {item.answered ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> {t('history.answered')}
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" /> {t('history.unanswered')}
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant="outline">{item.question.category}</Badge>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(item.question.difficulty)}
                    >
                      {item.question.difficulty}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex justify-between items-center">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> {formatTime(item.timestamp)}
                    </span>
                    <span>{item.language === 'zh' ? '中文' : 'English'}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-between">
          <Button variant="destructive" size="sm" onClick={handleClearHistory}>
            {t('history.clearAll')}
          </Button>
          <Button variant="outline" onClick={onClose}>
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
