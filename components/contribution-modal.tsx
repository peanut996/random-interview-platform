'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ExternalLink } from 'lucide-react';
import { title } from 'process';

interface ContributionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContributionModal({ isOpen, onOpenChange }: ContributionModalProps) {
  const { t } = useTranslation();
  const [questionContent, setQuestionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const maxLength = 2000;

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPrUrl(null);
      setQuestionContent('');
    }
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    if (!questionContent.trim()) {
      toast({
        title: t('contribution.emptyContent'),
        description: t('contribution.emptyContentDesc'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse question via API
      const parseResponse = await fetch('/api/questions/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: questionContent }), // 修正参数名
      });

      if (!parseResponse.ok) {
        throw new Error(`API responded with status: ${parseResponse.status}`);
      }

      const parsedQuestion = await parseResponse.json();

      // Validate JSON format
      if (!parsedQuestion || typeof parsedQuestion !== 'object') {
        throw new Error('Invalid question format returned');
      }

      // Submit the parsed question to create a PR
      const prResponse = await fetch('/api/questions/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: parsedQuestion }),
      });

      if (!prResponse.ok) {
        throw new Error(`PR creation failed with status: ${prResponse.status}`);
      }

      const prData = await prResponse.json();

      // Show success toast
      toast({
        title: t('contribution.success'),
        description: t('contribution.successDesc'),
      });

      // Store PR URL for display
      const pullRequestUrl = prData.url || prData.html_url;
      if (pullRequestUrl) {
        setPrUrl(pullRequestUrl);
      } else {
        console.error('No PR URL found in response:', prData);
      }

      // Clear content field but keep modal open to show success state
      setQuestionContent('');
    } catch (error) {
      console.error('Contribution error:', error);
      toast({
        title: t('contribution.error'),
        description: error instanceof Error ? error.message : t('contribution.errorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('contribution.title')}</DialogTitle>
        </DialogHeader>

        {prUrl ? (
          // Success state - show PR link
          <div className="space-y-4 py-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800">
              <h3 className="font-medium text-green-800 dark:text-green-400 mb-2">
                {t('contribution.prCreated')}
              </h3>
              <p className="text-sm text-green-700 dark:text-green-500 mb-4">
                {t('contribution.prCreatedDesc')}
              </p>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800"
                onClick={() => window.open(prUrl, '_blank')}
              >
                {t('contribution.viewPR')} <ExternalLink size={16} />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{t('contribution.thankYou')}</p>
          </div>
        ) : (
          // Input state - show question input field
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{t('contribution.description')}</p>
            <Textarea
              value={questionContent}
              onChange={e => setQuestionContent(e.target.value)}
              placeholder={t('contribution.placeholder')}
              className="min-h-[200px]"
              maxLength={maxLength}
              disabled={isSubmitting}
            />
            <div className="text-xs text-muted-foreground text-right">
              {questionContent.length}/{maxLength}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {prUrl ? t('contribution.close') : t('common.close')}
          </Button>

          {!prUrl && (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('contribution.submitting')}
                </>
              ) : (
                t('contribution.submit')
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
