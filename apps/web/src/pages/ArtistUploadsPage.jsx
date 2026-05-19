import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Upload, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

const ArtistUploadsPage = () => {
  const { currentUser } = useAuth();
  const [artistProfile, setArtistProfile] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this upload?')) {
      return;
    }

    try {
      await pb.collection('artist_uploads').delete(id, { requestKey: null });
      toast.success('Upload deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete upload');
    }
  };

  return (
    <>
      <Helmet>
        <title>My Uploads - IWS Smart Platform</title>
        <meta name="description" content="Manage your music uploads" />
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

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                  My Uploads
                </h1>
                <p className="text-slate-600">Manage your music library</p>
              </div>
              <Link to="/artist/upload">
                <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Upload className="w-4 h-4" />
                  Upload New Track
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Uploads</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : !artistProfile ? (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">Create your artist profile first</p>
                    <Link to="/artist/profile/edit">
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        Create Profile
                      </Button>
                    </Link>
                  </div>
                ) : uploads.length === 0 ? (
                  <div className="text-center py-12">
                    <Music className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No uploads yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {uploads.map((upload) => (
                      <div
                        key={upload.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Music className="w-6 h-6 text-indigo-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1">{upload.titre}</h3>
                              <p className="text-sm text-slate-600 line-clamp-1">{upload.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Eye className="w-4 h-4" />
                              {upload.vues || 0}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(upload.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

export default ArtistUploadsPage;