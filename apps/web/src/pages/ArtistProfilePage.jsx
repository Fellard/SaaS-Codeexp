import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Edit, Play, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ArtistProfilePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [artist, setArtist] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArtistData();
  }, [id]);

  const fetchArtistData = async () => {
    try {
      const artistRecord = await pb.collection('artists').getOne(id, {
        expand: 'user_id',
        requestKey: null
      });
      setArtist(artistRecord);

      const uploadRecords = await pb.collection('artist_uploads').getFullList({
        filter: `artist_id = "${id}"`,
        sort: '-date_upload',
        requestKey: null
      });
      setUploads(uploadRecords);
    } catch (error) {
      console.error('Failed to fetch artist:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOwnProfile = currentUser && artist?.user_id === currentUser.id;

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-64 w-full rounded-2xl mb-8" />
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!artist) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <Music className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Artist not found</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${artist.expand?.user_id?.nom || 'Artist'} - IWS Smart Platform`}</title>
        <meta name="description" content={artist.bio || 'Artist profile'} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* IWS RECORDS Logo Section */}
            <div className="section-logo-wrapper">
              <img 
                src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/3fdcf82954450e661c86392caf261342.png" 
                alt="IWS RECORDS Logo" 
                className="section-logo-img"
              />
            </div>

            {/* Profile Header */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    {artist.photo_profil ? (
                      <img
                        src={pb.files.getUrl(artist, artist.photo_profil)}
                        alt={artist.expand?.user_id?.nom}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <Music className="w-12 h-12 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                          {artist.expand?.user_id?.prenom} {artist.expand?.user_id?.nom}
                        </h1>
                        {artist.genres && (
                          <div className="flex flex-wrap gap-2">
                            {artist.genres.split(',').map((genre, i) => (
                              <span key={i} className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                                {genre.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isOwnProfile && (
                        <Link to="/artist/profile/edit">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Profile
                          </Button>
                        </Link>
                      )}
                    </div>
                    
                    {artist.bio && (
                      <p className="text-slate-600 leading-relaxed">{artist.bio}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Uploads */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">Music</h2>
                
                {uploads.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No uploads yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Music className="w-6 h-6 text-indigo-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 mb-1">{upload.titre}</h3>
                            <p className="text-sm text-slate-600 line-clamp-1">{upload.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Eye className="w-4 h-4" />
                              {upload.vues || 0}
                            </div>
                            {upload.fichier_audio && (
                              <audio controls className="h-10">
                                <source src={pb.files.getUrl(upload, upload.fichier_audio)} />
                              </audio>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtistProfilePage;