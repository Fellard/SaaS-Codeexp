
import React from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  const handleEdit = () => {
    toast.info('Fonctionnalité de modification à venir');
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('dashboard.profile')} - IWS LAAYOUNE</title>
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t('dashboard.profile')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold shadow-sm">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
                <p className="text-muted-foreground capitalize">{currentUser?.role}</p>
              </div>
            </div>
            
            <div className="grid gap-4 pt-6 border-t border-border">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('profile.email')}</p>
                <p className="text-base">{currentUser?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('profile.signupDate')}</p>
                <p className="text-base">{new Date(currentUser?.created).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <Button variant="outline" onClick={handleEdit}>{t('profile.edit')}</Button>
              <Button variant="outline" onClick={handleEdit}>{t('profile.changePassword')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
