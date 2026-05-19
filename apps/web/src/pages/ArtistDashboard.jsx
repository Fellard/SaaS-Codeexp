/**
 * ArtistDashboard — Espace Musicien IWS LAAYOUNE
 * Dashboard professionnel pour les musiciens :
 *  - Stats : titres uploadés, écoutes totales, engagement moyen
 *  - Uploads récents avec lecteur rapide
 *  - Accès rapide : Studio, Galerie, Profil, Magasin
 *  - CTA création de profil si aucun profil artiste
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Music2, Headphones, TrendingUp, Star, Upload, Users,
  PlayCircle, ExternalLink, Mic2, ShoppingBag,
  ChevronRight, Sparkles, Calendar, Globe,
  CheckCircle2, UserCircle2,
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
};

const fmtShort = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, loading }) => (
  <div className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color.bg}`}>
      <Icon className={`w-5 h-5 ${color.text}`} />
    </div>
    {loading
      ? <Skeleton className="h-8 w-20 mb-1" />
      : <p className={`text-2xl font-black ${color.text}`}>{value}</p>
    }
    <p className="text-sm font-semibold text-foreground mt-0.5">{label}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

// ── Ligne de piste ─────────────────────────────────────────────────────────────
const TrackRow = ({ track, rank }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors group">
    <span className="w-6 text-center text-xs font-black text-muted-foreground/50 group-hover:text-pink-500 transition-colors">
      {rank}
    </span>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
      <PlayCircle className="w-5 h-5 text-pink-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-foreground truncate">{track.titre || track.title || 'Sans titre'}</p>
      <p className="text-xs text-muted-foreground">{fmtShort(track.date_upload || track.created)}</p>
    </div>
    <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full flex-shrink-0">
      <Headphones className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-xs font-bold text-foreground">{(track.vues || 0).toLocaleString()}</span>
    </div>
  </div>
);

// ── Page principale ───────────────────────────────────────────────────────────
const ArtistDashboard = () => {
  const { currentUser } = useAuth();

  const [artistProfile, setArtistProfile] = useState(null);
  const [uploads,       setUploads]       = useState([]);
  const [loading,       setLoading]       = useState(true);

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || currentUser.name || 'Musicien')
    : 'Musicien';

  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MU';

  const memberSince = currentUser?.created
    ? new Date(currentUser.created).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : null;

  useEffect(() => {
    if (!currentUser?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const profiles = await pb.collection('artists').getFullList({
          filter: `user_id = "${currentUser.id}"`,
          requestKey: null,
        }).catch(() => []);

        if (profiles.length > 0) {
          setArtistProfile(profiles[0]);
          const ups = await pb.collection('artist_uploads').getFullList({
            filter: `artist_id = "${profiles[0].id}"`,
            sort: '-date_upload',
            requestKey: null,
          }).catch(() => []);
          setUploads(ups);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser?.id]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalUploads  = uploads.length;
  const totalVues     = uploads.reduce((s, u) => s + (u.vues || 0), 0);
  const avgVues       = totalUploads > 0 ? Math.round(totalVues / totalUploads) : 0;
  const topTrackVues  = uploads.length > 0
    ? Math.max(...uploads.map(u => u.vues || 0))
    : 0;

  const topTracks   = [...uploads].sort((a, b) => (b.vues || 0) - (a.vues || 0)).slice(0, 5);
  const recentTracks = uploads.slice(0, 3);

  return (
    <>
      <Helmet><title>Espace Musicien — IWS LAAYOUNE</title></Helmet>
      <DashboardLayout>

        {/* ── Carte héro ────────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#1a0533] via-[#2d0a52] to-[#4a0e7a] rounded-3xl p-6 sm:p-8 mb-8 overflow-hidden shadow-lg">
          {/* Déco */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          {/* Accent bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-pink-500" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white font-black text-xl shadow-lg flex-shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-white/60 text-sm font-medium">{getGreeting()},</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {displayName} 🎵
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-xs font-bold text-pink-300">
                    <Music2 className="w-3 h-3" /> Musicien IWS
                  </span>
                  {memberSince && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 rounded-full text-xs text-white/70">
                      <Calendar className="w-3 h-3" /> Depuis {memberSince}
                    </span>
                  )}
                  {totalUploads > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> {totalUploads} titre{totalUploads > 1 ? 's' : ''} publiés
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              {artistProfile && (
                <Link to={`/artist/${artistProfile.id}`}>
                  <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white/20 transition-colors">
                    <ExternalLink className="w-4 h-4" /> Mon profil public
                  </button>
                </Link>
              )}
              <Link to="/artist/upload">
                <button className="flex items-center gap-2 bg-pink-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-pink-400 transition-colors shadow-md">
                  <Upload className="w-4 h-4" /> Publier un titre
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Pas encore de profil artiste ───────────────────────────────── */}
        {!loading && !artistProfile && (
          <div className="bg-gradient-to-br from-pink-50 to-purple-50/50 border border-pink-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <UserCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base">Créez votre profil artiste</h3>
                <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">
                  Partagez votre musique avec la communauté IWS et gagnez en visibilité.
                </p>
              </div>
            </div>
            <Link to="/artist/profile/edit">
              <button className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white font-bold px-5 py-3 rounded-xl transition-opacity shadow-md flex-shrink-0 text-sm">
                <UserCircle2 className="w-4 h-4" /> Créer mon profil
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        )}

        {/* ── Stats ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Music2} label="Titres publiés" value={loading ? '—' : totalUploads}
            sub={totalUploads === 0 ? 'Publiez votre premier titre' : `dans votre catalogue`}
            color={{ bg: 'bg-pink-50', text: 'text-pink-600' }} loading={loading}
          />
          <StatCard
            icon={Headphones} label="Écoutes totales" value={loading ? '—' : totalVues.toLocaleString()}
            sub="sur tous vos titres"
            color={{ bg: 'bg-purple-50', text: 'text-purple-600' }} loading={loading}
          />
          <StatCard
            icon={TrendingUp} label="Moy. par titre" value={loading ? '—' : avgVues.toLocaleString()}
            sub="écoutes en moyenne"
            color={{ bg: 'bg-blue-50', text: 'text-blue-600' }} loading={loading}
          />
          <StatCard
            icon={Star} label="Meilleur titre" value={loading ? '—' : topTrackVues.toLocaleString()}
            sub="écoutes max"
            color={{ bg: 'bg-amber-50', text: 'text-amber-600' }} loading={loading}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">

          {/* ── Top titres ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-500" /> Top titres
              </h2>
              {uploads.length > 0 && (
                <Link to="/artist/uploads">
                  <button className="text-xs text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 transition-colors">
                    Tout gérer <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              )}
            </div>
            <div className="p-3">
              {loading ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : topTracks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Music2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Aucun titre publié</p>
                  <p className="text-xs mt-1 mb-4">Partagez votre première création avec la communauté</p>
                  <Link to="/artist/upload">
                    <button className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-4 py-2 rounded-xl text-sm transition-colors">
                      <Upload className="w-4 h-4" /> Publier un titre
                    </button>
                  </Link>
                </div>
              ) : (
                topTracks.map((track, i) => (
                  <TrackRow key={track.id} track={track} rank={i + 1} />
                ))
              )}
            </div>
          </div>

          {/* ── Accès rapide ───────────────────────────────────────────── */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Services IWS
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {[
                {
                  to: '/studio', icon: Mic2,
                  label: 'Studio d\'enregistrement',
                  desc: 'Réserver une session',
                  bg: 'bg-purple-50', color: 'text-purple-600', border: 'border-purple-100',
                },
                {
                  to: '/artist/upload', icon: Upload,
                  label: 'Publier un titre',
                  desc: 'Partager votre musique',
                  bg: 'bg-pink-50', color: 'text-pink-600', border: 'border-pink-100',
                },
                {
                  to: '/artists', icon: Users,
                  label: 'Galerie des artistes',
                  desc: 'Découvrir la communauté',
                  bg: 'bg-blue-50', color: 'text-blue-600', border: 'border-blue-100',
                },
                {
                  to: '/store', icon: ShoppingBag,
                  label: 'Magasin',
                  desc: 'Instruments & accessoires',
                  bg: 'bg-amber-50', color: 'text-amber-600', border: 'border-amber-100',
                },
                {
                  to: '/artist/profile/edit', icon: UserCircle2,
                  label: 'Mon profil artiste',
                  desc: 'Modifier ma bio',
                  bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100',
                },
              ].map(s => (
                <Link key={s.to} to={s.to} className="block group">
                  <div className={`flex items-center gap-3 p-3 rounded-xl border ${s.border} ${s.bg} hover:shadow-sm transition-all`}>
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold ${s.color}`}>{s.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── Uploads récents ────────────────────────────────────────────── */}
        {!loading && recentTracks.length > 0 && (
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Music2 className="w-4 h-4 text-purple-600" /> Derniers uploads
              </h2>
              <Link to="/artist/uploads">
                <button className="text-xs text-muted-foreground hover:text-primary font-semibold flex items-center gap-1 transition-colors">
                  Voir tout <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            <div className="p-4 space-y-3">
              {recentTracks.map(track => (
                <div key={track.id} className="flex items-center gap-4 p-3 bg-muted/30 border border-border rounded-2xl hover:border-pink-200 hover:shadow-sm transition-all">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {track.titre || track.title || 'Sans titre'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {fmtShort(track.date_upload || track.created)} · {(track.vues || 0).toLocaleString()} écoutes
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-pink-100 px-2.5 py-1 rounded-full flex-shrink-0">
                    <Headphones className="w-3.5 h-3.5 text-pink-600" />
                    <span className="text-xs font-bold text-pink-700">{(track.vues || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </DashboardLayout>
    </>
  );
};

export default ArtistDashboard;
