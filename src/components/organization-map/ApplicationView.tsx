import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Cog, 
  Cpu, 
  Server, 
  Building2,
  ArrowLeft,
  Activity,
  Clock,
  Zap,
  HardDrive
} from 'lucide-react';
import { LayerData, AppViewNode, StatusType, LayerType } from '@/types/organization-map';

interface ApplicationViewProps {
  apps: AppViewNode[];
  layers: LayerData[];
  allNodes: AppViewNode[];
  selectedApp: string | null;
  onAppSelect: (appId: string | null) => void;
}

const layerIcons: Record<LayerType, typeof Globe> = {
  applications: Globe,
  services: Cog,
  processes: Cpu,
  hosts: Server,
  datacenters: Building2,
};

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

const statusBorderColors: Record<StatusType, string> = {
  healthy: 'border-status-healthy',
  warning: 'border-status-warning',
  critical: 'border-status-critical',
  unknown: 'border-status-unknown',
};

// Metrics data for hover tooltips
interface NodeMetrics {
  status: StatusType;
  lastUpdated: string;
  requests?: string;
  errors?: string;
  responseTime?: string;
  calls?: string;
  latency?: string;
  errorRate?: string;
  cpu?: string;
  memory?: string;
  threads?: number;
  disk?: string;
  hosts?: number;
  uptime?: string;
  region?: string;
}

const getNodeMetrics = (node: AppViewNode): NodeMetrics => {
  const baseMetrics = {
    status: node.status,
    lastUpdated: '2 mins ago',
  };
  
  switch (node.type) {
    case 'application':
      return { ...baseMetrics, requests: '1.2K/s', errors: '0.02%', responseTime: '145ms' };
    case 'service':
      return { ...baseMetrics, calls: '850/s', latency: '23ms', errorRate: '0.1%' };
    case 'process':
      return { ...baseMetrics, cpu: `${Math.floor(Math.random() * 40 + 10)}%`, memory: `${Math.floor(Math.random() * 60 + 20)}%`, threads: Math.floor(Math.random() * 50 + 10) };
    case 'host':
      return { ...baseMetrics, cpu: `${Math.floor(Math.random() * 50 + 10)}%`, memory: `${Math.floor(Math.random() * 70 + 20)}%`, disk: `${Math.floor(Math.random() * 60 + 20)}%` };
    case 'datacenter':
      return { ...baseMetrics, hosts: Math.floor(Math.random() * 50 + 20), uptime: '99.99%', region: (node as any).location || 'Unknown' };
    default:
      return baseMetrics;
  }
};

export const ApplicationView = ({ apps, layers, allNodes, selectedApp, onAppSelect }: ApplicationViewProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (nodeId: string, e: React.MouseEvent) => {
    setHoveredNode(nodeId);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredNode) {
      setTooltipPos({ x: e.clientX, y: e.clientY });
    }
  };

  if (!selectedApp) {
    return (
      <BubbleMapView 
        apps={apps} 
        onAppSelect={onAppSelect}
        hoveredNode={hoveredNode}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
        tooltipPos={tooltipPos}
        allNodes={allNodes}
      />
    );
  }

  return (
    <DetailedFlowView 
      selectedApp={selectedApp}
      layers={layers}
      allNodes={allNodes}
      onBack={() => onAppSelect(null)}
      hoveredNode={hoveredNode}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredNode(null)}
      tooltipPos={tooltipPos}
    />
  );
};

// Bubble Map View - Initial view showing all applications as bubbles
interface BubbleMapViewProps {
  apps: AppViewNode[];
  onAppSelect: (appId: string) => void;
  hoveredNode: string | null;
  onMouseEnter: (nodeId: string, e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  tooltipPos: { x: number; y: number };
  allNodes: AppViewNode[];
}

const BubbleMapView = ({ apps, onAppSelect, hoveredNode, onMouseEnter, onMouseMove, onMouseLeave, tooltipPos, allNodes }: BubbleMapViewProps) => {
  const getAppStats = (appId: string) => {
    const getDescendants = (nodeId: string): string[] => {
      const node = allNodes.find(n => n.id === nodeId);
      if (!node?.children) return [];
      return node.children.flatMap(childId => [childId, ...getDescendants(childId)]);
    };
    
    const descendants = getDescendants(appId);
    const services = descendants.filter(id => allNodes.find(n => n.id === id)?.type === 'service').length;
    const processes = descendants.filter(id => allNodes.find(n => n.id === id)?.type === 'process').length;
    const hosts = descendants.filter(id => allNodes.find(n => n.id === id)?.type === 'host').length;
    
    return { services, processes, hosts };
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Applications Overview</h2>
        <p className="text-muted-foreground">Click on an application to view its detailed topology</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-8 max-w-5xl">
        {apps.map((app, index) => {
          const stats = getAppStats(app.id);
          const isHovered = hoveredNode === app.id;
          
          return (
            <motion.button
              key={app.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => onAppSelect(app.id)}
              onMouseEnter={(e) => onMouseEnter(app.id, e)}
              onMouseMove={onMouseMove}
              onMouseLeave={onMouseLeave}
              className={`relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all cursor-pointer
                ${statusBorderColors[app.status]} ${statusBgColors[app.status]}
                hover:shadow-lg hover:shadow-primary/20`}
              style={{
                boxShadow: isHovered ? `0 0 30px ${statusColors[app.status]}40` : undefined,
              }}
            >
              <div 
                className={`flex items-center justify-center w-20 h-20 rounded-full border-3 mb-4 ${statusBorderColors[app.status]} ${statusBgColors[app.status]}`}
              >
                <Globe className="w-10 h-10 text-foreground" />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">{app.name}</h3>
              
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Cog className="w-3 h-3" />
                  <span>{stats.services} services</span>
                </div>
                <div className="flex items-center gap-1">
                  <Server className="w-3 h-3" />
                  <span>{stats.hosts} hosts</span>
                </div>
              </div>
              
              {/* Status indicator */}
              <div 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background"
                style={{ backgroundColor: statusColors[app.status] }}
              />
            </motion.button>
          );
        })}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <NodeTooltip 
            node={allNodes.find(n => n.id === hoveredNode)!} 
            position={tooltipPos}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Detailed Flow View - Shows layers with connectivity
interface DetailedFlowViewProps {
  selectedApp: string;
  layers: LayerData[];
  allNodes: AppViewNode[];
  onBack: () => void;
  hoveredNode: string | null;
  onMouseEnter: (nodeId: string, e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  tooltipPos: { x: number; y: number };
}

const DetailedFlowView = ({ selectedApp, layers, allNodes, onBack, hoveredNode, onMouseEnter, onMouseMove, onMouseLeave, tooltipPos }: DetailedFlowViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [connections, setConnections] = useState<Array<{ from: string; to: string; fromPos: DOMRect; toPos: DOMRect }>>([]);

  // Get all related nodes for the selected app
  const getRelatedNodes = useCallback((appId: string): Set<string> => {
    const related = new Set<string>([appId]);
    
    const addDescendants = (nodeId: string) => {
      const node = allNodes.find(n => n.id === nodeId);
      if (node?.children) {
        node.children.forEach(childId => {
          related.add(childId);
          addDescendants(childId);
        });
      }
    };
    
    addDescendants(appId);
    return related;
  }, [allNodes]);

  const relatedNodeIds = getRelatedNodes(selectedApp);

  // Calculate connections between nodes
  useEffect(() => {
    const calculateConnections = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newConnections: typeof connections = [];
      
      relatedNodeIds.forEach(nodeId => {
        const node = allNodes.find(n => n.id === nodeId);
        if (node?.children) {
          node.children.forEach(childId => {
            if (relatedNodeIds.has(childId)) {
              const fromEl = nodeRefs.current.get(nodeId);
              const toEl = nodeRefs.current.get(childId);
              
              if (fromEl && toEl) {
                const fromRect = fromEl.getBoundingClientRect();
                const toRect = toEl.getBoundingClientRect();
                
                newConnections.push({
                  from: nodeId,
                  to: childId,
                  fromPos: {
                    ...fromRect,
                    x: fromRect.x - containerRect.x,
                    y: fromRect.y - containerRect.y,
                  } as DOMRect,
                  toPos: {
                    ...toRect,
                    x: toRect.x - containerRect.x,
                    y: toRect.y - containerRect.y,
                  } as DOMRect,
                });
              }
            }
          });
        }
      });
      
      setConnections(newConnections);
    };

    // Wait for nodes to render
    const timer = setTimeout(calculateConnections, 100);
    window.addEventListener('resize', calculateConnections);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateConnections);
    };
  }, [relatedNodeIds, allNodes]);

  const selectedAppNode = allNodes.find(n => n.id === selectedApp);

  const setNodeRef = (id: string, el: HTMLDivElement | null) => {
    if (el) {
      nodeRefs.current.set(id, el);
    }
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col overflow-auto relative">
      {/* Back button and header */}
      <div className="sticky top-0 z-20 flex items-center gap-4 px-6 py-4 bg-background/95 backdrop-blur border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Applications</span>
        </button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{selectedAppNode?.name}</h2>
          <p className="text-sm text-muted-foreground">Application Topology & Dependencies</p>
        </div>
      </div>

      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ minHeight: '800px' }}>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(250 95% 64%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(250 95% 64%)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {connections.map((conn, index) => {
          const fromX = conn.fromPos.x + conn.fromPos.width / 2;
          const fromY = conn.fromPos.y + conn.fromPos.height;
          const toX = conn.toPos.x + conn.toPos.width / 2;
          const toY = conn.toPos.y;
          
          const midY = (fromY + toY) / 2;
          const path = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;
          
          const isHighlighted = hoveredNode === conn.from || hoveredNode === conn.to;
          
          return (
            <g key={`${conn.from}-${conn.to}-${index}`}>
              <path
                d={path}
                fill="none"
                stroke={isHighlighted ? "url(#connectionGradient)" : "hsl(250 30% 50% / 0.4)"}
                strokeWidth={isHighlighted ? 3 : 2}
                filter={isHighlighted ? "url(#glow)" : undefined}
                className="transition-all duration-200"
              />
              {/* Arrow */}
              <circle
                cx={toX}
                cy={toY - 5}
                r={3}
                fill={isHighlighted ? "hsl(250 95% 64%)" : "hsl(250 30% 50% / 0.6)"}
              />
            </g>
          );
        })}
      </svg>

      {/* Layers */}
      <div className="flex flex-col gap-0 relative z-0 pb-8">
        {layers.map((layer, layerIndex) => {
          const Icon = layerIcons[layer.type];
          const layerNodes = layer.nodes.filter(n => relatedNodeIds.has(n.id));
          
          if (layerNodes.length === 0) return null;
          
          return (
            <motion.div
              key={layer.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: layerIndex * 0.1 }}
              className="relative"
            >
              {/* Layer header */}
              <div className="flex items-center gap-4 px-6 py-3 bg-secondary/30 border-b border-border">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{layer.label}</h3>
                <span className="text-xs text-muted-foreground">({layerNodes.length})</span>
              </div>
              
              {/* Layer nodes */}
              <div className="px-6 py-6 min-h-[120px]">
                <div className="flex flex-wrap justify-center gap-6">
                  {layerNodes.map((node, nodeIndex) => (
                    <div
                      key={node.id}
                      ref={(el) => setNodeRef(node.id, el)}
                    >
                      <FlowNode
                        node={node}
                        isHovered={hoveredNode === node.id}
                        onMouseEnter={(e) => onMouseEnter(node.id, e)}
                        onMouseMove={onMouseMove}
                        onMouseLeave={onMouseLeave}
                        delay={nodeIndex * 0.05}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <NodeTooltip 
            node={allNodes.find(n => n.id === hoveredNode)!} 
            position={tooltipPos}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Flow Node component
interface FlowNodeProps {
  node: AppViewNode;
  isHovered: boolean;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
  delay: number;
}

const FlowNode = ({ node, isHovered, onMouseEnter, onMouseMove, onMouseLeave, delay }: FlowNodeProps) => {
  const Icon = layerIcons[node.layer];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all
        ${statusBorderColors[node.status]} ${isHovered ? statusBgColors[node.status] : 'bg-card'}
        ${isHovered ? 'shadow-lg' : ''}`}
      style={{
        boxShadow: isHovered ? `0 0 20px ${statusColors[node.status]}40` : undefined,
      }}
    >
      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${statusBorderColors[node.status]} ${statusBgColors[node.status]}`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      
      <div className="text-center min-w-[80px] max-w-[120px]">
        <p className="text-xs font-medium text-foreground truncate">{node.name}</p>
      </div>
      
      {/* Status dot */}
      <div 
        className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-card"
        style={{ backgroundColor: statusColors[node.status] }}
      />
    </motion.div>
  );
};

// Tooltip component
interface NodeTooltipProps {
  node: AppViewNode;
  position: { x: number; y: number };
}

const NodeTooltip = ({ node, position }: NodeTooltipProps) => {
  const metrics = getNodeMetrics(node);
  const Icon = layerIcons[node.layer];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 p-4 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl min-w-[200px]"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${statusBgColors[node.status]}`}>
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{node.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
        </div>
        <div 
          className="ml-auto w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: statusColors[node.status] }}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        {node.type === 'application' && (
          <>
            <MetricItem icon={Activity} label="Requests" value={metrics.requests} />
            <MetricItem icon={Zap} label="Errors" value={metrics.errors} />
            <MetricItem icon={Clock} label="Response" value={metrics.responseTime} />
          </>
        )}
        {node.type === 'service' && (
          <>
            <MetricItem icon={Activity} label="Calls" value={metrics.calls} />
            <MetricItem icon={Clock} label="Latency" value={metrics.latency} />
            <MetricItem icon={Zap} label="Error Rate" value={metrics.errorRate} />
          </>
        )}
        {node.type === 'process' && (
          <>
            <MetricItem icon={Cpu} label="CPU" value={metrics.cpu} />
            <MetricItem icon={HardDrive} label="Memory" value={metrics.memory} />
            <MetricItem icon={Activity} label="Threads" value={String(metrics.threads)} />
          </>
        )}
        {node.type === 'host' && (
          <>
            <MetricItem icon={Cpu} label="CPU" value={metrics.cpu} />
            <MetricItem icon={HardDrive} label="Memory" value={metrics.memory} />
            <MetricItem icon={Server} label="Disk" value={metrics.disk} />
          </>
        )}
        {node.type === 'datacenter' && (
          <>
            <MetricItem icon={Server} label="Hosts" value={String(metrics.hosts)} />
            <MetricItem icon={Activity} label="Uptime" value={metrics.uptime} />
          </>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-border flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Updated {metrics.lastUpdated}</span>
      </div>
    </motion.div>
  );
};

const MetricItem = ({ icon: Icon, label, value }: { icon: typeof Activity; label: string; value: string }) => (
  <div className="flex items-center gap-1.5">
    <Icon className="w-3 h-3 text-muted-foreground" />
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium text-foreground">{value}</span>
  </div>
);
