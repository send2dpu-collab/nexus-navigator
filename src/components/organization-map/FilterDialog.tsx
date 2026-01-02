import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { StatusType, DeviceType, LayerType } from '@/types/organization-map';

export interface FilterState {
  statuses: StatusType[];
  deviceTypes?: DeviceType[];
  layers?: LayerType[];
}

interface FilterDialogProps {
  currentFilters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  mode: 'application' | 'network';
  entityCount: number;
}

const statusOptions: { value: StatusType; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: 'hsl(142 76% 36%)' },
  { value: 'warning', label: 'Warning', color: 'hsl(48 96% 53%)' },
  { value: 'critical', label: 'Critical', color: 'hsl(0 84% 60%)' },
  { value: 'unknown', label: 'Unknown', color: 'hsl(220 9% 46%)' },
];

const deviceTypeOptions: { value: DeviceType; label: string }[] = [
  { value: 'router', label: 'Router' },
  { value: 'switch', label: 'Switch' },
  { value: 'firewall', label: 'Firewall' },
  { value: 'server', label: 'Server' },
  { value: 'wifi', label: 'WiFi / Access Point' },
  { value: 'endpoint', label: 'Endpoint' },
];

const layerOptions: { value: LayerType; label: string }[] = [
  { value: 'applications', label: 'Applications' },
  { value: 'services', label: 'Services' },
  { value: 'processes', label: 'Processes' },
  { value: 'hosts', label: 'Hosts' },
  { value: 'datacenters', label: 'Datacenters' },
];

export const FilterDialog = ({ currentFilters, onFiltersChange, mode, entityCount }: FilterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);

  const handleStatusToggle = (status: StatusType) => {
    const newStatuses = localFilters.statuses.includes(status)
      ? localFilters.statuses.filter(s => s !== status)
      : [...localFilters.statuses, status];
    setLocalFilters({ ...localFilters, statuses: newStatuses });
  };

  const handleDeviceTypeToggle = (deviceType: DeviceType) => {
    const currentTypes = localFilters.deviceTypes || [];
    const newTypes = currentTypes.includes(deviceType)
      ? currentTypes.filter(t => t !== deviceType)
      : [...currentTypes, deviceType];
    setLocalFilters({ ...localFilters, deviceTypes: newTypes });
  };

  const handleLayerToggle = (layer: LayerType) => {
    const currentLayers = localFilters.layers || [];
    const newLayers = currentLayers.includes(layer)
      ? currentLayers.filter(l => l !== layer)
      : [...currentLayers, layer];
    setLocalFilters({ ...localFilters, layers: newLayers });
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setOpen(false);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      statuses: ['healthy', 'warning', 'critical', 'unknown'],
      deviceTypes: mode === 'network' ? ['router', 'switch', 'firewall', 'server', 'wifi', 'endpoint'] : undefined,
      layers: mode === 'application' ? ['applications', 'services', 'processes', 'hosts', 'datacenters'] : undefined,
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const activeFilterCount =
    (4 - localFilters.statuses.length) +
    (mode === 'network' && localFilters.deviceTypes ? (6 - localFilters.deviceTypes.length) : 0) +
    (mode === 'application' && localFilters.layers ? (5 - localFilters.layers.length) : 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/50 border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-semibold bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filter {mode === 'application' ? 'Applications' : 'Network Devices'}</DialogTitle>
          <DialogDescription>
            Customize what you see on the map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Status</h4>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={localFilters.statuses.includes(option.value)}
                    onCheckedChange={() => handleStatusToggle(option.value)}
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {mode === 'network' && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Device Type</h4>
                <div className="space-y-2">
                  {deviceTypeOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`device-${option.value}`}
                        checked={localFilters.deviceTypes?.includes(option.value) ?? true}
                        onCheckedChange={() => handleDeviceTypeToggle(option.value)}
                      />
                      <Label
                        htmlFor={`device-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'application' && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3">Layers</h4>
                <div className="space-y-2">
                  {layerOptions.map(option => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`layer-${option.value}`}
                        checked={localFilters.layers?.includes(option.value) ?? true}
                        onCheckedChange={() => handleLayerToggle(option.value)}
                      />
                      <Label
                        htmlFor={`layer-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button variant="outline" onClick={handleReset} size="sm">
            Reset All
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} size="sm">
              Cancel
            </Button>
            <Button onClick={handleApply} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
