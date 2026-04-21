import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const AudioUploadForm = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [artistProfile, setArtistProfile] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    fichier_audio: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArtistProfile();
  }, []);

  const fetchArtistProfile = async () => {
    try {
      const profiles = await pb.collection('artists').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        requestKey: null
      });
      
      if (profiles.length > 0) {
        setArtistProfile(profiles[0]);
      }
    } catch (error) {
      console.error('Failed to fetch artist profile:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, fichier_audio: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!artistProfile) {
      toast.error('Please create your artist profile first');
      navigate('/artist/profile/edit');
      return;
    }

    if (!formData.fichier_audio) {
      toast.error('Please select an audio file');
      return;
    }

    setLoading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('artist_id', artistProfile.id);
      uploadData.append('titre', formData.titre);
      uploadData.append('description', formData.description);
      uploadData.append('fichier_audio', formData.fichier_audio);
      uploadData.append('vues', 0);

      await pb.collection('artist_uploads').create(uploadData, { requestKey: null });
      
      toast.success('Track uploaded successfully');
      navigate('/artist/uploads');
    } catch (error) {
      toast.error('Failed to upload track');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Upload Track - IWS Smart Platform</title>
        <meta name="description" content="Upload your music to share with the world" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                Upload New Track
              </h1>
              <p className="text-slate-600">Share your music with the world</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Track Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="titre">Track Title</Label>
                    <Input
                      id="titre"
                      type="text"
                      value={formData.titre}
                      onChange={(e) => handleChange('titre', e.target.value)}
                      placeholder="Enter track title"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Describe your track..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fichier_audio">Audio File</Label>
                    <Input
                      id="fichier_audio"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      required
                      className="mt-1"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Supported formats: MP3, WAV, FLAC, AAC
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 active:scale-[0.98] gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? 'Uploading...' : 'Upload Track'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AudioUploadForm;