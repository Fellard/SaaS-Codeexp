
import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Camera, Save, KeyRound, User, Mail, Calendar, Loader2, Eye, EyeOff } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();

  // ── Photo ──────────────────────────────────────────────────────────────
  const fileInputRef            = useRef(null);
  const [photoPreview,  setPhotoPreview]  = useState(null);
  const [photoFile,     setPhotoFile]     = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Nom ───────────────────────────────────────────────────────────────
  const [editingName,  setEditingName]  = useState(false);
  const [nameValue,    setNameValue]    = useState(currentUser?.name || '');
  const [savingName,   setSavingName]   = useState(false);

  // ── Mot de passe ──────────────────────────────────────────────────────
  const [showPwdForm,  setShowPwdForm]  = useState(false);
  const [oldPwd,       setOldPwd]       = useState('');
  const [newPwd,       setNewPwd]       = useState('');
  const [confirmPwd,   setConfirmPwd]   = useState('');
  const [showOld,      setShowOld]      = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [savingPwd,    setSavingPwd]    = useState(false);

  // ── Helpers ───────────────────────────────────────────────────────────
  const getAvatarUrl = () => {
    if (photoPreview) return photoPreview;
    if (currentUser?.avatar) {
      return pb.files.getURL(currentUser, currentUser.avatar, { thumb: '200x200' });
    }
    return null;
  };

  const getInitials = () => {
    return (currentUser?.name || 'U')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // ── Sélection de fichier ──────────────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (JPG, PNG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop grande — maximum 5 Mo.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  // ── Upload photo ──────────────────────────────────────────────────────
  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', photoFile);
      await pb.collection('users').update(currentUser.id, formData);
      // Rafraîchit le modèle en authStore pour que le certificat soit à jour
      await pb.collection('users').authRefresh({ requestKey: null });
      toast.success('Photo de profil mise à jour !');
      setPhotoFile(null);
      // On garde le preview jusqu'au prochain rafraîchissement de page
    } catch (err) {
      toast.error('Erreur lors de l\'upload : ' + (err?.message || 'inconnu'));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // ── Annuler preview ───────────────────────────────────────────────────
  const handleCancelPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Sauvegarder le nom ────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSavingName(true);
    try {
      await pb.collection('users').update(currentUser.id, { name: nameValue.trim() });
      await pb.collection('users').authRefresh({ requestKey: null });
      toast.success('Nom mis à jour !');
      setEditingName(false);
    } catch (err) {
      toast.error('Erreur : ' + (err?.message || 'inconnu'));
    } finally {
      setSavingName(false);
    }
  };

  // ── Changer le mot de passe ───────────────────────────────────────────
  const handleChangePwd = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      toast.error('Veuillez remplir tous les champs.');
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (newPwd.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setSavingPwd(true);
    try {
      await pb.collection('users').update(currentUser.id, {
        oldPassword:     oldPwd,
        password:        newPwd,
        passwordConfirm: confirmPwd,
      });
      toast.success('Mot de passe mis à jour !');
      setShowPwdForm(false);
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      const detail = err?.response?.data;
      if (detail?.oldPassword) {
        toast.error('Ancien mot de passe incorrect.');
      } else {
        toast.error('Erreur : ' + (err?.message || 'inconnu'));
      }
    } finally {
      setSavingPwd(false);
    }
  };

  const avatarUrl = getAvatarUrl();

  return (
    <DashboardLayout>
      <Helmet>
        <title>{t('dashboard.profile')} — IWS Formation</title>
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* ── Photo + Nom ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Mon profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Avatar */}
            <div className="flex items-end gap-5">
              {/* Photo circle */}
              <div className="relative group flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-indigo-100 shadow-md bg-indigo-600 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={currentUser?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">{getInitials()}</span>
                  )}
                </div>
                {/* Overlay hover */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Changer la photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-1">Photo de profil</p>
                <p className="text-xs text-slate-500 mb-3">
                  Cette photo apparaît sur votre certificat.<br />
                  Format JPG/PNG · Max 5 Mo · Carré recommandé
                </p>
                {/* Actions photo */}
                {photoFile ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUploadPhoto}
                      disabled={uploadingPhoto}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {uploadingPhoto
                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Envoi…</>
                        : <><Save className="w-3.5 h-3.5 mr-1" /> Enregistrer</>}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelPhoto}>
                      Annuler
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    {currentUser?.avatar ? 'Modifier la photo' : 'Ajouter une photo'}
                  </Button>
                )}
              </div>
            </div>

            {/* Ligne de séparation */}
            <div className="border-t border-slate-100" />

            {/* Nom */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <User className="w-3 h-3" /> Nom complet
              </Label>
              {editingName ? (
                <div className="flex gap-2">
                  <Input
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    className="flex-1"
                    placeholder="Votre nom complet"
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                    autoFocus
                  />
                  <Button size="sm" onClick={handleSaveName} disabled={savingName} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingName(false); setNameValue(currentUser?.name || ''); }}>
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold text-slate-800">{currentUser?.name}</p>
                  <Button size="sm" variant="ghost" className="text-xs text-slate-500" onClick={() => setEditingName(true)}>
                    Modifier
                  </Button>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> Adresse e-mail
              </Label>
              <p className="text-base text-slate-800">{currentUser?.email}</p>
              <p className="text-xs text-slate-400 mt-0.5">L'email ne peut pas être modifié ici.</p>
            </div>

            {/* Date d'inscription */}
            <div>
              <Label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Inscrit le
              </Label>
              <p className="text-base text-slate-800">
                {currentUser?.created
                  ? new Date(currentUser.created).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Sécurité ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showPwdForm ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Mot de passe</p>
                  <p className="text-xs text-slate-400">Dernière modification inconnue</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPwdForm(true)}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                >
                  Changer le mot de passe
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Ancien mot de passe */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Ancien mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showOld ? 'text' : 'password'}
                      value={oldPwd}
                      onChange={e => setOldPwd(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOld(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nouveau */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmation */}
                <div>
                  <Label className="text-xs text-slate-500 mb-1 block">Confirmer le nouveau mot de passe</Label>
                  <Input
                    type="password"
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
                  />
                  {newPwd && confirmPwd && newPwd !== confirmPwd && (
                    <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    onClick={handleChangePwd}
                    disabled={savingPwd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {savingPwd
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Enregistrement…</>
                      : <><Save className="w-3.5 h-3.5 mr-1" /> Enregistrer</>}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { setShowPwdForm(false); setOldPwd(''); setNewPwd(''); setConfirmPwd(''); }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
