
import { create } from 'zustand';
import { toast } from 'sonner';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationStore {
  notifications: Notification[];
  soundEnabled: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  getUnreadCount: () => number;
  toggleSound: () => void;
}

// Function to play notification sound
const playNotificationSound = (type: NotificationType) => {
  try {
    // Create audio context for better browser compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      info: 600,
      warning: 400,
      error: 300
    };
    
    const frequency = frequencies[type];
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Set volume and duration
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio not supported or blocked');
  }
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  soundEnabled: true,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
    
    // Play sound if enabled
    if (get().soundEnabled) {
      playNotificationSound(notification.type);
    }
    
    // Show toast notification
    const toastConfig = {
      description: notification.message,
      action: notification.action ? {
        label: notification.action.label,
        onClick: notification.action.onClick,
      } : undefined,
    };
    
    switch (notification.type) {
      case 'success':
        toast.success(notification.title, toastConfig);
        break;
      case 'error':
        toast.error(notification.title, toastConfig);
        break;
      case 'warning':
        toast.warning(notification.title, toastConfig);
        break;
      case 'info':
        toast.info(notification.title, toastConfig);
        break;
    }
  },
  
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    })),
  
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    })),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
  
  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
  
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
}));
