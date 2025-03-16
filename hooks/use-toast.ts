'use client';

import { useCallback } from 'react';
import { toast as sonnerToast } from '@/components/ui/sonner';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'error';
  duration?: number;
};

function convertVariant(variant: ToastProps['variant']) {
  if (variant === 'default') return 'success';
  if (variant === 'destructive') return 'error';
  return variant;
}

export function useToast() {
  // Use useCallback to memoize the toast function
  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
      const convertedVariant = convertVariant(variant);
      
      sonnerToast({
        title,
        description,
        variant: convertedVariant,
        duration,
      });
    },
    []
  );

  return { toast };
}
