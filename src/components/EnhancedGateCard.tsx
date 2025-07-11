
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
      case 'supervisor': return <Crown size={12} className="text-amber-500" />;
      case 'coordinator': return <Shield size={12} className="text-blue-500" />;
      default: return <Shield size={12} className="text-emerald-500" />;
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-white/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="p-3">
        <CardTitle className="text-xs font-bold flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <span className="text-slate-700 dark:text-slate-300">{assignment.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 py-0 bg-slate-100/50 dark:bg-slate-700/50">
              {assignment.employees.length}/{assignment.maxCapacity}
            </Badge>
            {assignment.type !== 'training' && assignment.type !== 'vacation' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onToggleWeapon(assignment.id)}
                className={`p-1 h-5 w-5 ${assignment.weaponAssigned ? 'text-amber-500 bg-amber-100/50' : 'text-slate-400 hover:text-amber-500'}`}
                title={`Weapon ${assignment.weaponAssigned ? 'Assigned' : 'Not Assigned'}`}
              >
                <Zap size={10} />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <Droppable droppableId={assignment.id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-32 p-2 rounded-lg border border-dashed transition-all ${
                snapshot.isDraggingOver 
                  ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/50 shadow-inner' 
                  : 'border-slate-300/50 dark:border-slate-600/50'
              }`}
            >
              <div className="space-y-2">
                {assignment.employees.map((employee, index) => (
                  <Draggable key={employee.id} draggableId={employee.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-3 bg-white/90 dark:bg-slate-700/90 rounded-lg border border-white/50 shadow-md cursor-move transition-all hover:shadow-lg backdrop-blur-sm ${
                          snapshot.isDragging ? 'shadow-xl rotate-1 scale-105 z-50' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                          position: snapshot.isDragging ? 'fixed' : 'relative',
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12 border border-slate-200 shadow-sm flex-shrink-0">
                            <AvatarImage src={employee.image} alt={employee.name} className="object-cover" />
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-slate-100 to-slate-200">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate">{employee.name}</span>
                              {getRoleIcon(employee.role)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                              <span className="font-medium">#{employee.badge}</span>
                              {employee.age && <span>Age: {employee.age}</span>}
                              {employee.gradeCode && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                  {employee.gradeCode}
                                </Badge>
                              )}
                            </div>
                            
                            {employee.weapons && employee.weapons.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Weapons:</span>
                                <div className="flex flex-wrap gap-1">
                                  {employee.weapons.map(weapon => (
                                    <div key={weapon} className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-800">
                                      <img
                                        src={WEAPON_IMAGES[weapon as keyof WeaponImages]}
                                        alt={weapon}
                                        className="w-3 h-3 object-contain"
                                      />
                                      <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
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
                <div className="flex items-center justify-center h-20 text-slate-400 dark:text-slate-500">
                  <Users size={20} />
                  <span className="ml-2 text-sm">Empty</span>
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
