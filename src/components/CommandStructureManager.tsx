import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Shield, Settings, UserX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { EmployeeProfile } from './EmployeeProfileForm';

interface CommandStructureManagerProps {
  shift: string;
  employees: EmployeeProfile[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
  onAssignSupervisor: (employeeId: string | null) => void;
  onAssignCoordinator: (employeeId: string | null) => void;
  onDeleteEmployee?: (employeeId: string) => void;
}

const CommandStructureManager: React.FC<CommandStructureManagerProps> = ({
  shift,
  employees,
  supervisor,
  coordinator,
  onAssignSupervisor,
  onAssignCoordinator,
  onDeleteEmployee
}) => {
  const [showManager, setShowManager] = useState(false);

  const currentShiftEmployees = employees.filter(emp => emp.shift === shift);
  const availableForSupervisor = currentShiftEmployees.filter(emp => 
    emp.role === 'supervisor' || emp.role === 'coordinator'
  );
  const availableForCoordinator = currentShiftEmployees.filter(emp => 
    emp.role === 'coordinator' || emp.role === 'supervisor'
  );

  const handleAssignSupervisor = (employeeId: string) => {
    if (employeeId === 'none') {
      onAssignSupervisor(null);
      toast.success('Security Shift Supervisor removed');
    } else {
      const employee = employees.find(emp => emp.id === employeeId);
      onAssignSupervisor(employeeId);
      toast.success(`${employee?.name} assigned as Security Shift Supervisor`);
    }
  };

  const handleAssignCoordinator = (employeeId: string) => {
    if (employeeId === 'none') {
      onAssignCoordinator(null);
      toast.success('Security Shift Coordinator removed');
    } else {
      const employee = employees.find(emp => emp.id === employeeId);
      onAssignCoordinator(employeeId);
      toast.success(`${employee?.name} assigned as Security Shift Coordinator`);
    }
  };

  const handleDeleteEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee && onDeleteEmployee) {
      // Remove from supervisor/coordinator assignments if they are assigned
      if (supervisor?.id === employeeId) {
        onAssignSupervisor(null);
      }
      if (coordinator?.id === employeeId) {
        onAssignCoordinator(null);
      }
      
      onDeleteEmployee(employeeId);
      toast.success(`${employee.name} has been removed`);
    }
  };

  if (!showManager) {
    return (
      <Button
        onClick={() => setShowManager(true)}
        variant="outline"
        className="mb-4"
      >
        <Settings className="mr-2" size={16} />
        Manage Command Structure
      </Button>
    );
  }

  return (
    <Card className="mb-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="text-yellow-600" size={24} />
            Command Structure Manager - {shift}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowManager(false)}
            size="sm"
          >
            Close
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Assign Supervisor */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Crown size={18} className="text-red-600" />
            Security Shift Supervisor
          </h4>
          <Select onValueChange={handleAssignSupervisor} value={supervisor?.id || 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Select Security Shift Supervisor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <UserX size={16} />
                  No Security Shift Supervisor
                </div>
              </SelectItem>
              {availableForSupervisor.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-red-500" />
                    {employee.name} - #{employee.badge}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assign Coordinator */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            Security Shift Coordinator
          </h4>
          <Select onValueChange={handleAssignCoordinator} value={coordinator?.id || 'none'}>
            <SelectTrigger>
              <SelectValue placeholder="Select Security Shift Coordinator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                <div className="flex items-center gap-2">
                  <UserX size={16} />
                  No Security Shift Coordinator
                </div>
              </SelectItem>
              {availableForCoordinator.map(employee => (
                <SelectItem key={employee.id} value={employee.id}>
                  <div className="flex items-center gap-2">
                    <Shield size={16} className="text-blue-500" />
                    {employee.name} - #{employee.badge}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Employee Management Section */}
        {onDeleteEmployee && currentShiftEmployees.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Trash2 size={18} className="text-red-600" />
              Employee Management
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {currentShiftEmployees.map(employee => (
                <div key={employee.id} className="flex items-center justify-between p-2 border rounded-lg bg-white/50 dark:bg-slate-700/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      employee.role === 'supervisor' ? 'bg-red-500' :
                      employee.role === 'coordinator' ? 'bg-blue-500' :
                      employee.role === 'patrol' ? 'bg-purple-500' : 'bg-green-500'
                    }`} />
                    <span className="font-medium">{employee.name}</span>
                    <span className="text-sm text-gray-500">#{employee.badge}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded capitalize">
                      {employee.role}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommandStructureManager;
