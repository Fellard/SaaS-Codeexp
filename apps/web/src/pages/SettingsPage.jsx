
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation.js';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LanguageSwitcher from '@/components/LanguageSwitcher.jsx';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { t } = useTranslation();
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [publicProfile, setPublicProfile] = useState(false);

  const handleToggle = (setter, name) => (checked) => {
    setter(checked);
    toast.success(`Paramètre ${name} mis à jour`);
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('dashboard.settings')} - IWS LAAYOUNE</title>
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Choisissez votre langue préférée</span>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t('settings.notifications')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par Email</Label>
                <p className="text-sm text-muted-foreground">Recevoir des mises à jour sur vos commandes et formations.</p>
              </div>
              <Switch checked={emailNotif} onCheckedChange={handleToggle(setEmailNotif, 'Email')} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par SMS</Label>
                <p className="text-sm text-muted-foreground">Recevoir des alertes urgentes sur votre téléphone.</p>
              </div>
              <Switch checked={smsNotif} onCheckedChange={handleToggle(setSmsNotif, 'SMS')} />
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>{t('settings.privacy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Profil Public</Label>
                <p className="text-sm text-muted-foreground">Rendre votre profil visible aux autres utilisateurs.</p>
              </div>
              <Switch checked={publicProfile} onCheckedChange={handleToggle(setPublicProfile, 'Profil Public')} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
