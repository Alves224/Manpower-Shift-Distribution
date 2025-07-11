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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface DistributionRecord {
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

interface ManpowerDistributionProps {
  currentShift: string;
  assignments: Assignment[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
}

const ManpowerDistribution: React.FC<ManpowerDistributionProps> = ({
  currentShift,
  assignments,
  supervisor,
  coordinator
}) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [savedDistributions, setSavedDistributions] = useState<DistributionRecord[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<DistributionRecord | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load saved distributions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('manpowerDistributions');
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
        setSavedDistributions(parsed);
      } catch (error) {
        console.error('Error loading saved distributions:', error);
      }
    }
  }, []);

  // Save distributions to localStorage
  const saveDistributions = (distributions: DistributionRecord[]) => {
    localStorage.setItem('manpowerDistributions', JSON.stringify(distributions));
    setSavedDistributions(distributions);
  };

  const generatePDFContent = (record: DistributionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    
    let content = `MANPOWER DISTRIBUTION LIST\n`;
    content += `${dateRangeStr}\n`;
    content += `Shift: ${record.shift}\n`;
    content += `\n`;
    
    if (record.supervisor) {
      content += `Supervisor: ${record.supervisor.name} (Badge: ${record.supervisor.badge})\n`;
    }
    if (record.coordinator) {
      content += `Coordinator: ${record.coordinator.name} (Badge: ${record.coordinator.badge})\n`;
    }
    content += `\n`;

    // Create table format for PDF
    content += `${'ASSIGNMENT'.padEnd(25)} ${'NAME'.padEnd(25)} ${'BADGE'.padEnd(10)} ${'GRADE'.padEnd(8)} ${'AREA'.padEnd(10)}\n`;
    content += `${'-'.repeat(80)}\n`;

    // Group assignments by area for better organization
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
      } else {
        otherAssignments.push(assignment);
      }
    });

    // Add gate areas to table
    Object.entries(gateAreas).forEach(([areaCode, areaData]) => {
      if (areaData.assignments.length > 0) {
        areaData.assignments.forEach(assignment => {
          assignment.employees.forEach(emp => {
            content += `${assignment.name.padEnd(25)} ${emp.name.padEnd(25)} ${emp.badge.padEnd(10)} ${emp.gradeCode.padEnd(8)} ${areaCode.padEnd(10)}\n`;
          });
          if (assignment.employees.length === 0) {
            content += `${assignment.name.padEnd(25)} ${'No personnel assigned'.padEnd(25)} ${'-'.padEnd(10)} ${'-'.padEnd(8)} ${areaCode.padEnd(10)}\n`;
          }
        });
      }
    });

    // Add other assignments (patrols, training, etc.)
    otherAssignments.forEach(assignment => {
      assignment.employees.forEach(emp => {
        const assignmentType = assignment.type.toUpperCase();
        content += `${assignment.name.padEnd(25)} ${emp.name.padEnd(25)} ${emp.badge.padEnd(10)} ${emp.gradeCode.padEnd(8)} ${assignmentType.padEnd(10)}\n`;
      });
      if (assignment.employees.length === 0) {
        const assignmentType = assignment.type.toUpperCase();
        content += `${assignment.name.padEnd(25)} ${'No personnel assigned'.padEnd(25)} ${'-'.padEnd(10)} ${'-'.padEnd(8)} ${assignmentType.padEnd(10)}\n`;
      }
    });

    content += `${'-'.repeat(80)}\n`;
    content += `\nTotal Personnel: ${record.assignments.reduce((total, assignment) => total + assignment.employees.length, 0)}\n`;

    if (record.notes) {
      content += `\nNotes:\n${record.notes}\n`;
    }

    content += `\nGenerated on: ${format(new Date(), 'PPP p')}\n`;

    return content;
  };

  const createPDFBlob = (record: DistributionRecord) => {
    const content = generatePDFContent(record);
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  };

  const downloadAsPDF = (record: DistributionRecord) => {
    const blob = createPDFBlob(record);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateRangeStr = `${format(record.dateRange.start, 'MMM-d')}_to_${format(record.dateRange.end, 'MMM-d-yyyy')}`;
    a.download = `manpower_distribution_${dateRangeStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Distribution downloaded successfully');
  };

  const printDistribution = (record: DistributionRecord) => {
    const content = generatePDFContent(record);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Manpower Distribution</title>
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

  const sendByEmail = (record: DistributionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    const subject = `YSOD ${record.shift} Manpower Distribution for ${dateRangeStr}`;
    
    // Simplified email body as requested
    const emailBody = `Greetings All,

Please find attached the YSOD ${record.shift} manpower distribution for the period ${dateRangeStr}.

Best regards,
Security Operations Team`;

    // Create the PDF file for attachment
    const blob = createPDFBlob(record);
    const url = URL.createObjectURL(blob);
    
    // Create a downloadable link for the attachment
    const attachmentLink = document.createElement('a');
    attachmentLink.href = url;
    const filename = `YSOD_${record.shift}_Manpower_Distribution_${format(record.dateRange.start, 'MMM-d')}_to_${format(record.dateRange.end, 'MMM-d-yyyy')}.txt`;
    attachmentLink.download = filename;
    
    // Download the file first (user can then attach it manually)
    document.body.appendChild(attachmentLink);
    attachmentLink.click();
    document.body.removeChild(attachmentLink);
    
    // Open email client with the simplified body
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    setTimeout(() => {
      window.open(mailtoLink);
      URL.revokeObjectURL(url);
      toast.success('Email client opened and PDF downloaded for attachment');
    }, 500);
  };

  const saveCurrentDistribution = () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    const newRecord: DistributionRecord = {
      id: Date.now().toString(),
      dateRange: { start: startDate, end: endDate },
      shift: currentShift,
      assignments: assignments.filter(a => a.employees.length > 0),
      supervisor,
      coordinator,
      notes,
      createdAt: new Date()
    };

    const updated = [newRecord, ...savedDistributions];
    saveDistributions(updated);
    toast.success('Distribution saved successfully');
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

  // Helper function to render assignment table
  const renderAssignmentTable = (assignments: Assignment[]) => {
    const allEmployees: Array<{ assignment: string; employee: EmployeeProfile; area?: string }> = [];
    
    assignments.forEach(assignment => {
      assignment.employees.forEach(employee => {
        allEmployees.push({
          assignment: assignment.name,
          employee,
          area: assignment.area || assignment.type.toUpperCase()
        });
      });
    });

    return (
      <div className="mt-4">
        <h4 className="font-medium mb-2">Personnel Assignment Table</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assignment</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Badge</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Area/Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEmployees.length > 0 ? (
              allEmployees.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.assignment}</TableCell>
                  <TableCell>{item.employee.name}</TableCell>
                  <TableCell>{item.employee.badge}</TableCell>
                  <TableCell>{item.employee.gradeCode}</TableCell>
                  <TableCell>{item.area}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No personnel assigned
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-2 text-sm text-muted-foreground">
          Total Personnel: {allEmployees.length}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Main Actions */}
      <div className="flex gap-3">
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <FileText size={16} className="mr-2" />
              Create Distribution
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manpower Distribution</DialogTitle>
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
                  placeholder="Add any additional notes about this distribution..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Current Assignment Preview with Table */}
              {startDate && endDate && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Distribution Preview</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Week: {format(startDate, 'MMMM d')} to {format(endDate, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Shift: {currentShift}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Active Assignments: {assignments.filter(a => a.employees.length > 0).length}
                  </p>
                  
                  {/* Show the assignment table */}
                  {renderAssignmentTable(assignments.filter(a => a.employees.length > 0))}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveCurrentDistribution} className="flex-1">
                  Save Distribution
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
              View History ({savedDistributions.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Distribution History</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {savedDistributions.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No saved distributions yet</p>
              ) : (
                savedDistributions.map((record) => (
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
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printDistribution(record)}
                          >
                            <Printer size={14} className="mr-1" />
                            Print
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendByEmail(record)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                          >
                            <Mail size={14} className="mr-1" />
                            Email with Attachment
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

export default ManpowerDistribution;
