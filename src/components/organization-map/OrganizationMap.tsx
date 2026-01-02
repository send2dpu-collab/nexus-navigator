import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ViewToggle } from './ViewToggle';
import { SearchBar } from './SearchBar';
import { StatusLegend } from './StatusLegend';
import { ApplicationView } from './ApplicationView';
import { NetworkView } from './NetworkView';
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

  const layers = useMemo(() => getLayerData(), []);
  const statusCounts = useMemo(() => getStatusCounts(), []);
  
  const entityCount = activeView === 'application' 
    ? applicationNodes.length 
    : networkDevices.length;

  const filteredApps = useMemo(() => {
    const apps = applicationNodes.filter(n => n.layer === 'applications');
    if (!searchQuery) return apps;
    return apps.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredLayers = useMemo(() => {
    if (!searchQuery) return layers;
    return layers.map(layer => ({
      ...layer,
      nodes: layer.nodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      count: layer.nodes.filter(node => 
        node.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length,
    }));
  }, [layers, searchQuery]);

  const filteredDevices = useMemo(() => {
    if (!searchQuery) return networkDevices;
    return networkDevices.filter(device => 
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.ip?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
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
            />
          </div>
        </header>

        {/* Content */}
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
              />
            ) : (
              <NetworkView 
                devices={filteredDevices}
                connections={networkConnections}
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
