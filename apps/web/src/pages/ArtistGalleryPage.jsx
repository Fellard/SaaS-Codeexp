import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Music, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const ArtistGalleryPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const records = await pb.collection('artists').getFullList({
        expand: 'user_id',
        sort: '-created',
        requestKey: null
      });
      setArtists(records);
    } catch (error) {
      console.error('Failed to fetch artists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist => {
    const name = `${artist.expand?.user_id?.prenom} ${artist.expand?.user_id?.nom}`.toLowerCase();
    const genres = artist.genres?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return name.includes(search) || genres.includes(search);
  });

  return (
    <>
      <Helmet>
        <title>Artists Gallery - IWS Smart Platform</title>
        <meta name="description" content="Discover talented artists and their music" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* IWS RECORDS Logo Section */}
            <div className="section-logo-wrapper">
              <img 
                src="https://horizons-cdn.hostinger.com/1c587036-9b82-4552-a7aa-82b55c0e4cbb/3fdcf82954450e661c86392caf261342.png" 
                alt="IWS RECORDS Logo" 
                className="section-logo-img"
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                Discover Artists
              </h1>
              <p className="text-slate-600">Explore talented musicians and their work</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search artists by name or genre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Artists Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="w-20 h-20 rounded-2xl mx-auto mb-4" />
                      <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                      <Skeleton className="h-4 w-1/2 mx-auto" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredArtists.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No artists found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArtists.map((artist) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`}>
                    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                      <CardContent className="p-6 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          {artist.photo_profil ? (
                            <img
                              src={pb.files.getUrl(artist, artist.photo_profil)}
                              alt={artist.expand?.user_id?.nom}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <Music className="w-10 h-10 text-white" />
                          )}
                        </div>
                        
                        <h3 className="font-semibold text-slate-900 mb-2">
                          {artist.expand?.user_id?.prenom} {artist.expand?.user_id?.nom}
                        </h3>
                        
                        {artist.genres && (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {artist.genres.split(',').slice(0, 2).map((genre, i) => (
                              <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                                {genre.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ArtistGalleryPage;