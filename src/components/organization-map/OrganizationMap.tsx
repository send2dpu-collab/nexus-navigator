import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ViewToggle } from './ViewToggle';
import { SearchBar } from './SearchBar';
import { StatusLegend } from './StatusLegend';
import { ApplicationView } from './ApplicationView';
import { NetworkView } from './NetworkView';
import { FilterState } from './FilterDialog';
import { ViewType } from '@/types/organization-map';
import {
  applicationNodes,
  networkDevices,
  networkConnections,
  getLayerData,
  getStatusCounts
} from '@/data/mock-data';

export const OrganizationMap = () => {
  const [activeView, setActiveView] = useState<ViewType>('application');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const [appFilters, setAppFilters] = useState<FilterState>({
    statuses: ['healthy', 'warning', 'critical', 'unknown'],
    layers: ['applications', 'services', 'processes', 'hosts', 'datacenters'],
  });

  const [networkFilters, setNetworkFilters] = useState<FilterState>({
    statuses: ['healthy', 'warning', 'critical', 'unknown'],
    deviceTypes: ['router', 'switch', 'firewall', 'server', 'wifi', 'endpoint'],
  });

  const layers = useMemo(() => getLayerData(), []);
  const statusCounts = useMemo(() => getStatusCounts(), []);

  const filteredApps = useMemo(() => {
    const apps = applicationNodes.filter(n => n.layer === 'applications');
    return apps.filter(app => {
      const matchesSearch = !searchQuery || app.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = appFilters.statuses.includes(app.status);
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, appFilters]);

  const filteredLayers = useMemo(() => {
    return layers.map(layer => ({
      ...layer,
      nodes: layer.nodes.filter(node => {
        const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = appFilters.statuses.includes(node.status);
        const matchesLayer = !appFilters.layers || appFilters.layers.includes(node.layer);
        return matchesSearch && matchesStatus && matchesLayer;
      }),
      count: layer.nodes.filter(node => {
        const matchesSearch = !searchQuery || node.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = appFilters.statuses.includes(node.status);
        const matchesLayer = !appFilters.layers || appFilters.layers.includes(node.layer);
        return matchesSearch && matchesStatus && matchesLayer;
      }).length,
    })).filter(layer => layer.nodes.length > 0);
  }, [layers, searchQuery, appFilters]);

  const filteredDevices = useMemo(() => {
    return networkDevices.filter(device => {
      const matchesSearch = !searchQuery ||
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.ip?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = networkFilters.statuses.includes(device.status);
      const matchesType = !networkFilters.deviceTypes || networkFilters.deviceTypes.includes(device.deviceType);
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, networkFilters]);

  const filteredConnections = useMemo(() => {
    const deviceIds = new Set(filteredDevices.map(d => d.id));
    return networkConnections.filter(conn =>
      deviceIds.has(conn.from) && deviceIds.has(conn.to)
    );
  }, [filteredDevices]);

  const entityCount = activeView === 'application'
    ? (selectedApp ? filteredLayers.reduce((acc, layer) => acc + layer.count, 0) : filteredApps.length)
    : filteredDevices.length;

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Organization Map</h1>
              <p className="text-sm text-muted-foreground">
                Visualize your infrastructure topology
              </p>
            </div>
            <ViewToggle activeView={activeView} onViewChange={(view) => {
              setActiveView(view);
              setSelectedApp(null);
              setSelectedDevice(null);
            }} />
          </div>

          <div className="flex items-center gap-6">
            <StatusLegend counts={statusCounts} />
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              entityCount={entityCount}
              viewMode={activeView}
              filters={activeView === 'application' ? appFilters : networkFilters}
              onFiltersChange={activeView === 'application' ? setAppFilters : setNetworkFilters}
            />
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <motion.div
            key={`${activeView}-${selectedApp}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeView === 'application' ? (
              <ApplicationView
                apps={filteredApps}
                layers={filteredLayers}
                allNodes={applicationNodes}
                selectedApp={selectedApp}
                onAppSelect={setSelectedApp}
                searchQuery={searchQuery}
                filters={appFilters}
              />
            ) : (
              <NetworkView
                devices={filteredDevices}
                connections={filteredConnections}
                selectedDevice={selectedDevice}
                onDeviceSelect={setSelectedDevice}
              />
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};
