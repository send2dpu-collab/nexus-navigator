import { motion } from 'framer-motion';
import { Layers, Network } from 'lucide-react';
import { ViewType } from '@/types/organization-map';

interface ViewToggleProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export const ViewToggle = ({ activeView, onViewChange }: ViewToggleProps) => {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border">
      <button
        onClick={() => onViewChange('application')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === 'application' 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {activeView === 'application' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-md"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Layers className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Application View</span>
      </button>
      
      <button
        onClick={() => onViewChange('network')}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeView === 'network' 
            ? 'text-primary-foreground' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        {activeView === 'network' && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-primary rounded-md"
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        )}
        <Network className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Network View</span>
      </button>
    </div>
  );
};
