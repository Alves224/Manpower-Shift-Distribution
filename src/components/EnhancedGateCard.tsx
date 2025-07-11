
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Shield, Zap, Car } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: EmployeeProfile[];
  maxCapacity: number;
  weaponAssigned?: boolean;
  area?: string;
}

interface EnhancedGateCardProps {
  assignment: Assignment;
  onToggleWeapon: (assignmentId: string) => void;
  getAssignmentColor: (type: string) => string;
  getRoleColor: (role: string) => string;
}

const EnhancedGateCard: React.FC<EnhancedGateCardProps> = ({
  assignment,
  onToggleWeapon,
  getAssignmentColor,
  getRoleColor
}) => {
  const isVehiclePatrol = assignment.name.startsWith('V/P');
  const isPatrolType = assignment.type === 'patrol';

  return (
    <Card className={`h-fit ${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
      <CardHeader className="p-3 pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isVehiclePatrol && <Car size={14} className="text-blue-600" />}
            {isPatrolType && !isVehiclePatrol && <Car size={14} className="text-purple-600" />}
            <span className="truncate">{assignment.name}</span>
          </div>
          <div className="flex items-center gap-1">
            {assignment.weaponAssigned && (
              <Zap size={12} className="text-yellow-500" />
            )}
            <Badge variant="outline" className="text-xs px-1 py-0">
              {assignment.employees.length}/{assignment.maxCapacity}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Droppable droppableId={assignment.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-16 p-2 rounded border-2 border-dashed transition-all ${
                snapshot.isDraggingOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/50' 
                  : 'border-gray-300/50 dark:border-gray-600/50'
              }`}
            >
              {assignment.employees.map((employee, index) => (
                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`flex items-center gap-2 p-1 mb-1 bg-white/90 dark:bg-slate-700/90 rounded border text-xs cursor-move transition-all hover:shadow-sm ${
                        snapshot.isDragging ? 'rotate-1 shadow-md scale-105' : ''
                      }`}
                    >
                      <Avatar className="h-5 w-5 border">
                        <AvatarImage src={employee.image} alt={employee.name} />
                        <AvatarFallback className="text-xs">
                          {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{employee.name}</div>
                        <div className="text-xs text-gray-500">#{employee.badge}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${getRoleColor(employee.role)}`} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {assignment.employees.length === 0 && (
                <div className="text-xs text-gray-400 italic text-center py-2">
                  Drop personnel here
                </div>
              )}
            </div>
          )}
        </Droppable>
        
        {(assignment.type === 'gate' || assignment.type === 'patrol') && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onToggleWeapon(assignment.id)}
            className={`mt-2 w-full text-xs h-6 ${
              assignment.weaponAssigned 
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            <Shield size={10} className="mr-1" />
            {assignment.weaponAssigned ? 'Armed' : 'Unarmed'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedGateCard;
