import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import { AlertCircle } from 'lucide-react';

interface QuestionErrorProps {
  onRetry: () => void;
}

export default function QuestionError({ onRetry }: QuestionErrorProps) {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">
            {t('question.errorTitle') || 'Error Loading Question'}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 space-y-6">
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
            <AlertCircle className="h-8 w-8" />
            <p className="text-lg">{t('question.error') || 'Failed to load question'}</p>
          </div>
          <Button onClick={onRetry} className="px-6">
            {t('question.retry') || 'Try Again'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
