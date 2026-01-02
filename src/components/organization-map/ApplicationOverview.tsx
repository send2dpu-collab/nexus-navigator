import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingUp, Users, Activity } from 'lucide-react';
import { AppViewNode, StatusType } from '@/types/organization-map';

interface ApplicationOverviewProps {
  applications: AppViewNode[];
  onApplicationSelect: (appId: string) => void;
  searchQuery: string;
}

const statusColors: Record<StatusType, string> = {
  healthy: 'hsl(142 76% 36%)',
  warning: 'hsl(48 96% 53%)',
  critical: 'hsl(0 84% 60%)',
  unknown: 'hsl(220 9% 46%)',
};

const statusBgColors: Record<StatusType, string> = {
  healthy: 'bg-status-healthy/20',
  warning: 'bg-status-warning/20',
  critical: 'bg-status-critical/20',
  unknown: 'bg-status-unknown/20',
};

export const ApplicationOverview = ({ applications, onApplicationSelect, searchQuery }: ApplicationOverviewProps) => {
  const [hoveredApp, setHoveredApp] = useState<string | null>(null);

  const getApplicationMetrics = (app: AppViewNode) => {
    return {
      services: app.children?.length || 0,
      users: Math.floor(Math.random() * 10000 + 1000),
      uptime: `${(99 + Math.random()).toFixed(2)}%`,
      requests: `${Math.floor(Math.random() * 5000 + 1000)}/min`,
    };
  };

  const filteredApps = applications.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-background via-secondary/10 to-background p-8">
      <div className="w-full max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Organization Applications</h2>
          <p className="text-muted-foreground">
            Select an application to view its detailed service map
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app, index) => {
            const metrics = getApplicationMetrics(app);
            const isHovered = hoveredApp === app.id;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`relative cursor-pointer group`}
                onClick={() => onApplicationSelect(app.id)}
                onMouseEnter={() => setHoveredApp(app.id)}
                onMouseLeave={() => setHoveredApp(null)}
              >
                <div
                  className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                    isHovered
                      ? 'bg-card shadow-2xl border-primary'
                      : 'bg-card/80 border-border hover:border-primary/50'
                  }`}
                  style={{
                    boxShadow: isHovered ? `0 0 40px ${statusColors[app.status]}40` : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex items-center justify-center w-14 h-14 rounded-xl"
                      style={{ backgroundColor: `hsl(200 80% 55% / 0.2)` }}
                    >
                      <Globe className="w-7 h-7" style={{ color: 'hsl(200 80% 55%)' }} />
                    </div>

                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: statusColors[app.status] }}
                    />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                    {app.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 capitalize">
                    {app.status} · {metrics.services} services
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Requests</p>
                        <p className="text-xs font-semibold text-foreground">{metrics.requests}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <TrendingUp className="w-3.5 h-3.5 text-status-healthy" />
                      <div>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                        <p className="text-xs font-semibold text-foreground">{metrics.uptime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{metrics.users} users</span>
                    </div>
                    <div className="text-xs text-primary font-medium group-hover:underline">
                      View Details →
                    </div>
                  </div>

                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 rounded-2xl border-2 border-primary pointer-events-none"
                      style={{
                        boxShadow: `0 0 30px ${statusColors[app.status]}30`,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredApps.length === 0 && (
          <div className="text-center py-20">
            <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-xl text-muted-foreground">No applications found</p>
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your search query</p>
          </div>
        )}
      </div>
    </div>
  );
};
