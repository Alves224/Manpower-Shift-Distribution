
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Download, Mail, FileText, History, Printer } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
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

interface DescriptionRecord {
  id: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  shift: string;
  assignments: Assignment[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
  notes?: string;
  createdAt: Date;
}

interface ManpowerDescriptionProps {
  currentShift: string;
  assignments: Assignment[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
}

const ManpowerDescription: React.FC<ManpowerDescriptionProps> = ({
  currentShift,
  assignments,
  supervisor,
  coordinator
}) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [savedDescriptions, setSavedDescriptions] = useState<DescriptionRecord[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<DescriptionRecord | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load saved descriptions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('manpowerDescriptions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((record: any) => ({
          ...record,
          dateRange: {
            start: new Date(record.dateRange.start),
            end: new Date(record.dateRange.end)
          },
          createdAt: new Date(record.createdAt)
        }));
        setSavedDescriptions(parsed);
      } catch (error) {
        console.error('Error loading saved descriptions:', error);
      }
    }
  }, []);

  // Save descriptions to localStorage
  const saveDescriptions = (descriptions: DescriptionRecord[]) => {
    localStorage.setItem('manpowerDescriptions', JSON.stringify(descriptions));
    setSavedDescriptions(descriptions);
  };

  const generatePDFContent = (record: DescriptionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    
    let content = `MANPOWER DESCRIPTION LIST\n`;
    content += `${dateRangeStr}\n`;
    content += `Shift: ${record.shift}\n\n`;
    
    if (record.supervisor) {
      content += `Supervisor: ${record.supervisor.name} (Badge: ${record.supervisor.badge})\n`;
    }
    if (record.coordinator) {
      content += `Coordinator: ${record.coordinator.name} (Badge: ${record.coordinator.badge})\n`;
    }
    content += `\n`;

    // Group assignments by area
    const gateAreas = {
      NGL: { name: 'NGL Area', assignments: [] as Assignment[] },
      YRD: { name: 'YRD Area', assignments: [] as Assignment[] },
      BUP: { name: 'BUP Area', assignments: [] as Assignment[] },
      HUH: { name: 'HUH Area', assignments: [] as Assignment[] },
      YNT: { name: 'YNT Area', assignments: [] as Assignment[] }
    };

    const otherAssignments: Assignment[] = [];

    record.assignments.forEach(assignment => {
      if (assignment.area && gateAreas[assignment.area as keyof typeof gateAreas]) {
        gateAreas[assignment.area as keyof typeof gateAreas].assignments.push(assignment);
      } else if (assignment.type !== 'gate') {
        otherAssignments.push(assignment);
      }
    });

    // Add gate areas
    Object.entries(gateAreas).forEach(([areaCode, areaData]) => {
      if (areaData.assignments.length > 0) {
        content += `${areaData.name}:\n`;
        areaData.assignments.forEach(assignment => {
          content += `  ${assignment.name}:\n`;
          assignment.employees.forEach(emp => {
            content += `    - ${emp.name} (Badge: ${emp.badge}, Grade: ${emp.gradeCode})\n`;
          });
          if (assignment.employees.length === 0) {
            content += `    - No personnel assigned\n`;
          }
        });
        content += `\n`;
      }
    });

    // Add patrols
    const patrols = otherAssignments.filter(a => a.type === 'patrol');
    if (patrols.length > 0) {
      content += `Vehicle Patrols:\n`;
      patrols.forEach(assignment => {
        content += `  ${assignment.name}:\n`;
        assignment.employees.forEach(emp => {
          content += `    - ${emp.name} (Badge: ${emp.badge}, Grade: ${emp.gradeCode})\n`;
        });
        if (assignment.employees.length === 0) {
          content += `    - No personnel assigned\n`;
        }
      });
      content += `\n`;
    }

    // Add special assignments
    const special = otherAssignments.filter(a => a.type === 'training' || a.type === 'vacation');
    if (special.length > 0) {
      content += `Special Assignments:\n`;
      special.forEach(assignment => {
        content += `  ${assignment.name}:\n`;
        assignment.employees.forEach(emp => {
          content += `    - ${emp.name} (Badge: ${emp.badge}, Grade: ${emp.gradeCode})\n`;
        });
        if (assignment.employees.length === 0) {
          content += `    - No personnel assigned\n`;
        }
      });
      content += `\n`;
    }

    if (record.notes) {
      content += `Notes:\n${record.notes}\n`;
    }

    return content;
  };

  const downloadAsPDF = (record: DescriptionRecord) => {
    const content = generatePDFContent(record);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateRangeStr = `${format(record.dateRange.start, 'MMM-d')}_to_${format(record.dateRange.end, 'MMM-d-yyyy')}`;
    a.download = `manpower_description_${dateRangeStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Description downloaded as PDF');
  };

  const printDescription = (record: DescriptionRecord) => {
    const content = generatePDFContent(record);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Manpower Description</title>
            <style>
              body { font-family: Arial, sans-serif; white-space: pre-line; padding: 20px; }
              h1 { color: #333; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sendByEmail = (record: DescriptionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    const subject = `Manpower Description List for ${dateRangeStr}`;
    const body = generatePDFContent(record);
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    toast.success('Email client opened with description');
  };

  const saveCurrentDescription = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const newRecord: DescriptionRecord = {
      id: Date.now().toString(),
      dateRange: { start: startDate, end: endDate },
      shift: currentShift,
      assignments: assignments.filter(a => a.employees.length > 0),
      supervisor,
      coordinator,
      notes,
      createdAt: new Date()
    };

    const updated = [newRecord, ...savedDescriptions];
    saveDescriptions(updated);
    toast.success('Description saved successfully');
    setShowCreateDialog(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setNotes('');
  };

  const setWeekRange = (startOfWeek: Date) => {
    setStartDate(startOfWeek);
    setEndDate(addDays(startOfWeek, 6));
  };

  const setCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = subDays(today, dayOfWeek);
    setWeekRange(startOfWeek);
  };

  return (
    <div className="space-y-4">
      {/* Main Actions */}
      <div className="flex gap-3">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <FileText size={16} className="mr-2" />
              Create Description
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manpower Description</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Date Range Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Quick Week Selection */}
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={setCurrentWeek}>
                  Current Week
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setWeekRange(subDays(new Date(), 7))}>
                  Last Week
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setWeekRange(addDays(new Date(), 7))}>
                  Next Week
                </Button>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any additional notes about this description..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Current Assignment Preview */}
              {startDate && endDate && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Description Preview</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Week: {format(startDate, 'MMMM d')} to {format(endDate, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Shift: {currentShift}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Active Assignments: {assignments.filter(a => a.employees.length > 0).length}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveCurrentDescription} className="flex-1">
                  Save Description
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <History size={16} className="mr-2" />
              View History ({savedDescriptions.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Description History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {savedDescriptions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No saved descriptions yet</p>
              ) : (
                savedDescriptions.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div>
                          {format(record.dateRange.start, 'MMM d')} - {format(record.dateRange.end, 'MMM d, yyyy')}
                          <Badge variant="secondary" className="ml-2">{record.shift}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadAsPDF(record)}
                          >
                            <Download size={14} className="mr-1" />
                            PDF
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printDescription(record)}
                          >
                            <Printer size={14} className="mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendByEmail(record)}
                          >
                            <Mail size={14} className="mr-1" />
                            Email
                          </Button>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p>Created: {format(record.createdAt, 'PPP p')}</p>
                        <p>Active Assignments: {record.assignments.length}</p>
                        {record.supervisor && <p>Supervisor: {record.supervisor.name}</p>}
                        {record.coordinator && <p>Coordinator: {record.coordinator.name}</p>}
                        {record.notes && (
                          <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded">
                            <p className="text-xs font-medium">Notes:</p>
                            <p className="text-xs">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ManpowerDescription;
