import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InteractionHistoryComponent from '@/components/InteractionHistoryComponent.jsx';
import AddInteractionForm from '@/components/AddInteractionForm.jsx';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const ClientDetailPage = () => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient();
  }, [id]);

  const fetchClient = async () => {
    try {
      const record = await pb.collection('crm_clients').getOne(id, {
        expand: 'user_id',
        requestKey: null
      });
      setClient(record);
    } catch (error) {
      console.error('Failed to fetch client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <p className="text-slate-600">Client not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${client.nom} - CRM - IWS Smart Platform`}</title>
        <meta name="description" content="Client details and interaction history" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Client Info */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Name</p>
                        <p className="font-medium text-slate-900">{client.nom}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <p className="font-medium text-slate-900">{client.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <p className="font-medium text-slate-900">{client.telephone}</p>
                      </div>
                    </div>

                    {client.adresse && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Address</p>
                          <p className="font-medium text-slate-900">{client.adresse}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="mt-6">
                  <AddInteractionForm clientId={id} onSuccess={fetchClient} />
                </div>
              </div>

              {/* Interaction History */}
              <div className="lg:col-span-2">
                <InteractionHistoryComponent clientId={id} />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ClientDetailPage;