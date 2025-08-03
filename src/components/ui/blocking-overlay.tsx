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
      
      {/* Blocking overlay for disabled elements */}
      {isBlocked && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-30 cursor-not-allowed rounded-lg" />
      )}
      
      {/* Highlight overlay for active elements */}
      {shouldHighlight && (
        <>
          {/* Pulsing border highlight */}
          <div className="absolute inset-0 z-40 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-primary/40 rounded-lg animate-pulse" />
            <div className="absolute inset-0 border-2 border-primary rounded-lg animate-pulse" />
          </div>
          
          {/* Arrow pointer */}
          <div className="absolute -top-3 -right-3 z-50 pointer-events-none">
            <div className="relative">
              <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-semibold animate-bounce shadow-lg">
                👆 Click here!
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
              </div>
            </div>
          </div>
          
          {/* Spotlight effect */}
          <div className="absolute inset-0 z-35 pointer-events-none">
            <div className="absolute inset-0 shadow-[0_0_0_4px_rgba(var(--primary),0.3),0_0_30px_rgba(var(--primary),0.5)] rounded-lg"></div>
          </div>
        </>
      )}
    </div>
  );
}