
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserPlus, FileText, BarChart3, Sun, Moon } from 'lucide-react';

interface HeaderActionsProps {
  darkMode: boolean;
  onToggleDarkMode: (checked: boolean) => void;
  onAddEmployee: () => void;
  onShowNotes: () => void;
  onShowDescription: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  darkMode,
  onToggleDarkMode,
  onAddEmployee,
  onShowNotes,
  onShowDescription
}) => {
  return (
    <div className="flex items-center gap-3">
      <Button 
        onClick={onAddEmployee}
        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-md" 
        size="sm"
      >
        <UserPlus size={16} className="mr-2" />
        Add Employee
      </Button>
      
      <Button 
        onClick={onShowNotes}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md" 
        size="sm"
      >
        <FileText size={16} className="mr-2" />
        Notes & Planning
      </Button>

      <Button 
        onClick={onShowDescription}
        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md" 
        size="sm"
      >
        <BarChart3 size={16} className="mr-2" />
        Description Manager
      </Button>
      
      <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 p-2 rounded-lg">
        <Sun className="h-4 w-4" />
        <Switch 
          checked={darkMode} 
          onCheckedChange={onToggleDarkMode} 
        />
        <Moon className="h-4 w-4" />
      </div>
    </div>
  );
};

export default HeaderActions;
