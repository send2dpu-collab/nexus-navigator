import { motion } from 'framer-motion';

interface StatusLegendProps {
  counts: {
    healthy: number;
    warning: number;
    critical: number;
    unknown: number;
  };
}

export const StatusLegend = ({ counts }: StatusLegendProps) => {
  const statuses = [
    { key: 'critical', label: 'Critical', color: 'bg-status-critical', count: counts.critical },
    { key: 'warning', label: 'Warning', color: 'bg-status-warning', count: counts.warning },
    { key: 'healthy', label: 'Healthy', color: 'bg-status-healthy', count: counts.healthy },
    { key: 'unknown', label: 'Unknown', color: 'bg-status-unknown', count: counts.unknown },
  ];

  return (
    <div className="flex items-center gap-4">
      {statuses.map((status, index) => (
        <motion.button
          key={status.key}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border hover:bg-secondary transition-colors"
        >
          <span className={`w-2.5 h-2.5 rounded-full ${status.color}`} />
          <span className="text-xs font-medium text-foreground">{status.count}</span>
        </motion.button>
      ))}
    </div>
  );
};
