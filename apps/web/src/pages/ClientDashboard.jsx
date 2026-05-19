import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import DashboardStats from '@/components/DashboardStats.jsx';
import RecentActivity from '@/components/RecentActivity.jsx';
import QuickShortcuts from '@/components/QuickShortcuts.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle, CreditCard, Mic2, ShoppingBag, BookOpen, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, isAfter, parseISO } from 'date-fns';

const ClientDashboard = () => {
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

  // Calculate Stats
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter(r => r.statut === 'en attente' || r.statut === 'pending').length;
  const completedReservations = reservations.filter(r => r.statut === 'completed' || r.statut === 'confirmee').length;
  
  const totalSpent = reservations.reduce((sum, r) => {
    if (r.statut !== 'annulee' && r.statut !== 'cancelled') {
      return sum + (r.expand?.service_id?.prix || 0);
    }
    return sum;
  }, 0);

  // Find next reservation
  const now = new Date();
  const upcoming = reservations
    .filter(r => (r.statut === 'confirmee' || r.statut === 'confirmed' || r.statut === 'en attente' || r.statut === 'pending') && isAfter(parseISO(r.date_reservation), now))
    .sort((a, b) => parseISO(a.date_reservation) - parseISO(b.date_reservation));
  
  const nextReservation = upcoming.length > 0 ? upcoming[0] : null;

  // Prepare Activity Data
  const recentActivities = reservations.slice(0, 5).map(r => {
    let icon = Calendar;
    let color = 'slate';
    let desc = `Reservation for ${r.expand?.service_id?.nom || 'Studio'}`;

    if (r.statut === 'confirmee' || r.statut === 'confirmed') { icon = CheckCircle; color = 'green'; desc = 'Reservation confirmed'; }
    else if (r.statut === 'annulee' || r.statut === 'cancelled') { icon = Clock; color = 'red'; desc = 'Reservation cancelled'; }
    else if (r.statut === 'completed') { icon = CheckCircle; color = 'indigo'; desc = 'Session completed'; }
    else { icon = Clock; color = 'orange'; desc = 'Reservation pending approval'; }

    return {
      id: r.id,
      title: r.expand?.service_id?.nom || 'Studio Session',
      description: desc,
      date: r.updated,
      icon: icon,
      color: color,
      actionLink: '/client/reservations',
      actionLabel: 'View'
    };
  });

  // Prepare Shortcuts
  const shortcuts = [
    { label: 'Book Studio', description: 'Reserve professional space', icon: Mic2, path: '/studio-reservation', color: 'indigo' },
    { label: 'Platform Store', description: 'Buy digital assets & gear', icon: ShoppingBag, path: '/store', color: 'purple' },
    { label: 'Browse Courses', description: 'Learn new skills', icon: BookOpen, path: '/courses', color: 'teal' },
  ];

  return (
    <>
      <Helmet>
        <title>Client Dashboard - IWS Smart Platform</title>
        <meta name="description" content="Manage your studio reservations and bookings" />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Header />
        
        <main className="flex-1 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 tracking-tight">
                Welcome, {currentUser?.prenom}
              </h1>
              <p className="text-slate-500">Manage your studio bookings and purchases.</p>
            </div>

            {/* Stats Grid */}
            <div className="dash-grid-bento mb-8">
              <DashboardStats 
                title="Total Bookings" 
                value={loading ? '-' : totalReservations} 
                icon={Calendar} 
                color="indigo"
                description="All time reservations"
              />
              <DashboardStats 
                title="Pending Approval" 
                value={loading ? '-' : pendingReservations} 
                icon={Clock} 
                color="orange"
                description="Awaiting confirmation"
              />
              <DashboardStats 
                title="Completed Sessions" 
                value={loading ? '-' : completedReservations} 
                icon={CheckCircle} 
                color="green"
                description="Successfully finished"
              />
              <DashboardStats 
                title="Total Spent" 
                value={loading ? '-' : `$${totalSpent.toFixed(2)}`} 
                icon={CreditCard} 
                color="purple"
                description="On studio services"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2 space-y-8">
                {/* Next Reservation Section */}
                <Card className="dash-card overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">Next Upcoming Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-10 w-full mt-4" />
                      </div>
                    ) : nextReservation ? (
                      <div className="bg-white rounded-xl border border-indigo-100 p-6 shadow-sm relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <Mic2 className="w-7 h-7" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">
                                {nextReservation.expand?.service_id?.nom || 'Studio Session'}
                              </h3>
                              <p className="text-slate-500 font-medium">
                                {format(parseISO(nextReservation.date_reservation), 'EEEE, MMMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-medium text-sm mb-1">
                              <Clock className="w-4 h-4" />
                              {nextReservation.heure_debut} - {nextReservation.heure_fin}
                            </div>
                            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                              Status: <span className={nextReservation.statut.includes('confirm') ? 'text-green-600' : 'text-orange-500'}>{nextReservation.statut}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Link to="/client/reservations" className="flex-1">
                            <Button variant="outline" className="w-full">Manage Booking</Button>
                          </Link>
                          <Link to="/studio-reservation" className="flex-1">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Book Another</Button>
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium mb-1">No upcoming sessions</p>
                        <p className="text-sm text-slate-500 mb-4">Ready to record your next project?</p>
                        <Link to="/studio-reservation">
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Book Studio Now</Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Shortcuts */}
                <QuickShortcuts shortcuts={shortcuts} />
              </div>

              {/* Sidebar Area */}
              <div className="lg:col-span-1">
                <RecentActivity activities={recentActivities} title="Booking History" viewAllLink="/client/reservations" />
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ClientDashboard;