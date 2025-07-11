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
  MP5: '/lovable-uploads/a77e4cce-32dd-4452-8a77-60284b5bfeba.png',
  Glock: '/lovable-uploads/332f3c1f-d4cf-487f-b0a6-bb60d4b13299.png',
  AirTaser: '/lovable-uploads/f33a5480-6810-4bdb-9202-949f44d8b836.png'
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
    <Card className="w-full max-w-2xl mx-auto bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700 shadow-2xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <UserPlus size={24} />
            Add Employee Profile - {currentShift}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X size={16} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 p-6 rounded-xl border border-blue-200 dark:border-slate-600">
            <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="dark:text-slate-300 font-semibold">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                  className="dark:bg-slate-700 dark:border-slate-600 mt-2"
                  required
                />
              </div>
              <div>
                <Label htmlFor="age" className="dark:text-slate-300 font-semibold">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="Enter age"
                  className="dark:bg-slate-700 dark:border-slate-600 mt-2"
                  min="18"
                  max="65"
                  required
                />
              </div>
              <div>
                <Label htmlFor="gradeCode" className="dark:text-slate-300 font-semibold">Grade Code</Label>
                <Input
                  id="gradeCode"
                  value={formData.gradeCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, gradeCode: e.target.value }))}
                  placeholder="e.g., SG-1, SG-2"
                  className="dark:bg-slate-700 dark:border-slate-600 mt-2"
                />
              </div>
              <div>
                <Label htmlFor="badge" className="dark:text-slate-300 font-semibold">Badge Number *</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge: e.target.value }))}
                  placeholder="Enter badge number"
                  className="dark:bg-slate-700 dark:border-slate-600 mt-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-700 dark:to-slate-800 p-6 rounded-xl border border-green-200 dark:border-slate-600">
            <Label className="dark:text-slate-300 font-semibold text-lg text-green-800 dark:text-green-300">Role Assignment *</Label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full mt-3 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-200 text-lg"
            >
              <option value="guard">Security Guard</option>
              <option value="patrol">Vehicle Patrol</option>
              <option value="supervisor">Supervisor</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>

          {/* Image Upload */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-slate-700 dark:to-slate-800 p-6 rounded-xl border border-purple-200 dark:border-slate-600">
            <Label className="dark:text-slate-300 font-semibold text-lg text-purple-800 dark:text-purple-300">Profile Image</Label>
            <div className="mt-4 flex items-center gap-6">
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover border-4 border-purple-300 shadow-lg"
                />
              )}
              <label className="cursor-pointer">
                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg">
                  <Upload size={20} />
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
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-800 p-6 rounded-xl border border-orange-200 dark:border-slate-600">
            <Label className="dark:text-slate-300 mb-4 block font-semibold text-lg text-orange-800 dark:text-orange-300">Weapons Assignment</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(WEAPON_IMAGES).map(([weapon, image]) => (
                <div key={weapon} className="flex flex-col items-center space-y-3 p-4 border-2 border-orange-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all duration-300">
                  <img
                    src={image}
                    alt={weapon}
                    className="w-20 h-20 object-contain rounded-lg bg-gray-50 dark:bg-slate-700 p-2"
                  />
                  <div className="text-center">
                    <Label className="text-sm font-bold dark:text-slate-200 text-gray-800">{weapon}</Label>
                    <div className="mt-2">
                      <Checkbox
                        checked={formData.weapons.includes(weapon)}
                        onCheckedChange={() => handleWeaponToggle(weapon)}
                        className="scale-125"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {formData.weapons.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.weapons.map(weapon => (
                  <Badge key={weapon} variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                    {weapon}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300">
            Add Employee Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EmployeeProfileForm;
