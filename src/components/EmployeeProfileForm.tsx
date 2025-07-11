
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface WeaponImages {
  MP5: string;
  Glock: string;
  AirTaser: string;
}

const WEAPON_IMAGES: WeaponImages = {
  MP5: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop',
  Glock: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop',
  AirTaser: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=150&h=150&fit=crop'
};

export interface EmployeeProfile {
  id: string;
  name: string;
  age: number;
  gradeCode: string;
  badge: string;
  role: 'guard' | 'patrol' | 'supervisor' | 'coordinator';
  shift: string;
  image?: string;
  weapons: string[];
}

interface EmployeeProfileFormProps {
  currentShift: string;
  onAddEmployee: (employee: EmployeeProfile) => void;
  onClose?: () => void;
}

const EmployeeProfileForm: React.FC<EmployeeProfileFormProps> = ({
  currentShift,
  onAddEmployee,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gradeCode: '',
    badge: '',
    role: 'guard' as const,
    image: '',
    weapons: [] as string[]
  });

  const handleWeaponToggle = (weapon: string) => {
    setFormData(prev => ({
      ...prev,
      weapons: prev.weapons.includes(weapon)
        ? prev.weapons.filter(w => w !== weapon)
        : [...prev.weapons, weapon]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.badge.trim() || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newEmployee: EmployeeProfile = {
      id: `emp-${Date.now()}`,
      name: formData.name.trim(),
      age: parseInt(formData.age),
      gradeCode: formData.gradeCode.trim(),
      badge: formData.badge.trim(),
      role: formData.role,
      shift: currentShift,
      image: formData.image || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000000)}-ce5d-49a4-a31b-50db8ce16d8e?w=150&h=150&fit=crop&crop=face`,
      weapons: formData.weapons
    };

    onAddEmployee(newEmployee);
    
    // Reset form
    setFormData({
      name: '',
      age: '',
      gradeCode: '',
      badge: '',
      role: 'guard',
      image: '',
      weapons: []
    });
    
    toast.success(`${newEmployee.name} added to ${currentShift}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          image: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 dark:text-slate-200">
            <UserPlus size={20} />
            Add Employee Profile - {currentShift}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="dark:text-slate-300">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                className="dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
            <div>
              <Label htmlFor="age" className="dark:text-slate-300">Age *</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                placeholder="Enter age"
                className="dark:bg-slate-700 dark:border-slate-600"
                min="18"
                max="65"
                required
              />
            </div>
            <div>
              <Label htmlFor="gradeCode" className="dark:text-slate-300">Grade Code</Label>
              <Input
                id="gradeCode"
                value={formData.gradeCode}
                onChange={(e) => setFormData(prev => ({ ...prev, gradeCode: e.target.value }))}
                placeholder="e.g., SG-1, SG-2"
                className="dark:bg-slate-700 dark:border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="badge" className="dark:text-slate-300">Badge Number *</Label>
              <Input
                id="badge"
                value={formData.badge}
                onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                placeholder="Enter badge number"
                className="dark:bg-slate-700 dark:border-slate-600"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <Label className="dark:text-slate-300">Role *</Label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="guard">Security Guard</option>
              <option value="patrol">Vehicle Patrol</option>
              <option value="supervisor">Supervisor</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>

          {/* Image Upload */}
          <div>
            <Label className="dark:text-slate-300">Profile Image</Label>
            <div className="mt-2 flex items-center gap-4">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                />
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                  <Upload size={16} />
                  Upload Image
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Weapons Assignment */}
          <div>
            <Label className="dark:text-slate-300 mb-3 block">Weapons Assignment</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(WEAPON_IMAGES).map(([weapon, image]) => (
                <div key={weapon} className="flex items-center space-x-3 p-3 border rounded-lg dark:border-slate-600">
                  <img
                    src={image}
                    alt={weapon}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium dark:text-slate-200">{weapon}</Label>
                    <Checkbox
                      checked={formData.weapons.includes(weapon)}
                      onCheckedChange={() => handleWeaponToggle(weapon)}
                      className="ml-2"
                    />
                  </div>
                </div>
              ))}
            </div>
            {formData.weapons.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.weapons.map(weapon => (
                  <Badge key={weapon} variant="secondary">
                    {weapon}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Employee Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeProfileForm;
