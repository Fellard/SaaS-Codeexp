import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Clock, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const ReservationConfirmationPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [reservation, setReservation] = useState(location.state?.reservation || null);

  useEffect(() => {
    if (!reservation) {
      fetchReservation();
    }
  }, [id]);

  const fetchReservation = async () => {
    try {
      const record = await pb.collection('studio_reservations').getOne(id, {
        expand: 'service_id',
        requestKey: null
      });
      setReservation(record);
    } catch (error) {
      console.error('Failed to fetch reservation:', error);
    }
  };

  if (!reservation) {
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

  return (
    <>
      <Helmet>
        <title>Reservation Confirmed - IWS Smart Platform</title>
        <meta name="description" content="Your studio reservation has been confirmed" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        
        <main className="flex-1 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ textWrap: 'balance' }}>
                  Reservation Confirmed
                </h1>
                <p className="text-slate-600 mb-8">Your studio session has been successfully booked</p>

                <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                  <h2 className="font-semibold text-slate-900 mb-4">Booking Details</h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Service</p>
                        <p className="text-slate-900">{reservation.expand?.service_id?.nom || 'Studio Session'}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Date</p>
                        <p className="text-slate-900">
                          {format(new Date(reservation.date_reservation), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Time</p>
                        <p className="text-slate-900">
                          {reservation.heure_debut} - {reservation.heure_fin}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600">Status</p>
                        <p className="text-slate-900 capitalize">{reservation.statut}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full gap-2">
                      Go to Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link to="/studio-reservation" className="flex-1">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Book Another Session
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ReservationConfirmationPage;