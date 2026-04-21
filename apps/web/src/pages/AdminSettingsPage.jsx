
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import { useTranslation } from '@/i18n/useTranslation.js';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({ id: '', secretCode: '', companyName: '', email: '', phone: '', address: '' });
  const [newSecretCode, setNewSecretCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch the current secret code as requested
        const res = await pb.collection('settings').getFirstListItem('secretCode != ""', { requestKey: null });
        if (res) setSettings(res);
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedData = { ...settings };
      
      // If user entered a new secret code, update it
      if (newSecretCode.trim() !== '') {
        updatedData.secretCode = newSecretCode;
      }
      
      if (settings.id) {
        await pb.collection('settings').update(settings.id, updatedData, { requestKey: null });
      } else {
        const res = await pb.collection('settings').create(updatedData, { requestKey: null });
        setSettings(res);
      }
      
      if (newSecretCode.trim() !== '') {
        setSettings(prev => ({ ...prev, secretCode: newSecretCode }));
        setNewSecretCode('');
      }
      
      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>{t('admin.nav.settings', 'Paramètres')} - Admin IWS</title>
      </Helmet>

      <div className="space-y-6 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.nav.settings', 'Paramètres')}</h2>

        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle>Paramètres Généraux</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-6">
                
                {/* Security Section */}
                <div className="space-y-4 p-5 bg-muted/50 rounded-xl border border-border">
                  <h3 className="font-semibold text-lg text-foreground">Sécurité & Approbation</h3>
                  
                  <div className="space-y-2">
                    <Label>Code Secret Actuel</Label>
                    <Input 
                      type="password"
                      readOnly
                      value={settings.secretCode || '••••••••'} 
                      className="bg-muted text-muted-foreground cursor-not-allowed font-mono"
                    />
                    <p className="text-xs text-muted-foreground">Ce code est requis pour l'inscription des nouveaux administrateurs et managers.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nouveau Code Secret</Label>
                    <Input 
                      type="text"
                      value={newSecretCode} 
                      onChange={e => setNewSecretCode(e.target.value)} 
                      placeholder="Laissez vide pour conserver le code actuel"
                      className="bg-background text-foreground font-mono"
                    />
                  </div>
                </div>

                {/* Company Info Section */}
                <div className="space-y-4 p-5 bg-muted/50 rounded-xl border border-border">
                  <h3 className="font-semibold text-lg text-foreground">Informations de l'entreprise</h3>
                  
                  <div className="space-y-2">
                    <Label>Nom de l'entreprise</Label>
                    <Input 
                      value={settings.companyName} 
                      onChange={e => setSettings({...settings, companyName: e.target.value})} 
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email de contact</Label>
                    <Input 
                      type="email"
                      value={settings.email} 
                      onChange={e => setSettings({...settings, email: e.target.value})} 
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input 
                      value={settings.phone} 
                      onChange={e => setSettings({...settings, phone: e.target.value})} 
                      className="bg-background text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input 
                      value={settings.address} 
                      onChange={e => setSettings({...settings, address: e.target.value})} 
                      className="bg-background text-foreground"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
