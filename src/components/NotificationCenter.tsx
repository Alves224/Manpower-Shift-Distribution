
import React, { useState } from 'react';
import { Bell, Check, X, Trash2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationStore } from '@/hooks/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotificationStore();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'error': return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'info': return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
      default: return 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white animate-pulse"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 animate-fade-in">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <CheckCheck size={12} className="mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X size={12} />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="max-h-96">
            <div className="p-2">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                        getNotificationColor(notification.type)
                      } ${
                        !notification.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              {!notification.read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="h-5 w-5 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                  <Check size={10} />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeNotification(notification.id)}
                                className="h-5 w-5 p-0 hover:bg-red-100 dark:hover:bg-red-900 text-red-500"
                              >
                                <X size={10} />
                              </Button>
                            </div>
                          </div>
                          {notification.description && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {notification.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </span>
                            {notification.action && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={notification.action.onClick}
                                className="h-6 text-xs px-2"
                              >
                                {notification.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="w-full text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 size={12} className="mr-1" />
                Clear all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
