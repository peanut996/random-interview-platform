'use client';

import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';

type ToastProps = {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
};

export function useToast() {
  // Use useCallback to memoize the toast function
  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 3000 }: ToastProps) => {
      if (variant === 'destructive') {
        sonnerToast.error(title, {
          description,
          duration,
        });
      } else {
        sonnerToast(title, {
          description,
          duration,
        });
      }
    },
    []
  );

  return { toast };
}
