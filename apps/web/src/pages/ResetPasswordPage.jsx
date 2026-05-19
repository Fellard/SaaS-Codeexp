import React, { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { confirmPasswordReset } = useAuth();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRtl = language?.startsWith('ar');

  // Token peut venir des params ou de la query string
  const resetToken = token || searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error(t('auth.resetPassword.mismatch'));
      return;
    }
    if (password.length < 8) {
      toast.error(t('auth.resetPassword.length'));
      return;
    }
    setLoading(true);
    try {
      await confirmPasswordReset(resetToken, password, confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Reset error:', error);
      toast.error(t('auth.resetPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.resetPassword.title')} - IWS LAAYOUNE</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted p-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors mb-6 text-sm font-medium">
            ← Retour à l'accueil
          </Link>

          <div className="bg-card rounded-2xl shadow-xl p-8 border border-border">
            {success ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-primary mb-3">Mot de passe modifié !</h2>
                <p className="text-muted-foreground mb-6">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la connexion...
                </p>
                <Link to="/login">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-primary font-bold">
                    Se connecter maintenant
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center text-primary mb-2">
                  {t('auth.resetPassword.title')}
                </h1>
                <p className="text-center text-muted-foreground text-sm mb-8">
                  Choisissez un nouveau mot de passe sécurisé.
                </p>

                {!resetToken ? (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">Lien invalide ou expiré.</p>
                    <Link to="/forgot-password">
                      <Button className="w-full">Demander un nouveau lien</Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('auth.resetPassword.newPassword')}</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          required value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Minimum 8 caractères"
                          className="bg-background pr-10"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('auth.resetPassword.confirmPassword')}</Label>
                      <Input
                        id="confirmPassword"
                        type="password" required value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Répétez le mot de passe"
                        className={`bg-background ${confirmPassword && confirmPassword !== password ? 'border-red-400' : ''}`}
                      />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                      {loading ? 'Réinitialisation...' : t('auth.resetPassword.submit')}
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
