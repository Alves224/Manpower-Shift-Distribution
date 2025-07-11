
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Save } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';

interface SearchFilters {
  searchTerm: string;
  role: string;
  gradeCode: string;
  minAge: string;
  maxAge: string;
  weapons: string[];
}

interface AdvancedSearchProps {
  employees: EmployeeProfile[];
  onFilteredResults: (results: EmployeeProfile[]) => void;
  onClearFilters: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  employees,
  onFilteredResults,
  onClearFilters
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    role: '',
    gradeCode: '',
    minAge: '',
    maxAge: '',
    weapons: []
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get unique values for filter options
  const uniqueRoles = useMemo(() => 
    [...new Set(employees.map(emp => emp.role))].sort(), [employees]
  );
  
  const uniqueGrades = useMemo(() => 
    [...new Set(employees.map(emp => emp.gradeCode))].sort(), [employees]
  );
  
  const uniqueWeapons = useMemo(() => 
    [...new Set(employees.flatMap(emp => emp.weapons || []))].sort(), [employees]
  );

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          employee.name.toLowerCase().includes(searchLower) ||
          employee.badge.toLowerCase().includes(searchLower) ||
          employee.gradeCode.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Role filter
      if (filters.role && employee.role !== filters.role) return false;

      // Grade code filter
      if (filters.gradeCode && employee.gradeCode !== filters.gradeCode) return false;

      // Age filters
      if (filters.minAge && employee.age < parseInt(filters.minAge)) return false;
      if (filters.maxAge && employee.age > parseInt(filters.maxAge)) return false;

      // Weapons filter
      if (filters.weapons.length > 0) {
        const hasRequiredWeapons = filters.weapons.every(weapon => 
          employee.weapons?.includes(weapon)
        );
        if (!hasRequiredWeapons) return false;
      }

      return true;
    });
  }, [employees, filters]);

  // Update parent component when filtered results change
  React.useEffect(() => {
    onFilteredResults(filteredEmployees);
  }, [filteredEmployees, onFilteredResults]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | string[]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleWeaponToggle = (weapon: string) => {
    setFilters(prev => ({
      ...prev,
      weapons: prev.weapons.includes(weapon)
        ? prev.weapons.filter(w => w !== weapon)
        : [...prev.weapons, weapon]
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchTerm: '',
      role: '',
      gradeCode: '',
      minAge: '',
      maxAge: '',
      weapons: []
    });
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== ''
  );

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
      {/* Basic Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search by name, badge, or grade..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter size={16} />
          {showAdvanced ? 'Hide' : 'Advanced'}
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearAllFilters} className="gap-2">
            <X size={16} />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
          {/* Role Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Role</label>
            <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any role</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grade Code Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Grade Code</label>
            <Select value={filters.gradeCode} onValueChange={(value) => handleFilterChange('gradeCode', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Any grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any grade</SelectItem>
                {uniqueGrades.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Min Age</label>
            <Input
              type="number"
              placeholder="Min age"
              value={filters.minAge}
              onChange={(e) => handleFilterChange('minAge', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Age</label>
            <Input
              type="number"
              placeholder="Max age"
              value={filters.maxAge}
              onChange={(e) => handleFilterChange('maxAge', e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Weapons Filter */}
      {showAdvanced && uniqueWeapons.length > 0 && (
        <div>
          <label className="text-sm font-medium mb-2 block">Required Weapons</label>
          <div className="flex flex-wrap gap-2">
            {uniqueWeapons.map(weapon => (
              <Badge
                key={weapon}
                variant={filters.weapons.includes(weapon) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleWeaponToggle(weapon)}
              >
                {weapon}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
        {hasActiveFilters && (
          <div className="flex items-center gap-2">
            <span>Active filters:</span>
            {filters.searchTerm && <Badge variant="secondary">Search: {filters.searchTerm}</Badge>}
            {filters.role && <Badge variant="secondary">Role: {filters.role}</Badge>}
            {filters.gradeCode && <Badge variant="secondary">Grade: {filters.gradeCode}</Badge>}
            {filters.weapons.length > 0 && <Badge variant="secondary">Weapons: {filters.weapons.length}</Badge>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;
