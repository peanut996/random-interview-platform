import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';
import { Loader2 } from 'lucide-react';

export default function QuestionLoading() {
  const { t } = useTranslation();

  return (
    <Card className="mb-6 shadow-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#2c2c2e] rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-medium">{t('question.generatingTitle')}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg">{t('question.generating')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
