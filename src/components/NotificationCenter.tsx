
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { useNotificationStore } from '@/hooks/useNotificationStore';
import { format } from 'date-fns';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll, 
    getUnreadCount 
  } = useNotificationStore();

  const unreadCount = getUnreadCount();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-green-500 bg-green-50 dark:bg-green-950/30';
      case 'error': return 'border-l-red-500 bg-red-50 dark:bg-red-950/30';
      case 'warning': return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/30';
      case 'info': return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/30';
      default: return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/30';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative bg-white/50 dark:bg-slate-800/50 border-2 border-white/40 hover:bg-white/70 dark:hover:bg-slate-800/70"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs font-bold animate-pulse"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 dark:border-slate-700/20 shadow-2xl z-[100]" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={markAllAsRead}
                    className="text-xs hover:bg-blue-100 dark:hover:bg-slate-800"
                  >
                    <CheckCheck size={12} className="mr-1" />
                    Mark All Read
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearAll}
                    className="text-xs text-red-600 hover:bg-red-100 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <Bell size={32} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'ring-2 ring-blue-500/20' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {format(notification.timestamp, 'MMM d, HH:mm')}
                          </span>
                          {notification.action && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                notification.action?.onClick();
                                markAsRead(notification.id);
                              }}
                              className="text-xs h-6 px-2 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-800/80"
                            >
                              {notification.action.label}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                        >
                          <Check size={10} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/50"
                      >
                        <X size={10} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
