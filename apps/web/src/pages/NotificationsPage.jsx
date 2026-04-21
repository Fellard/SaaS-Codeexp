
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Bell, Check, Trash2, UserPlus, ShoppingCart, BookOpen, FileText, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation.js';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([
    { id: '1', type: 'order', message: 'Nouvelle commande #1024 de Jean Dupont', read: false, date: '2026-04-07 10:30' },
    { id: '2', type: 'user', message: 'Nouvel utilisateur inscrit: Marie Martin', read: false, date: '2026-04-07 09:15' },
    { id: '3', type: 'course', message: 'Nouvelle inscription à la formation React', read: true, date: '2026-04-06 14:20' },
    { id: '4', type: 'content', message: 'Nouveau contenu ajouté: Guide SEO 2026', read: true, date: '2026-04-05 11:00' },
    { id: '5', type: 'error', message: 'Échec de paiement pour la commande #1023', read: true, date: '2026-04-05 08:45' },
  ]);

  const getIcon = (type) => {
    switch (type) {
      case 'user': return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'order': return <ShoppingCart className="w-5 h-5 text-green-500" />;
      case 'course': return <BookOpen className="w-5 h-5 text-orange-500" />;
      case 'content': return <FileText className="w-5 h-5 text-purple-500" />;
      default: return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    toast.success('Marqué comme lu');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification supprimée');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('admin.nav.notifications', 'Notifications')} - Admin IWS</title>
      </Helmet>

      <div className="space-y-6 animate-slide-up max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          </div>
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <Check className="w-4 h-4" /> Tout marquer comme lu
          </Button>
        </div>

        <Card className="dashboard-card">
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p>Aucune notification pour le moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors hover:bg-muted/30 ${!notif.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-background p-2 rounded-full border border-border shadow-sm shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-base ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                            {notif.message}
                          </p>
                          {!notif.read && <Badge variant="default" className="h-5 px-1.5 text-[10px]">Nouveau</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                      {!notif.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)} title="Marquer comme lu">
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteNotification(notif.id)} title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;
