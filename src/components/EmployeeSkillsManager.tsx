
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Star, Plus, Calendar as CalendarIcon, Award, Shield, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { EmployeeProfile } from './EmployeeProfileForm';
import { toast } from 'sonner';

interface Skill {
  id: string;
  name: string;
  level: number; // 1-5 scale
  certified: boolean;
  certificationDate?: Date;
  expiryDate?: Date;
  notes?: string;
}

interface PerformanceRecord {
  id: string;
  date: Date;
  rating: number; // 1-5 scale
  category: 'discipline' | 'teamwork' | 'communication' | 'technical' | 'leadership';
  notes: string;
  reviewedBy: string;
}

interface EnhancedEmployeeProfile extends EmployeeProfile {
  skills?: Skill[];
  performanceRecords?: PerformanceRecord[];
  availabilityStatus?: 'available' | 'unavailable' | 'limited';
  availabilityNotes?: string;
}

interface EmployeeSkillsManagerProps {
  employee: EnhancedEmployeeProfile;
  onUpdateEmployee: (updatedEmployee: EnhancedEmployeeProfile) => void;
}

const EmployeeSkillsManager: React.FC<EmployeeSkillsManagerProps> = ({
  employee,
  onUpdateEmployee
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: '', level: 1, certified: false });
  const [newPerformanceRecord, setNewPerformanceRecord] = useState({
    rating: 5,
    category: 'technical' as const,
    notes: '',
    reviewedBy: ''
  });

  const skillCategories = [
    'Firearms Training',
    'First Aid/CPR',
    'Security Systems',
    'Vehicle Operation',
    'Communication',
    'Emergency Response',
    'Physical Fitness',
    'Leadership',
    'Crowd Control',
    'Investigation'
  ];

  const performanceCategories = [
    { value: 'discipline', label: 'Discipline & Conduct' },
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'communication', label: 'Communication' },
    { value: 'technical', label: 'Technical Skills' },
    { value: 'leadership', label: 'Leadership' }
  ];

  const addSkill = () => {
    if (!newSkill.name.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    const skill: Skill = {
      id: Date.now().toString(),
      name: newSkill.name,
      level: newSkill.level,
      certified: newSkill.certified,
      certificationDate: newSkill.certified ? new Date() : undefined
    };

    const updatedEmployee = {
      ...employee,
      skills: [...(employee.skills || []), skill]
    };

    onUpdateEmployee(updatedEmployee);
    setNewSkill({ name: '', level: 1, certified: false });
    toast.success('Skill added successfully');
  };

  const updateSkill = (skillId: string, updates: Partial<Skill>) => {
    const updatedEmployee = {
      ...employee,
      skills: (employee.skills || []).map(skill =>
        skill.id === skillId ? { ...skill, ...updates } : skill
      )
    };
    onUpdateEmployee(updatedEmployee);
  };

  const removeSkill = (skillId: string) => {
    const updatedEmployee = {
      ...employee,
      skills: (employee.skills || []).filter(skill => skill.id !== skillId)
    };
    onUpdateEmployee(updatedEmployee);
    toast.success('Skill removed');
  };

  const addPerformanceRecord = () => {
    if (!newPerformanceRecord.notes.trim() || !newPerformanceRecord.reviewedBy.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const record: PerformanceRecord = {
      id: Date.now().toString(),
      date: new Date(),
      ...newPerformanceRecord
    };

    const updatedEmployee = {
      ...employee,
      performanceRecords: [...(employee.performanceRecords || []), record]
    };

    onUpdateEmployee(updatedEmployee);
    setNewPerformanceRecord({
      rating: 5,
      category: 'technical',
      notes: '',
      reviewedBy: ''
    });
    toast.success('Performance record added');
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-blue-600';
    if (level >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getOverallRating = () => {
    const records = employee.performanceRecords || [];
    if (records.length === 0) return 0;
    
    const sum = records.reduce((total, record) => total + record.rating, 0);
    return Math.round((sum / records.length) * 10) / 10;
  };

  const getExpiringCertifications = () => {
    const skills = employee.skills || [];
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return skills.filter(skill => 
      skill.certified && 
      skill.expiryDate && 
      skill.expiryDate <= thirtyDaysFromNow
    );
  };

  const expiringCerts = getExpiringCertifications();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Star size={14} />
          Skills & Performance
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Skills & Performance - {employee.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Award className="text-blue-600" size={20} />
                  <div>
                    <div className="text-2xl font-bold">{(employee.skills || []).length}</div>
                    <div className="text-sm text-gray-600">Total Skills</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Shield className="text-green-600" size={20} />
                  <div>
                    <div className="text-2xl font-bold">
                      {(employee.skills || []).filter(s => s.certified).length}
                    </div>
                    <div className="text-sm text-gray-600">Certifications</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-600" size={20} />
                  <div>
                    <div className="text-2xl font-bold">{getOverallRating()}</div>
                    <div className="text-sm text-gray-600">Avg Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Certifications Alert */}
          {expiringCerts.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle size={16} />
                  <strong>Expiring Certifications:</strong>
                  {expiringCerts.map(skill => (
                    <Badge key={skill.id} variant="outline" className="text-yellow-700">
                      {skill.name} - {skill.expiryDate && format(skill.expiryDate, 'MMM d')}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Skills & Certifications</span>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter skill name..."
                    value={newSkill.name}
                    onChange={(e) => setNewSkill(prev => ({ ...prev, name: e.target.value }))}
                    className="w-48"
                  />
                  <Select
                    value={newSkill.level.toString()}
                    onValueChange={(value) => setNewSkill(prev => ({ ...prev, level: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          {level}/5
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={addSkill} size="sm" className="gap-1">
                    <Plus size={14} />
                    Add
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(employee.skills || []).map(skill => (
                  <div key={skill.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{skill.name}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Level:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <Star
                              key={level}
                              size={16}
                              className={level <= skill.level ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-medium ${getSkillLevelColor(skill.level)}`}>
                          {skill.level}/5
                        </span>
                      </div>
                      
                      {skill.certified && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Shield size={14} />
                          <span>Certified</span>
                          {skill.certificationDate && (
                            <span>({format(skill.certificationDate, 'MMM yyyy')})</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(employee.skills || []).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No skills recorded yet. Add some skills to track this employee's capabilities.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Performance Records */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Performance Record */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-medium mb-3">Add Performance Record</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={newPerformanceRecord.category}
                      onValueChange={(value: any) => setNewPerformanceRecord(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {performanceCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={newPerformanceRecord.rating.toString()}
                      onValueChange={(value) => setNewPerformanceRecord(prev => ({ ...prev, rating: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(rating => (
                          <SelectItem key={rating} value={rating.toString()}>
                            {rating}/5 Stars
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      placeholder="Reviewed by..."
                      value={newPerformanceRecord.reviewedBy}
                      onChange={(e) => setNewPerformanceRecord(prev => ({ ...prev, reviewedBy: e.target.value }))}
                    />

                    <Button onClick={addPerformanceRecord} className="gap-2">
                      <Plus size={14} />
                      Add Record
                    </Button>
                  </div>

                  <Textarea
                    placeholder="Performance notes and comments..."
                    value={newPerformanceRecord.notes}
                    onChange={(e) => setNewPerformanceRecord(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-2"
                    rows={2}
                  />
                </div>

                {/* Performance History */}
                <div className="space-y-3">
                  {(employee.performanceRecords || [])
                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                    .map(record => (
                      <div key={record.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {performanceCategories.find(cat => cat.value === record.category)?.label}
                            </Badge>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  size={14}
                                  className={star <= record.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {format(record.date, 'MMM d, yyyy')} by {record.reviewedBy}
                          </div>
                        </div>
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    ))}
                </div>

                {(employee.performanceRecords || []).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No performance records yet. Add records to track this employee's progress.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeSkillsManager;
