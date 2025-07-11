import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, Shield, Car, Clock, UserPlus, Trash2, Moon, Sun, Settings, Zap, Activity, BarChart3 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-all duration-500">
      <div className="container mx-auto p-6">
        {/* Enhanced Header with Stats */}
        <div className="mb-8 relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10 rounded-3xl"></div>
          
          <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3 flex items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <Shield className="text-white" size={56} />
                  </div>
                  YSOD Security Dashboard
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-xl mb-4">Advanced Employee Assignment & Shift Management System</p>
                
                {/* Quick Stats */}
                <div className="flex gap-6">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <Users size={20} />
                    <span className="font-semibold">{currentShiftEmployees.length} Active</span>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <Shield size={20} />
                    <span className="font-semibold">{gateAssignments.length} Gates</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <Car size={20} />
                    <span className="font-semibold">{patrolAssignments.length} Patrols</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowProfileForm(!showProfileForm)}
                  className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 px-6 py-3 text-lg font-semibold shadow-lg transition-all duration-300"
                >
                  <UserPlus size={20} />
                  {showProfileForm ? 'Hide Form' : 'Add Employee'}
                </Button>
                <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-700/50 p-3 rounded-xl backdrop-blur-sm">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <Switch
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                    aria-label="Toggle dark mode"
                  />
                  <Moon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Profile Form */}
        {showProfileForm && (
          <div className="mb-8 animate-fade-in">
            <EmployeeProfileForm
              currentShift={currentShift}
              onAddEmployee={addEmployee}
              onClose={() => setShowProfileForm(false)}
            />
          </div>
        )}

        {/* Enhanced Shift Selector */}
        <div className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
          <div className="flex gap-6 items-center justify-center">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <Clock className="text-blue-600 dark:text-blue-400" size={24} />
              <span className="font-semibold text-lg">Active Shift:</span>
            </div>
            {SHIFTS.map(shift => (
              <Button
                key={shift}
                variant={currentShift === shift ? "default" : "outline"}
                onClick={() => setCurrentShift(shift)}
                className={`font-bold px-6 py-3 text-lg transition-all duration-300 ${
                  currentShift === shift 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg scale-105' 
                    : 'hover:scale-105'
                }`}
              >
                {shift}
              </Button>
            ))}
            <Badge variant="secondary" className="text-lg px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600">
              <Activity className="mr-2" size={16} />
              {currentShiftEmployees.length} Total Employees
            </Badge>
          </div>
        </div>

        {/* Shift Hierarchy */}
        <ShiftHierarchy
          shift={currentShift}
          supervisor={supervisor}
          coordinator={coordinator}
          darkMode={darkMode}
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Enhanced Available Employees Pool */}
            <div className="lg:col-span-1">
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 shadow-2xl border-0">
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <Users size={24} />
                    Available Personnel
                    <Badge className="bg-white/20 text-white font-bold">
                      {unassignedPool?.employees.length || 0}/45
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-40 max-h-96 overflow-y-auto p-3 rounded-xl border-2 border-dashed transition-all duration-300 ${
                          snapshot.isDraggingOver 
                            ? 'border-green-400 bg-green-100 dark:bg-green-950 shadow-inner scale-105' 
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      >
                        {unassignedPool?.employees.map((employee, index) => (
                          <Draggable key={employee.id} draggableId={employee.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-3 mb-3 bg-white dark:bg-slate-700 rounded-xl border shadow-md cursor-move transition-all duration-300 hover:shadow-lg ${
                                  snapshot.isDragging ? 'rotate-2 shadow-2xl scale-105' : 'hover:scale-102'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10 border-2 border-green-300">
                                    <AvatarImage src={employee.image} alt={employee.name} />
                                    <AvatarFallback className="text-xs font-bold bg-green-100">
                                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm dark:text-slate-200 truncate">{employee.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                      <span>#{employee.badge}</span>
                                      <span>|</span>
                                      <span>{employee.gradeCode}</span>
                                      <span>|</span>
                                      <span>Age {employee.age}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${getRoleColor(employee.role)}`}></div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeEmployee(employee.id)}
                                      className="p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-100"
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
            <div className="lg:col-span-3 space-y-8">
              {/* Security Gates */}
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3 text-blue-800 dark:text-blue-300">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-xl">
                    <Shield className="text-white" size={28} />
                  </div>
                  Security Gates
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {gateAssignments.length} Gates
                  </Badge>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3 text-purple-800 dark:text-purple-300">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-xl">
                    <Car className="text-white" size={28} />
                  </div>
                  Vehicle Patrols
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {patrolAssignments.length} Units
                  </Badge>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20">
                <h3 className="text-3xl font-bold mb-6 flex items-center gap-3 text-orange-800 dark:text-orange-300">
                  <div className="bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-xl">
                    <BarChart3 className="text-white" size={28} />
                  </div>
                  Special Assignments
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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
