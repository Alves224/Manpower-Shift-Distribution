
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Shield, Car, Clock, UserPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Employee {
  id: string;
  name: string;
  badge: string;
  role: 'guard' | 'patrol' | 'supervisor';
  shift: string;
}

interface Assignment {
  id: string;
  name: string;
  type: 'gate' | 'patrol' | 'training' | 'vacation';
  employees: Employee[];
  maxCapacity: number;
}

const SHIFTS = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3'];
const GATE_NUMBERS = Array.from({ length: 24 }, (_, i) => i + 1);
const VIP_GATES = ['V/P #014', 'V/P #05', 'V/P #09', 'V/P #06', 'V/P #011', 'V/P #07', 'V/P #03', 'V/P #010', 'V/P #21', 'V/P #22'];

const Index = () => {
  const [currentShift, setCurrentShift] = useState('SHIFT 1');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeBadge, setNewEmployeeBadge] = useState('');
  const [selectedRole, setSelectedRole] = useState<'guard' | 'patrol' | 'supervisor'>('guard');

  // Initialize assignments
  useEffect(() => {
    const initialAssignments: Assignment[] = [
      // Unassigned pool
      { id: 'unassigned', name: 'Available Employees', type: 'gate', employees: [], maxCapacity: 50 },
      
      // Security Gates
      ...GATE_NUMBERS.map(num => ({
        id: `gate-${num}`,
        name: `G #${num}`,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 2
      })),
      
      // VIP Gates
      ...VIP_GATES.map((gate, index) => ({
        id: `vip-${index}`,
        name: gate,
        type: 'gate' as const,
        employees: [],
        maxCapacity: 2
      })),
      
      // Vehicle Patrols
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `patrol-${i + 1}`,
        name: `Patrol ${i + 1}`,
        type: 'patrol' as const,
        employees: [],
        maxCapacity: 2
      })),
      
      // Special assignments
      { id: 'training', name: 'Training', type: 'training', employees: [], maxCapacity: 10 },
      { id: 'vacation', name: 'Vacation', type: 'vacation', employees: [], maxCapacity: 20 },
      { id: 'assignment', name: 'Assignment', type: 'training', employees: [], maxCapacity: 5 },
      { id: 'm-time', name: 'M-Time', type: 'training', employees: [], maxCapacity: 5 }
    ];
    
    setAssignments(initialAssignments);
  }, []);

  const addEmployee = () => {
    if (newEmployeeName.trim() && newEmployeeBadge.trim()) {
      const newEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: newEmployeeName.trim(),
        badge: newEmployeeBadge.trim(),
        role: selectedRole,
        shift: currentShift
      };
      
      setEmployees(prev => [...prev, newEmployee]);
      
      // Add to unassigned pool
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === 'unassigned' 
            ? { ...assignment, employees: [...assignment.employees, newEmployee] }
            : assignment
        )
      );
      
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
      case 'patrol': return 'border-blue-200 bg-blue-50';
      case 'training': return 'border-orange-200 bg-orange-50';
      case 'vacation': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);
  const unassignedPool = assignments.find(a => a.id === 'unassigned');
  const gateAssignments = assignments.filter(a => a.type === 'gate' && a.id !== 'unassigned');
  const patrolAssignments = assignments.filter(a => a.type === 'patrol');
  const specialAssignments = assignments.filter(a => a.type === 'training' || a.type === 'vacation');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
            <Shield className="text-blue-600" />
            YSOD Security Dashboard
          </h1>
          <p className="text-slate-600">Employee Assignment & Shift Management System</p>
        </div>

        {/* Shift Selector */}
        <div className="mb-6 flex gap-4 items-center">
          <Clock className="text-slate-600" />
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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus size={20} />
              Add New Employee to {currentShift}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Employee Name</label>
                <Input
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Badge Number</label>
                <Input
                  value={newEmployeeBadge}
                  onChange={(e) => setNewEmployeeBadge(e.target.value)}
                  placeholder="Enter badge number"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Users size={20} />
                    Available ({unassignedPool?.employees.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="unassigned">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-32 p-2 rounded border-2 border-dashed transition-colors ${
                          snapshot.isDraggingOver ? 'border-green-400 bg-green-50' : 'border-gray-300'
                        }`}
                      >
                        {unassignedPool?.employees.map((employee, index) => (
                          <Draggable key={employee.id} draggableId={employee.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-2 mb-2 bg-white rounded border shadow-sm cursor-move transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'rotate-2 shadow-lg' : ''
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="font-semibold text-sm">{employee.name}</div>
                                    <div className="text-xs text-gray-500">#{employee.badge}</div>
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
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="text-blue-600" />
                  Security Gates
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {gateAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center">
                          {assignment.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <Droppable droppableId={assignment.id}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`min-h-20 p-1 rounded border transition-colors ${
                                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-1 mb-1 bg-white rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="font-medium truncate">{employee.name}</div>
                                      <div className="text-gray-500">#{employee.badge}</div>
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
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Car className="text-blue-600" />
                  Vehicle Patrols
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {patrolAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center">
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
                                snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-2 mb-1 bg-white rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="font-medium">{employee.name}</div>
                                      <div className="text-gray-500">#{employee.badge}</div>
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
                <h3 className="text-xl font-semibold mb-4">Special Assignments</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {specialAssignments.map(assignment => (
                    <Card key={assignment.id} className={`${getAssignmentColor(assignment.type)} transition-all hover:shadow-md`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-center">
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
                                snapshot.isDraggingOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200'
                              }`}
                            >
                              {assignment.employees.map((employee, index) => (
                                <Draggable key={employee.id} draggableId={employee.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`p-2 mb-1 bg-white rounded text-xs border cursor-move transition-all hover:shadow-sm ${
                                        snapshot.isDragging ? 'shadow-md' : ''
                                      }`}
                                    >
                                      <div className="font-medium">{employee.name}</div>
                                      <div className="text-gray-500">#{employee.badge}</div>
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
