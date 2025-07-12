
import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Shield, Car, MapPin, Users } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: any[];
  maxCapacity: number;
  area?: string;
}

interface EmployeeContextMenuProps {
  children: React.ReactNode;
  assignments: Assignment[];
  onAssignEmployee: (assignmentId: string) => void;
  currentAssignmentId?: string;
}

const GATE_AREAS = {
  NGL: { name: 'NGL Area', color: 'text-blue-600' },
  YRD: { name: 'YRD Area', color: 'text-green-600' },
  BUP: { name: 'BUP Area', color: 'text-purple-600' },
  HUH: { name: 'HUH Area', color: 'text-orange-600' },
  YNT: { name: 'YNT Area', color: 'text-indigo-600' }
};

const EmployeeContextMenu: React.FC<EmployeeContextMenuProps> = ({
  children,
  assignments,
  onAssignEmployee,
  currentAssignmentId
}) => {
  // Group assignments by type and area
  const gatesByArea = assignments
    .filter(a => a.type === 'gate' && a.area && a.id !== 'unassigned' && a.id !== 'unavailable')
    .reduce((acc, assignment) => {
      if (!acc[assignment.area!]) {
        acc[assignment.area!] = [];
      }
      acc[assignment.area!].push(assignment);
      return acc;
    }, {} as Record<string, Assignment[]>);

  const patrols = assignments.filter(a => a.type === 'patrol');
  const specialAssignments = assignments.filter(a => 
    (a.type === 'training' || a.type === 'vacation') && 
    a.id !== 'unavailable' && 
    a.id !== 'unassigned'
  );
  const availablePool = assignments.find(a => a.id === 'unassigned');

  const canAssign = (assignment: Assignment) => {
    return assignment.employees.length < assignment.maxCapacity && 
           assignment.id !== currentAssignmentId;
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Move to Available Pool */}
        {currentAssignmentId !== 'unassigned' && availablePool && (
          <>
            <ContextMenuItem 
              onClick={() => onAssignEmployee('unassigned')}
              className="flex items-center gap-2"
            >
              <Users size={16} className="text-green-600" />
              Move to Available
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {/* Gates by Area */}
        {Object.entries(gatesByArea).map(([areaCode, areaGates]) => (
          <ContextMenuSub key={areaCode}>
            <ContextMenuSubTrigger className="flex items-center gap-2">
              <MapPin size={16} className={GATE_AREAS[areaCode as keyof typeof GATE_AREAS]?.color || 'text-gray-600'} />
              {GATE_AREAS[areaCode as keyof typeof GATE_AREAS]?.name || areaCode}
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {areaGates.map(gate => (
                <ContextMenuItem
                  key={gate.id}
                  onClick={() => onAssignEmployee(gate.id)}
                  disabled={!canAssign(gate)}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Shield size={14} />
                    {gate.name}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {gate.employees.length}/{gate.maxCapacity}
                  </span>
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        ))}

        {/* Patrols */}
        {patrols.length > 0 && (
          <>
            <ContextMenuSeparator />
            <ContextMenuSub>
              <ContextMenuSubTrigger className="flex items-center gap-2">
                <Car size={16} className="text-purple-600" />
                Patrols
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {patrols.map(patrol => (
                  <ContextMenuItem
                    key={patrol.id}
                    onClick={() => onAssignEmployee(patrol.id)}
                    disabled={!canAssign(patrol)}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <Car size={14} />
                      {patrol.name}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {patrol.employees.length}/{patrol.maxCapacity}
                    </span>
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          </>
        )}

        {/* Special Assignments */}
        {specialAssignments.length > 0 && (
          <>
            <ContextMenuSeparator />
            {specialAssignments.map(assignment => (
              <ContextMenuItem
                key={assignment.id}
                onClick={() => onAssignEmployee(assignment.id)}
                disabled={!canAssign(assignment)}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <Shield size={14} className="text-orange-600" />
                  {assignment.name}
                </div>
                <span className="text-xs text-muted-foreground">
                  {assignment.employees.length}/{assignment.maxCapacity}
                </span>
              </ContextMenuItem>
            ))}
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default EmployeeContextMenu;
