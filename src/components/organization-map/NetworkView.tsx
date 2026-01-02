import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Router, 
  Server, 
  Shield, 
  Wifi,
  HardDrive,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cloud,
  Activity,
  Clock,
  Network
} from 'lucide-react';
import { NetworkDevice, Connection, StatusType, DeviceType } from '@/types/organization-map';

interface NetworkViewProps {
  devices: NetworkDevice[];
  connections: Connection[];
  selectedDevice: string | null;
  onDeviceSelect: (deviceId: string | null) => void;
}

const deviceIcons: Record<DeviceType, typeof Router> = {
  router: Router,
  switch: HardDrive,
  firewall: Shield,
  server: Server,
  wifi: Wifi,
  endpoint: Server,
};

const deviceLabels: Record<DeviceType, string> = {
  router: 'Router',
  switch: 'Switch',
  firewall: 'Firewall',
  server: 'Server',
  wifi: 'Access Point',
  endpoint: 'Endpoint',
};

const statusColors: Record<StatusType, string> = {
  healthy: 'hsl(142 76% 36%)',
  warning: 'hsl(48 96% 53%)',
  critical: 'hsl(0 84% 60%)',
  unknown: 'hsl(220 9% 46%)',
};

const deviceColors: Record<DeviceType, string> = {
  router: 'hsl(217 91% 60%)',
  switch: 'hsl(142 76% 36%)',
  firewall: 'hsl(0 84% 60%)',
  server: 'hsl(280 68% 60%)',
  wifi: 'hsl(48 96% 53%)',
  endpoint: 'hsl(220 9% 46%)',
};

export const NetworkView = ({ devices, connections, selectedDevice, onDeviceSelect }: NetworkViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPan = useRef({ x: 0, y: 0 });

  // Center the view on mount
  useEffect(() => {
    if (containerRef.current && devices.length > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Find bounds of all devices
      const positions = devices.filter(d => d.position).map(d => d.position!);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y));
      
      const contentWidth = maxX - minX + 150;
      const contentHeight = maxY - minY + 200;
      
      // Calculate zoom to fit
      const zoomX = (containerWidth - 100) / contentWidth;
      const zoomY = (containerHeight - 100) / contentHeight;
      const fitZoom = Math.min(zoomX, zoomY, 1.2);
      
      // Center content
      const centerX = (containerWidth - contentWidth * fitZoom) / 2 - minX * fitZoom + 40;
      const centerY = (containerHeight - contentHeight * fitZoom) / 2 - minY * fitZoom + 60;
      
      setZoom(fitZoom);
      setPan({ x: centerX, y: centerY });
    }
  }, [devices]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.min(Math.max(z * delta, 0.3), 3));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
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
    if (containerRef.current && devices.length > 0) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      const positions = devices.filter(d => d.position).map(d => d.position!);
      const minX = Math.min(...positions.map(p => p.x));
      const maxX = Math.max(...positions.map(p => p.x));
      const minY = Math.min(...positions.map(p => p.y));
      const maxY = Math.max(...positions.map(p => p.y));
      
      const contentWidth = maxX - minX + 150;
      const contentHeight = maxY - minY + 200;
      
      const zoomX = (containerWidth - 100) / contentWidth;
      const zoomY = (containerHeight - 100) / contentHeight;
      const fitZoom = Math.min(zoomX, zoomY, 1.2);
      
      const centerX = (containerWidth - contentWidth * fitZoom) / 2 - minX * fitZoom + 40;
      const centerY = (containerHeight - contentHeight * fitZoom) / 2 - minY * fitZoom + 60;
      
      setZoom(fitZoom);
      setPan({ x: centerX, y: centerY });
    }
  };

  const getRelatedConnections = (deviceId: string) => {
    return connections.filter(c => c.from === deviceId || c.to === deviceId);
  };

  const isConnectionHighlighted = (connection: Connection) => {
    if (!selectedDevice && !hoveredDevice) return false;
    const targetDevice = selectedDevice || hoveredDevice;
    return connection.from === targetDevice || connection.to === targetDevice;
  };

  const isDeviceRelated = (device: NetworkDevice) => {
    if (!selectedDevice && !hoveredDevice) return true;
    const targetDevice = selectedDevice || hoveredDevice;
    if (device.id === targetDevice) return true;
    return connections.some(c => 
      (c.from === targetDevice && c.to === device.id) || 
      (c.to === targetDevice && c.from === device.id)
    );
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-full overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Legend */}
      <div className="absolute top-4 left-4 z-20 p-3 bg-card/90 backdrop-blur border border-border rounded-lg">
        <p className="text-xs font-semibold text-foreground mb-2">Device Types</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(deviceIcons) as DeviceType[]).map(type => {
            const Icon = deviceIcons[type];
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div 
                  className="w-5 h-5 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${deviceColors[type]}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color: deviceColors[type] }} />
                </div>
                <span className="text-[10px] text-muted-foreground">{deviceLabels[type]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.2, 3))}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z / 1.2, 0.3))}
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
        className="absolute inset-0"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-[2000px] h-[1000px] pointer-events-none">
          <defs>
            <linearGradient id="healthyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={statusColors.healthy} stopOpacity="0.6" />
              <stop offset="100%" stopColor={statusColors.healthy} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={statusColors.warning} stopOpacity="0.6" />
              <stop offset="100%" stopColor={statusColors.warning} stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="criticalGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={statusColors.critical} stopOpacity="0.6" />
              <stop offset="100%" stopColor={statusColors.critical} stopOpacity="0.8" />
            </linearGradient>
            <filter id="connectionGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Internet cloud connection */}
          <path
            d="M 550 30 Q 550 60 550 80"
            fill="none"
            stroke="hsl(220 15% 50%)"
            strokeWidth="2"
            strokeDasharray="6 4"
            opacity="0.6"
          />

          {/* Connection lines */}
          {connections.map((connection) => {
            const fromDevice = devices.find(d => d.id === connection.from);
            const toDevice = devices.find(d => d.id === connection.to);
            if (!fromDevice?.position || !toDevice?.position) return null;

            const isHighlighted = isConnectionHighlighted(connection);
            const isHovered = hoveredConnection === connection.id;
            const color = statusColors[connection.status];
            
            const x1 = fromDevice.position.x + 45;
            const y1 = fromDevice.position.y + 40;
            const x2 = toDevice.position.x + 45;
            const y2 = toDevice.position.y + 40;
            
            // Create curved path
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const offset = Math.min(Math.abs(dx), Math.abs(dy)) * 0.2;
            
            const path = Math.abs(dy) > Math.abs(dx) 
              ? `M ${x1} ${y1} Q ${x1} ${midY}, ${midX} ${midY} Q ${x2} ${midY}, ${x2} ${y2}`
              : `M ${x1} ${y1} Q ${midX} ${y1}, ${midX} ${midY} Q ${midX} ${y2}, ${x2} ${y2}`;

            return (
              <g key={connection.id}>
                {/* Connection line */}
                <path
                  d={path}
                  fill="none"
                  stroke={isHighlighted || isHovered ? color : 'hsl(220 15% 35%)'}
                  strokeWidth={isHighlighted || isHovered ? 3 : 2}
                  opacity={(selectedDevice || hoveredDevice) && !isHighlighted ? 0.15 : 0.8}
                  filter={isHighlighted || isHovered ? 'url(#connectionGlow)' : undefined}
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onMouseEnter={(e) => {
                    setHoveredConnection(connection.id);
                    setTooltipPos({ x: e.clientX, y: e.clientY });
                  }}
                  onMouseLeave={() => setHoveredConnection(null)}
                />
                
                {/* Utilization indicator on hover */}
                {(isHighlighted || isHovered) && (
                  <g>
                    <rect
                      x={midX - 20}
                      y={midY - 10}
                      width="40"
                      height="20"
                      rx="4"
                      fill="hsl(var(--card))"
                      stroke={color}
                      strokeWidth="1"
                    />
                    <text
                      x={midX}
                      y={midY + 4}
                      fill={color}
                      fontSize="10"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {connection.utilization}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Internet cloud */}
        <div 
          className="absolute flex flex-col items-center gap-1 p-3"
          style={{ left: 505, top: -30 }}
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20">
            <Cloud className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xs font-semibold text-foreground">Internet</span>
        </div>

        {/* Device nodes */}
        {devices.map((device, index) => {
          if (!device.position) return null;
          const Icon = deviceIcons[device.deviceType];
          const isSelected = selectedDevice === device.id;
          const isHovered = hoveredDevice === device.id;
          const isRelated = isDeviceRelated(device);

          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isRelated ? 1 : 0.25, 
                scale: 1,
              }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              className={`absolute flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected || isHovered
                  ? 'bg-card shadow-xl z-10' 
                  : 'bg-card/80 hover:bg-card'
              }`}
              style={{
                left: device.position.x,
                top: device.position.y,
                borderColor: isSelected || isHovered ? statusColors[device.status] : 'transparent',
                boxShadow: isSelected || isHovered ? `0 0 25px ${statusColors[device.status]}40` : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDeviceSelect(isSelected ? null : device.id);
              }}
              onMouseEnter={(e) => {
                setHoveredDevice(device.id);
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseMove={(e) => {
                setTooltipPos({ x: e.clientX, y: e.clientY });
              }}
              onMouseLeave={() => setHoveredDevice(null)}
            >
              <div
                className="flex items-center justify-center w-12 h-12 rounded-xl"
                style={{ backgroundColor: `${deviceColors[device.deviceType]}20` }}
              >
                <Icon
                  className="w-6 h-6"
                  style={{ color: deviceColors[device.deviceType] }}
                />
              </div>
              <span className="text-[11px] font-medium text-foreground whitespace-nowrap max-w-[90px] truncate">
                {device.name}
              </span>
              <span className="text-[9px] text-muted-foreground">{device.ip}</span>
              
              {/* Status indicator */}
              <div
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-card"
                style={{ backgroundColor: statusColors[device.status] }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Device Tooltip */}
      <AnimatePresence>
        {hoveredDevice && !selectedDevice && (
          <DeviceTooltip 
            device={devices.find(d => d.id === hoveredDevice)!}
            connections={getRelatedConnections(hoveredDevice)}
            position={tooltipPos}
          />
        )}
      </AnimatePresence>

      {/* Connection Tooltip */}
      <AnimatePresence>
        {hoveredConnection && (
          <ConnectionTooltip 
            connection={connections.find(c => c.id === hoveredConnection)!}
            devices={devices}
            position={tooltipPos}
          />
        )}
      </AnimatePresence>

      {/* Selected device details panel */}
      <AnimatePresence>
        {selectedDevice && (
          <DeviceDetailsPanel 
            device={devices.find(d => d.id === selectedDevice)!}
            connections={getRelatedConnections(selectedDevice)}
            devices={devices}
            onClose={() => onDeviceSelect(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Device Tooltip
interface DeviceTooltipProps {
  device: NetworkDevice;
  connections: Connection[];
  position: { x: number; y: number };
}

const DeviceTooltip = ({ device, connections, position }: DeviceTooltipProps) => {
  const Icon = deviceIcons[device.deviceType];
  const avgUtilization = connections.length > 0 
    ? Math.round(connections.reduce((acc, c) => acc + (c.utilization || 0), 0) / connections.length)
    : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 p-4 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl min-w-[220px]"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-border">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${deviceColors[device.deviceType]}20` }}
        >
          <Icon className="w-5 h-5" style={{ color: deviceColors[device.deviceType] }} />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">{device.name}</p>
          <p className="text-xs text-muted-foreground">{deviceLabels[device.deviceType]}</p>
        </div>
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[device.status] }}
        />
      </div>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">IP Address</span>
          <span className="font-medium text-foreground">{device.ip}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vendor</span>
          <span className="font-medium text-foreground">{device.vendor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Model</span>
          <span className="font-medium text-foreground">{device.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Connections</span>
          <span className="font-medium text-foreground">{connections.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avg Utilization</span>
          <span className="font-medium text-foreground">{avgUtilization}%</span>
        </div>
      </div>
    </motion.div>
  );
};

// Connection Tooltip
interface ConnectionTooltipProps {
  connection: Connection;
  devices: NetworkDevice[];
  position: { x: number; y: number };
}

const ConnectionTooltip = ({ connection, devices, position }: ConnectionTooltipProps) => {
  const fromDevice = devices.find(d => d.id === connection.from);
  const toDevice = devices.find(d => d.id === connection.to);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed z-50 p-3 bg-card/95 backdrop-blur border border-border rounded-lg shadow-xl min-w-[180px]"
      style={{
        left: position.x + 15,
        top: position.y + 15,
        pointerEvents: 'none',
      }}
    >
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
        <Network className="w-4 h-4 text-primary" />
        <span className="font-semibold text-foreground text-sm">Link Details</span>
      </div>
      
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">From</span>
          <span className="font-medium text-foreground">{fromDevice?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">To</span>
          <span className="font-medium text-foreground">{toDevice?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Bandwidth</span>
          <span className="font-medium text-foreground">{connection.bandwidth} Mbps</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Utilization</span>
          <span className="font-medium" style={{ color: statusColors[connection.status] }}>
            {connection.utilization}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status</span>
          <div className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[connection.status] }}
            />
            <span className="font-medium capitalize text-foreground">{connection.status}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Device Details Panel
interface DeviceDetailsPanelProps {
  device: NetworkDevice;
  connections: Connection[];
  devices: NetworkDevice[];
  onClose: () => void;
}

const DeviceDetailsPanel = ({ device, connections, devices, onClose }: DeviceDetailsPanelProps) => {
  const Icon = deviceIcons[device.deviceType];
  const avgUtilization = connections.length > 0 
    ? Math.round(connections.reduce((acc, c) => acc + (c.utilization || 0), 0) / connections.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute bottom-4 left-4 right-4 p-4 bg-card/95 backdrop-blur border border-border rounded-xl shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-14 h-14 rounded-xl"
          style={{ backgroundColor: `${deviceColors[device.deviceType]}20` }}
        >
          <Icon className="w-7 h-7" style={{ color: deviceColors[device.deviceType] }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-foreground">{device.name}</h4>
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[device.status] }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {device.vendor} {device.model} • {device.ip}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{connections.length}</p>
            <p className="text-xs text-muted-foreground">Connections</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{avgUtilization}%</p>
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Close
        </button>
      </div>

      {/* Connected devices */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Connected Devices</p>
        <div className="flex flex-wrap gap-2">
          {connections.map(conn => {
            const connectedId = conn.from === device.id ? conn.to : conn.from;
            const connectedDevice = devices.find(d => d.id === connectedId);
            if (!connectedDevice) return null;
            
            const ConnIcon = deviceIcons[connectedDevice.deviceType];
            return (
              <div 
                key={conn.id}
                className="flex items-center gap-2 px-2 py-1 bg-secondary/50 rounded-lg"
              >
                <ConnIcon className="w-3 h-3" style={{ color: deviceColors[connectedDevice.deviceType] }} />
                <span className="text-xs text-foreground">{connectedDevice.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ 
                  backgroundColor: `${statusColors[conn.status]}20`,
                  color: statusColors[conn.status]
                }}>
                  {conn.utilization}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
