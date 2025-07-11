
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface ShiftSelectorProps {
  currentShift: string;
  shifts: string[];
  onShiftChange: (shift: string) => void;
}

const ShiftSelector: React.FC<ShiftSelectorProps> = ({
  currentShift,
  shifts,
  onShiftChange
}) => {
  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Clock size={18} />
            <span className="font-medium">Active Shift:</span>
          </div>
          {shifts.map(shift => (
            <Button 
              key={shift} 
              variant={currentShift === shift ? "default" : "outline"}
              onClick={() => onShiftChange(shift)}
              className={currentShift === shift 
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-md' 
                : 'border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
              size="sm"
            >
              {shift}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftSelector;
