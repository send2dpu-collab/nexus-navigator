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
  HardDrive,
  Database,
  Cloud,
  Box,
  Layers,
  Container
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

// Extended component types for detailed flow
type ComponentType = 'web' | 'service' | 'database' | 'queue' | 'cache' | 'mainframe' | 'tomcat' | 'nginx' | 'api' | 'storage' | 'external';

const componentIcons: Record<ComponentType, typeof Globe> = {
  web: Globe,
  service: Cog,
  database: Database,
  queue: Layers,
  cache: HardDrive,
  mainframe: Server,
  tomcat: Container,
  nginx: Box,
  api: Cloud,
  storage: HardDrive,
  external: Cloud,
};

const componentColors: Record<ComponentType, string> = {
  web: 'hsl(250 95% 64%)',
  service: 'hsl(217 91% 60%)',
  database: 'hsl(142 76% 36%)',
  queue: 'hsl(48 96% 53%)',
  cache: 'hsl(280 68% 60%)',
  mainframe: 'hsl(0 84% 60%)',
  tomcat: 'hsl(25 95% 53%)',
  nginx: 'hsl(142 71% 45%)',
  api: 'hsl(199 89% 48%)',
  storage: 'hsl(220 9% 46%)',
  external: 'hsl(280 68% 60%)',
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

// Flow node for connectivity map
interface FlowComponent {
  id: string;
  name: string;
  type: ComponentType;
  status: StatusType;
  x: number;
  y: number;
  metrics: {
    requests?: string;
    responseTime?: string;
    errors?: string;
    cpu?: string;
    memory?: string;
    connections?: number;
    throughput?: string;
    latency?: string;
    queries?: string;
  };
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  requests?: string;
  responseTime?: string;
  status: StatusType;
}

// Generate flow data for an application
const generateAppFlowData = (appName: string): { components: FlowComponent[]; connections: FlowConnection[] } => {
  const baseY = 300;
  const components: FlowComponent[] = [
    // User/Browser
    { id: 'user', name: 'User Browser', type: 'web', status: 'healthy', x: 100, y: baseY, 
      metrics: { requests: '2.5K/min', responseTime: '1.2s', errors: '0.1%' } },
    
    // Web Server Layer
    { id: 'nginx', name: 'nginx:80', type: 'nginx', status: 'healthy', x: 280, y: baseY - 80,
      metrics: { requests: '5K/min', responseTime: '12ms', throughput: '250 MB/s' } },
    { id: 'cdn', name: 'CDN Edge', type: 'external', status: 'healthy', x: 280, y: baseY + 80,
      metrics: { requests: '8K/min', latency: '5ms', throughput: '1.2 GB/s' } },
    
    // Application Server Layer  
    { id: 'tomcat1', name: 'Tomcat:8080', type: 'tomcat', status: 'healthy', x: 460, y: baseY - 120,
      metrics: { requests: '1.8K/min', cpu: '45%', memory: '2.1 GB' } },
    { id: 'tomcat2', name: 'Tomcat:8081', type: 'tomcat', status: 'warning', x: 460, y: baseY,
      metrics: { requests: '1.2K/min', cpu: '78%', memory: '3.5 GB' } },
    { id: 'nodeapi', name: 'Node API:3000', type: 'api', status: 'healthy', x: 460, y: baseY + 120,
      metrics: { requests: '3.2K/min', responseTime: '45ms', errors: '0.02%' } },
    
    // Middleware Layer
    { id: 'kafka', name: 'Kafka Queue', type: 'queue', status: 'healthy', x: 640, y: baseY - 60,
      metrics: { throughput: '50K msg/s', latency: '2ms', connections: 124 } },
    { id: 'redis', name: 'Redis Cache', type: 'cache', status: 'healthy', x: 640, y: baseY + 60,
      metrics: { requests: '12K/s', memory: '8.2 GB', connections: 256 } },
    
    // Database Layer
    { id: 'postgres', name: 'PostgreSQL', type: 'database', status: 'healthy', x: 820, y: baseY - 120,
      metrics: { queries: '2.1K/s', connections: 85, responseTime: '8ms' } },
    { id: 'mysql', name: 'MySQL Cluster', type: 'database', status: 'healthy', x: 820, y: baseY,
      metrics: { queries: '1.5K/s', connections: 62, responseTime: '12ms' } },
    { id: 'mongodb', name: 'MongoDB', type: 'database', status: 'warning', x: 820, y: baseY + 120,
      metrics: { queries: '890/s', connections: 45, memory: '12 GB' } },
    
    // Mainframe/Legacy
    { id: 'mainframe', name: 'IBM Mainframe', type: 'mainframe', status: 'critical', x: 1000, y: baseY - 60,
      metrics: { requests: '120/s', responseTime: '250ms', cpu: '92%' } },
    { id: 'storage', name: 'NetApp Storage', type: 'storage', status: 'healthy', x: 1000, y: baseY + 60,
      metrics: { throughput: '2.5 GB/s', latency: '0.5ms', connections: 32 } },
  ];

  const connections: FlowConnection[] = [
    // User to Web Layer
    { from: 'user', to: 'nginx', label: 'HTTPS', requests: '5K/min', responseTime: '45ms', status: 'healthy' },
    { from: 'user', to: 'cdn', label: 'Static Assets', requests: '8K/min', responseTime: '12ms', status: 'healthy' },
    
    // Web to App Layer
    { from: 'nginx', to: 'tomcat1', label: 'HTTP', requests: '1.8K/min', responseTime: '65ms', status: 'healthy' },
    { from: 'nginx', to: 'tomcat2', label: 'HTTP', requests: '1.2K/min', responseTime: '180ms', status: 'warning' },
    { from: 'nginx', to: 'nodeapi', label: 'REST API', requests: '2K/min', responseTime: '35ms', status: 'healthy' },
    { from: 'cdn', to: 'nodeapi', label: 'API Calls', requests: '1.2K/min', responseTime: '28ms', status: 'healthy' },
    
    // App to Middleware
    { from: 'tomcat1', to: 'kafka', label: 'Events', requests: '500/min', responseTime: '2ms', status: 'healthy' },
    { from: 'tomcat2', to: 'kafka', label: 'Events', requests: '350/min', responseTime: '5ms', status: 'warning' },
    { from: 'tomcat1', to: 'redis', label: 'Cache', requests: '3K/min', responseTime: '1ms', status: 'healthy' },
    { from: 'nodeapi', to: 'redis', label: 'Sessions', requests: '2K/min', responseTime: '0.8ms', status: 'healthy' },
    
    // Middleware to DB
    { from: 'kafka', to: 'postgres', label: 'Write', requests: '800/min', responseTime: '12ms', status: 'healthy' },
    { from: 'redis', to: 'mysql', label: 'Query', requests: '1.2K/min', responseTime: '8ms', status: 'healthy' },
    { from: 'tomcat2', to: 'mongodb', label: 'NoSQL', requests: '600/min', responseTime: '45ms', status: 'warning' },
    { from: 'nodeapi', to: 'postgres', label: 'JDBC', requests: '1.5K/min', responseTime: '15ms', status: 'healthy' },
    
    // DB to Backend
    { from: 'postgres', to: 'mainframe', label: 'CICS', requests: '80/min', responseTime: '280ms', status: 'critical' },
    { from: 'mysql', to: 'storage', label: 'Backup', requests: '20/min', responseTime: '150ms', status: 'healthy' },
    { from: 'mongodb', to: 'storage', label: 'Archive', requests: '10/min', responseTime: '200ms', status: 'healthy' },
  ];

  return { components, connections };
};

export const ApplicationView = ({ apps, layers, allNodes, selectedApp, onAppSelect }: ApplicationViewProps) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (nodeId: string, e: React.MouseEvent) => {
    setHoveredNode(nodeId);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredNode || hoveredConnection) {
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

  const selectedAppNode = allNodes.find(n => n.id === selectedApp);

  return (
    <ConnectivityFlowView 
      appName={selectedAppNode?.name || 'Application'}
      onBack={() => onAppSelect(null)}
      hoveredNode={hoveredNode}
      hoveredConnection={hoveredConnection}
      onNodeHover={setHoveredNode}
      onConnectionHover={setHoveredConnection}
      onMouseMove={handleMouseMove}
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
        <p className="text-muted-foreground">Click on an application to view its connectivity map</p>
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
          <BubbleTooltip 
            node={allNodes.find(n => n.id === hoveredNode)!} 
            position={tooltipPos}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Connectivity Flow View - Shows full application connectivity like Dynatrace
interface ConnectivityFlowViewProps {
  appName: string;
  onBack: () => void;
  hoveredNode: string | null;
  hoveredConnection: string | null;
  onNodeHover: (nodeId: string | null) => void;
  onConnectionHover: (connId: string | null) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  tooltipPos: { x: number; y: number };
}

const ConnectivityFlowView = ({ 
  appName, 
  onBack, 
  hoveredNode, 
  hoveredConnection,
  onNodeHover,
  onConnectionHover,
  onMouseMove,
  tooltipPos 
}: ConnectivityFlowViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });

  const { components, connections } = generateAppFlowData(appName);

  // Center view on mount
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setPan({ x: (containerWidth - 1100) / 2, y: 50 });
    }
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.4), 2));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === containerRef.current) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastPan.current = { ...pan };
    }
  };

  const handleMouseMoveInternal = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: lastPan.current.x + dx,
        y: lastPan.current.y + dy,
      });
    }
    onMouseMove(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode && !hoveredConnection) return true;
    if (hoveredNode === nodeId) return true;
    if (hoveredConnection) {
      const conn = connections.find((_, i) => `conn-${i}` === hoveredConnection);
      if (conn && (conn.from === nodeId || conn.to === nodeId)) return true;
    }
    // Check if connected to hovered node
    if (hoveredNode) {
      return connections.some(c => 
        (c.from === hoveredNode && c.to === nodeId) || 
        (c.to === hoveredNode && c.from === nodeId)
      );
    }
    return false;
  };

  const isConnectionHighlighted = (index: number) => {
    const conn = connections[index];
    if (!hoveredNode && !hoveredConnection) return false;
    if (hoveredConnection === `conn-${index}`) return true;
    if (hoveredNode && (conn.from === hoveredNode || conn.to === hoveredNode)) return true;
    return false;
  };

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMoveInternal}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center gap-4 px-6 py-4 bg-background/95 backdrop-blur border-b border-border">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{appName} - Connectivity Map</h2>
          <p className="text-sm text-muted-foreground">Full application flow with all dependencies</p>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-20 left-4 z-20 p-3 bg-card/95 backdrop-blur border border-border rounded-lg">
        <p className="text-xs font-semibold text-foreground mb-2">Component Types</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {(['nginx', 'tomcat', 'database', 'queue', 'cache', 'mainframe'] as ComponentType[]).map(type => {
            const Icon = componentIcons[type];
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div 
                  className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${componentColors[type]}30` }}
                >
                  <Icon className="w-2.5 h-2.5" style={{ color: componentColors[type] }} />
                </div>
                <span className="text-[10px] text-muted-foreground capitalize">{type}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-lg">
        <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Canvas */}
      <div 
        className="absolute inset-0 pt-16"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-[1200px] h-[700px] pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(250 95% 64%)" />
            </marker>
            <marker id="arrowHeadDim" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(220 15% 40%)" />
            </marker>
            <filter id="flowGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connection lines */}
          {connections.map((conn, index) => {
            const fromNode = components.find(c => c.id === conn.from);
            const toNode = components.find(c => c.id === conn.to);
            if (!fromNode || !toNode) return null;

            const x1 = fromNode.x + 45;
            const y1 = fromNode.y + 30;
            const x2 = toNode.x + 45;
            const y2 = toNode.y + 30;

            // Create curved path
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const ctrlOffset = Math.abs(y2 - y1) * 0.3;
            
            const path = `M ${x1} ${y1} Q ${midX} ${y1 + ctrlOffset}, ${x2} ${y2}`;
            const isHighlighted = isConnectionHighlighted(index);
            const isDimmed = (hoveredNode || hoveredConnection) && !isHighlighted;

            return (
              <g 
                key={`conn-${index}`}
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  onConnectionHover(`conn-${index}`);
                }}
                onMouseLeave={() => onConnectionHover(null)}
              >
                <path
                  d={path}
                  fill="none"
                  stroke={isHighlighted ? statusColors[conn.status] : isDimmed ? 'hsl(220 15% 30%)' : 'hsl(220 15% 45%)'}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={conn.status === 'critical' ? '8 4' : undefined}
                  opacity={isDimmed ? 0.3 : 1}
                  markerEnd={isHighlighted ? 'url(#arrowHead)' : 'url(#arrowHeadDim)'}
                  filter={isHighlighted ? 'url(#flowGlow)' : undefined}
                  className="transition-all duration-200"
                />
                {/* Connection label */}
                {isHighlighted && conn.label && (
                  <g>
                    <rect
                      x={midX - 30}
                      y={midY - 20}
                      width="60"
                      height="16"
                      rx="4"
                      fill="hsl(var(--card))"
                      stroke={statusColors[conn.status]}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY - 9}
                      fill={statusColors[conn.status]}
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {conn.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Component nodes */}
        {components.map((component, index) => {
          const Icon = componentIcons[component.type];
          const isHovered = hoveredNode === component.id;
          const isHighlighted = isNodeHighlighted(component.id);

          return (
            <motion.div
              key={component.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isHighlighted ? 1 : 0.3, 
                scale: 1,
              }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className={`absolute flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer
                ${isHovered ? 'bg-card shadow-xl z-10' : 'bg-card/90 hover:bg-card'}`}
              style={{
                left: component.x,
                top: component.y,
                borderColor: isHovered ? statusColors[component.status] : 'transparent',
                boxShadow: isHovered ? `0 0 30px ${statusColors[component.status]}50` : undefined,
              }}
              onMouseEnter={(e) => {
                onNodeHover(component.id);
              }}
              onMouseLeave={() => onNodeHover(null)}
            >
              <div
                className="flex items-center justify-center w-14 h-14 rounded-xl mb-1"
                style={{ backgroundColor: `${componentColors[component.type]}25` }}
              >
                <Icon
                  className="w-7 h-7"
                  style={{ color: componentColors[component.type] }}
                />
              </div>
              <span className="text-[11px] font-medium text-foreground whitespace-nowrap max-w-[100px] truncate">
                {component.name}
              </span>
              
              {/* Status indicator */}
              <div
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card"
                style={{ backgroundColor: statusColors[component.status] }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Node Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <ComponentTooltip 
            component={components.find(c => c.id === hoveredNode)!}
            position={tooltipPos}
          />
        )}
      </AnimatePresence>

      {/* Connection Tooltip */}
      <AnimatePresence>
        {hoveredConnection && (
          <ConnectionFlowTooltip 
            connection={connections[parseInt(hoveredConnection.replace('conn-', ''))]}
            components={components}
            position={tooltipPos}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Component Tooltip
interface ComponentTooltipProps {
  component: FlowComponent;
  position: { x: number; y: number };
}

const ComponentTooltip = ({ component, position }: ComponentTooltipProps) => {
  const Icon = componentIcons[component.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 p-4 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl min-w-[220px]"
      style={{
        left: Math.min(position.x + 15, window.innerWidth - 250),
        top: Math.min(position.y + 15, window.innerHeight - 200),
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <div 
          className="flex items-center justify-center w-10 h-10 rounded-lg"
          style={{ backgroundColor: `${componentColors[component.type]}25` }}
        >
          <Icon className="w-5 h-5" style={{ color: componentColors[component.type] }} />
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{component.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{component.type}</p>
        </div>
        <div 
          className="ml-auto w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[component.status] }}
        />
      </div>
      
      <div className="space-y-2 text-xs">
        {component.metrics.requests && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3" /> Requests</span>
            <span className="font-medium text-foreground">{component.metrics.requests}</span>
          </div>
        )}
        {component.metrics.responseTime && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Response</span>
            <span className="font-medium text-foreground">{component.metrics.responseTime}</span>
          </div>
        )}
        {component.metrics.throughput && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> Throughput</span>
            <span className="font-medium text-foreground">{component.metrics.throughput}</span>
          </div>
        )}
        {component.metrics.cpu && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
            <span className="font-medium text-foreground">{component.metrics.cpu}</span>
          </div>
        )}
        {component.metrics.memory && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><HardDrive className="w-3 h-3" /> Memory</span>
            <span className="font-medium text-foreground">{component.metrics.memory}</span>
          </div>
        )}
        {component.metrics.connections && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Server className="w-3 h-3" /> Connections</span>
            <span className="font-medium text-foreground">{component.metrics.connections}</span>
          </div>
        )}
        {component.metrics.queries && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Database className="w-3 h-3" /> Queries</span>
            <span className="font-medium text-foreground">{component.metrics.queries}</span>
          </div>
        )}
        {component.metrics.latency && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Latency</span>
            <span className="font-medium text-foreground">{component.metrics.latency}</span>
          </div>
        )}
        {component.metrics.errors && (
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3" /> Errors</span>
            <span className="font-medium" style={{ color: parseFloat(component.metrics.errors) > 1 ? statusColors.critical : statusColors.healthy }}>
              {component.metrics.errors}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Connection Flow Tooltip
interface ConnectionFlowTooltipProps {
  connection: FlowConnection;
  components: FlowComponent[];
  position: { x: number; y: number };
}

const ConnectionFlowTooltip = ({ connection, components, position }: ConnectionFlowTooltipProps) => {
  const fromComponent = components.find(c => c.id === connection.from);
  const toComponent = components.find(c => c.id === connection.to);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 p-3 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl min-w-[200px]"
      style={{
        left: Math.min(position.x + 15, window.innerWidth - 230),
        top: Math.min(position.y + 15, window.innerHeight - 180),
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
        <Activity className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground text-sm">{connection.label || 'Connection'}</span>
        <div 
          className="ml-auto w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: statusColors[connection.status] }}
        />
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">From</span>
          <span className="font-medium text-foreground">{fromComponent?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">To</span>
          <span className="font-medium text-foreground">{toComponent?.name}</span>
        </div>
        {connection.requests && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requests</span>
            <span className="font-medium text-foreground">{connection.requests}</span>
          </div>
        )}
        {connection.responseTime && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Response Time</span>
            <span className="font-medium" style={{ color: statusColors[connection.status] }}>
              {connection.responseTime}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <span className="font-medium capitalize" style={{ color: statusColors[connection.status] }}>
            {connection.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Bubble Tooltip for initial view
interface BubbleTooltipProps {
  node: AppViewNode;
  position: { x: number; y: number };
}

const BubbleTooltip = ({ node, position }: BubbleTooltipProps) => {
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
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Requests:</span>
          <span className="font-medium text-foreground">1.2K/s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Response:</span>
          <span className="font-medium text-foreground">145ms</span>
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Updated 2 mins ago</span>
      </div>
    </motion.div>
  );
};
