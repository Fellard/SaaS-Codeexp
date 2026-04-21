import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const ClientReservationsPage = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const records = await pb.collection('studio_reservations').getFullList({
        filter: `user_id = "${currentUser.id}"`,
        expand: 'service_id',
        sort: '-date_reservation',
        requestKey: null
      });
      setReservations(records);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await pb.collection('studio_reservations').update(id, {
        statut: 'cancelled'
      }, { requestKey: null });
      
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to cancel reservation');
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-slate-100 text-slate-700'
    };
    return styles[statut] || styles.pending;
  };

  return (
    <>
      <Helmet>
        <title>My Reservations - IWS Smart Platform</title>
        <meta name="description" content="View and manage your studio reservations" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                My Reservations
              </h1>
              <p className="text-slate-600">View and manage your studio bookings</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : reservations.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">No reservations found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div
                        key={reservation.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 mb-1">
                              {reservation.expand?.service_id?.nom || 'Studio Session'}
                            </h3>
                            <p className="text-sm text-slate-600">
                              {format(new Date(reservation.date_reservation), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(reservation.statut)}`}>
                            {reservation.statut}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            {reservation.heure_debut} - {reservation.heure_fin}
                          </div>
                          
                          {reservation.statut === 'pending' || reservation.statut === 'confirmed' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancel(reservation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </Button>
                          ) : null}
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

export default ClientReservationsPage;