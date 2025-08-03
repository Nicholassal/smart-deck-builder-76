import { ReactNode } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface BlockingOverlayProps {
  children: ReactNode;
  allowedStep?: string;
  className?: string;
  highlight?: boolean;
}

export function BlockingOverlay({ children, allowedStep, className = '', highlight = false }: BlockingOverlayProps) {
  const { isOnboardingActive, isBlockingUI, currentStep } = useOnboarding();

  const isBlocked = isOnboardingActive && isBlockingUI && (!allowedStep || currentStep !== allowedStep);
  const shouldHighlight = isOnboardingActive && highlight && allowedStep === currentStep;

  return (
    <div className={`relative ${className}`}>
      {children}
      {isBlocked && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] z-30 cursor-not-allowed" />
      )}
      {shouldHighlight && (
        <div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/30 animate-pulse rounded-lg shadow-lg shadow-primary/50" />
          <div className="absolute top-2 right-2">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold animate-bounce">
              Click here!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}