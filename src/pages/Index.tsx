import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, Shield, Car, Clock, UserPlus, Trash2, Moon, Sun, Settings, Zap, Activity, BarChart3, UserMinus, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeProfileForm, { EmployeeProfile } from '@/components/EmployeeProfileForm';
import ShiftHierarchy from '@/components/ShiftHierarchy';
import EnhancedGateCard from '@/components/EnhancedGateCard';
import AssignmentManager from '@/components/AssignmentManager';
import CommandStructureManager from '@/components/CommandStructureManager';
import ManpowerDescription from '@/components/ManpowerDescription';
import AreaNotesManager from '@/components/AreaNotesManager';

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: EmployeeProfile[];
  maxCapacity: number;
  weaponAssigned?: boolean;
  area?: string;
}

const SHIFTS = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3', 'SHIFT 4'];

// Gate areas configuration
const GATE_AREAS = {
  NGL: {
    name: 'NGL Area',
    gates: ['G #1', 'G #2', 'G #3', 'G #21'],
    vipGates: ['V/P #05', 'V/P #014'],
    color: 'from-blue-500 to-cyan-500'
  },
  YRD: {
    name: 'YRD Area',
    gates: ['G #16', 'G #17'],
    vipGates: ['V/P #07', 'V/P #011'],
    color: 'from-green-500 to-emerald-500'
  },
  BUP: {
    name: 'BUP Area',
    gates: ['G #18'],
    vipGates: ['V/P #03'],
    color: 'from-purple-500 to-pink-500'
  },
  HUH: {
    name: 'HUH Area',
    gates: ['G #23', 'G #24'],
    vipGates: ['V/P #022', 'V/P #023'],
    color: 'from-orange-500 to-red-500'
  },
  YNT: {
    name: 'YNT Area',
    gates: ['G #4', 'G #5', 'G #9', 'G #11'],
    vipGates: ['V/P #06', 'V/P #09', 'V/P #010'],
    color: 'from-indigo-500 to-purple-500'
  }
};

// Placeholder images for employees
const PLACEHOLDER_IMAGES = ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1494790108755-2616b9ec2c5f?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'];

// Example employees for testing with enhanced profiles
const EXAMPLE_EMPLOYEES: EmployeeProfile[] = [{
  id: 'emp-1',
  name: 'John Smith',
  age: 35,
  gradeCode: 'SG-1',
  badge: '001',
  role: 'supervisor',
  shift: 'SHIFT 1',
  image: PLACEHOLDER_IMAGES[0],
  weapons: ['MP5', 'Glock']
}, {
  id: 'emp-2',
  name: 'Sarah Johnson',
  age: 28,
  gradeCode: 'SG-2',
  badge: '002',
  role: 'coordinator',
  shift: 'SHIFT 1',
  image: PLACEHOLDER_IMAGES[1],
  weapons: ['Glock']
}, {
  id: 'emp-3',
  name: 'Mike Wilson',
  age: 32,
  gradeCode: 'SG-3',
  badge: '003',
  role: 'patrol',
  shift: 'SHIFT 1',
  image: PLACEHOLDER_IMAGES[2],
  weapons: ['MP5', 'AirTaser']
}, {
  id: 'emp-4',
  name: 'Lisa Brown',
  age: 26,
  gradeCode: 'SG-4',
  badge: '004',
  role: 'guard',
  shift: 'SHIFT 1',
  image: PLACEHOLDER_IMAGES[3],
  weapons: ['Glock']
}, {
  id: 'emp-5',
  name: 'David Lee',
  age: 40,
  gradeCode: 'SG-1',
  badge: '005',
  role: 'supervisor',
  shift: 'SHIFT 2',
  image: PLACEHOLDER_IMAGES[4],
  weapons: ['MP5', 'Glock']
}, {
  id: 'emp-6',
  name: 'Maria Garcia',
  age: 29,
  gradeCode: 'SG-2',
  badge: '006',
  role: 'coordinator',
  shift: 'SHIFT 2',
  image: PLACEHOLDER_IMAGES[5],
  weapons: ['Glock', 'AirTaser']
}, {
  id: 'emp-7',
  name: 'James Taylor',
  age: 33,
  gradeCode: 'SG-3',
  badge: '007',
  role: 'guard',
  shift: 'SHIFT 2',
  image: PLACEHOLDER_IMAGES[6],
  weapons: ['Glock']
}, {
  id: 'emp-8',
  name: 'Anna Davis',
  age: 27,
  gradeCode: 'SG-4',
  badge: '008',
  role: 'patrol',
  shift: 'SHIFT 2',
  image: PLACEHOLDER_IMAGES[7],
  weapons: ['MP5']
}];

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentShift, setCurrentShift] = useState('SHIFT 1');
  const [employees, setEmployees] = useState<EmployeeProfile[]>(EXAMPLE_EMPLOYEES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [supervisorAssignments, setSupervisorAssignments] = useState<Record<string, string | null>>({});
  const [coordinatorAssignments, setCoordinatorAssignments] = useState<Record<string, string | null>>({});

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initialize assignments with categorized gates
  useEffect(() => {
    const initialAssignments: Assignment[] = [
      // Available pool
      {
        id: 'unassigned',
        name: 'Available Employees',
        type: 'gate',
        employees: [],
        maxCapacity: 45
      },
      // Unavailable pool
      {
        id: 'unavailable',
        name: 'Unavailable Personnel',
        type: 'vacation',
        employees: [],
        maxCapacity: 20
      },
      // Create assignments for each area's gates
      ...Object.entries(GATE_AREAS).flatMap(([areaCode, areaData]) => [
        // Regular gates
        ...areaData.gates.map(gateName => ({
          id: `gate-${gateName.replace('G #', '').replace(' ', '')}`,
          name: gateName,
          type: 'gate' as const,
          employees: [],
          maxCapacity: 5,
          weaponAssigned: false,
          area: areaCode
        })),
        // VIP gates
        ...areaData.vipGates.map((vipGate, index) => ({
          id: `vip-${areaCode}-${index}`,
          name: vipGate,
          type: 'gate' as const,
          employees: [],
          maxCapacity: 5,
          weaponAssigned: false,
          area: areaCode
        }))
      ]),
      ...Array.from({
        length: 8
      }, (_, i) => ({
        id: `patrol-${i + 1}`,
        name: `Patrol ${i + 1}`,
        type: 'patrol' as const,
        employees: [],
        maxCapacity: 1,
        weaponAssigned: false
      })),
      {
        id: 'training',
        name: 'Training',
        type: 'training',
        employees: [],
        maxCapacity: 10
      },
      {
        id: 'vacation',
        name: 'Vacation',
        type: 'vacation',
        employees: [],
        maxCapacity: 20
      },
      {
        id: 'assignment',
        name: 'Assignment',
        type: 'training',
        employees: [],
        maxCapacity: 5
      },
      {
        id: 'm-time',
        name: 'M-Time',
        type: 'training',
        employees: [],
        maxCapacity: 5
      }
    ];
    setAssignments(initialAssignments);
  }, []);

  // Initialize unassigned pool with current shift employees
  useEffect(() => {
    const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);
    setAssignments(prev => prev.map(assignment => assignment.id === 'unassigned' ? {
      ...assignment,
      employees: currentShiftEmployees
    } : {
      ...assignment,
      employees: assignment.employees.filter(emp => emp.shift === currentShift)
    }));
  }, [currentShift, employees]);

  // Update unavailable personnel based on special assignments
  useEffect(() => {
    const specialAssignmentIds = ['training', 'vacation', 'assignment', 'm-time'];
    const unavailableEmployees: EmployeeProfile[] = [];

    // Collect all employees from special assignments
    assignments.forEach(assignment => {
      if (specialAssignmentIds.includes(assignment.id)) {
        unavailableEmployees.push(...assignment.employees);
      }
    });

    // Update unavailable personnel pool
    setAssignments(prev => prev.map(assignment => assignment.id === 'unavailable' ? {
      ...assignment,
      employees: unavailableEmployees
    } : assignment));
  }, [assignments]);

  const addEmployee = (employee: EmployeeProfile) => {
    setEmployees(prev => [...prev, employee]);
    setShowProfileForm(false);
  };

  const removeEmployee = (employeeId: string) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setAssignments(prev => prev.map(assignment => ({
      ...assignment,
      employees: assignment.employees.filter(emp => emp.id !== employeeId)
    })));
    
    // Clear supervisor/coordinator assignments if the deleted employee was assigned
    setSupervisorAssignments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(shift => {
        if (updated[shift] === employeeId) {
          updated[shift] = null;
        }
      });
      return updated;
    });
    
    setCoordinatorAssignments(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(shift => {
        if (updated[shift] === employeeId) {
          updated[shift] = null;
        }
      });
      return updated;
    });
    
    toast.success('Employee removed');
  };

  const toggleWeapon = (assignmentId: string) => {
    setAssignments(prev => prev.map(assignment => assignment.id === assignmentId ? {
      ...assignment,
      weaponAssigned: !assignment.weaponAssigned
    } : assignment));
    toast.success('Weapon status updated');
  };

  const onDragEnd = (result: any) => {
    const {
      destination,
      source,
      draggableId
    } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    const sourceAssignment = assignments.find(a => a.id === source.droppableId);
    const destAssignment = assignments.find(a => a.id === destination.droppableId);
    if (!sourceAssignment || !destAssignment) return;

    // Prevent dragging to unavailable personnel directly
    if (destination.droppableId === 'unavailable') {
      toast.error('Employees automatically become unavailable when assigned to Training, Vacation, Assignment, or M-Time');
      return;
    }

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
      case 'supervisor':
        return 'bg-red-500';
      case 'coordinator':
        return 'bg-blue-500';
      case 'patrol':
        return 'bg-purple-500';
      default:
        return 'bg-green-500';
    }
  };

  const getAssignmentColor = (type: string) => {
    switch (type) {
      case 'patrol':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      case 'training':
        return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
      case 'vacation':
        return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
    }
  };

  const addAssignment = (newAssignment: Omit<Assignment, 'employees'>) => {
    setAssignments(prev => [...prev, {
      ...newAssignment,
      employees: []
    }]);
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const assignSupervisor = (employeeId: string | null) => {
    setSupervisorAssignments(prev => ({
      ...prev,
      [currentShift]: employeeId
    }));
  };

  const assignCoordinator = (employeeId: string | null) => {
    setCoordinatorAssignments(prev => ({
      ...prev,
      [currentShift]: employeeId
    }));
  };

  // Calculate derived values that were missing
  const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);
  const supervisor = supervisorAssignments[currentShift] ? employees.find(emp => emp.id === supervisorAssignments[currentShift]) : currentShiftEmployees.find(emp => emp.role === 'supervisor');
  const coordinator = coordinatorAssignments[currentShift] ? employees.find(emp => emp.id === coordinatorAssignments[currentShift]) : currentShiftEmployees.find(emp => emp.role === 'coordinator');
  const unassignedPool = assignments.find(a => a.id === 'unassigned');
  const unavailablePool = assignments.find(a => a.id === 'unavailable');
  const patrolAssignments = assignments.filter(a => a.type === 'patrol');
  const specialAssignments = assignments.filter(a => (a.type === 'training' || a.type === 'vacation') && a.id !== 'unavailable');

  // Group gate assignments by area
  const gateAssignmentsByArea = Object.keys(GATE_AREAS).reduce((acc, areaCode) => {
    acc[areaCode] = assignments.filter(a => a.area === areaCode);
    return acc;
  }, {} as Record<string, Assignment[]>);

  // Calculate total gates
  const totalGates = Object.values(GATE_AREAS).reduce((total, area) => {
    return total + area.gates.length + area.vipGates.length;
  }, 0);

  return <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900">
      <div className="container mx-auto p-4 space-y-6">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <Shield className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Security Control Center
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Area-Based Assignment & Monitoring System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowProfileForm(!showProfileForm)} className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md" size="sm">
                <UserPlus size={16} className="mr-2" />
                Add Employee
              </Button>
              
              <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
                <Sun className="h-4 w-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="h-4 w-4" />
              </div>
            </div>
          </div>
          
          {/* Compact Stats Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Users size={18} />
                <div>
                  <div className="text-xs opacity-90">Active Personnel</div>
                  <div className="text-lg font-bold">{currentShiftEmployees.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <div>
                  <div className="text-xs opacity-90">Gates</div>
                  <div className="text-lg font-bold">{totalGates}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Car size={18} />
                <div>
                  <div className="text-xs opacity-90">Patrol</div>
                  <div className="text-lg font-bold">{patrolAssignments.length}</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg shadow-sm">
              <div className="flex items-center gap-2">
                <Activity size={18} />
                <div>
                  <div className="text-xs opacity-90">Current Shift</div>
                  <div className="text-lg font-bold">{currentShift.replace('SHIFT ', '')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employee Profile Form */}
        {showProfileForm && <EmployeeProfileForm currentShift={currentShift} onAddEmployee={addEmployee} onClose={() => setShowProfileForm(false)} />}

        {/* Shift Selector */}
        <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Clock size={18} />
                <span className="font-medium">Active Shift:</span>
              </div>
              {SHIFTS.map(shift => <Button key={shift} variant={currentShift === shift ? "default" : "outline"} onClick={() => setCurrentShift(shift)} className={currentShift === shift ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md' : 'border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'} size="sm">
                  {shift}
                </Button>)}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Manager */}
        <AssignmentManager assignments={assignments} onAddAssignment={addAssignment} onDeleteAssignment={deleteAssignment} />

        {/* Command Structure Manager */}
        <CommandStructureManager 
          shift={currentShift} 
          employees={employees} 
          supervisor={supervisor} 
          coordinator={coordinator} 
          onAssignSupervisor={assignSupervisor} 
          onAssignCoordinator={assignCoordinator}
          onDeleteEmployee={removeEmployee}
        />

        {/* Manpower Description */}
        <ManpowerDescription currentShift={currentShift} assignments={assignments} supervisor={supervisor} coordinator={coordinator} />

        {/* Shift Hierarchy */}
        <ShiftHierarchy shift={currentShift} supervisor={supervisor} coordinator={coordinator} darkMode={darkMode} />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Personnel Pools */}
            <div className="lg:col-span-1 space-y-4">
              {/* Available Employees Pool */}
              <Card className="bg-gradient-to-br from-emerald-50/90 to-green-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl border border-emerald-200/50 dark:border-slate-700/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-t-lg p-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Users size={16} />
                    Available Personnel
                    <Badge className="bg-white/20 text-white text-xs">
                      {unassignedPool?.employees.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`min-h-24 max-h-64 overflow-y-auto p-2 rounded-lg border-2 border-dashed transition-all ${snapshot.isDraggingOver ? 'border-emerald-400 bg-emerald-100/50 dark:bg-emerald-950/50' : 'border-slate-300/50 dark:border-slate-600/50'}`}>
                        {unassignedPool?.employees.map((employee, index) => <Draggable key={employee.id} draggableId={employee.id} index={index}>
                            {(provided, snapshot) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`p-2 mb-2 bg-white/90 dark:bg-slate-700/90 rounded-lg border shadow-sm cursor-move transition-all hover:shadow-md ${snapshot.isDragging ? 'rotate-1 shadow-lg scale-105' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6 border">
                                    <AvatarImage src={employee.image} alt={employee.name} />
                                    <AvatarFallback className="text-xs">
                                      {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs truncate">{employee.name}</div>
                                    <div className="text-xs text-slate-500">#{employee.badge}</div>
                                  </div>
                                  <Button size="sm" variant="ghost" onClick={() => removeEmployee(employee.id)} className="h-5 w-5 p-0 text-red-500 hover:bg-red-100">
                                    <Trash2 size={10} />
                                  </Button>
                                </div>
                              </div>}
                          </Draggable>)}
                        {provided.placeholder}
                      </div>}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Unavailable Personnel Pool */}
              <Card className="bg-gradient-to-br from-red-50/90 to-orange-50/90 dark:from-slate-800/90 dark:to-slate-900/90 backdrop-blur-xl border border-red-200/50 dark:border-slate-700/50 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg p-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <UserMinus size={16} />
                    Unavailable
                    <Badge className="bg-white/20 text-white text-xs">
                      {unavailablePool?.employees.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="min-h-16 max-h-32 overflow-y-auto p-2 rounded-lg border-2 border-dashed border-slate-300/50 bg-slate-50/50 dark:bg-slate-800/50">
                    {unavailablePool?.employees.map(employee => <div key={employee.id} className="p-2 mb-1 bg-white/50 dark:bg-slate-700/50 rounded opacity-75">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={employee.image} alt={employee.name} />
                            <AvatarFallback className="text-xs">
                              {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs truncate">{employee.name}</div>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Assignment Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Security Gates by Area */}
              {Object.entries(GATE_AREAS).map(([areaCode, areaData]) => <div key={areaCode} className="space-y-4">
                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${areaData.color} p-2 rounded-lg`}>
                        <MapPin className="text-white" size={20} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{areaData.name}</h3>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs">
                        {gateAssignmentsByArea[areaCode]?.length || 0} Gates
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {gateAssignmentsByArea[areaCode]?.map(assignment => <EnhancedGateCard key={assignment.id} assignment={assignment} onToggleWeapon={toggleWeapon} getAssignmentColor={getAssignmentColor} getRoleColor={getRoleColor} />)}
                    </div>
                  </div>
                  
                  {/* Area Notes Manager - Now available to all employees */}
                  <AreaNotesManager 
                    areaCode={areaCode}
                    areaName={areaData.name}
                    currentUser={supervisor || coordinator || currentShiftEmployees[0]}
                    employees={currentShiftEmployees}
                  />
                </div>)}

              {/* Special Assignments */}
              <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-xl shadow-lg border border-white/20 dark:border-slate-700/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                    <BarChart3 className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Special Assignments</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {specialAssignments.map(assignment => <EnhancedGateCard key={assignment.id} assignment={assignment} onToggleWeapon={toggleWeapon} getAssignmentColor={getAssignmentColor} getRoleColor={getRoleColor} />)}
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>;
};

export default Index;
