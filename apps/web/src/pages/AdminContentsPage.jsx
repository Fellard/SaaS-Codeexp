
import React from 'react';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation.js';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent } from '@/components/ui/card';

const AdminContentsPage = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('admin.nav.contents', 'Contenus')} - Admin IWS</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">{t('admin.nav.contents', 'Contenus')}</h2>
        </div>

        <Card className="dashboard-card">
          <CardContent className="p-12 text-center text-muted-foreground">
            <p>La gestion des contenus sera disponible prochainement.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminContentsPage;
