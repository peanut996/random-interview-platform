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
import { toast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, GitMerge, ExternalLink } from 'lucide-react';

interface ContributionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContributionModal({ isOpen, onOpenChange }: ContributionModalProps) {
  const { t } = useTranslation();
  const [requirement, setRequirement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prUrl, setPrUrl] = useState<string | null>(null);
  const maxLength = 200; // Limit to one sentence

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setRequirement('');
      setPrUrl(null);
    }
    onOpenChange(open);
  };

  const handleSubmit = async () => {
    if (!requirement.trim()) {
      toast({
        title: t('contribution.error.title'),
        description: t('contribution.error.emptyRequirement'),
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
        body: JSON.stringify({ title: requirement }), // 修正参数名
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
        title: t('contribution.success.title'),
        description: t('contribution.success.description'),
      });

      // Store PR URL for display
      const pullRequestUrl = prData.url || prData.html_url;
      if (pullRequestUrl) {
        setPrUrl(pullRequestUrl);
      } else {
        console.error('No PR URL found in response:', prData);
      }

      // Clear content field but keep modal open to show success state
      setRequirement('');
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

  const openPrUrl = () => {
    if (prUrl) {
      window.open(prUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <GitMerge className="h-5 w-5 text-primary" />
            <DialogTitle>{t('contribution.title')}</DialogTitle>
          </div>
          <DialogDescription>{t('contribution.description')}</DialogDescription>
        </DialogHeader>

        {prUrl ? (
          // Success state with PR URL
          <div className="space-y-4 py-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-md border border-green-200 dark:border-green-800 flex flex-col">
              <div className="flex items-start mb-3">
                <Sparkles className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-400 mb-1">
                    {t('contribution.prCreated')}
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-500">
                    {t('contribution.prCreatedDesc')}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={openPrUrl}
                className="flex items-center justify-center gap-2 bg-white dark:bg-gray-800"
              >
                {t('contribution.viewPR')} <ExternalLink className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center mt-2">
              {t('contribution.thankYou')}
            </p>
          </div>
        ) : (
          // Input state
          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Textarea
                value={requirement}
                onChange={e => setRequirement(e.target.value)}
                placeholder={t('contribution.requirementPlaceholder')}
                className="min-h-[80px] resize-none"
                maxLength={maxLength}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">{t('contribution.hint')}</p>
                <p className="text-xs text-muted-foreground">
                  {requirement.length}/{maxLength}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            {prUrl ? t('contribution.close') : t('button.cancel')}
          </Button>

          {!prUrl && (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('contribution.submitting')}</span>
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
