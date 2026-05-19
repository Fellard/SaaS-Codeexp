import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiServerClient.fetch('/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.forgotPassword.title')} - IWS LAAYOUNE</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-6 text-sm font-medium">
            {t('auth.backToHome')}
          </Link>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-primary mb-3">Email envoyé !</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
                </p>
                <Link to="/login">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold">
                    Retour à la connexion
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center text-primary mb-2">{t('auth.forgotPassword.title')}</h1>
                <p className="text-center text-muted-foreground text-sm mb-8">
                  Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.forgotPassword.email')}</Label>
                    <Input
                      id="email" type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="bg-background text-foreground"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                    {loading ? 'Envoi en cours...' : t('auth.forgotPassword.submit')}
                  </Button>
                </form>
                <div className="mt-6 text-center text-sm text-muted-foreground">
                  <Link to="/login" className="hover:text-primary hover:underline">
                    {t('auth.forgotPassword.login')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
