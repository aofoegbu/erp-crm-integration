import { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { Button } from './button';
import { GlassmorphismCard } from './glassmorphism-card';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Add initial notifications
    const initialNotifications: Notification[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Priority Ticket',
        message: 'Ticket #TK008 requires immediate attention - customer system offline',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false
      },
      {
        id: '2',
        type: 'success',
        title: 'Integration Restored',
        message: 'CRM sync service back online - all pending updates processed',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false
      },
      {
        id: '3',
        type: 'info',
        title: 'New Chat Session',
        message: 'Customer Sarah Johnson started a new chat session',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true
      },
      {
        id: '4',
        type: 'error',
        title: 'API Rate Limit',
        message: 'ERP API approaching rate limit - 85% capacity reached',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        read: false
      }
    ];

    setNotifications(initialNotifications);

    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'warning' : Math.random() > 0.5 ? 'info' : 'success',
        title: 'System Update',
        message: `Integration log entry created at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 notifications
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      default: return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowPanel(!showPanel)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showPanel && (
        <div className="absolute right-0 top-12 w-80 z-50">
          <GlassmorphismCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">Notifications</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPanel(false)}
                  className="h-6 w-6"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-4 text-slate-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        notification.read 
                          ? 'bg-slate-800/30 border-slate-700' 
                          : 'bg-slate-700/50 border-slate-600'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          {getIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-white truncate">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1 ml-2">
                                <Clock className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-400">
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-300 mt-1">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="h-6 w-6 ml-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="w-full text-slate-400 hover:text-white"
                  >
                    Mark all as read
                  </Button>
                </div>
              )}
            </div>
          </GlassmorphismCard>
        </div>
      )}
    </div>
  );
}