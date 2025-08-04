import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Home, BarChart3, Calendar, Settings, Menu, X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockingOverlay } from '@/components/ui/blocking-overlay';

interface NavigationProps {
  currentView: 'files' | 'stats' | 'schedule' | 'shop' | 'settings';
  onViewChange: (view: 'files' | 'stats' | 'schedule' | 'shop' | 'settings') => void;
  onCreateFile: () => void;
}

export function Navigation({ currentView, onViewChange, onCreateFile }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'files' as const, label: 'Files', icon: Home },
    { id: 'stats' as const, label: 'Stats', icon: BarChart3 },
    { id: 'schedule' as const, label: 'Schedule', icon: Calendar },
    { id: 'shop' as const, label: 'Shop', icon: ShoppingBag },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-card border-b fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-primary">StudyCards</h1>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:relative top-0 left-0 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out z-40",
        "md:transform-none md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-8 hidden md:block">StudyCards</h1>
          
          <BlockingOverlay allowedStep="create-file" highlight={true}>
            <Button 
              onClick={onCreateFile}
              className="w-full mb-6 bg-primary hover:bg-primary-dark text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Study File
            </Button>
          </BlockingOverlay>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    currentView === item.id && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}