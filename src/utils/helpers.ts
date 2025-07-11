
export function generateId(): string {
  return 'id-' + Math.random().toString(36).substr(2, 9);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'supervisor': return 'bg-red-500';
    case 'coordinator': return 'bg-blue-500';
    case 'patrol': return 'bg-purple-500';
    default: return 'bg-green-500';
  }
}

export function getAssignmentColor(type: string): string {
  switch (type) {
    case 'patrol': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
    case 'training': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950';
    case 'vacation': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950';
    default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950';
  }
}
