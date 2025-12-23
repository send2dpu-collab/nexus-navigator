import { motion } from 'framer-motion';
import { 
  Globe, 
  Cog, 
  Cpu, 
  Server, 
  Building2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { LayerData, AppViewNode, StatusType } from '@/types/organization-map';

interface ApplicationViewProps {
  layers: LayerData[];
  selectedNode: string | null;
  onNodeSelect: (nodeId: string | null) => void;
}

const layerIcons = {
  applications: Globe,
  services: Cog,
  processes: Cpu,
  hosts: Server,
  datacenters: Building2,
};

const layerColors = {
  applications: 'layer-application',
  services: 'layer-service',
  processes: 'layer-process',
  hosts: 'layer-host',
  datacenters: 'layer-datacenter',
};

const statusColors: Record<StatusType, string> = {
  healthy: 'border-status-healthy',
  warning: 'border-status-warning',
  critical: 'border-status-critical',
  unknown: 'border-status-unknown',
};

const statusBgColors: Record<StatusType, string> = {
  healthy: 'bg-status-healthy/20',
  warning: 'bg-status-warning/20',
  critical: 'bg-status-critical/20',
  unknown: 'bg-status-unknown/20',
};

export const ApplicationView = ({ layers, selectedNode, onNodeSelect }: ApplicationViewProps) => {
  const getNodeRelations = (nodeId: string) => {
    const allNodes = layers.flatMap(l => l.nodes);
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return { parents: [], children: [], relatedIds: new Set<string>() };
    
    const relatedIds = new Set<string>([nodeId]);
    
    // Get all parents recursively
    const addParents = (ids: string[] | undefined) => {
      if (!ids) return;
      ids.forEach(id => {
        relatedIds.add(id);
        const parent = allNodes.find(n => n.id === id);
        if (parent && 'parents' in parent) {
          addParents(parent.parents);
        }
      });
    };
    
    // Get all children recursively
    const addChildren = (ids: string[] | undefined) => {
      if (!ids) return;
      ids.forEach(id => {
        relatedIds.add(id);
        const child = allNodes.find(n => n.id === id);
        if (child && 'children' in child) {
          addChildren(child.children);
        }
      });
    };
    
    if ('parents' in node) addParents(node.parents);
    if ('children' in node) addChildren(node.children);
    
    return { relatedIds };
  };

  const relations = selectedNode ? getNodeRelations(selectedNode) : null;

  const isNodeHighlighted = (nodeId: string) => {
    if (!selectedNode) return true;
    return relations?.relatedIds.has(nodeId) ?? false;
  };

  return (
    <div className="flex flex-col gap-0 h-full overflow-auto">
      {layers.map((layer, layerIndex) => {
        const Icon = layerIcons[layer.type];
        
        return (
          <motion.div
            key={layer.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: layerIndex * 0.1 }}
            className="relative"
          >
            {/* Layer header */}
            <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-4 bg-background/95 backdrop-blur border-b border-border">
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${layerColors[layer.type]}/20`}>
                <Icon className={`w-5 h-5 text-${layerColors[layer.type]}`} />
              </div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">{layer.label}</h3>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-2xl font-bold text-foreground">{layer.count}</span>
              </div>
            </div>
            
            {/* Layer content */}
            <div className="px-6 py-6 min-h-[140px] bg-gradient-to-b from-secondary/30 to-transparent">
              <div className="flex flex-wrap items-start gap-4 pl-20">
                {layer.nodes.map((node, nodeIndex) => (
                  <NodeBubble
                    key={node.id}
                    node={node}
                    isSelected={selectedNode === node.id}
                    isHighlighted={isNodeHighlighted(node.id)}
                    onSelect={() => onNodeSelect(selectedNode === node.id ? null : node.id)}
                    delay={nodeIndex * 0.03}
                  />
                ))}
              </div>
            </div>
            
            {/* Connection lines indicator */}
            {layerIndex < layers.length - 1 && (
              <div className="absolute left-1/2 -bottom-3 w-px h-6 bg-border" />
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

interface NodeBubbleProps {
  node: AppViewNode;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
  delay: number;
}

const NodeBubble = ({ node, isSelected, isHighlighted, onSelect, delay }: NodeBubbleProps) => {
  const Icon = layerIcons[node.layer];
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isHighlighted ? 1 : 0.3, 
        scale: isSelected ? 1.05 : 1 
      }}
      transition={{ delay, duration: 0.2 }}
      onClick={onSelect}
      className={`group relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
        statusColors[node.status]
      } ${
        isSelected 
          ? `${statusBgColors[node.status]} shadow-glow ring-2 ring-primary/50` 
          : 'bg-card hover:bg-secondary/50'
      }`}
    >
      <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${statusColors[node.status]} ${statusBgColors[node.status]}`}>
        <Icon className="w-6 h-6 text-foreground" />
      </div>
      
      <div className="text-center min-w-[80px] max-w-[120px]">
        <p className="text-xs font-medium text-foreground truncate">{node.name}</p>
        {'requestCount' in node && node.requestCount && (
          <p className="text-[10px] text-muted-foreground">{node.requestCount} req/s</p>
        )}
        {'cpuUsage' in node && node.cpuUsage && (
          <p className="text-[10px] text-muted-foreground">CPU: {node.cpuUsage}%</p>
        )}
        {'ip' in node && node.ip && (
          <p className="text-[10px] text-muted-foreground">{node.ip}</p>
        )}
        {'location' in node && node.location && (
          <p className="text-[10px] text-muted-foreground">{node.location}</p>
        )}
      </div>
      
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded bg-primary text-primary-foreground text-xs whitespace-nowrap"
        >
          <span>View Details</span>
          <ExternalLink className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );
};
