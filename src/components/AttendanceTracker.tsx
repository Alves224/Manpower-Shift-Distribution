
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarIcon, Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { format, isToday, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { EmployeeProfile } from './EmployeeProfileForm';
import { toast } from 'sonner';

interface AttendanceRecord {
  employeeId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
  shift: string;
}

interface AttendanceTrackerProps {
  employees: EmployeeProfile[];
  currentShift: string;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  employees,
  currentShift
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showWeekView, setShowWeekView] = useState(false);

  // Load attendance records from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('attendance_records');
    if (stored) {
      try {
        setAttendanceRecords(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to load attendance records:', error);
      }
    }
  }, []);

  // Save attendance records to localStorage
  useEffect(() => {
    localStorage.setItem('attendance_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const currentShiftEmployees = employees.filter(emp => emp.shift === currentShift);

  const markAttendance = (
    employeeId: string, 
    status: AttendanceRecord['status'], 
    notes?: string
  ) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const now = new Date();
    
    setAttendanceRecords(prev => {
      const existing = prev.find(
        record => record.employeeId === employeeId && 
                 record.date === dateStr && 
                 record.shift === currentShift
      );

      if (existing) {
        return prev.map(record => 
          record.employeeId === employeeId && record.date === dateStr && record.shift === currentShift
            ? { 
                ...record, 
                status, 
                notes,
                checkIn: status === 'present' && !record.checkIn ? format(now, 'HH:mm') : record.checkIn
              }
            : record
        );
      } else {
        return [...prev, {
          employeeId,
          date: dateStr,
          status,
          shift: currentShift,
          checkIn: status === 'present' ? format(now, 'HH:mm') : undefined,
          notes
        }];
      }
    });

    const employee = employees.find(emp => emp.id === employeeId);
    toast.success(`${employee?.name} marked as ${status}`);
  };

  const getAttendanceForDate = (employeeId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendanceRecords.find(
      record => record.employeeId === employeeId && 
               record.date === dateStr && 
               record.shift === currentShift
    );
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      late: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
      excused: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle }
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <Icon size={12} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const exportAttendanceData = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    
    const weekData = attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= weekStart && 
             recordDate <= weekEnd && 
             record.shift === currentShift;
    });

    const csvContent = [
      ['Date', 'Employee', 'Badge', 'Status', 'Check In', 'Check Out', 'Notes'].join(','),
      ...weekData.map(record => {
        const employee = employees.find(emp => emp.id === record.employeeId);
        return [
          record.date,
          employee?.name || 'Unknown',
          employee?.badge || '',
          record.status,
          record.checkIn || '',
          record.checkOut || '',
          record.notes || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${format(weekStart, 'yyyy-MM-dd')}_to_${format(weekEnd, 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Attendance data exported successfully');
  };

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayRecords = attendanceRecords.filter(
      record => record.date === today && record.shift === currentShift
    );

    return {
      present: todayRecords.filter(r => r.status === 'present').length,
      absent: todayRecords.filter(r => r.status === 'absent').length,
      late: todayRecords.filter(r => r.status === 'late').length,
      total: currentShiftEmployees.length
    };
  };

  const todayStats = getTodayStats();

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={20} />
              <div>
                <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
                <div className="text-sm text-gray-600">Present Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="text-red-600" size={20} />
              <div>
                <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
                <div className="text-sm text-gray-600">Absent Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="text-yellow-600" size={20} />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{todayStats.late}</div>
                <div className="text-sm text-gray-600">Late Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-blue-600" size={20} />
              <div>
                <div className="text-2xl font-bold">{Math.round((todayStats.present / todayStats.total) * 100) || 0}%</div>
                <div className="text-sm text-gray-600">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-3 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon size={16} />
              {format(selectedDate, 'PPP')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant={showWeekView ? "default" : "outline"}
          onClick={() => setShowWeekView(!showWeekView)}
        >
          {showWeekView ? 'Day View' : 'Week View'}
        </Button>

        <Button variant="outline" onClick={exportAttendanceData} className="gap-2">
          <Download size={16} />
          Export CSV
        </Button>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance for {format(selectedDate, 'PPPP')} - {currentShift}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentShiftEmployees.map(employee => {
                const attendance = getAttendanceForDate(employee.id, selectedDate);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>#{employee.badge}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {attendance ? getStatusBadge(attendance.status) : (
                        <Badge variant="outline">Not marked</Badge>
                      )}
                    </TableCell>
                    <TableCell>{attendance?.checkIn || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(employee.id, 'present')}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(employee.id, 'absent')}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Absent
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAttendance(employee.id, 'late')}
                          className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                        >
                          Late
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;
