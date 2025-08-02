import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Info } from 'lucide-react';
import { useOnboarding, FirstVisitPage } from '@/hooks/useOnboarding';

interface FirstVisitTooltipProps {
  page: FirstVisitPage;
  title: string;
  description: string;
  className?: string;
}

export function FirstVisitTooltip({ page, title, description, className = '' }: FirstVisitTooltipProps) {
  const { shouldShowFirstVisit, dismissFirstVisit } = useOnboarding();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (shouldShowFirstVisit(page)) {
      // Show tooltip after a brief delay
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [page, shouldShowFirstVisit]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissFirstVisit(page);
  };

  if (!isVisible || !shouldShowFirstVisit(page)) {
    return null;
  }

  return (
    <Card className={`absolute top-4 right-4 max-w-sm z-40 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm">{title}</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{description}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}