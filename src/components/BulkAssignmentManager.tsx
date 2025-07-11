
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, ArrowRight } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: EmployeeProfile[];
  maxCapacity: number;
  area?: string;
}

interface BulkAssignmentManagerProps {
  availableEmployees: EmployeeProfile[];
  assignments: Assignment[];
  onBulkAssign: (employeeIds: string[], assignmentId: string) => void;
}

const BulkAssignmentManager: React.FC<BulkAssignmentManagerProps> = ({
  availableEmployees,
  assignments,
  onBulkAssign
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [targetAssignment, setTargetAssignment] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === availableEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(availableEmployees.map(emp => emp.id));
    }
  };

  const handleBulkAssign = () => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select at least one employee');
      return;
    }
    
    if (!targetAssignment) {
      toast.error('Please select a target assignment');
      return;
    }

    const assignment = assignments.find(a => a.id === targetAssignment);
    if (assignment && (assignment.employees.length + selectedEmployees.length) > assignment.maxCapacity) {
      toast.error(`Assignment would exceed capacity (${assignment.maxCapacity})`);
      return;
    }

    onBulkAssign(selectedEmployees, targetAssignment);
    setSelectedEmployees([]);
    setTargetAssignment('');
    setIsOpen(false);
    toast.success(`${selectedEmployees.length} employees assigned successfully`);
  };

  const availableAssignments = assignments.filter(a => a.employees.length < a.maxCapacity);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Users size={16} />
          Bulk Assign ({availableEmployees.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Assignment Manager</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Employee Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Select Employees</h4>
              <Button
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedEmployees.length === availableEmployees.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded-lg p-3">
              {availableEmployees.map(employee => (
                <div key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-sm text-gray-500">#{employee.badge} • {employee.gradeCode} • {employee.role}</div>
                  </div>
                  <Badge variant="outline">{employee.age}y</Badge>
                </div>
              ))}
            </div>
            
            {selectedEmployees.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                {selectedEmployees.length} employee{selectedEmployees.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Assignment Selection */}
          <div>
            <h4 className="font-medium mb-3">Target Assignment</h4>
            <Select value={targetAssignment} onValueChange={setTargetAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignment..." />
              </SelectTrigger>
              <SelectContent>
                {availableAssignments.map(assignment => (
                  <SelectItem key={assignment.id} value={assignment.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{assignment.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {assignment.employees.length}/{assignment.maxCapacity}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {targetAssignment && (
              <div className="mt-2 text-sm text-gray-600">
                Available capacity: {assignments.find(a => a.id === targetAssignment)?.maxCapacity! - assignments.find(a => a.id === targetAssignment)?.employees.length!} positions
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              onClick={handleBulkAssign}
              disabled={selectedEmployees.length === 0 || !targetAssignment}
              className="flex-1 gap-2"
            >
              <ArrowRight size={16} />
              Assign {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
            </Button>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAssignmentManager;
