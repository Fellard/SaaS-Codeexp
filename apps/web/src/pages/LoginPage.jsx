
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(t('auth.login.success', 'Connexion réussie'));
      // Redirige vers la page d'origine si elle existe, sinon vers l'espace par défaut
      const from = location.state?.from?.pathname || null;
      if (user.role === 'admin' || user.role === 'manager') {
        navigate(from || '/admin', { replace: true });
      } else {
        navigate(from || '/dashboard', { replace: true });
      }
    } catch (error) {
      const msg = error?.message || '';
      if (msg.includes('attente') || msg.includes('validation') || msg.includes('activé')) {
        toast.error(msg);
      } else {
        toast.error(t('auth.login.error', 'Email ou mot de passe incorrect'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.login.title')} - IWS LAAYOUNE</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-6 text-sm font-medium"
          >
            {t('auth.backToHome')}
          </Link>
          
          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            <div className="flex justify-center mb-6">
              <img 
                src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/194eb2392c06f1b937e41ace9ded27ea.png" 
                alt="IWS Logo" 
                className="w-[150px] h-[150px] object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-center text-primary mb-8">{t('auth.login.title')}</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.login.email')}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                  <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                    {t('auth.login.forgotPassword')}
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background text-foreground"
                />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? '...' : t('auth.login.submit')}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/signup" className="hover:text-primary hover:underline">
                {t('auth.login.signup')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
