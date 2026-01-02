import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Cog,
  Cpu,
  Server,
  Building2,
  Activity,
  Clock,
  Zap,
  HardDrive,
  Database,
  Network,
  AlertTriangle,
  TrendingUp,
  Users,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2
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

const layerColors: Record<LayerType, string> = {
  applications: 'hsl(200 80% 55%)',
  services: 'hsl(260 70% 60%)',
  processes: 'hsl(45 93% 55%)',
  hosts: 'hsl(142 76% 45%)',
  datacenters: 'hsl(320 70% 55%)',
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

interface NodePosition {
  x: number;
  y: number;
}

const generateNodeMetrics = (node: AppViewNode) => {
  const baseMetrics = {
    uptime: `${Math.floor(Math.random() * 365) + 30} days`,
    lastSeen: '< 1 min ago',
  };

  switch (node.type) {
    case 'application':
      return {
        ...baseMetrics,
        requests: `${Math.floor(Math.random() * 5000 + 1000)}/min`,
        responseTime: `${Math.floor(Math.random() * 200 + 50)}ms`,
        errors: `${(Math.random() * 2).toFixed(2)}%`,
        users: Math.floor(Math.random() * 10000 + 1000),
        availability: `${(99 + Math.random()).toFixed(2)}%`,
      };
    case 'service':
      return {
        ...baseMetrics,
        requests: `${Math.floor(Math.random() * 3000 + 500)}/min`,
        responseTime: `${Math.floor(Math.random() * 150 + 30)}ms`,
        errors: `${(Math.random() * 1).toFixed(2)}%`,
        cpu: `${Math.floor(Math.random() * 40 + 20)}%`,
        memory: `${Math.floor(Math.random() * 50 + 30)}%`,
        throughput: `${Math.floor(Math.random() * 500 + 100)} MB/s`,
      };
    case 'process':
      return {
        ...baseMetrics,
        cpu: `${Math.floor(Math.random() * 60 + 20)}%`,
        memory: `${Math.floor(Math.random() * 70 + 20)}%`,
        threads: Math.floor(Math.random() * 50 + 10),
        handles: Math.floor(Math.random() * 1000 + 200),
        pid: Math.floor(Math.random() * 10000 + 1000),
      };
    case 'host':
      return {
        ...baseMetrics,
        cpu: `${Math.floor(Math.random() * 60 + 20)}%`,
        memory: `${Math.floor(Math.random() * 70 + 30)}%`,
        disk: `${Math.floor(Math.random() * 60 + 20)}%`,
        network: `${Math.floor(Math.random() * 500 + 100)} MB/s`,
        processes: Math.floor(Math.random() * 200 + 50),
      };
    case 'datacenter':
      return {
        ...baseMetrics,
        hosts: Math.floor(Math.random() * 100 + 20),
        capacity: `${Math.floor(Math.random() * 30 + 60)}%`,
        power: `${Math.floor(Math.random() * 500 + 100)} kW`,
        cooling: `${Math.floor(Math.random() * 20 + 18)}°C`,
      };
    default:
      return baseMetrics;
  }
};

export const ApplicationView = ({ apps, layers, allNodes, selectedApp, onAppSelect }: ApplicationViewProps) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <LayeredTopologyView
      layers={layers}
      allNodes={allNodes}
      selectedNode={selectedNode}
      onNodeSelect={setSelectedNode}
      hoveredNode={hoveredNode}
      onNodeHover={setHoveredNode}
    />
  );
};

interface LayeredTopologyViewProps {
  layers: LayerData[];
  allNodes: AppViewNode[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
  hoveredNode: string | null;
  onNodeHover: (nodeId: string | null) => void;
}

const LayeredTopologyView = ({
  layers,
  allNodes,
  selectedNode,
  onNodeSelect,
  hoveredNode,
  onNodeHover,
}: LayeredTopologyViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });

  // Calculate node positions
  useEffect(() => {
    const positions: Record<string, NodePosition> = {};
    const layerHeight = 150;
    const startY = 60;
    const nodeSpacing = 120;
    const leftMargin = 200;

    layers.forEach((layer, layerIndex) => {
      const y = startY + layerIndex * layerHeight;
      const nodesInLayer = layer.nodes;
      const totalWidth = nodesInLayer.length * nodeSpacing;
      const startX = leftMargin;

      nodesInLayer.forEach((node, nodeIndex) => {
        const x = startX + nodeIndex * nodeSpacing;
        positions[node.id] = { x, y };
      });
    });

    setNodePositions(positions);
  }, [layers]);

  // Center view on mount
  useEffect(() => {
    if (containerRef.current && Object.keys(nodePositions).length > 0) {
      const container = containerRef.current;
      const panelWidth = selectedNode ? 320 : 0;
      const availableWidth = container.clientWidth - panelWidth - 100;
      setPan({ x: 50, y: 20 });
    }
  }, [nodePositions, selectedNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.5), 2));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === containerRef.current) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      lastPan.current = { ...pan };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({
        x: lastPan.current.x + dx,
        y: lastPan.current.y + dy,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 50, y: 20 });
  };

  const getConnections = (): Array<{ from: string; to: string }> => {
    const connections: Array<{ from: string; to: string }> = [];
    allNodes.forEach(node => {
      if (node.children) {
        node.children.forEach(childId => {
          connections.push({ from: node.id, to: childId });
        });
      }
    });
    return connections;
  };

  const connections = getConnections();

  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode && !selectedNode) return true;
    const targetNode = hoveredNode || selectedNode;
    if (nodeId === targetNode) return true;

    // Check if connected
    return connections.some(c =>
      (c.from === targetNode && c.to === nodeId) ||
      (c.to === targetNode && c.from === nodeId)
    );
  };

  const isConnectionHighlighted = (connection: { from: string; to: string }) => {
    if (!hoveredNode && !selectedNode) return false;
    const targetNode = hoveredNode || selectedNode;
    return connection.from === targetNode || connection.to === targetNode;
  };

  return (
    <div className="h-full flex">
      {/* Main canvas area */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-hidden bg-gradient-to-br from-background via-secondary/10 to-background transition-all duration-300`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Layer Labels - Left Side */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-sidebar/50 backdrop-blur border-r border-border z-10">
          {layers.map((layer, index) => {
            const Icon = layerIcons[layer.type];
            return (
              <div
                key={layer.type}
                className="flex items-center gap-3 px-4 py-3 border-b border-border"
                style={{ height: '150px' }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 rounded-lg"
                  style={{ backgroundColor: `${layerColors[layer.type]}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: layerColors[layer.type] }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{layer.label}</p>
                  <p className="text-xs text-muted-foreground">{layer.count} items</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setZoom(z => Math.min(z * 1.2, 2))}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <ZoomIn className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <ZoomOut className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={resetView}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
          >
            <Maximize2 className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-lg">
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Canvas */}
        <div
          className="absolute inset-0 ml-48"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(220 15% 45%)" />
              </marker>
              <marker id="arrowheadHighlight" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(230 80% 60%)" />
              </marker>
              <filter id="connGlow">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Connection lines */}
            {connections.map((conn, index) => {
              const fromPos = nodePositions[conn.from];
              const toPos = nodePositions[conn.to];
              if (!fromPos || !toPos) return null;

              const x1 = fromPos.x + 40;
              const y1 = fromPos.y + 50;
              const x2 = toPos.x + 40;
              const y2 = toPos.y + 20;

              const isHighlighted = isConnectionHighlighted(conn);
              const isDimmed = (hoveredNode || selectedNode) && !isHighlighted;

              // Curved path
              const midY = (y1 + y2) / 2;
              const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

              return (
                <path
                  key={`conn-${index}`}
                  d={path}
                  fill="none"
                  stroke={isHighlighted ? 'hsl(230 80% 60%)' : 'hsl(220 15% 45%)'}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  opacity={isDimmed ? 0.15 : 0.6}
                  markerEnd={isHighlighted ? 'url(#arrowheadHighlight)' : 'url(#arrowhead)'}
                  filter={isHighlighted ? 'url(#connGlow)' : undefined}
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {allNodes.map((node, index) => {
            const position = nodePositions[node.id];
            if (!position) return null;

            const Icon = layerIcons[node.layer];
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isHighlighted = isNodeHighlighted(node.id);

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: isHighlighted ? 1 : 0.25,
                  scale: 1,
                }}
                transition={{ delay: index * 0.02, duration: 0.3 }}
                className={`absolute flex flex-col items-center cursor-pointer group`}
                style={{
                  left: position.x,
                  top: position.y,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onNodeSelect(isSelected ? null : node.id);
                }}
                onMouseEnter={() => onNodeHover(node.id)}
                onMouseLeave={() => onNodeHover(null)}
              >
                {/* Node circle */}
                <div
                  className={`relative flex items-center justify-center w-20 h-20 rounded-xl border-2 transition-all
                    ${isSelected || isHovered ? 'bg-card shadow-xl' : 'bg-card/80 hover:bg-card'}
                  `}
                  style={{
                    borderColor: isSelected || isHovered ? layerColors[node.layer] : 'transparent',
                    boxShadow: isSelected || isHovered ? `0 0 25px ${layerColors[node.layer]}40` : undefined,
                    backgroundColor: `${layerColors[node.layer]}15`,
                  }}
                >
                  <Icon className="w-8 h-8" style={{ color: layerColors[node.layer] }} />

                  {/* Status indicator */}
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-card"
                    style={{ backgroundColor: statusColors[node.status] }}
                  />
                </div>

                {/* Node label */}
                <div className="mt-2 text-center max-w-[100px]">
                  <p className="text-xs font-medium text-foreground truncate">{node.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{node.type}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Right Side Panel - Component Details */}
      <AnimatePresence>
        {selectedNode && (
          <ComponentDetailsPanel
            node={allNodes.find(n => n.id === selectedNode)!}
            allNodes={allNodes}
            onClose={() => onNodeSelect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Component Details Panel
interface ComponentDetailsPanelProps {
  node: AppViewNode;
  allNodes: AppViewNode[];
  onClose: () => void;
}

const ComponentDetailsPanel = ({ node, allNodes, onClose }: ComponentDetailsPanelProps) => {
  const Icon = layerIcons[node.layer];
  const metrics = generateNodeMetrics(node);

  const getRelatedNodes = () => {
    const children = node.children?.map(id => allNodes.find(n => n.id === id)).filter(Boolean) || [];
    const parents = node.parents?.map(id => allNodes.find(n => n.id === id)).filter(Boolean) || [];
    return { children, parents };
  };

  const { children, parents } = getRelatedNodes();

  return (
    <motion.div
      initial={{ opacity: 0, x: 320 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 320 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-80 h-full bg-card border-l border-border overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 p-4 bg-card border-b border-border">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-xl"
          style={{ backgroundColor: `${layerColors[node.layer]}20` }}
        >
          <Icon className="w-6 h-6" style={{ color: layerColors[node.layer] }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">{node.name}</h3>
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: statusColors[node.status] }}
            />
          </div>
          <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Basic Info */}
      {(node.type === 'host' && node.os) || (node.type === 'host' && node.ip) || (node.type === 'datacenter' && node.location) ? (
        <div className="p-4 border-b border-border">
          <h4 className="text-xs font-semibold text-muted-foreground mb-3">BASIC INFO</h4>
          <div className="space-y-2">
            {node.type === 'host' && node.os && <InfoRow label="Operating System" value={node.os} />}
            {node.type === 'host' && node.ip && <InfoRow label="IP Address" value={node.ip} />}
            {node.type === 'datacenter' && node.location && <InfoRow label="Location" value={node.location} />}
            <InfoRow label="Status" value={node.status} valueColor={statusColors[node.status]} />
          </div>
        </div>
      ) : null}

      {/* Critical Metrics */}
      <div className="p-4 border-b border-border">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">CRITICAL METRICS</h4>
        <div className="grid grid-cols-2 gap-3">
          {node.type === 'application' && (
            <>
              <MetricCard
                icon={Activity}
                label="Requests"
                value={(metrics as any).requests}
                status="healthy"
              />
              <MetricCard
                icon={Clock}
                label="Response"
                value={(metrics as any).responseTime}
                status="healthy"
              />
              <MetricCard
                icon={TrendingUp}
                label="Availability"
                value={(metrics as any).availability}
                status="healthy"
              />
              <MetricCard
                icon={Users}
                label="Users"
                value={String((metrics as any).users)}
                status="healthy"
              />
            </>
          )}
          {node.type === 'service' && (
            <>
              <MetricCard
                icon={Activity}
                label="Requests"
                value={(metrics as any).requests}
                status="healthy"
              />
              <MetricCard
                icon={Clock}
                label="Response"
                value={(metrics as any).responseTime}
                status="healthy"
              />
              <MetricCard
                icon={Cpu}
                label="CPU"
                value={(metrics as any).cpu}
                status={parseInt((metrics as any).cpu) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={HardDrive}
                label="Memory"
                value={(metrics as any).memory}
                status={parseInt((metrics as any).memory) > 70 ? 'warning' : 'healthy'}
              />
            </>
          )}
          {node.type === 'process' && (
            <>
              <MetricCard
                icon={Cpu}
                label="CPU"
                value={(metrics as any).cpu}
                status={parseInt((metrics as any).cpu) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={HardDrive}
                label="Memory"
                value={(metrics as any).memory}
                status={parseInt((metrics as any).memory) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={Network}
                label="Threads"
                value={String((metrics as any).threads)}
                status="healthy"
              />
              <MetricCard
                icon={Database}
                label="Handles"
                value={String((metrics as any).handles)}
                status="healthy"
              />
            </>
          )}
          {node.type === 'host' && (
            <>
              <MetricCard
                icon={Cpu}
                label="CPU"
                value={(metrics as any).cpu}
                status={parseInt((metrics as any).cpu) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={HardDrive}
                label="Memory"
                value={(metrics as any).memory}
                status={parseInt((metrics as any).memory) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={Database}
                label="Disk"
                value={(metrics as any).disk}
                status={parseInt((metrics as any).disk) > 70 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={Network}
                label="Network"
                value={(metrics as any).network}
                status="healthy"
              />
            </>
          )}
          {node.type === 'datacenter' && (
            <>
              <MetricCard
                icon={Server}
                label="Hosts"
                value={String((metrics as any).hosts)}
                status="healthy"
              />
              <MetricCard
                icon={TrendingUp}
                label="Capacity"
                value={(metrics as any).capacity}
                status={parseInt((metrics as any).capacity) > 80 ? 'warning' : 'healthy'}
              />
              <MetricCard
                icon={Zap}
                label="Power"
                value={(metrics as any).power}
                status="healthy"
              />
              <MetricCard
                icon={Activity}
                label="Cooling"
                value={(metrics as any).cooling}
                status="healthy"
              />
            </>
          )}
        </div>

        <div className="mt-3 space-y-2">
          <InfoRow label="Uptime" value={metrics.uptime} />
          <InfoRow label="Last Seen" value={metrics.lastSeen} />
          {node.type === 'application' && (metrics as any).errors && (
            <InfoRow
              label="Error Rate"
              value={(metrics as any).errors}
              valueColor={parseFloat((metrics as any).errors) > 1 ? statusColors.critical : statusColors.healthy}
            />
          )}
          {node.type === 'service' && (metrics as any).throughput && (
            <InfoRow label="Throughput" value={(metrics as any).throughput} />
          )}
          {node.type === 'process' && (metrics as any).pid && (
            <InfoRow label="Process ID" value={String((metrics as any).pid)} />
          )}
          {node.type === 'host' && (metrics as any).processes && (
            <InfoRow label="Processes" value={String((metrics as any).processes)} />
          )}
        </div>
      </div>

      {/* Related Components */}
      {(parents.length > 0 || children.length > 0) && (
        <div className="p-4">
          {parents.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">
                PARENT COMPONENTS ({parents.length})
              </h4>
              <div className="space-y-2 mb-4">
                {parents.map((parent) => {
                  if (!parent) return null;
                  const ParentIcon = layerIcons[parent.layer];
                  return (
                    <div
                      key={parent.id}
                      className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg"
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ backgroundColor: `${layerColors[parent.layer]}20` }}
                      >
                        <ParentIcon className="w-4 h-4" style={{ color: layerColors[parent.layer] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{parent.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{parent.type}</p>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColors[parent.status] }}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {children.length > 0 && (
            <>
              <h4 className="text-xs font-semibold text-muted-foreground mb-3">
                CHILD COMPONENTS ({children.length})
              </h4>
              <div className="space-y-2">
                {children.map((child) => {
                  if (!child) return null;
                  const ChildIcon = layerIcons[child.layer];
                  return (
                    <div
                      key={child.id}
                      className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-colors"
                    >
                      <div
                        className="flex items-center justify-center w-8 h-8 rounded-lg"
                        style={{ backgroundColor: `${layerColors[child.layer]}20` }}
                      >
                        <ChildIcon className="w-4 h-4" style={{ color: layerColors[child.layer] }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{child.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{child.type}</p>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: statusColors[child.status] }}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </motion.div>
  );
};

// Helper components
const InfoRow = ({ label, value, valueColor, icon }: { label: string; value: string; valueColor?: string; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-xs font-medium flex items-center gap-1" style={{ color: valueColor || 'hsl(var(--foreground))' }}>
      {icon}
      {value}
    </span>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, status }: { icon: typeof Cpu; label: string; value: string; status: StatusType }) => (
  <div className="p-2.5 bg-secondary/30 rounded-lg">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
    <p className="text-lg font-bold" style={{ color: statusColors[status] }}>{value}</p>
  </div>
);
