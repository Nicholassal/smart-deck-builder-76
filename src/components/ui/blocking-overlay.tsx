import { ReactNode } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';

interface BlockingOverlayProps {
  children: ReactNode;
  allowedStep?: string;
  className?: string;
}

export function BlockingOverlay({ children, allowedStep, className = '' }: BlockingOverlayProps) {
  const { isOnboardingActive, isBlockingUI, currentStep } = useOnboarding();

  const isBlocked = isOnboardingActive && isBlockingUI && (!allowedStep || currentStep !== allowedStep);

  return (
    <div className={`relative ${className}`}>
      {children}
      {isBlocked && (
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-30 cursor-not-allowed" />
      )}
    </div>
  );
}