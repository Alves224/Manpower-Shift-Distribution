
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Users } from 'lucide-react';

interface HierarchyEmployee {
  id: string;
  name: string;
  badge: string;
  image?: string;
  role: 'supervisor' | 'coordinator';
}

interface ShiftHierarchyProps {
  shift: string;
  supervisor?: HierarchyEmployee;
  coordinator?: HierarchyEmployee;
  darkMode: boolean;
}

const ShiftHierarchy: React.FC<ShiftHierarchyProps> = ({
  shift,
  supervisor,
  coordinator,
  darkMode
}) => {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Users size={20} />
          {shift} - Command Structure
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
          {/* Supervisor */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center mb-2">
                {supervisor ? (
                  <Avatar className="w-18 h-18">
                    <AvatarImage src={supervisor.image} alt={supervisor.name} />
                    <AvatarFallback className="bg-red-100 text-red-800">
                      {supervisor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Crown className="w-8 h-8 text-white" />
                )}
              </div>
              <Crown className="absolute -top-1 -right-1 w-6 h-6 text-yellow-500" />
            </div>
            <Badge variant="destructive" className="mb-1">Security Shift Supervisor</Badge>
            {supervisor ? (
              <div className="text-center">
                <p className="font-semibold text-sm dark:text-slate-200">{supervisor.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Badge #{supervisor.badge}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Not Assigned</p>
            )}
          </div>

          {/* Arrow */}
          <div className="hidden lg:block text-2xl text-gray-400">→</div>
          <div className="lg:hidden text-2xl text-gray-400">↓</div>

          {/* Coordinator */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-2">
                {coordinator ? (
                  <Avatar className="w-18 h-18">
                    <AvatarImage src={coordinator.image} alt={coordinator.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-800">
                      {coordinator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Shield className="w-8 h-8 text-white" />
                )}
              </div>
              <Shield className="absolute -top-1 -right-1 w-6 h-6 text-blue-400" />
            </div>
            <Badge className="mb-1 bg-blue-600 hover:bg-blue-700">Security Shift Coordinator</Badge>
            {coordinator ? (
              <div className="text-center">
                <p className="font-semibold text-sm dark:text-slate-200">{coordinator.name}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Badge #{coordinator.badge}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">Not Assigned</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftHierarchy;
