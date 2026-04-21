import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Mic2, Clock, ArrowLeft, CalendarDays, CheckCircle2,
  Info, Loader2, Phone, MessageSquare, User
} from 'lucide-react';

const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00','13:00','14:00',
  '15:00','16:00','17:00','18:00','19:00','20:00','21:00','22:00'
];

const StudioReservationPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [services,        setServices]        = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate,    setSelectedDate]    = useState(new Date());
  const [startTime,       setStartTime]       = useState('');
  const [endTime,         setEndTime]         = useState('');
  const [clientTel,       setClientTel]       = useState('');
  const [notes,           setNotes]           = useState('');
  const [loading,         setLoading]         = useState(false);
  const [bookedSlots,     setBookedSlots]     = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Connectez-vous pour réserver une session.');
      navigate('/login');
      return;
    }
    pb.collection('studio_services').getFullList({ sort: 'prix', requestKey: null })
      .then(setServices).catch(() => {});
  }, [isAuthenticated, navigate]);

  // Load booked slots when date or service changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    pb.collection('studio_reservations').getFullList({
      filter: `service_id='${selectedService}' && date_reservation='${dateStr}' && statut!='annulée'`,
      requestKey: null,
    }).then(setBookedSlots).catch(() => {});
  }, [selectedService, selectedDate]);

  const isSlotBooked = (slot) => {
    return bookedSlots.some(r => {
      return slot >= r.heure_debut && slot < r.heure_fin;
    });
  };

  const selectedSvc = services.find(s => s.id === selectedService);
  const durationH   = (() => {
    if (!startTime || !endTime) return 0;
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    return Math.max(0, (eh * 60 + em - (sh * 60 + sm)) / 60);
  })();
  const estimatedCost = selectedSvc ? Math.round(selectedSvc.prix * durationH) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return toast.error('Veuillez choisir un service.');
    if (!clientTel.trim()) return toast.error('Veuillez saisir votre numéro de téléphone.');
    if (!startTime || !endTime) return toast.error('Veuillez choisir les horaires.');
    if (startTime >= endTime) return toast.error('L\'heure de fin doit être après l\'heure de début.');
    if (durationH < 0.5) return toast.error('La durée minimale est de 30 minutes.');

    setLoading(true);
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      // Vérification chevauchement
      const existing = await pb.collection('studio_reservations').getList(1, 1, {
        filter: `service_id='${selectedService}' && date_reservation='${dateStr}' && heure_debut<'${endTime}' && heure_fin>'${startTime}' && statut!='annulée'`,
        requestKey: null,
      });

      if (existing.totalItems > 0) {
        toast.error('Ce créneau est déjà réservé. Choisissez un autre horaire.');
        setLoading(false);
        return;
      }

      const reservation = await pb.collection('studio_reservations').create({
        user_id:          currentUser.id,
        service_id:       selectedService,
        date_reservation: dateStr,
        heure_debut:      startTime,
        heure_fin:        endTime,
        statut:           'en attente',
        client_tel:       clientTel.trim(),
        client_nom:       currentUser.name || currentUser.nom || '',
        notes:            notes.trim(),
      }, { requestKey: null });

      toast.success('🎙️ Réservation envoyée !');
      navigate(`/studio/confirmation/${reservation.id}`, {
        state: {
          service:   selectedSvc,
          date:      dateStr,
          start:     startTime,
          end:       endTime,
          tel:       clientTel.trim(),
          email:     currentUser.email,
          nom:       currentUser.name || currentUser.nom || '',
          montant:   estimatedCost,
        }
      });
    } catch (error) {
      toast.error('Erreur lors de la réservation. Réessayez.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Réserver une session — IWS Records Studio</title>
        <meta name="description" content="Réservez votre session d'enregistrement au studio IWS Records à Laayoune." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Back */}
            <Link to="/studio" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group text-sm">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Retour au studio
            </Link>

            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm mb-4 border border-purple-200">
                <Mic2 className="w-4 h-4" />IWS Records Studio
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3 tracking-tight">
                Réserver une session
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Choisissez votre service, la date et les horaires. Notre équipe confirmera votre réservation sous 24h.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-5 gap-6">

                {/* ── Colonne gauche : formulaire ─────────────────────── */}
                <div className="md:col-span-3 space-y-5">

                  {/* Service */}
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <Mic2 className="w-4 h-4 text-purple-600" />Service souhaité
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3">
                      {services.map(s => (
                        <label key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedService === s.id ? 'border-purple-500 bg-purple-50' : 'border-border hover:border-purple-200'
                        }`}>
                          <input type="radio" name="service" value={s.id}
                            checked={selectedService === s.id}
                            onChange={() => setSelectedService(s.id)}
                            className="accent-purple-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{s.nom}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                          </div>
                          <span className="text-sm font-bold text-purple-600 whitespace-nowrap">{s.prix} MAD/h</span>
                        </label>
                      ))}
                      {services.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Chargement des services...</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Contact */}
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-600" />Vos coordonnées
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                          <User className="w-3 h-3" />Nom complet
                        </label>
                        <input
                          value={currentUser?.name || currentUser?.nom || ''}
                          readOnly
                          className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-muted text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                          <Phone className="w-3 h-3" />Numéro de téléphone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={clientTel}
                          onChange={e => setClientTel(e.target.value)}
                          placeholder="Ex : +212 6XX XXX XXX"
                          className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <p className="text-xs text-muted-foreground mt-1">L'équipe vous appellera sur ce numéro pour confirmer.</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />Notes / Demandes spéciales (optionnel)
                        </label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          rows={2}
                          placeholder="Ex : Besoin d'un guitariste, apporter son propre micro..."
                          className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Date */}
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-purple-600" />Choisir la date
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          locale={fr}
                          disabled={date => date < new Date(new Date().setHours(0,0,0,0))}
                          className="rounded-xl border border-border"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Horaires */}
                  <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />Horaires
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Heure de début</label>
                          <select value={startTime} onChange={e => { setStartTime(e.target.value); setEndTime(''); }}
                            className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option value="">— Choisir —</option>
                            {TIME_SLOTS.map(t => (
                              <option key={t} value={t} disabled={isSlotBooked(t)}>{t}{isSlotBooked(t) ? ' (réservé)' : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-2 block">Heure de fin</label>
                          <select value={endTime} onChange={e => setEndTime(e.target.value)}
                            disabled={!startTime}
                            className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50">
                            <option value="">— Choisir —</option>
                            {TIME_SLOTS.filter(t => t > startTime).map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {durationH > 0 && (
                        <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                          <Clock className="w-4 h-4 shrink-0" />
                          Durée : <strong>{durationH.toFixed(1)} heure{durationH > 1 ? 's' : ''}</strong>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* ── Colonne droite : récapitulatif ───────────────────── */}
                <div className="md:col-span-2">
                  <div className="sticky top-24 space-y-4">
                    <Card className="border border-purple-200 shadow-md bg-purple-50/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-foreground">Récapitulatif</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium text-right max-w-[160px]">{selectedSvc?.nom || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">{selectedDate ? format(selectedDate, 'dd MMM yyyy', { locale: fr }) : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Horaire</span>
                          <span className="font-medium">{startTime && endTime ? `${startTime} – ${endTime}` : '—'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Durée</span>
                          <span className="font-medium">{durationH > 0 ? `${durationH.toFixed(1)}h` : '—'}</span>
                        </div>
                        <div className="border-t border-border my-2 pt-3 flex justify-between items-center">
                          <span className="font-bold text-foreground">Estimation</span>
                          <span className="text-xl font-extrabold text-purple-600">{estimatedCost > 0 ? `${estimatedCost} MAD` : '—'}</span>
                        </div>
                        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background rounded-lg p-3 border border-border">
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-purple-500" />
                          Le paiement se fait sur place après confirmation de votre session par notre équipe.
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      type="submit"
                      disabled={loading || !selectedService || !startTime || !endTime || !clientTel.trim()}
                      className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 text-base disabled:opacity-50"
                    >
                      {loading ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Envoi...</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4 mr-2" />Confirmer la réservation</>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Connecté en tant que <strong>{currentUser?.name || currentUser?.email}</strong>
                    </p>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default StudioReservationPage;
