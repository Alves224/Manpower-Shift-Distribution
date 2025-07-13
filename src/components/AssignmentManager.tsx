
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Shield, Car, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: any[];
  maxCapacity: number;
  weaponAssigned?: boolean;
  area?: string;
}

interface AssignmentManagerProps {
  assignments: Assignment[];
  onAddAssignment: (assignment: Omit<Assignment, 'employees'>) => void;
  onDeleteAssignment: (id: string) => void;
}

// Gate areas configuration
const GATE_AREAS = {
  NGL: 'NGL Area',
  YRD: 'YRD Area', 
  BUP: 'BUP Area',
  HUH: 'HUH Area',
  YNT: 'YNT Area'
};

const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  assignments,
  onAddAssignment,
  onDeleteAssignment
}) => {
  const [newGateName, setNewGateName] = useState('');
  const [newPatrolName, setNewPatrolName] = useState('');
  const [selectedGateArea, setSelectedGateArea] = useState('');
  const [selectedPatrolArea, setSelectedPatrolArea] = useState('');
  const [showManager, setShowManager] = useState(false);

  const handleAddGate = () => {
    if (!newGateName.trim()) {
      toast.error('Please enter a gate name');
      return;
    }
    
    if (!selectedGateArea) {
      toast.error('Please select an area for the gate');
      return;
    }
    
    const newGate: Omit<Assignment, 'employees'> = {
      id: `gate-custom-${Date.now()}`,
      name: newGateName,
      type: 'gate',
      maxCapacity: 5,
      weaponAssigned: false,
      area: selectedGateArea
    };
    
    onAddAssignment(newGate);
    setNewGateName('');
    setSelectedGateArea('');
    toast.success(`Gate ${newGateName} added to ${GATE_AREAS[selectedGateArea as keyof typeof GATE_AREAS]}`);
  };

  const handleAddPatrol = () => {
    if (!newPatrolName.trim()) {
      toast.error('Please enter a patrol name');
      return;
    }
    
    if (!selectedPatrolArea) {
      toast.error('Please select an area for the patrol');
      return;
    }
    
    const newPatrol: Omit<Assignment, 'employees'> = {
      id: `patrol-custom-${Date.now()}`,
      name: newPatrolName,
      type: 'patrol',
      maxCapacity: 1,
      weaponAssigned: false,
      area: selectedPatrolArea
    };
    
    onAddAssignment(newPatrol);
    setNewPatrolName('');
    setSelectedPatrolArea('');
    toast.success(`Patrol ${newPatrolName} added to ${GATE_AREAS[selectedPatrolArea as keyof typeof GATE_AREAS]}`);
  };

  const handleDeleteAssignment = (id: string, name: string) => {
    const assignment = assignments.find(a => a.id === id);
    if (assignment && assignment.employees.length > 0) {
      toast.error('Cannot delete assignment with assigned personnel');
      return;
    }
    
    onDeleteAssignment(id);
    toast.success(`${name} deleted`);
  };

  // Group assignments by area for better organization
  const assignmentsByArea = Object.keys(GATE_AREAS).reduce((acc, areaCode) => {
    acc[areaCode] = assignments.filter(a => a.area === areaCode && a.id !== 'unassigned');
    return acc;
  }, {} as Record<string, Assignment[]>);

  if (!showManager) {
    return (
      <Button
        onClick={() => setShowManager(true)}
        className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
      >
        <Settings className="mr-2" size={16} />
        Manage Gates & Patrols
      </Button>
    );
  }

  return (
    <Card className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="text-indigo-600" size={24} />
            Assignment Manager
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
        {/* Add Gates */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            Add New Gate
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter gate name (e.g., G #25)"
              value={newGateName}
              onChange={(e) => setNewGateName(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedGateArea} onValueChange={setSelectedGateArea}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GATE_AREAS).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddGate}>
              <Plus size={16} className="mr-1" />
              Add Gate
            </Button>
          </div>
        </div>

        {/* Add Patrols */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Car size={18} className="text-purple-600" />
            Add New Patrol
          </h4>
          <div className="flex gap-2">
            <Input
              placeholder="Enter patrol name (e.g., Patrol 9)"
              value={newPatrolName}
              onChange={(e) => setNewPatrolName(e.target.value)}
              className="flex-1"
            />
            <Select value={selectedPatrolArea} onValueChange={setSelectedPatrolArea}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Area" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GATE_AREAS).map(([code, name]) => (
                  <SelectItem key={code} value={code}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddPatrol}>
              <Plus size={16} className="mr-1" />
              Add Patrol
            </Button>
          </div>
        </div>

        {/* Delete Assignments by Area */}
        {Object.entries(GATE_AREAS).map(([areaCode, areaName]) => {
          const areaAssignments = assignmentsByArea[areaCode] || [];
          if (areaAssignments.length === 0) return null;

          return (
            <div key={areaCode} className="space-y-3">
              <h4 className="font-semibold text-red-600">Delete from {areaName}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {areaAssignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between bg-red-50 dark:bg-red-950 p-2 rounded">
                    <span className="text-sm">{assignment.name}</span>
                    <div className="flex items-center gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${assignment.type === 'patrol' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {assignment.employees.length}/{assignment.maxCapacity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAssignment(assignment.id, assignment.name)}
                        className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default AssignmentManager;
