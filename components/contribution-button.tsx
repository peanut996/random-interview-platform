'use client';

import { useState } from 'react';
import { GitPullRequestArrow } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { ContributionModal } from '@/components/contribution-modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ContributionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <div className="fixed bottom-24 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsOpen(true)}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                aria-label={t('contribution.tooltip')}
              >
                <GitPullRequestArrow className="h-6 w-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{t('contribution.tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <ContributionModal isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
