
import React from 'react';
import { Users, MapPin, Car, Activity } from 'lucide-react';

interface StatsCardsProps {
  activePersonnel: number;
  totalGates: number;
  patrolCount: number;
  currentShift: string;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  activePersonnel,
  totalGates,
  patrolCount,
  currentShift
}) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Users size={18} />
          <div>
            <div className="text-xs opacity-90">Active Personnel</div>
            <div className="text-lg font-bold">{activePersonnel}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <MapPin size={18} />
          <div>
            <div className="text-xs opacity-90">Gates</div>
            <div className="text-lg font-bold">{totalGates}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Car size={18} />
          <div>
            <div className="text-xs opacity-90">Patrol</div>
            <div className="text-lg font-bold">{patrolCount}</div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-2">
          <Activity size={18} />
          <div>
            <div className="text-xs opacity-90">Current Shift</div>
            <div className="text-lg font-bold">{currentShift.replace('SHIFT ', '')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
