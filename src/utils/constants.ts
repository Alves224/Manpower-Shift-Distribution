
export const SHIFTS = ['SHIFT 1', 'SHIFT 2', 'SHIFT 3', 'SHIFT 4'];

export const GATE_AREAS = {
  NGL: {
    name: 'NGL Area',
    gates: ['Gate #1', 'Gate #2', 'Gate #3', 'Gate #21'],
    vipGates: ['V/P 05', 'V/P 014'],
    color: 'from-blue-500 to-cyan-500'
  },
  YRD: {
    name: 'YRD Area',
    gates: ['Gate #16', 'Gate #17'],
    vipGates: ['V/P 07', 'V/P 011'],
    color: 'from-green-500 to-emerald-500'
  },
  BUP: {
    name: 'BUP Area',
    gates: ['Gate #18'],
    vipGates: ['V/P 03'],
    color: 'from-purple-500 to-pink-500'
  },
  HUH: {
    name: 'HUH Area',
    gates: ['Gate #23', 'Gate #24'],
    vipGates: ['V/P 022', 'V/P 023'],
    color: 'from-orange-500 to-red-500'
  },
  YNT: {
    name: 'YNT Area',
    gates: ['Gate #4', 'Gate #5', 'Gate #9', 'Gate #11'],
    vipGates: ['V/P 06', 'V/P 09', 'V/P 010'],
    color: 'from-indigo-500 to-purple-500'
  }
};

export const WEAPON_ICONS = {
  'MP5': 'fas fa-gun',
  'Glock': 'fas fa-crosshairs',
  'AirTaser': 'fas fa-bolt'
};

export const ROLE_COLORS = {
  supervisor: 'bg-red-500',
  coordinator: 'bg-blue-500',
  patrol: 'bg-purple-500',
  guard: 'bg-green-500'
};

export const ASSIGNMENT_COLORS = {
  patrol: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
  training: 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950',
  vacation: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950',
  gate: 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
};
