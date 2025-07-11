import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Users, Crown } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfileForm';
interface EnhancedGateCardProps {
  assignment: {
    id: string;
    name: string;
    type: string;
    employees: EmployeeProfile[];
    maxCapacity: number;
    weaponAssigned?: boolean;
  };
  onToggleWeapon: (assignmentId: string) => void;
  getAssignmentColor: (type: string) => string;
  getRoleColor: (role: string) => string;
}
const EnhancedGateCard: React.FC<EnhancedGateCardProps> = ({
  assignment,
  onToggleWeapon,
  getAssignmentColor,
  getRoleColor
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'supervisor':
        return <Crown size={12} className="text-red-500" />;
      case 'coordinator':
        return <Shield size={12} className="text-blue-500" />;
      default:
        return <Shield size={12} className="text-green-500" />;
    }
  };
  return;
};
export default EnhancedGateCard;