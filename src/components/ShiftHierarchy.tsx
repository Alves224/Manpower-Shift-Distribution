
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Shield, Users } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';

interface ShiftHierarchyProps {
  shift: string;
  supervisor?: EmployeeProfile;
  coordinator?: EmployeeProfile;
  darkMode: boolean;
}

const ShiftHierarchy: React.FC<ShiftHierarchyProps> = ({
  shift,
  supervisor,
  coordinator,
  darkMode
}) => {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg p-4">
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} />
          Command Structure - {shift}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-center items-center gap-8">
          {/* Supervisor */}
          <div className="text-center relative">
            <div className="relative mb-3">
              <Avatar className="h-16 w-16 border-4 border-red-200 dark:border-red-800 shadow-lg mx-auto">
                <AvatarImage src={supervisor?.image} alt={supervisor?.name} />
                <AvatarFallback className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 font-bold">
                  {supervisor?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S'}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1">
                Supervisor
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {supervisor?.name || 'Unassigned'}
              </h3>
              {supervisor && (
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Badge: #{supervisor.badge}</p>
                  <p>Grade: {supervisor.gradeCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Connection Line */}
          <div className="flex-1 max-w-24">
            <div className="h-0.5 bg-gradient-to-r from-red-400 to-blue-400 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-2">
                <Users size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          {/* Coordinator */}
          <div className="text-center">
            <div className="relative mb-3">
              <Avatar className="h-16 w-16 border-4 border-blue-200 dark:border-blue-800 shadow-lg mx-auto">
                <AvatarImage src={coordinator?.image} alt={coordinator?.name} />
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold">
                  {coordinator?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <Badge className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1">
                Coordinator
              </Badge>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">
                {coordinator?.name || 'Unassigned'}
              </h3>
              {coordinator && (
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <p>Badge: #{coordinator.badge}</p>
                  <p>Grade: {coordinator.gradeCode}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftHierarchy;
