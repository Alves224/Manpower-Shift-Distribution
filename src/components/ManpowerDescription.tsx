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

  const generateStructuredContent = (record: DistributionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    
    // Create structured data for table format
    const tableData: Array<{
      goal: string;
      owner: string;
      status: string;
      currentState: string;
      desiredState: string;
      gap: string;
      risk: string;
      priority: string;
      comments: string;
    }> = [];

    // Group assignments by area for better organization
    const gateAreas = {
      NGL: { name: 'NGL Area Gates', assignments: [] as Assignment[] },
      YRD: { name: 'YRD Area Gates', assignments: [] as Assignment[] },
      BUP: { name: 'BUP Area Gates', assignments: [] as Assignment[] },
      HUH: { name: 'HUH Area Gates', assignments: [] as Assignment[] },
      YNT: { name: 'YNT Area Gates', assignments: [] as Assignment[] }
    };

    const otherAssignments: Assignment[] = [];

    // Categorize assignments
    record.assignments.forEach(assignment => {
      if (assignment.area && gateAreas[assignment.area as keyof typeof gateAreas]) {
        gateAreas[assignment.area as keyof typeof gateAreas].assignments.push(assignment);
      } else {
        otherAssignments.push(assignment);
      }
    });

    // Process gate areas
    Object.entries(gateAreas).forEach(([areaCode, areaData]) => {
      if (areaData.assignments.length > 0) {
        const totalAssigned = areaData.assignments.reduce((sum, assignment) => sum + assignment.employees.length, 0);
        const totalCapacity = areaData.assignments.reduce((sum, assignment) => sum + assignment.maxCapacity, 0);
        const gapAnalysis = totalCapacity - totalAssigned;
        
        tableData.push({
          goal: areaData.name,
          owner: supervisor?.name || 'Supervisor',
          status: gapAnalysis === 0 ? 'Fully Staffed' : gapAnalysis > 0 ? 'Under Staffed' : 'Over Staffed',
          currentState: totalAssigned.toString(),
          desiredState: totalCapacity.toString(),
          gap: gapAnalysis > 0 ? `Need ${gapAnalysis}` : gapAnalysis < 0 ? `Excess ${Math.abs(gapAnalysis)}` : 'Balanced',
          risk: gapAnalysis > 2 ? 'High' : gapAnalysis > 0 ? 'Medium' : 'Low',
          priority: gapAnalysis > 2 ? 'High' : gapAnalysis > 0 ? 'Medium' : 'Low',
          comments: `${areaData.assignments.length} gates assigned`
        });
      }
    });

    // Process other assignments
    ['patrol', 'training', 'vacation'].forEach(type => {
      const typeAssignments = otherAssignments.filter(a => a.type === type);
      if (typeAssignments.length > 0) {
        const totalAssigned = typeAssignments.reduce((sum, assignment) => sum + assignment.employees.length, 0);
        const totalCapacity = typeAssignments.reduce((sum, assignment) => sum + assignment.maxCapacity, 0);
        const gapAnalysis = totalCapacity - totalAssigned;
        
        tableData.push({
          goal: `${type.charAt(0).toUpperCase() + type.slice(1)} Operations`,
          owner: coordinator?.name || 'Coordinator',
          status: totalAssigned > 0 ? 'Active' : 'Available',
          currentState: totalAssigned.toString(),
          desiredState: 'Variable',
          gap: gapAnalysis > 0 ? `Capacity ${gapAnalysis}` : 'At Capacity',
          risk: 'Low',
          priority: type === 'patrol' ? 'High' : 'Medium',
          comments: `${typeAssignments.length} ${type} assignments`
        });
      }
    });

    return { dateRangeStr, tableData };
  };

  const generatePDFContent = (record: DistributionRecord) => {
    const { dateRangeStr, tableData } = generateStructuredContent(record);
    
    let content = `YSOD SECURITY MANPOWER DISTRIBUTION PLAN\n`;
    content += `Period: ${dateRangeStr}\n`;
    content += `Shift: ${record.shift}\n`;
    content += `Generated: ${format(new Date(), 'PPP p')}\n\n`;
    
    if (record.supervisor) {
      content += `Supervisor: ${record.supervisor.name} (Badge: ${record.supervisor.badge})\n`;
    }
    if (record.coordinator) {
      content += `Coordinator: ${record.coordinator.name} (Badge: ${record.coordinator.badge})\n`;
    }
    content += '\n';

    // Create structured table
    content += `${'GOAL/AREA'.padEnd(25)} ${'OWNER'.padEnd(15)} ${'STATUS'.padEnd(12)} ${'CURRENT'.padEnd(8)} ${'DESIRED'.padEnd(8)} ${'GAP'.padEnd(12)} ${'RISK'.padEnd(8)} ${'PRIORITY'.padEnd(10)} ${'COMMENTS'.padEnd(20)}\n`;
    content += `${'-'.repeat(120)}\n`;

    tableData.forEach(row => {
      content += `${row.goal.padEnd(25)} ${row.owner.padEnd(15)} ${row.status.padEnd(12)} ${row.currentState.padEnd(8)} ${row.desiredState.padEnd(8)} ${row.gap.padEnd(12)} ${row.risk.padEnd(8)} ${row.priority.padEnd(10)} ${row.comments.padEnd(20)}\n`;
    });

    content += `${'-'.repeat(120)}\n`;
    
    // Personnel Details Section
    content += `\nDETAILED PERSONNEL ASSIGNMENT:\n`;
    content += `${'-'.repeat(60)}\n`;
    
    record.assignments.forEach(assignment => {
      if (assignment.employees.length > 0) {
        content += `\n${assignment.name.toUpperCase()}:\n`;
        assignment.employees.forEach(emp => {
          content += `  • ${emp.name} (Badge: ${emp.badge}, Grade: ${emp.gradeCode})\n`;
        });
      }
    });

    const totalPersonnel = record.assignments.reduce((total, assignment) => total + assignment.employees.length, 0);
    content += `\nTOTAL ACTIVE PERSONNEL: ${totalPersonnel}\n`;

    if (record.notes) {
      content += `\nADDITIONAL NOTES:\n${record.notes}\n`;
    }

    return content;
  };

  const generateHTMLTable = (record: DistributionRecord) => {
    const { dateRangeStr, tableData } = generateStructuredContent(record);
    
    let html = `
      <html>
        <head>
          <title>YSOD Security Manpower Distribution Plan</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              background-color: #f5f5f5;
            }
            .header {
              background: linear-gradient(135deg, #1e40af, #7c3aed);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            .header p {
              margin: 5px 0;
              opacity: 0.9;
            }
            .info-section {
              background: white;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            th { 
              background: linear-gradient(135deg, #f97316, #dc2626);
              color: white; 
              padding: 12px 8px; 
              text-align: left; 
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
            }
            td { 
              padding: 10px 8px; 
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            tr:nth-child(even) { 
              background-color: #f9fafb; 
            }
            tr:hover {
              background-color: #f3f4f6;
            }
            .status-active { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .status-staffed { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .status-under { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .priority-high { background-color: #fca5a5; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .priority-medium { background-color: #fcd34d; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .priority-low { background-color: #a7f3d0; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .risk-high { background-color: #fca5a5; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
            .risk-medium { background-color: #fcd34d; color: #92400e; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .risk-low { background-color: #a7f3d0; color: #065f46; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
            .footer {
              margin-top: 20px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YSOD SECURITY MANPOWER DISTRIBUTION PLAN</h1>
            <p>Period: ${dateRangeStr} | Shift: ${record.shift}</p>
          </div>
          
          <div class="info-section">
            <strong>Command Structure:</strong><br>
            ${record.supervisor ? `Supervisor: ${record.supervisor.name} (Badge: ${record.supervisor.badge})<br>` : ''}
            ${record.coordinator ? `Coordinator: ${record.coordinator.name} (Badge: ${record.coordinator.badge})<br>` : ''}
            <strong>Total Active Personnel:</strong> ${record.assignments.reduce((total, assignment) => total + assignment.employees.length, 0)}
          </div>

          <table>
            <thead>
              <tr>
                <th>Goal/Area</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Current</th>
                <th>Desired</th>
                <th>Gap</th>
                <th>Risk</th>
                <th>Priority</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>`;

    tableData.forEach(row => {
      const statusClass = row.status.includes('Fully') ? 'status-staffed' : 
                         row.status.includes('Under') ? 'status-under' : 'status-active';
      const priorityClass = `priority-${row.priority.toLowerCase()}`;
      const riskClass = `risk-${row.risk.toLowerCase()}`;
      
      html += `
              <tr>
                <td><strong>${row.goal}</strong></td>
                <td>${row.owner}</td>
                <td><span class="${statusClass}">${row.status}</span></td>
                <td>${row.currentState}</td>
                <td>${row.desiredState}</td>
                <td>${row.gap}</td>
                <td><span class="${riskClass}">${row.risk}</span></td>
                <td><span class="${priorityClass}">${row.priority}</span></td>
                <td>${row.comments}</td>
              </tr>`;
    });

    html += `
            </tbody>
          </table>
          
          <div class="footer">
            Generated on ${format(new Date(), 'PPP p')} | YSOD Security Operations
          </div>
        </body>
      </html>`;

    return html;
  };

  const createPDFBlob = (record: DistributionRecord) => {
    const content = generatePDFContent(record);
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  };

  const downloadAsPDF = (record: DistributionRecord) => {
    const content = generatePDFContent(record);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateRangeStr = `${format(record.dateRange.start, 'MMM-d')}_to_${format(record.dateRange.end, 'MMM-d-yyyy')}`;
    a.download = `YSOD_Manpower_Distribution_${dateRangeStr}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Distribution downloaded successfully');
  };

  const printDistribution = (record: DistributionRecord) => {
    const htmlContent = generateHTMLTable(record);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const sendByEmail = (record: DistributionRecord) => {
    const dateRangeStr = `${format(record.dateRange.start, 'MMMM d')} to ${format(record.dateRange.end, 'MMMM d, yyyy')}`;
    const subject = `YSOD ${record.shift} Manpower Distribution Plan - ${dateRangeStr}`;
    
    const emailBody = `Greetings All,

Please find the attached YSOD ${record.shift} manpower distribution plan for the period ${dateRangeStr}.

This structured plan includes:
- Resource allocation by area
- Gap analysis and risk assessment  
- Personnel assignment details
- Priority recommendations

Best regards,
Security Operations Team`;

    // Create the structured content file for attachment
    const content = generatePDFContent(record);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const attachmentLink = document.createElement('a');
    attachmentLink.href = url;
    const filename = `YSOD_Manpower_Distribution_Plan_${format(record.dateRange.start, 'MMM-d')}_to_${format(record.dateRange.end, 'MMM-d-yyyy')}.txt`;
    attachmentLink.download = filename;
    
    document.body.appendChild(attachmentLink);
    attachmentLink.click();
    document.body.removeChild(attachmentLink);
    
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    
    setTimeout(() => {
      window.open(mailtoLink);
      URL.revokeObjectURL(url);
      toast.success('Email client opened and structured distribution plan downloaded for attachment');
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
