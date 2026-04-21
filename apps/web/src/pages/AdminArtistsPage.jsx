import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this artist profile?')) {
      return;
    }

    try {
      await pb.collection('artists').delete(id, { requestKey: null });
      toast.success('Artist profile deleted');
      fetchArtists();
    } catch (error) {
      toast.error('Failed to delete artist');
    }
  };

  return (
    <>
      <Helmet>
        <title>Manage Artists - Admin - IWS Smart Platform</title>
        <meta name="description" content="Manage artist profiles" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                Manage Artists
              </h1>
              <p className="text-slate-600">View and manage artist profiles</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Artists</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Genres</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {artists.map((artist) => (
                        <TableRow key={artist.id}>
                          <TableCell className="font-medium">
                            {artist.expand?.user_id?.prenom} {artist.expand?.user_id?.nom}
                          </TableCell>
                          <TableCell>{artist.genres || 'N/A'}</TableCell>
                          <TableCell className="max-w-xs truncate">{artist.bio || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/artist/${artist.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(artist.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default AdminArtistsPage;