import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Users, Shield, Car, Clock, UserPlus, Trash2, Moon, Sun, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  badge: string;
  role: 'guard' | 'patrol' | 'supervisor';
  shift: string;
  image?: string;
}

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: Employee[];
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

// Example employees for testing with images
const EXAMPLE_EMPLOYEES: Employee[] = [
  { id: 'emp-1', name: 'John Smith', badge: '001', role: 'supervisor', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[0] },
  { id: 'emp-2', name: 'Sarah Johnson', badge: '002', role: 'guard', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[1] },
  { id: 'emp-3', name: 'Mike Wilson', badge: '003', role: 'patrol', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[2] },
  { id: 'emp-4', name: 'Lisa Brown', badge: '004', role: 'guard', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[3] },
  { id: 'emp-5', name: 'David Lee', badge: '005', role: 'patrol', shift: 'SHIFT 1', image: PLACEHOLDER_IMAGES[4] },
  { id: 'emp-6', name: 'Maria Garcia', badge: '006', role: 'guard', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[5] },
  { id: 'emp-7', name: 'James Taylor', badge: '007', role: 'supervisor', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[6] },
  { id: 'emp-8', name: 'Anna Davis', badge: '008', role: 'patrol', shift: 'SHIFT 2', image: PLACEHOLDER_IMAGES[7] },
  { id: 'emp-9', name: 'Robert Miller', badge: '009', role: 'guard', shift: 'SHIFT 3', image: PLACEHOLDER_IMAGES[0] },
  { id: 'emp-10', name: 'Jennifer Anderson', badge: '010', role: 'patrol', shift: 'SHIFT 3', image: PLACEHOLDER_IMAGES[1] },
  { id: 'emp-11', name: 'Michael Chen', badge: '011', role: 'supervisor', shift: 'SHIFT 3', image: PLACEHOLDER_IMAGES[2] },
  { id: 'emp-12', name: 'Emily Rodriguez', badge: '012', role: 'guard', shift: 'SHIFT 3', image: PLACEHOLDER_IMAGES[3] },
  { id: 'emp-13', name: 'Thomas White', badge: '013', role: 'patrol', shift: 'SHIFT 4', image: PLACEHOLDER_IMAGES[4] },
  { id: 'emp-14', name: 'Jessica Martinez', badge: '014', role: 'guard', shift: 'SHIFT 4', image: PLACEHOLDER_IMAGES[5] },
  { id: 'emp-15', name: 'Daniel Thompson', badge: '015', role: 'supervisor', shift: 'SHIFT 4', image: PLACEHOLDER_IMAGES[6] },
];

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentShift, setCurrentShift] = useState('SHIFT 1');
  const [employees, setEmployees] = useState<Employee[]>(EXAMPLE_EMPLOYEES);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeBadge, setNewEmployeeBadge] = useState('');
  const [selectedRole, setSelectedRole] = useState<'guard' | 'patrol' | 'supervisor'>('guard');

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
      
      // Security Gates with weapon tracking
      ...GATE_NUMBERS.map(num => ({
        id: `gate-${num}`,
        name: `G #${num}`,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 2,
        weaponAssigned: false
      })),
      
      // VIP Gates with weapon tracking
      ...VIP_GATES.map((gate, index) => ({
        id: `vip-${index}`,
        name: gate,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 2,
        weaponAssigned: false
      })),
      
      // Vehicle Patrols with weapon tracking
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `patrol-${i + 1}`,
        name: `Patrol ${i + 1}`,
        type: 'patrol' as const,
        employees: [],
        maxCapacity: 2,
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

  const addEmployee = () => {
    if (newEmployeeName.trim() && newEmployeeBadge.trim()) {
      // Get a random placeholder image
      const randomImage = PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)];
      
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: newEmployeeName.trim(),
        badge: newEmployeeBadge.trim(),
        role: selectedRole,
        shift: currentShift,
        image: randomImage
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      setNewEmployeeName('');
      setNewEmployeeBadge('');
      toast.success(`${newEmployee.name} added to ${currentShift}`);
    }
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
      case 'patrol': return 'bg-blue-500';
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
  const unassignedPool = assignments.find(a => a.id === 'unassigned');
  const gateAssignments = assignments.filter(a => a.type === 'gate' && a.id !== 'unassigned');
  const patrolAssignments = assignments.filter(a => a.type === 'patrol');
  const specialAssignments = assignments.filter(a => a.type === 'training' || a.type === 'vacation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="container mx-auto p-6">
        {/* Header with Dark Mode Toggle */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-3">
              <Shield className="text-blue-600 dark:text-blue-400" />
              YSOD Security Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">Employee Assignment & Shift Management System</p>
          </div>
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

        {/* Shift Selector */}
        <div className="mb-6 flex gap-4 items-center">
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
          <Badge variant="secondary" className="ml-4">
            {currentShiftEmployees.length} Employees
          </Badge>
        </div>

        {/* Add Employee Form */}
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-slate-200">
              <UserPlus size={20} />
              Add New Employee to {currentShift}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Employee Name</label>
                <Input
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                  className="dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Badge Number</label>
                <Input
                  value={newEmployeeBadge}
                  onChange={(e) => setNewEmployeeBadge(e.target.value)}
                  placeholder="Enter badge number"
                  className="dark:bg-slate-700 dark:border-slate-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
                >
                  <option value="guard">Security Guard</option>
                  <option value="patrol">Vehicle Patrol</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              <Button onClick={addEmployee} className="px-6">
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Available Employees Pool */}
            <div className="lg:col-span-1">
              <Card className="dark:bg-slate-800 dark:border-slate-700">
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
                                    <div className="text-xs text-gray-500 dark:text-gray-400">#{employee.badge}</div>
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
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-slate-200">
                  <Shield className="text-blue-600 dark:text-blue-400" />
                  Security Gates
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {gateAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center dark:text-slate-200 flex justify-between items-center">
                          <span>{assignment.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleWeapon(assignment.id)}
                            className={`p-1 h-6 w-6 ${assignment.weaponAssigned ? 'text-orange-500' : 'text-gray-400'}`}
                          >
                            <Zap size={12} />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Droppable droppableId={assignment.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-20 p-1 rounded border transition-colors ${
                                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-1 mb-1 bg-white dark:bg-slate-700 rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <Avatar className="h-5 w-5">
                                          <AvatarImage src={employee.image} alt={employee.name} />
                                          <AvatarFallback className="text-[8px]">
                                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate dark:text-slate-200">{employee.name}</div>
                                          <div className="text-gray-500 dark:text-gray-400">#{employee.badge}</div>
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
                  ))}
                </div>
              </div>

              {/* Vehicle Patrols */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-slate-200">
                  <Car className="text-blue-600 dark:text-blue-400" />
                  Vehicle Patrols
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {patrolAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center dark:text-slate-200 flex justify-between items-center">
                          <span>{assignment.name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleWeapon(assignment.id)}
                            className={`p-1 h-6 w-6 ${assignment.weaponAssigned ? 'text-orange-500' : 'text-gray-400'}`}
                          >
                            <Zap size={12} />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Droppable droppableId={assignment.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-24 p-2 rounded border transition-colors ${
                                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-2 mb-1 bg-white dark:bg-slate-700 rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={employee.image} alt={employee.name} />
                                          <AvatarFallback className="text-[10px]">
                                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium dark:text-slate-200 truncate">{employee.name}</div>
                                          <div className="text-gray-500 dark:text-gray-400">#{employee.badge}</div>
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
                  ))}
                </div>
              </div>

              {/* Special Assignments */}
              <div>
                <h3 className="text-xl font-semibold mb-4 dark:text-slate-200">Special Assignments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specialAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center dark:text-slate-200">
                          {assignment.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Droppable droppableId={assignment.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-24 p-2 rounded border transition-colors ${
                                snapshot.isDraggingOver ? 'border-orange-400 bg-orange-50 dark:bg-orange-950' : 'border-gray-200 dark:border-gray-600'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-2 mb-1 bg-white dark:bg-slate-700 rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={employee.image} alt={employee.name} />
                                          <AvatarFallback className="text-[10px]">
                                            {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium dark:text-slate-200 truncate">{employee.name}</div>
                                          <div className="text-gray-500 dark:text-gray-400">#{employee.badge}</div>
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
