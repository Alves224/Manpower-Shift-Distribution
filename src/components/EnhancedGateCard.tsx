
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Users, Crown } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';

interface WeaponImages {
  MP5: string;
  Glock: string;
  AirTaser: string;
}

const WEAPON_IMAGES: WeaponImages = {
  MP5: '/lovable-uploads/a77e4cce-32dd-4452-8a77-60284b5bfeba.png',
  Glock: '/lovable-uploads/332f3c1f-d4cf-487f-b0a6-bb60d4b13299.png',
  AirTaser: '/lovable-uploads/f33a5480-6810-4bdb-9202-949f44d8b836.png'
};

interface EnhancedGateCardProps {
  assignment: {
    id: string;
    name: string;
    type: string;
    employees: EmployeeProfile[];
    maxCapacity: number;
    weaponAssigned?: boolean;
  };
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
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supervisor': return <Crown size={14} className="text-red-500" />;
      case 'coordinator': return <Shield size={14} className="text-blue-500" />;
      default: return <Shield size={14} className="text-green-500" />;
    }
  };

  return (
    <Card className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-lg border-2 hover:border-blue-300 dark:hover:border-blue-600 h-fit`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-bold text-center dark:text-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blue-600 dark:text-blue-400" />
            <span>{assignment.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {assignment.employees.length}/{assignment.maxCapacity}
            </Badge>
            {assignment.type !== 'training' && assignment.type !== 'vacation' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleWeapon(assignment.id)}
                className={`p-1 h-6 w-6 ${assignment.weaponAssigned ? 'text-orange-500 bg-orange-100 dark:bg-orange-900' : 'text-gray-400 hover:text-orange-500'}`}
                title={`Weapon ${assignment.weaponAssigned ? 'Assigned' : 'Not Assigned'}`}
              >
                <Zap size={12} />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 pb-6">
        <Droppable droppableId={assignment.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-96 p-4 rounded-lg border-2 border-dashed transition-all ${
                snapshot.isDraggingOver 
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950 shadow-inner' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="space-y-6">
                {assignment.employees.map((employee, index) => (
                  <Draggable key={employee.id} draggableId={employee.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-5 bg-white dark:bg-slate-700 rounded-xl border shadow-lg cursor-move transition-all hover:shadow-xl min-w-[340px] mb-4 ${
                          snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 z-50' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          position: snapshot.isDragging ? 'fixed' : 'relative',
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="h-16 w-16 border-2 border-gray-200 shadow-md flex-shrink-0">
                            <AvatarImage src={employee.image} alt={employee.name} className="object-cover" />
                            <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-100 to-purple-100">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-base dark:text-slate-200 truncate">{employee.name}</span>
                              {getRoleIcon(employee.role)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">#{employee.badge}</span>
                              {employee.age && <span>Age: {employee.age}</span>}
                              {employee.gradeCode && (
                                <Badge variant="outline" className="text-[10px] px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {employee.gradeCode}
                                </Badge>
                              )}
                            </div>
                            
                            {employee.weapons && employee.weapons.length > 0 && (
                              <div className="space-y-2">
                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Weapons:</span>
                                <div className="flex flex-wrap gap-2">
                                  {employee.weapons.map(weapon => (
                                    <div key={weapon} className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 px-3 py-2 rounded-lg border border-orange-200 dark:border-orange-800">
                                      <img
                                        src={WEAPON_IMAGES[weapon as keyof WeaponImages]}
                                        alt={weapon}
                                        className="w-5 h-5 object-contain"
                                      />
                                      <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                                        {weapon}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}
              {assignment.employees.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500">
                  <Users size={32} />
                  <span className="ml-3 text-lg">Empty</span>
                </div>
              )}
            </div>
          )}
        </Droppable>
      </CardContent>
    </Card>
  );
};

export default EnhancedGateCard;
