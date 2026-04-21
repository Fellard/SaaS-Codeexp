import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const records = await pb.collection('studio_reservations').getFullList({
        expand: 'user_id,service_id',
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await pb.collection('studio_reservations').update(id, {
        statut: newStatus
      }, { requestKey: null });
      
      toast.success('Status updated');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to update status');
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
        <title>Manage Reservations - Admin - IWS Smart Platform</title>
        <meta name="description" content="Manage studio reservations" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                Manage Reservations
              </h1>
              <p className="text-slate-600">View and manage all studio bookings</p>
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
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reservations.map((reservation) => (
                        <TableRow key={reservation.id}>
                          <TableCell className="font-medium">
                            {reservation.expand?.user_id?.prenom} {reservation.expand?.user_id?.nom}
                          </TableCell>
                          <TableCell>{reservation.expand?.service_id?.nom}</TableCell>
                          <TableCell>
                            {format(new Date(reservation.date_reservation), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            {reservation.heure_debut} - {reservation.heure_fin}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(reservation.statut)}`}>
                              {reservation.statut}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Select
                              value={reservation.statut}
                              onValueChange={(value) => handleStatusChange(reservation.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
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

export default AdminReservationsPage;