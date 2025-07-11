
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, Shield, Car, Clock, UserPlus, Trash2, Moon, Sun, Settings } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeProfileForm, { EmployeeProfile } from '@/components/EmployeeProfileForm';
import ShiftHierarchy from '@/components/ShiftHierarchy';
import EnhancedGateCard from '@/components/EnhancedGateCard';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: EmployeeProfile[];
  maxCapacity: number;
  weaponAssigned?: boolean;
}

const SHIFTS = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3', 'SHIFT 4'];
const GATE_NUMBERS = Array.from({ length: 24 }, (_, i) => i + 1);
const VIP_GATES = ['V/P #014', 'V/P #05', 'V/P #09', 'V/P #06', 'V/P #011', 'V/P #07', 'V/P #03', 'V/P #010', 'V/P #21', 'V/P #22'];

// Placeholder images for employees
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b9ec2c5f?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
];

// Example employees for testing with enhanced profiles
const EXAMPLE_EMPLOYEES: EmployeeProfile[] = [
  { id: 'emp-1', name: 'John Smith', age: 35, gradeCode: 'SG-1', badge: '001', role: 'supervisor', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[0], weapons: ['MP5', 'Glock'] },
  { id: 'emp-2', name: 'Sarah Johnson', age: 28, gradeCode: 'SG-2', badge: '002', role: 'coordinator', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[1], weapons: ['Glock'] },
  { id: 'emp-3', name: 'Mike Wilson', age: 32, gradeCode: 'SG-3', badge: '003', role: 'patrol', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[2], weapons: ['MP5', 'AirTaser'] },
  { id: 'emp-4', name: 'Lisa Brown', age: 26, gradeCode: 'SG-4', badge: '004', role: 'guard', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[3], weapons: ['Glock'] },
  { id: 'emp-5', name: 'David Lee', age: 40, gradeCode: 'SG-1', badge: '005', role: 'supervisor', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[4], weapons: ['MP5', 'Glock'] },
  { id: 'emp-6', name: 'Maria Garcia', age: 29, gradeCode: 'SG-2', badge: '006', role: 'coordinator', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[5], weapons: ['Glock', 'AirTaser'] },
  { id: 'emp-7', name: 'James Taylor', age: 33, gradeCode: 'SG-3', badge: '007', role: 'guard', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[6], weapons: ['Glock'] },
  { id: 'emp-8', name: 'Anna Davis', age: 27, gradeCode: 'SG-4', badge: '008', role: 'patrol', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[7], weapons: ['MP5'] },
];

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentShift, setCurrentShift] = useState('SHIFT 1');
  const [employees, setEmployees] = useState<EmployeeProfile[]>(EXAMPLE_EMPLOYEES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize assignments
  useEffect(() => {
    const initialAssignments: Assignment[] = [
      // Unassigned pool with increased capacity for 45 employees
      { id: 'unassigned', name: 'Available Employees', type: 'gate', employees: [], maxCapacity: 45 },
      
      // Security Gates with weapon tracking - Updated to maxCapacity: 5
      ...GATE_NUMBERS.map(num => ({
        id: `gate-${num}`,
        name: `G #${num}`,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 5,
        weaponAssigned: false
      })),
      
      // VIP Gates with weapon tracking - Updated to maxCapacity: 5
      ...VIP_GATES.map((gate, index) => ({
        id: `vip-${index}`,
        name: gate,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 5,
        weaponAssigned: false
      })),
      
      // Vehicle Patrols with weapon tracking - Updated to maxCapacity: 1
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `patrol-${i + 1}`,
        name: `Patrol ${i + 1}`,
        type: 'patrol' as const,
        employees: [],
        maxCapacity: 1,
        weaponAssigned: false
      })),
      
      // Special assignments
      { id: 'training', name: 'Training', type: 'training', employees: [], maxCapacity: 10 },
      { id: 'vacation', name: 'Vacation', type: 'vacation', employees: [], maxCapacity: 20 },
      { id: 'assignment', name: 'Assignment', type: 'training', employees: [], maxCapacity: 5 },
      { id: 'm-time', name: 'M-Time', type: 'training', employees: [], maxCapacity: 5 }
    ];
    
    setAssignments(initialAssignments);
  }, []);

  // Initialize unassigned pool with current shift employees
  useEffect(() => {
    const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === 'unassigned' 
          ? { ...assignment, employees: currentShiftEmployees }
          : { ...assignment, employees: assignment.employees.filter(emp => emp.shift === currentShift) }
      )
    );
  }, [currentShift, employees]);

  const addEmployee = (employee: EmployeeProfile) => {
    setEmployees(prev => [...prev, employee]);
    setShowProfileForm(false);
  };

  const removeEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setAssignments(prev => 
      prev.map(assignment => ({
        ...assignment,
        employees: assignment.employees.filter(emp => emp.id !== employeeId)
      }))
    );
    toast.success('Employee removed');
  };

  const toggleWeapon = (assignmentId: string) => {
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? { ...assignment, weaponAssigned: !assignment.weaponAssigned }
          : assignment
      )
    );
    toast.success('Weapon status updated');
  };

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    if (!destination) return;
    
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceAssignment = assignments.find(a => a.id === source.droppableId);
    const destAssignment = assignments.find(a => a.id === destination.droppableId);
    
    if (!sourceAssignment || !destAssignment) return;

    // Check capacity
    if (destAssignment.employees.length >= destAssignment.maxCapacity && destination.droppableId !== source.droppableId) {
      toast.error(`${destAssignment.name} is at maximum capacity`);
      return;
    }

    const draggedEmployee = sourceAssignment.employees.find(emp => emp.id === draggableId);
    if (!draggedEmployee) return;

    setAssignments(prev => {
      return prev.map(assignment => {
        if (assignment.id === source.droppableId) {
          return {
            ...assignment,
            employees: assignment.employees.filter(emp => emp.id !== draggableId)
          };
        }
        if (assignment.id === destination.droppableId) {
          const newEmployees = [...assignment.employees];
          newEmployees.splice(destination.index, 0, draggedEmployee);
          return {
            ...assignment,
            employees: newEmployees
          };
        }
        return assignment;
      });
    });

    toast.success(`${draggedEmployee.name} assigned to ${destAssignment.name}`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'supervisor': return 'bg-red-500';
      case 'coordinator': return 'bg-blue-500';
      case 'patrol': return 'bg-purple-500';
      default: return 'bg-green-500';
    }
  };

  const getAssignmentColor = (type: string) => {
    switch (type) {
      case 'patrol': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'training': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
      case 'vacation': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);
  const supervisor = currentShiftEmployees.find(emp => emp.role === 'supervisor');
  const coordinator = currentShiftEmployees.find(emp => emp.role === 'coordinator');
  const unassignedPool = assignments.find(a => a.id === 'unassigned');
  const gateAssignments = assignments.filter(a => a.type === 'gate' && a.id !== 'unassigned');
  const patrolAssignments = assignments.filter(a => a.type === 'patrol');
  const specialAssignments = assignments.filter(a => a.type === 'training' || a.type === 'vacation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <div className="container mx-auto p-6">
        {/* Enhanced Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Shield className="text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 rounded-full p-2" size={48} />
              YSOD Security Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Advanced Employee Assignment & Shift Management System</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowProfileForm(!showProfileForm)}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Settings size={16} />
              {showProfileForm ? 'Hide Form' : 'Add Employee'}
            </Button>
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                aria-label="Toggle dark mode"
              />
              <Moon className="h-4 w-4 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Employee Profile Form */}
        {showProfileForm && (
          <div className="mb-6">
            <EmployeeProfileForm
              currentShift={currentShift}
              onAddEmployee={addEmployee}
              onClose={() => setShowProfileForm(false)}
            />
          </div>
        )}

        {/* Shift Selector */}
        <div className="mb-6 flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md">
          <Clock className="text-slate-600 dark:text-slate-400" />
          {SHIFTS.map(shift => (
            <Button
              key={shift}
              variant={currentShift === shift ? "default" : "outline"}
              onClick={() => setCurrentShift(shift)}
              className="font-semibold"
            >
              {shift}
            </Button>
          ))}
          <Badge variant="secondary" className="ml-4 text-sm px-3 py-1">
            {currentShiftEmployees.length} Total Employees
          </Badge>
        </div>

        {/* Shift Hierarchy */}
        <ShiftHierarchy
          shift={currentShift}
          supervisor={supervisor}
          coordinator={coordinator}
          darkMode={darkMode}
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Available Employees Pool */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-slate-800 dark:border-slate-700 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Users size={20} />
                    Available ({unassignedPool?.employees.length || 0}/45)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-32 max-h-96 overflow-y-auto p-2 rounded border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver ? 'border-green-400 bg-green-50 dark:bg-green-950' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {unassignedPool?.employees.map((employee, index) => (
                          <Draggable key={employee.id} draggableId={employee.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2 mb-2 bg-white dark:bg-slate-700 rounded border shadow-sm cursor-move transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={employee.image} alt={employee.name} />
                                    <AvatarFallback className="text-xs">
                                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm dark:text-slate-200 truncate">{employee.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">#{employee.badge} | {employee.gradeCode}</div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${getRoleColor(employee.role)}`}></div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeEmployee(employee.id)}
                                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
                                    >
                                      <Trash2 size={12} />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>

            {/* Main Assignment Area */}
            <div className="lg:col-span-3">
              {/* Security Gates */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-slate-200">
                  <Shield className="text-blue-600 dark:text-blue-400" />
                  Security Gates
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {gateAssignments.map(assignment => (
                    <EnhancedGateCard
                      key={assignment.id}
                      assignment={assignment}
                      onToggleWeapon={toggleWeapon}
                      getAssignmentColor={getAssignmentColor}
                      getRoleColor={getRoleColor}
                    />
                  ))}
                </div>
              </div>

              {/* Vehicle Patrols */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 dark:text-slate-200">
                  <Car className="text-blue-600 dark:text-blue-400" />
                  Vehicle Patrols
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {patrolAssignments.map(assignment => (
                    <EnhancedGateCard
                      key={assignment.id}
                      assignment={assignment}
                      onToggleWeapon={toggleWeapon}
                      getAssignmentColor={getAssignmentColor}
                      getRoleColor={getRoleColor}
                    />
                  ))}
                </div>
              </div>

              {/* Special Assignments */}
              <div>
                <h3 className="text-2xl font-bold mb-4 dark:text-slate-200">Special Assignments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specialAssignments.map(assignment => (
                    <EnhancedGateCard
                      key={assignment.id}
                      assignment={assignment}
                      onToggleWeapon={toggleWeapon}
                      getAssignmentColor={getAssignmentColor}
                      getRoleColor={getRoleColor}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Index;
