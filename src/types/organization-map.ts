export type ViewType = 'application' | 'network';

export type StatusType = 'healthy' | 'warning' | 'critical' | 'unknown';

export type LayerType = 'applications' | 'services' | 'processes' | 'hosts' | 'datacenters';

export type DeviceType = 'router' | 'switch' | 'firewall' | 'server' | 'wifi' | 'endpoint';

export interface ApplicationNode {
  id: string;
  name: string;
  type: 'application';
  status: StatusType;
  icon?: string;
  count?: number;
  layer: LayerType;
  children?: string[];
  parents?: string[];
}

export interface ServiceNode {
  id: string;
  name: string;
  type: 'service';
  status: StatusType;
  requestCount?: number;
  responseTime?: number;
  layer: LayerType;
  children?: string[];
  parents?: string[];
}

export interface ProcessNode {
  id: string;
  name: string;
  type: 'process';
  status: StatusType;
  cpuUsage?: number;
  memoryUsage?: number;
  layer: LayerType;
  children?: string[];
  parents?: string[];
}

export interface HostNode {
  id: string;
  name: string;
  type: 'host';
  status: StatusType;
  os?: string;
  ip?: string;
  layer: LayerType;
  children?: string[];
  parents?: string[];
}

export interface DatacenterNode {
  id: string;
  name: string;
  type: 'datacenter';
  status: StatusType;
  location?: string;
  layer: LayerType;
  children?: string[];
  parents?: string[];
}

export type AppViewNode = ApplicationNode | ServiceNode | ProcessNode | HostNode | DatacenterNode;

export interface NetworkDevice {
  id: string;
  name: string;
  deviceType: DeviceType;
  status: StatusType;
  ip?: string;
  vendor?: string;
  model?: string;
  interfaces?: NetworkInterface[];
  position?: { x: number; y: number };
  connections?: string[];
}

export interface NetworkInterface {
  name: string;
  utilization: number;
  status: StatusType;
  speed?: string;
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  bandwidth?: number;
  utilization?: number;
  status: StatusType;
}

export interface LayerData {
  type: LayerType;
  label: string;
  count: number;
  nodes: AppViewNode[];
}
