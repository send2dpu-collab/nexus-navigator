import { motion } from 'framer-motion';
import { 
  Router, 
  Server, 
  Shield, 
  Wifi,
  HardDrive,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Cloud
} from 'lucide-react';
import { NetworkDevice, Connection, StatusType, DeviceType } from '@/types/organization-map';
import { useState, useRef } from 'react';

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

const statusColors: Record<StatusType, string> = {
  healthy: '#22c55e',
  warning: '#eab308',
  critical: '#ef4444',
  unknown: '#6b7280',
};

const deviceColors: Record<DeviceType, string> = {
  router: '#3b82f6',
  switch: '#22c55e',
  firewall: '#ef4444',
  server: '#a855f7',
  wifi: '#eab308',
  endpoint: '#6b7280',
};

export const NetworkView = ({ devices, connections, selectedDevice, onDeviceSelect }: NetworkViewProps) => {
  const [zoom, setZoom] = useState(0.85);
  const [pan, setPan] = useState({ x: 50, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getRelatedConnections = (deviceId: string) => {
    return connections.filter(c => c.from === deviceId || c.to === deviceId);
  };

  const isConnectionHighlighted = (connection: Connection) => {
    if (!selectedDevice) return false;
    return connection.from === selectedDevice || connection.to === selectedDevice;
  };

  // Internet cloud position
  const internetPosition = { x: 500, y: -40 };

  return (
    <div className="relative flex-1 overflow-hidden bg-secondary/20 rounded-lg border border-border">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ZoomIn className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
        >
          <ZoomOut className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={() => { setZoom(0.85); setPan({ x: 50, y: 80 }); }}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
        >
          <Maximize2 className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          {/* Internet to core router connection */}
          <line
            x1={internetPosition.x + 25}
            y1={internetPosition.y + 50}
            x2={505 + 25}
            y2={30 + 25}
            stroke="hsl(220 15% 40%)"
            strokeWidth={2}
            strokeDasharray="8 4"
            opacity={0.6}
          />

          {/* Connection lines */}
          <g>
            {connections.map((connection) => {
              const fromDevice = devices.find(d => d.id === connection.from);
              const toDevice = devices.find(d => d.id === connection.to);
              if (!fromDevice?.position || !toDevice?.position) return null;

              const isHighlighted = isConnectionHighlighted(connection);
              const color = statusColors[connection.status];

              return (
                <g key={connection.id}>
                  <line
                    x1={fromDevice.position.x + 25}
                    y1={fromDevice.position.y + 25}
                    x2={toDevice.position.x + 25}
                    y2={toDevice.position.y + 25}
                    stroke={isHighlighted ? color : 'hsl(220 15% 30%)'}
                    strokeWidth={isHighlighted ? 3 : 2}
                    opacity={selectedDevice && !isHighlighted ? 0.2 : 1}
                    className={isHighlighted ? 'animate-flow' : ''}
                  />
                  {/* Utilization label */}
                  {isHighlighted && (
                    <text
                      x={(fromDevice.position.x + toDevice.position.x) / 2 + 25}
                      y={(fromDevice.position.y + toDevice.position.y) / 2 + 20}
                      fill={color}
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {connection.utilization}%
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Internet cloud node */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute flex flex-col items-center gap-1 p-2"
          style={{
            left: internetPosition.x * zoom + pan.x,
            top: internetPosition.y * zoom + pan.y,
          }}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 border-2 border-primary">
            <Cloud className="w-6 h-6 text-primary" />
          </div>
          <span className="text-xs font-medium text-foreground">Internet</span>
        </motion.div>

        {/* Device nodes */}
        {devices.map((device, index) => {
          if (!device.position) return null;
          const Icon = deviceIcons[device.deviceType];
          const isSelected = selectedDevice === device.id;
          const isRelated = selectedDevice
            ? getRelatedConnections(selectedDevice).some(
                c => c.from === device.id || c.to === device.id
              ) || device.id === selectedDevice
            : true;

          return (
            <motion.button
              key={device.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isRelated ? 1 : 0.3, 
                scale: 1,
              }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              onClick={() => onDeviceSelect(isSelected ? null : device.id)}
              className={`absolute flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'bg-card border-primary shadow-glow z-10' 
                  : 'bg-card border-transparent hover:border-border'
              }`}
              style={{
                left: device.position.x * zoom + pan.x,
                top: device.position.y * zoom + pan.y,
                borderColor: isSelected ? statusColors[device.status] : undefined,
                boxShadow: isSelected ? `0 0 20px ${statusColors[device.status]}40` : undefined,
              }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{ backgroundColor: `${deviceColors[device.deviceType]}30` }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: deviceColors[device.deviceType] }}
                />
              </div>
              <span className="text-[10px] font-medium text-foreground whitespace-nowrap max-w-[80px] truncate">
                {device.name}
              </span>
              <span
                className="w-2 h-2 rounded-full absolute -top-1 -right-1"
                style={{ backgroundColor: statusColors[device.status] }}
              />
            </motion.button>
          );
        })}
      </div>

      {/* Selected device details */}
      {selectedDevice && (
        <DeviceDetails 
          device={devices.find(d => d.id === selectedDevice)!} 
          connections={getRelatedConnections(selectedDevice)}
        />
      )}
    </div>
  );
};

interface DeviceDetailsProps {
  device: NetworkDevice;
  connections: Connection[];
}

const DeviceDetails = ({ device, connections }: DeviceDetailsProps) => {
  const Icon = deviceIcons[device.deviceType];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-4 left-4 right-4 p-4 bg-card/95 backdrop-blur border border-border rounded-lg shadow-card"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex items-center justify-center w-12 h-12 rounded-lg"
          style={{ backgroundColor: `${deviceColors[device.deviceType]}30` }}
        >
          <Icon className="w-6 h-6" style={{ color: deviceColors[device.deviceType] }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-foreground">{device.name}</h4>
            <span
              className="w-2.5 h-2.5 rounded-full"
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
            <p className="text-2xl font-bold text-foreground">
              {Math.round(connections.reduce((acc, c) => acc + (c.utilization || 0), 0) / connections.length || 0)}%
            </p>
            <p className="text-xs text-muted-foreground">Avg Utilization</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
