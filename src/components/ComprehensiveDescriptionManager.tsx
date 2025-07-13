import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  FileText, 
  Download, 
  Mail, 
  Calendar as CalendarIcon, 
  Clock, 
  Save, 
  History, 
  Plus,
  Trash2,
  Eye,
  Edit,
  Search,
  Filter,
  X,
  Users,
  Shield,
  MapPin
} from 'lucide-react';
import { format, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
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

interface Description {
  id: string;
  title: string;
  content: string;
  shift: string;
  date: Date;
  createdBy: string;
  createdAt: Date;
  type: 'daily' | 'weekly' | 'incident' | 'custom';
  assignments: Assignment[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
  totalPersonnel: number;
  tags: string[];
}

interface ComprehensiveDescriptionManagerProps {
  currentShift: string;
  assignments: Assignment[];
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
  employees: EmployeeProfile[];
  onClose: () => void;
}

const ComprehensiveDescriptionManager: React.FC<ComprehensiveDescriptionManagerProps> = ({
  currentShift,
  assignments,
  supervisor,
  coordinator,
  employees,
  onClose
}) => {
  const [descriptions, setDescriptions] = useState<Description[]>([]);
  const [currentDescription, setCurrentDescription] = useState<Partial<Description>>({
    title: '',
    content: '',
    shift: currentShift,
    date: new Date(),
    type: 'daily',
    tags: []
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date())
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Load descriptions from localStorage
  useEffect(() => {
    const savedDescriptions = localStorage.getItem('security-descriptions');
    if (savedDescriptions) {
      const parsed = JSON.parse(savedDescriptions);
      setDescriptions(parsed.map((desc: any) => ({
        ...desc,
        date: new Date(desc.date),
        createdAt: new Date(desc.createdAt)
      })));
    }
  }, []);

  // Save descriptions to localStorage
  const saveDescriptions = (newDescriptions: Description[]) => {
    setDescriptions(newDescriptions);
    localStorage.setItem('security-descriptions', JSON.stringify(newDescriptions));
  };

  // Generate automatic description content
  const generateAutoDescription = () => {
    const totalPersonnel = assignments.reduce((total, assignment) => total + assignment.employees.length, 0);
    const gateAssignments = assignments.filter(a => a.type === 'gate' && a.employees.length > 0);
    const patrolAssignments = assignments.filter(a => a.type === 'patrol' && a.employees.length > 0);
    const specialAssignments = assignments.filter(a => (a.type === 'training' || a.type === 'vacation') && a.employees.length > 0);

    let content = `Shift Assignment Manager Report - ${currentShift}\n`;
    content += `Date: ${format(selectedDate, 'PPP')}\n`;
    content += `Time: ${format(new Date(), 'HH:mm')}\n\n`;

    // Command Structure
    content += `COMMAND STRUCTURE:\n`;
    content += `Shift Supervisor: ${supervisor?.name || 'Not Assigned'}\n`;
    content += `Shift Coordinator: ${coordinator?.name || 'Not Assigned'}\n\n`;

    // Personnel Summary
    content += `PERSONNEL SUMMARY:\n`;
    content += `Total Active Personnel: ${totalPersonnel}\n`;
    content += `Available Personnel: ${assignments.find(a => a.id === 'unassigned')?.employees.length || 0}\n`;
    content += `Unavailable Personnel: ${assignments.find(a => a.id === 'unavailable')?.employees.length || 0}\n\n`;

    // Gate Assignments by Area
    const areas = ['NGL', 'YRD', 'BUP', 'HUH', 'YNT'];
    content += `GATE ASSIGNMENTS BY AREA:\n`;
    areas.forEach(area => {
      const areaGates = gateAssignments.filter(a => a.area === area);
      if (areaGates.length > 0) {
        content += `\n${area} Area:\n`;
        areaGates.forEach(gate => {
          content += `  - ${gate.name}: ${gate.employees.map(e => e.name).join(', ')} ${gate.weaponAssigned ? '(Armed)' : ''}\n`;
        });
      }
    });

    // Patrol Assignments
    if (patrolAssignments.length > 0) {
      content += `\nPATROL ASSIGNMENTS:\n`;
      patrolAssignments.forEach(patrol => {
        content += `  - ${patrol.name}: ${patrol.employees.map(e => e.name).join(', ')}\n`;
      });
    }

    // Special Assignments
    if (specialAssignments.length > 0) {
      content += `\nSPECIAL ASSIGNMENTS:\n`;
      specialAssignments.forEach(special => {
        content += `  - ${special.name}: ${special.employees.map(e => e.name).join(', ')}\n`;
      });
    }

    content += `\nReport generated at: ${format(new Date(), 'PPpp')}`;

    setCurrentDescription(prev => ({
      ...prev,
      content,
      totalPersonnel
    }));
  };

  // Save description
  const saveDescription = () => {
    if (!currentDescription.title || !currentDescription.content) {
      toast.error('Please fill in title and content');
      return;
    }

    const newDescription: Description = {
      id: editingId || `desc-${Date.now()}`,
      title: currentDescription.title || '',
      content: currentDescription.content || '',
      shift: currentDescription.shift || currentShift,
      date: selectedDate,
      createdBy: supervisor?.name || coordinator?.name || 'System',
      createdAt: new Date(),
      type: currentDescription.type as 'daily' | 'weekly' | 'incident' | 'custom' || 'daily',
      assignments: [...assignments],
      supervisor,
      coordinator,
      totalPersonnel: assignments.reduce((total, assignment) => total + assignment.employees.length, 0),
      tags: currentDescription.tags || []
    };

    if (editingId) {
      const updatedDescriptions = descriptions.map(desc => 
        desc.id === editingId ? newDescription : desc
      );
      saveDescriptions(updatedDescriptions);
      toast.success('Description updated successfully');
    } else {
      saveDescriptions([...descriptions, newDescription]);
      toast.success('Description saved successfully');
    }

    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setCurrentDescription({
      title: '',
      content: '',
      shift: currentShift,
      date: new Date(),
      type: 'daily',
      tags: []
    });
    setIsEditing(false);
    setEditingId(null);
  };

  // Edit description
  const editDescription = (description: Description) => {
    setCurrentDescription(description);
    setSelectedDate(description.date);
    setIsEditing(true);
    setEditingId(description.id);
  };

  // Delete description
  const deleteDescription = (id: string) => {
    if (confirm('Are you sure you want to delete this description?')) {
      const updatedDescriptions = descriptions.filter(desc => desc.id !== id);
      saveDescriptions(updatedDescriptions);
      toast.success('Description deleted successfully');
    }
  };

  // Export to PDF (placeholder - would require a PDF library)
  const exportToPDF = (description: Description) => {
    const content = `${description.title}\n\n${description.content}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${description.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Description exported successfully');
  };

  // Send email (placeholder - would require email integration)
  const sendEmail = (description: Description) => {
    const subject = `Security Report: ${description.title}`;
    const body = encodeURIComponent(description.content);
    const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
    toast.success('Email client opened');
  };

  // Add tag
  const addTag = () => {
    if (newTag && !currentDescription.tags?.includes(newTag)) {
      setCurrentDescription(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setCurrentDescription(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  // Filter descriptions
  const filteredDescriptions = descriptions.filter(desc => {
    const matchesSearch = desc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         desc.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || desc.type === filterType;
    const matchesDateRange = desc.date >= dateRange.from && desc.date <= dateRange.to;
    
    return matchesSearch && matchesFilter && matchesDateRange;
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Shift Assignment Manager
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Create, manage, and export detailed security assignments with historical tracking
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-slate-500 hover:text-slate-700">
              <X size={20} />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Creation/Editing Panel */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={20} />
                    {isEditing ? 'Edit Description' : 'Create New Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Title and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input
                        value={currentDescription.title || ''}
                        onChange={(e) => setCurrentDescription(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter description title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <Select 
                        value={currentDescription.type || 'daily'} 
                        onValueChange={(value) => setCurrentDescription(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily Report</SelectItem>
                          <SelectItem value="weekly">Weekly Summary</SelectItem>
                          <SelectItem value="incident">Incident Report</SelectItem>
                          <SelectItem value="custom">Custom Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Report Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon size={16} className="mr-2" />
                          {format(selectedDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add tag"
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      />
                      <Button onClick={addTag} size="sm">
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentDescription.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Auto-generate Button */}
                  <Button 
                    onClick={generateAutoDescription} 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Shield size={16} className="mr-2" />
                    Auto-Generate from Current Assignments
                  </Button>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      value={currentDescription.content || ''}
                      onChange={(e) => setCurrentDescription(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Enter detailed description..."
                      className="min-h-[200px]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button onClick={saveDescription} className="flex-1 bg-green-600 hover:bg-green-700">
                      <Save size={16} className="mr-2" />
                      {isEditing ? 'Update' : 'Save'} Description
                    </Button>
                    {isEditing && (
                      <Button onClick={resetForm} variant="outline">
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* History and Management Panel */}
            <div className="space-y-6">
              {/* Filters and Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History size={20} />
                    Description History & Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Search and Filter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search descriptions..."
                        className="w-full"
                      />
                    </div>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="daily">Daily Reports</SelectItem>
                        <SelectItem value="weekly">Weekly Summaries</SelectItem>
                        <SelectItem value="incident">Incident Reports</SelectItem>
                        <SelectItem value="custom">Custom Reports</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Filter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">From Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <CalendarIcon size={14} className="mr-2" />
                            {format(dateRange.from, 'PP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">To Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-start">
                            <CalendarIcon size={14} className="mr-2" />
                            {format(dateRange.to, 'PP')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Saved Descriptions ({filteredDescriptions.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-96 overflow-y-auto">
                    {filteredDescriptions.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        No descriptions found matching your criteria
                      </div>
                    ) : (
                      filteredDescriptions.map((desc) => (
                        <div key={desc.id} className="border-b border-slate-200 dark:border-slate-700 p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{desc.title}</h4>
                              <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <CalendarIcon size={12} />
                                  {format(desc.date, 'PP')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {desc.shift}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users size={12} />
                                  {desc.totalPersonnel} personnel
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {desc.type}
                                </Badge>
                                {desc.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => editDescription(desc)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => exportToPDF(desc)}
                                className="h-8 w-8 p-0"
                              >
                                <Download size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => sendEmail(desc)}
                                className="h-8 w-8 p-0"
                              >
                                <Mail size={14} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => deleteDescription(desc.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                            {desc.content.substring(0, 100)}...
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveDescriptionManager;
