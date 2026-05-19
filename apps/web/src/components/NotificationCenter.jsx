
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, UserPlus, ShoppingCart, BookOpen, FileText, AlertCircle, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/i18n/useTranslation.js';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'order': return <ShoppingCart className="w-4 h-4 text-green-500" />;
      case 'course': return <BookOpen className="w-4 h-4 text-orange-500" />;
      case 'content': return <FileText className="w-4 h-4 text-purple-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center bg-destructive text-destructive-foreground rounded-full text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-auto py-1 px-2">
              <Check className="w-3 h-3 mr-1" /> Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Aucune notification</div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex items-start gap-3 p-4 border-b border-border/50 transition-colors hover:bg-muted/50 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="mt-0.5 bg-background p-1.5 rounded-full border border-border shadow-sm">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm ${!notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{notif.time}</p>
                </div>
                {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>}
              </div>
            ))
          )}
        </div>
        <div className="p-2 border-t border-border">
          <Button asChild variant="ghost" className="w-full text-sm justify-center">
            <Link to="/admin/notifications">Voir toutes les notifications</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
