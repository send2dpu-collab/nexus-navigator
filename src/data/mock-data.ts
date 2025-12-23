import { AppViewNode, NetworkDevice, Connection, LayerData } from '@/types/organization-map';

export const applicationNodes: AppViewNode[] = [
  // Applications
  { id: 'app-1', name: 'Customer Portal', type: 'application', status: 'healthy', layer: 'applications', children: ['svc-1', 'svc-2'] },
  { id: 'app-2', name: 'easyTravel Frontend', type: 'application', status: 'warning', layer: 'applications', children: ['svc-3', 'svc-4', 'svc-5'] },
  { id: 'app-3', name: 'Payment Gateway', type: 'application', status: 'healthy', layer: 'applications', children: ['svc-6'] },
  { id: 'app-4', name: 'Inventory API', type: 'application', status: 'critical', layer: 'applications', children: ['svc-7', 'svc-8'] },
  
  // Services
  { id: 'svc-1', name: 'Auth Service', type: 'service', status: 'healthy', layer: 'services', parents: ['app-1'], children: ['proc-1'] },
  { id: 'svc-2', name: 'User Profile API', type: 'service', status: 'healthy', layer: 'services', parents: ['app-1'], children: ['proc-2'] },
  { id: 'svc-3', name: 'Booking Engine', type: 'service', status: 'warning', layer: 'services', parents: ['app-2'], children: ['proc-3', 'proc-4'] },
  { id: 'svc-4', name: 'Search Service', type: 'service', status: 'healthy', layer: 'services', parents: ['app-2'], children: ['proc-5'] },
  { id: 'svc-5', name: 'Recommendation API', type: 'service', status: 'healthy', layer: 'services', parents: ['app-2'], children: ['proc-6'] },
  { id: 'svc-6', name: 'Transaction Processor', type: 'service', status: 'healthy', layer: 'services', parents: ['app-3'], children: ['proc-7'] },
  { id: 'svc-7', name: 'Stock Manager', type: 'service', status: 'critical', layer: 'services', parents: ['app-4'], children: ['proc-8'] },
  { id: 'svc-8', name: 'Warehouse API', type: 'service', status: 'warning', layer: 'services', parents: ['app-4'], children: ['proc-9'] },
  
  // Processes
  { id: 'proc-1', name: 'auth-worker-01', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-1'], children: ['host-1'] },
  { id: 'proc-2', name: 'profile-svc-01', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-2'], children: ['host-1'] },
  { id: 'proc-3', name: 'booking-engine-01', type: 'process', status: 'warning', layer: 'processes', parents: ['svc-3'], children: ['host-2'] },
  { id: 'proc-4', name: 'booking-engine-02', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-3'], children: ['host-2'] },
  { id: 'proc-5', name: 'search-worker-01', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-4'], children: ['host-3'] },
  { id: 'proc-6', name: 'recommend-ml-01', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-5'], children: ['host-3'] },
  { id: 'proc-7', name: 'txn-processor-01', type: 'process', status: 'healthy', layer: 'processes', parents: ['svc-6'], children: ['host-4'] },
  { id: 'proc-8', name: 'stock-mgr-01', type: 'process', status: 'critical', layer: 'processes', parents: ['svc-7'], children: ['host-5'] },
  { id: 'proc-9', name: 'warehouse-api-01', type: 'process', status: 'warning', layer: 'processes', parents: ['svc-8'], children: ['host-5'] },
  
  // Hosts
  { id: 'host-1', name: 'prod-web-01', type: 'host', status: 'healthy', os: 'Ubuntu 22.04', ip: '10.0.1.10', layer: 'hosts', parents: ['proc-1', 'proc-2'], children: ['dc-1'] },
  { id: 'host-2', name: 'prod-app-01', type: 'host', status: 'warning', os: 'RHEL 8', ip: '10.0.1.20', layer: 'hosts', parents: ['proc-3', 'proc-4'], children: ['dc-1'] },
  { id: 'host-3', name: 'prod-search-01', type: 'host', status: 'healthy', os: 'Ubuntu 22.04', ip: '10.0.1.30', layer: 'hosts', parents: ['proc-5', 'proc-6'], children: ['dc-1'] },
  { id: 'host-4', name: 'prod-payment-01', type: 'host', status: 'healthy', os: 'Windows Server 2022', ip: '10.0.2.10', layer: 'hosts', parents: ['proc-7'], children: ['dc-2'] },
  { id: 'host-5', name: 'prod-inventory-01', type: 'host', status: 'critical', os: 'RHEL 8', ip: '10.0.2.20', layer: 'hosts', parents: ['proc-8', 'proc-9'], children: ['dc-2'] },
  
  // Datacenters
  { id: 'dc-1', name: 'US-East-1', type: 'datacenter', status: 'healthy', location: 'Virginia, USA', layer: 'datacenters', parents: ['host-1', 'host-2', 'host-3'] },
  { id: 'dc-2', name: 'US-West-2', type: 'datacenter', status: 'warning', location: 'Oregon, USA', layer: 'datacenters', parents: ['host-4', 'host-5'] },
];

export const networkDevices: NetworkDevice[] = [
  // Core Layer - Internet/WAN
  { id: 'net-1', name: 'core-rtr-01', deviceType: 'router', status: 'healthy', vendor: 'Cisco', model: 'ASR 9000', ip: '10.0.0.1', position: { x: 500, y: 30 }, connections: ['net-2', 'net-3'] },
  
  // Distribution Layer
  { id: 'net-2', name: 'dist-sw-01', deviceType: 'switch', status: 'healthy', vendor: 'Cisco', model: 'Nexus 9000', ip: '10.0.0.10', position: { x: 300, y: 120 }, connections: ['net-4', 'net-5', 'net-6'] },
  { id: 'net-3', name: 'dist-sw-02', deviceType: 'switch', status: 'warning', vendor: 'Cisco', model: 'Nexus 9000', ip: '10.0.0.11', position: { x: 700, y: 120 }, connections: ['net-7', 'net-8', 'net-9'] },
  
  // Firewall
  { id: 'net-4', name: 'fw-palo-01', deviceType: 'firewall', status: 'healthy', vendor: 'Palo Alto', model: 'PA-5200', ip: '10.0.0.100', position: { x: 120, y: 210 }, connections: ['net-10'] },
  
  // Access Layer
  { id: 'net-5', name: 'access-sw-01', deviceType: 'switch', status: 'healthy', vendor: 'Aruba', model: 'CX 6300', ip: '10.0.1.1', position: { x: 260, y: 210 }, connections: ['net-11', 'net-12'] },
  { id: 'net-6', name: 'access-sw-02', deviceType: 'switch', status: 'healthy', vendor: 'Aruba', model: 'CX 6300', ip: '10.0.1.2', position: { x: 400, y: 210 }, connections: ['net-13', 'net-14'] },
  { id: 'net-7', name: 'access-sw-03', deviceType: 'switch', status: 'critical', vendor: 'Cisco', model: 'Catalyst 9300', ip: '10.0.2.1', position: { x: 600, y: 210 }, connections: ['net-15', 'net-16'] },
  { id: 'net-8', name: 'access-sw-04', deviceType: 'switch', status: 'healthy', vendor: 'Cisco', model: 'Catalyst 9300', ip: '10.0.2.2', position: { x: 780, y: 210 }, connections: ['net-17'] },
  { id: 'net-9', name: 'wifi-ctrl-01', deviceType: 'wifi', status: 'healthy', vendor: 'Aruba', model: '7200 Series', ip: '10.0.3.1', position: { x: 920, y: 210 }, connections: ['net-18', 'net-19'] },
  
  // Servers and Endpoints
  { id: 'net-10', name: 'dmz-web-01', deviceType: 'server', status: 'healthy', vendor: 'Dell', model: 'PowerEdge R750', ip: '192.168.1.10', position: { x: 60, y: 320 } },
  { id: 'net-11', name: 'prod-db-01', deviceType: 'server', status: 'healthy', vendor: 'HPE', model: 'ProLiant DL380', ip: '10.0.1.100', position: { x: 200, y: 320 } },
  { id: 'net-12', name: 'prod-db-02', deviceType: 'server', status: 'warning', vendor: 'HPE', model: 'ProLiant DL380', ip: '10.0.1.101', position: { x: 320, y: 320 } },
  { id: 'net-13', name: 'prod-app-01', deviceType: 'server', status: 'healthy', vendor: 'Dell', model: 'PowerEdge R640', ip: '10.0.1.110', position: { x: 360, y: 320 } },
  { id: 'net-14', name: 'prod-app-02', deviceType: 'server', status: 'healthy', vendor: 'Dell', model: 'PowerEdge R640', ip: '10.0.1.111', position: { x: 460, y: 320 } },
  { id: 'net-15', name: 'prod-web-01', deviceType: 'server', status: 'critical', vendor: 'Dell', model: 'PowerEdge R750', ip: '10.0.2.100', position: { x: 540, y: 320 } },
  { id: 'net-16', name: 'prod-web-02', deviceType: 'server', status: 'healthy', vendor: 'Dell', model: 'PowerEdge R750', ip: '10.0.2.101', position: { x: 660, y: 320 } },
  { id: 'net-17', name: 'backup-srv-01', deviceType: 'server', status: 'healthy', vendor: 'HPE', model: 'ProLiant ML350', ip: '10.0.2.200', position: { x: 780, y: 320 } },
  
  // WiFi APs
  { id: 'net-18', name: 'ap-floor1-01', deviceType: 'wifi', status: 'healthy', vendor: 'Aruba', model: 'AP-535', ip: '10.0.3.10', position: { x: 880, y: 320 } },
  { id: 'net-19', name: 'ap-floor2-01', deviceType: 'wifi', status: 'healthy', vendor: 'Aruba', model: 'AP-535', ip: '10.0.3.11', position: { x: 980, y: 320 } },
];

export const networkConnections: Connection[] = [
  { id: 'conn-1', from: 'net-1', to: 'net-2', bandwidth: 10000, utilization: 45, status: 'healthy' },
  { id: 'conn-2', from: 'net-1', to: 'net-3', bandwidth: 10000, utilization: 62, status: 'warning' },
  { id: 'conn-3', from: 'net-2', to: 'net-4', bandwidth: 1000, utilization: 30, status: 'healthy' },
  { id: 'conn-4', from: 'net-2', to: 'net-5', bandwidth: 1000, utilization: 55, status: 'healthy' },
  { id: 'conn-5', from: 'net-2', to: 'net-6', bandwidth: 1000, utilization: 40, status: 'healthy' },
  { id: 'conn-6', from: 'net-3', to: 'net-7', bandwidth: 1000, utilization: 85, status: 'critical' },
  { id: 'conn-7', from: 'net-3', to: 'net-8', bandwidth: 1000, utilization: 35, status: 'healthy' },
  { id: 'conn-8', from: 'net-3', to: 'net-9', bandwidth: 1000, utilization: 25, status: 'healthy' },
  { id: 'conn-9', from: 'net-4', to: 'net-10', bandwidth: 1000, utilization: 20, status: 'healthy' },
  { id: 'conn-10', from: 'net-5', to: 'net-11', bandwidth: 1000, utilization: 50, status: 'healthy' },
  { id: 'conn-11', from: 'net-5', to: 'net-12', bandwidth: 1000, utilization: 70, status: 'warning' },
  { id: 'conn-12', from: 'net-6', to: 'net-13', bandwidth: 1000, utilization: 45, status: 'healthy' },
  { id: 'conn-13', from: 'net-6', to: 'net-14', bandwidth: 1000, utilization: 42, status: 'healthy' },
  { id: 'conn-14', from: 'net-7', to: 'net-15', bandwidth: 1000, utilization: 90, status: 'critical' },
  { id: 'conn-15', from: 'net-7', to: 'net-16', bandwidth: 1000, utilization: 38, status: 'healthy' },
  { id: 'conn-16', from: 'net-8', to: 'net-17', bandwidth: 1000, utilization: 25, status: 'healthy' },
  { id: 'conn-17', from: 'net-9', to: 'net-18', bandwidth: 1000, utilization: 15, status: 'healthy' },
  { id: 'conn-18', from: 'net-9', to: 'net-19', bandwidth: 1000, utilization: 18, status: 'healthy' },
];

export const getLayerData = (): LayerData[] => {
  const layers: LayerData[] = [
    { type: 'applications', label: 'Applications', count: 0, nodes: [] },
    { type: 'services', label: 'Services', count: 0, nodes: [] },
    { type: 'processes', label: 'Processes', count: 0, nodes: [] },
    { type: 'hosts', label: 'Hosts', count: 0, nodes: [] },
    { type: 'datacenters', label: 'Datacenters', count: 0, nodes: [] },
  ];

  applicationNodes.forEach(node => {
    const layer = layers.find(l => l.type === node.layer);
    if (layer) {
      layer.nodes.push(node);
      layer.count++;
    }
  });

  return layers;
};

export const getStatusCounts = () => {
  const counts = { healthy: 0, warning: 0, critical: 0, unknown: 0 };
  
  [...applicationNodes, ...networkDevices].forEach(item => {
    counts[item.status]++;
  });
  
  return counts;
};
