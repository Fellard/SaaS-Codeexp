import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DashboardStats from '@/components/DashboardStats.jsx';
import RecentActivity from '@/components/RecentActivity.jsx';
import QuickShortcuts from '@/components/QuickShortcuts.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Eye, Upload, Headphones, TrendingUp, PlayCircle, Users, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ArtistDashboard = () => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const [artistProfile, setArtistProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistData();
  }, []);

  const fetchArtistData = async () => {
    try {
      const profiles = await pb.collection('artists').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        requestKey: null
      });
      
      if (profiles.length > 0) {
        setArtistProfile(profiles[0]);
        
        const uploadRecords = await pb.collection('artist_uploads').getFullList({
          filter: `artist_id = "${profiles[0].id}"`,
          sort: '-date_upload',
          requestKey: null
        });
        setUploads(uploadRecords);
      }
    } catch (error) {
      console.error('Failed to fetch artist data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Stats
  const totalUploads = uploads.length;
  const totalViews = uploads.reduce((sum, u) => sum + (u.vues || 0), 0);
  const averageViews = totalUploads > 0 ? Math.round(totalViews / totalUploads) : 0;
  
  // Top tracks
  const topTracks = [...uploads].sort((a, b) => (b.vues || 0) - (a.vues || 0)).slice(0, 3);

  // Prepare Activity Data
  const recentActivities = uploads.slice(0, 5).map(u => ({
    id: u.id,
    title: u.titre,
    description: `${u.vues || 0} views`,
    date: u.date_upload || u.created,
    icon: Music,
    color: 'pink',
    actionLink: '/artist/uploads',
    actionLabel: t('artistDashboard.manageAll') || 'Manage'
  }));

  // Prepare Shortcuts
  const shortcuts = [
    { label: t('artistDashboard.shortcuts.upload') || 'Upload Music', description: t('artistDashboard.shortcuts.uploadDesc') || 'Share your latest track', icon: Upload, path: '/artist/upload', color: 'pink' },
    { label: t('artistDashboard.shortcuts.gallery') || 'Artist Gallery', description: t('artistDashboard.shortcuts.galleryDesc') || 'Discover other creators', icon: Users, path: '/artists', color: 'indigo' },
    { label: t('artistDashboard.shortcuts.editProfile') || 'Edit Profile', description: t('artistDashboard.shortcuts.editProfileDesc') || 'Update your bio', icon: Star, path: '/artist/profile/edit', color: 'purple' },
  ];

  return (
    <>
      <Helmet>
        <title>{t('Dashboard')} - IWS Smart Platform</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/50" dir={isRtl ? 'rtl' : 'ltr'}>
        <Header />
        
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* IWS RECORDS Logo Section */}
            <div className="section-logo-wrapper">
              <img 
                src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/3fdcf82954450e661c86392caf261342.png" 
                alt="IWS RECORDS Logo" 
                className="section-logo-img"
              />
            </div>

            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                  {t('artistDashboard.welcome') || 'Welcome'}, {currentUser?.prenom}
                </h1>
                <p className="text-slate-500">{t('artistDashboard.subtitle') || 'Manage your music portfolio and track engagement.'}</p>
              </div>
              {artistProfile && (
                <Link to={`/artist/${artistProfile.id}`}>
                  <Button variant="outline" className="bg-white">{t('artistDashboard.viewProfile') || 'View Public Profile'}</Button>
                </Link>
              )}
            </div>

            {/* Stats Grid */}
            <div className="dash-grid-bento mb-8">
              <DashboardStats 
                title={t('artistDashboard.totalUploads') || 'Total Uploads'} 
                value={loading ? '-' : totalUploads} 
                icon={Music} 
                color="pink"
                description={t('artistDashboard.uploadsDesc') || 'Tracks in your library'}
              />
              <DashboardStats 
                title={t('artistDashboard.totalListens') || 'Total Listens'} 
                value={loading ? '-' : totalViews} 
                icon={Headphones} 
                color="indigo"
                description={t('artistDashboard.listensDesc') || 'All tracks'}
              />
              <DashboardStats 
                title={t('artistDashboard.avgEngagement') || 'Avg. Engagement'} 
                value={loading ? '-' : averageViews} 
                icon={TrendingUp} 
                color="purple"
                description={t('artistDashboard.engagementDesc') || 'Listens per track'}
              />
              <DashboardStats 
                title={t('artistDashboard.topGenre') || 'Top Genre'} 
                value={loading ? '-' : (artistProfile?.genres?.split(',')[0] || 'N/A')} 
                icon={Star} 
                color="orange"
                description={t('artistDashboard.genreDesc') || 'Primary style'}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Top Tracks Section */}
                <Card className="dash-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold">{t('artistDashboard.topTracks') || 'Top Performing Tracks'}</CardTitle>
                    <Link to="/artist/uploads" className="text-sm font-medium text-pink-600 hover:text-pink-700">
                      {t('artistDashboard.manageAll') || 'Manage all'}
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-16 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : !artistProfile ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium mb-1">{t('artistDashboard.profileIncomplete') || 'Profile Incomplete'}</p>
                        <p className="text-sm text-slate-500 mb-4">{t('artistDashboard.createProfileDesc') || 'Create your artist profile to start uploading.'}</p>
                        <Link to="/artist/profile/edit">
                          <Button size="sm" className="bg-pink-600 hover:bg-pink-700">{t('artistDashboard.createProfileBtn') || 'Create Profile'}</Button>
                        </Link>
                      </div>
                    ) : topTracks.length === 0 ? (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Music className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium mb-1">{t('artistDashboard.noTracks') || 'No tracks uploaded'}</p>
                        <p className="text-sm text-slate-500 mb-4">{t('artistDashboard.shareFirst') || 'Share your first creation with the world.'}</p>
                        <Link to="/artist/upload">
                          <Button size="sm" className="bg-pink-600 hover:bg-pink-700">{t('artistDashboard.uploadTrackBtn') || 'Upload Track'}</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topTracks.map((track, index) => (
                          <div key={track.id} className="flex items-center p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group">
                            <div className="w-8 text-center font-bold text-slate-300 group-hover:text-pink-400 transition-colors">
                              {index + 1}
                            </div>
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600 mx-3 flex-shrink-0">
                              <PlayCircle className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 truncate">{track.titre}</h4>
                              <p className="text-xs text-slate-500 truncate">{track.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                              <Headphones className="w-4 h-4" />
                              {track.vues || 0}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <QuickShortcuts shortcuts={shortcuts} />
              </div>

              {/* Sidebar Area */}
              <div className="lg:col-span-1">
                <RecentActivity activities={recentActivities} title={t('artistDashboard.recentUploads') || 'Recent Uploads'} viewAllLink="/artist/uploads" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtistDashboard;