'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface ConfirmationModalProps {
  step: number;
  language: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  step,
  language,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const { t } = useTranslation();

  const messages = [
    {
      title: t('confirmation.step1.title'),
      description: t('confirmation.step1.description'),
    },
    {
      title: t('confirmation.step2.title'),
      description: t('confirmation.step2.description'),
    },
    {
      title: t('confirmation.step3.title'),
      description: t('confirmation.step3.description'),
    },
  ];

  const currentMessage = messages[step];

  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <DialogTitle>{currentMessage.title}</DialogTitle>
          <DialogDescription>{currentMessage.description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            {t('button.no')}
          </Button>
          <Button onClick={onConfirm}>{t('button.yes')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
