import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FilterDialog, FilterState } from './FilterDialog';
import { ViewType } from '@/types/organization-map';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  entityCount: number;
  viewMode: ViewType;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export const SearchBar = ({ value, onChange, entityCount, viewMode, filters, onFiltersChange }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search entities..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-64 pl-10 bg-secondary/50 border-border focus:border-primary"
        />
      </div>

      <FilterDialog
        currentFilters={filters}
        onFiltersChange={onFiltersChange}
        mode={viewMode}
        entityCount={entityCount}
      />

      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary/30 border border-border/50">
        <span className="text-xs text-muted-foreground">Entities:</span>
        <span className="text-sm font-semibold text-foreground">{entityCount}</span>
      </div>
    </div>
  );
};
