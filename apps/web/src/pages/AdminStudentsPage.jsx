
import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { FORMATION_SECTIONS, getCourseSection } from './AdminFormationPage.jsx';
import ReceiptModal from '@/components/ReceiptModal.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Users, Search, Eye, Trash2, CheckCircle2, Download,
  ChevronLeft, ChevronRight, GraduationCap, TrendingUp,
  DollarSign, Plus, UserPlus, Filter, Receipt, RefreshCw,
  Languages, Monitor, Code2, BookOpen, Award, Clock,
} from 'lucide-react';

// ── Constants ────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 10;

const NIVEAU_STYLE = {
  A1: 'bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-900/30 dark:text-sky-300',
  A2: 'bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  B1: 'bg-violet-100 text-violet-700 border border-violet-300 dark:bg-violet-900/30 dark:text-violet-300',
  B2: 'bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  C1: 'bg-orange-100 text-orange-700 border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300',
  C2: 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300',
};

const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const PAYMENT_STATUS = {
  paid:    { label: 'Payé',        cls: 'bg-green-100 text-green-700 border-green-300' },
  pending: { label: 'En attente',  cls: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  free:    { label: 'Gratuit',     cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  none:    { label: 'Aucun',       cls: 'bg-gray-100 text-gray-500 border-gray-300' },
};

const FREE_COURSES_LIMIT = 5;

const ENROLL_STATUS = {
  actif:    { label: 'En cours',      cls: 'bg-blue-100 text-blue-700' },
  termine:  { label: 'Terminé',       cls: 'bg-green-100 text-green-700' },
  inscrit:  { label: 'Inscrit',       cls: 'bg-purple-100 text-purple-700' },
  gratuit:  { label: 'Cours gratuit', cls: 'bg-emerald-100 text-emerald-700' },
  attente:  { label: 'En attente paiement', cls: 'bg-yellow-100 text-yellow-700' },
};

const PROGRAMME_CFG = {
  langues:       { icon: Languages, label: 'Langues',      badge: 'bg-blue-100 text-blue-700 border-blue-300',   color: 'text-blue-600' },
  informatique:  { icon: Monitor,   label: 'Informatique', badge: 'bg-green-100 text-green-700 border-green-300', color: 'text-green-600' },
  programmation: { icon: Code2,     label: 'Programmation',badge: 'bg-purple-100 text-purple-700 border-purple-300',color: 'text-purple-600' },
};

const getEnrollStatus = (student) => {
  const prog = student._progress || 0;
  const enrCount = student._enrollmentCount || 0;
  const hasPaid  = student._paymentStatus === 'paid';

  if (prog >= 100) return 'termine';
  if (prog > 0)    return 'actif';
  if (hasPaid)     return 'inscrit';
  // Free tier: first FREE_COURSES_LIMIT courses are free
  if (enrCount <= FREE_COURSES_LIMIT) return 'gratuit';
  return 'attente';
};

const exportCSV = (students) => {
  const headers = ['Nom', 'Email', 'Programme', 'Cours', 'Niveau', 'Progression', 'Paiement (MAD)', 'Statut'];
  const rows = students.map(s => [
    s._fullName,
    s.email,
    s._programme ? PROGRAMME_CFG[s._programme]?.label || s._programme : '-',
    s.current_course || s._courseName || '-',
    s.Level || '-',
    `${s.progress || 0}%`,
    s.payment || 0,
    ENROLL_STATUS[getEnrollStatus(s)]?.label || '-',
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `etudiants_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// ── EnrollmentModal ──────────────────────────────────────────────
const EnrollmentModal = ({ open, onClose, students, courses, onSaved }) => {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [saving, setSaving] = useState(false);

  const filteredCourses = useMemo(() =>
    courses.filter(c => !selectedProgramme || getCourseSection(c) === selectedProgramme),
    [courses, selectedProgramme]
  );

  const selectedCourseObj = courses.find(c => c.id === selectedCourse);

  useEffect(() => {
    if (selectedCourseObj) {
      setSelectedLevel(selectedCourseObj.level || 'A1');
      setPrice(selectedCourseObj.price || 0);
      setDuration(selectedCourseObj.duration || 0);
    }
  }, [selectedCourse]);

  const reset = () => {
    setStep(1); setSelectedStudent(''); setSelectedProgramme('');
    setSelectedCourse(''); setSelectedLevel(''); setPrice(0); setDuration(0);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error('Veuillez sélectionner un étudiant et un cours.');
      return;
    }
    setSaving(true);
    try {
      // Create enrollment
      await pb.collection('course_enrollments').create({
        user_id: selectedStudent,
        course_id: selectedCourse,
        requestKey: null,
      });
      // Update student profile
      const course = selectedCourseObj;
      await pb.collection('users').update(selectedStudent, {
        Level: selectedLevel || course?.level || 'A1',
        current_course: course?.title || '',
        section: selectedProgramme,
        requestKey: null,
      });
      toast.success('Étudiant inscrit avec succès !');
      onSaved();
      handleClose();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const ProgBtn = ({ key: k, cfg }) => {
    const Ic = cfg.icon;
    const sec = FORMATION_SECTIONS[k];
    const active = selectedProgramme === k;
    return (
      <button
        key={k}
        onClick={() => { setSelectedProgramme(k); setSelectedCourse(''); setStep(2); }}
        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-full ${
          active
            ? `bg-gradient-to-br ${sec?.gradient || 'from-blue-500 to-indigo-500'} text-white border-transparent shadow-md`
            : `border-border hover:border-current ${cfg.color} hover:bg-muted`
        }`}
      >
        <Ic className="w-6 h-6" />
        <span className="text-sm font-semibold">{cfg.label}</span>
      </button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Inscrire un étudiant
          </DialogTitle>
        </DialogHeader>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                step >= s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground'
              }`}>{s}</div>
              {s < 3 && <div className={`flex-1 h-0.5 rounded ${step > s ? 'bg-primary' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mb-4 px-0.5">
          <span>Étudiant</span><span>Programme & Cours</span><span>Détails</span>
        </div>

        {/* Step 1 — Select student */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block">Sélectionner un étudiant</Label>
              <Select value={selectedStudent} onValueChange={v => { setSelectedStudent(v); setStep(2); }}>
                <SelectTrigger><SelectValue placeholder="Choisir un étudiant..." /></SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s._fullName} — {s.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 2 — Programme + Course */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Programme</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(PROGRAMME_CFG).map(([k, cfg]) => (
                  <ProgBtn key={k} k={k} cfg={cfg} />
                ))}
              </div>
            </div>
            {selectedProgramme && (
              <div>
                <Label className="mb-1.5 block">Cours</Label>
                <Select value={selectedCourse} onValueChange={v => { setSelectedCourse(v); setStep(3); }}>
                  <SelectTrigger><SelectValue placeholder="Choisir un cours..." /></SelectTrigger>
                  <SelectContent>
                    {filteredCourses.length === 0
                      ? <SelectItem value="none" disabled>Aucun cours dans ce programme</SelectItem>
                      : filteredCourses.map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.title} — {c.level} — {c.price || 0} MAD
                          </SelectItem>
                        ))
                    }
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs">
              ← Retour
            </Button>
          </div>
        )}

        {/* Step 3 — Details */}
        {step === 3 && selectedCourseObj && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
              <p className="text-sm font-semibold text-foreground">{selectedCourseObj.title}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge className={`${PROGRAMME_CFG[selectedProgramme]?.badge} border`}>
                  {PROGRAMME_CFG[selectedProgramme]?.label}
                </Badge>
                <Badge className={NIVEAU_STYLE[selectedLevel]}>
                  {selectedLevel}
                </Badge>
                {selectedCourseObj.category && (
                  <Badge variant="outline">{selectedCourseObj.category}</Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-1.5 block">Niveau</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NIVEAUX.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 block">Durée (min)</Label>
                <Input type="number" min={0} value={duration}
                  onChange={e => setDuration(Number(e.target.value))} />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block">Prix (MAD)</Label>
              <div className="relative">
                <Input type="number" min={0} value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="pr-16" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">MAD</span>
              </div>
              {selectedCourseObj.price !== price && (
                <p className="text-xs text-muted-foreground mt-1">
                  Prix de base : {selectedCourseObj.price || 0} MAD
                  <button className="ml-2 text-primary underline" onClick={() => setPrice(selectedCourseObj.price || 0)}>
                    Réinitialiser
                  </button>
                </p>
              )}
            </div>

            {/* Étudiant recap */}
            <div className="p-3 rounded-xl border border-border bg-background flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                {students.find(s => s.id === selectedStudent)?._fullName?.charAt(0) || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold">{students.find(s => s.id === selectedStudent)?._fullName}</p>
                <p className="text-xs text-muted-foreground">{students.find(s => s.id === selectedStudent)?.email}</p>
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs">
              ← Retour
            </Button>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          {step === 3 && (
            <Button onClick={handleSave} disabled={saving || !selectedStudent || !selectedCourse}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
              {saving ? 'Inscription...' : 'Inscrire l\'étudiant'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Page ────────────────────────────────────────────────────
const AdminStudentsPage = () => {
  const { t } = useTranslation();
  const [students, setStudents]       = useState([]);
  const [courses, setCourses]         = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterProgramme, setFilterProgramme] = useState('all');
  const [filterNiveau, setFilterNiveau]       = useState('all');
  const [filterStatus, setFilterStatus]       = useState('all');
  const [filterPayment, setFilterPayment]     = useState('all');
  const [page, setPage]               = useState(1);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [receipt, setReceipt]         = useState(null);

  // ── Fetch all data ─────────────────────────────────────────────
  // On utilise l'API backend (superuser) pour récupérer les inscriptions,
  // car PocketBase restreint course_enrollments au seul utilisateur connecté.
  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = pb.authStore.token;

      // Les données d'inscriptions viennent du backend (superuser bypass)
      const apiRes = await fetch('http://localhost:3001/admin/all-students', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const apiData = apiRes.ok ? await apiRes.json() : {};

      // Fallback: si l'API échoue, on tente directement (peut retourner 0 inscriptions)
      const [studFallback, coursesFallback, ordersFallback] = apiRes.ok
        ? [{ status: 'fulfilled', value: apiData.students || [] },
           { status: 'fulfilled', value: apiData.courses || [] },
           { status: 'fulfilled', value: apiData.orders || [] }]
        : await Promise.allSettled([
            pb.collection('users').getFullList({ filter: "role='etudiant'", sort: '-created', requestKey: null }),
            pb.collection('courses').getFullList({ requestKey: null }),
            pb.collection('orders').getFullList({ sort: '-created', requestKey: null }),
          ]);

      const rawStudents = studFallback.status === 'fulfilled' ? studFallback.value : [];
      const allCourses  = coursesFallback.status === 'fulfilled' ? coursesFallback.value : [];
      const allEnr      = apiRes.ok ? (apiData.enrollments || []) : [];
      const allOrders   = ordersFallback.status === 'fulfilled' ? ordersFallback.value : [];

      // Enrich students with programme, course name, orders
      const enriched = rawStudents.map(s => {
        const fullName = `${s.prenom || ''} ${s.nom || s.name || ''}`.trim() || s.email;
        const studentEnrollments = allEnr.filter(e => e.user_id === s.id);
        const enrolledCourses = studentEnrollments.map(e => {
          const c = allCourses.find(c => c.id === e.course_id);
          if (c) return { ...c, title: c.titre || c.title || '' };
          return null;
        }).filter(Boolean);

        // ── Détermination du programme (section) ─────────────────────
        // Priorité : champ section → inscriptions → current_course par mot-clé → titre de cours
        let programme = s.section || null;
        if (!programme && enrolledCourses.length > 0) {
          programme = getCourseSection(enrolledCourses[0]);
        }
        if (!programme && s.current_course) {
          // Correspondance par mot-clé (plus souple que titre exact)
          const courseLower = s.current_course.toLowerCase();
          for (const [key, cfg] of Object.entries(FORMATION_SECTIONS)) {
            if (cfg.categories.some(cat => courseLower.includes(cat) || cat.includes(courseLower))) {
              programme = key;
              break;
            }
          }
        }
        if (!programme && s.current_course) {
          // Correspondance partielle sur le titre de cours
          const match = allCourses.find(c => {
            const title = (c.titre || c.title || '').toLowerCase();
            const curr  = s.current_course.toLowerCase();
            return title.includes(curr) || curr.includes(title.split(' ')[0]);
          });
          if (match) programme = getCourseSection(match);
        }
        // Par défaut : si l'étudiant a un cours, on suppose Langues
        if (!programme && (s.current_course || studentEnrollments.length > 0)) {
          programme = 'langues';
        }

        const studentOrders = allOrders.filter(o => o.user_id === s.id);
        const paidOrders    = studentOrders.filter(o => o.status === 'paid' || o.status === 'completed');
        const totalPaid     = paidOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const enrCountLocal = studentEnrollments.length;
        const paymentStatus = paidOrders.length > 0 ? 'paid'
          : enrCountLocal <= FREE_COURSES_LIMIT && enrCountLocal > 0 ? 'free'
          : studentOrders.some(o => o.status === 'pending') ? 'pending'
          : 'none';

        // ── Real progression from course_enrollments ───────────────
        const avgProgress = studentEnrollments.length > 0
          ? Math.round(studentEnrollments.reduce((sum, e) => sum + (e.progression || 0), 0) / studentEnrollments.length)
          : 0;

        // Last activity timestamp
        const lastActivity = studentEnrollments.length > 0
          ? studentEnrollments
              .map(e => e.last_activity || e.updated || '')
              .filter(Boolean)
              .sort()
              .pop()
          : null;

        // Active course from enrollments (the one with highest progress)
        const activeCourse = studentEnrollments.length > 0
          ? (() => {
              const best = studentEnrollments.reduce((a, b) => (b.progression || 0) > (a.progression || 0) ? b : a, studentEnrollments[0]);
              return allCourses.find(c => c.id === best.course_id);
            })()
          : null;

        return {
          ...s,
          _fullName: fullName,
          _programme: programme,
          _enrolledCourses: enrolledCourses,
          _courseName: activeCourse?.title || enrolledCourses[0]?.title || s.current_course || '',
          _studentOrders: studentOrders,
          _totalPaid: totalPaid || s.payment || 0,
          _paymentStatus: paymentStatus,
          _progress: avgProgress,
          _enrollmentCount: studentEnrollments.length,
          _lastActivity: lastActivity,
        };
      });

      setStudents(enriched);
      setCourses(allCourses);
      setEnrollments(allEnr);
      setOrders(allOrders);
    } catch (e) {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();

    // ── Abonnements temps réel PocketBase ──────────────────────────
    // Quand un étudiant est créé/modifié/supprimé directement en DB,
    // la liste se rafraîchit automatiquement sans rechargement de page.
    let unsubUsers = null;
    let unsubEnrollments = null;

    const subscribe = async () => {
      try {
        unsubUsers = await pb.collection('users').subscribe('*', (e) => {
          // Ne traite que les étudiants
          if (e.record?.role && e.record.role !== 'etudiant') return;
          if (e.action === 'delete') {
            // Suppression immédiate dans l'état local (pas besoin de refetch)
            setStudents(prev => prev.filter(s => s.id !== e.record.id));
          } else {
            // Création ou modification → refetch complet pour recalculer les stats
            fetchAll();
          }
        });

        unsubEnrollments = await pb.collection('course_enrollments').subscribe('*', () => {
          // Un changement de progression → refetch pour mettre à jour les barres
          fetchAll();
        });
      } catch {
        // Les abonnements temps réel ne sont pas critiques
      }
    };

    subscribe();

    return () => {
      if (unsubUsers)      unsubUsers();
      if (unsubEnrollments) unsubEnrollments();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Supprimer définitivement "${name}" ?\n\nToutes ses inscriptions et commandes seront aussi supprimées. Action irréversible.`)) return;
    const toastId = toast.loading(`Suppression de ${name}…`);
    try {
      const token = pb.authStore.token;
      const res = await fetch('http://localhost:3001/admin/students/' + id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || data.error || `HTTP ${res.status}`);
      toast.success(`"${name}" supprimé avec succès`, { id: toastId });
      fetchAll();
    } catch (err) {
      console.error('Erreur suppression étudiant:', err);
      toast.error(`Erreur : ${err.message || 'Suppression impossible'}`, { id: toastId });
    }
  };

  // ── Filters ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return students.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        s._fullName.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s._courseName?.toLowerCase().includes(q) ||
        (s._programme && PROGRAMME_CFG[s._programme]?.label.toLowerCase().includes(q));

      const matchProg   = filterProgramme === 'all' || s._programme === filterProgramme;
      const matchNiveau = filterNiveau === 'all' || s.Level === filterNiveau;
      const matchStatus = filterStatus === 'all' || getEnrollStatus(s) === filterStatus;
      const matchPay    = filterPayment === 'all' || s._paymentStatus === filterPayment;

      return matchSearch && matchProg && matchNiveau && matchStatus && matchPay;
    });
  }, [students, search, filterProgramme, filterNiveau, filterStatus, filterPayment]);

  useEffect(() => { setPage(1); }, [search, filterProgramme, filterNiveau, filterStatus, filterPayment]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── Stats ──────────────────────────────────────────────────────
  const totalRevenue = students.reduce((s, u) => s + (u._totalPaid || 0), 0);
  const byProg = Object.fromEntries(
    Object.keys(PROGRAMME_CFG).map(k => [k, students.filter(s => s._programme === k).length])
  );

  const openReceipt = (order, student) => {
    setReceipt({
      id: order.id,
      ref: order.id.slice(0, 8).toUpperCase(),
      date: order.created,
      service: `Centre de Formation — ${student._programme ? PROGRAMME_CFG[student._programme]?.label : ''}`,
      studentName: student._fullName,
      studentEmail: student.email,
      items: [{ label: student._courseName || 'Formation', qty: 1, unitPrice: order.total_price || 0 }],
      total: order.total_price || 0,
      status: order.status,
      paymentMethod: order.payment_method || 'Virement',
    });
  };

  return (
    <AdminLayout>
      <Helmet><title>Étudiants — IWS Admin</title></Helmet>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-7 h-7 text-primary" />
              Gestion des Étudiants
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Classification par programme · Suivi des formations et paiements
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportCSV(filtered)} className="gap-2">
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button size="sm" onClick={() => setEnrollModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 shadow-md">
              <UserPlus className="w-4 h-4" /> Inscrire un étudiant
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total étudiants', value: students.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20' },
            { icon: Languages, label: 'Langues', value: byProg.langues || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
            { icon: Monitor, label: 'Informatique', value: byProg.informatique || 0, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/20' },
            { icon: Code2, label: 'Programmation', value: byProg.programmation || 0, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20' },
          ].map(({ icon: Ic, label, value, color, bg }) => (
            <Card key={label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    {loading ? <><Skeleton className="h-7 w-16 mb-1" /><Skeleton className="h-3 w-24" /></> : (
                      <><p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{label}</p></>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${bg}`}><Ic className={`w-4 h-4 ${color}`} /></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue + approved stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {loading ? '...' : `${totalRevenue.toLocaleString('fr-FR')} MAD`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Revenus totaux formation</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {loading ? '...' : students.filter(s => s.approved).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Étudiants approuvés</p>
                </div>
                <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, email, cours..."
              value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* Programme filter */}
            <div className="flex gap-1.5 flex-wrap">
              {[{ k: 'all', label: 'Tous programmes' }, ...Object.entries(PROGRAMME_CFG).map(([k, c]) => ({ k, label: c.label }))].map(({ k, label }) => (
                <button key={k} onClick={() => setFilterProgramme(k)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    filterProgramme === k
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  }`}>{label}</button>
              ))}
            </div>

            <div className="w-px h-5 bg-border hidden sm:block" />

            {/* Niveau filter */}
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => setFilterNiveau('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterNiveau === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                Tous niveaux
              </button>
              {['A1','A2','B1','B2','C1','C2'].map(n => (
                <button key={n} onClick={() => setFilterNiveau(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${filterNiveau === n ? NIVEAU_STYLE[n] : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {n}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-border hidden sm:block" />

            {/* Payment filter */}
            <div className="flex gap-1.5">
              {[{ k: 'all', label: 'Tous paiements' }, { k: 'paid', label: 'Payé' }, { k: 'pending', label: 'En attente' }, { k: 'none', label: 'Aucun' }].map(({ k, label }) => (
                <button key={k} onClick={() => setFilterPayment(k)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${filterPayment === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {['Étudiant', 'Programme', 'Cours', 'Niveau', 'Progression', 'Paiement', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-muted-foreground">
                      <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">Aucun étudiant trouvé</p>
                      <p className="text-xs mt-1">Modifiez vos filtres ou ajoutez un étudiant.</p>
                    </td>
                  </tr>
                ) : paginated.map(student => {
                  const prog = PROGRAMME_CFG[student._programme];
                  const ProgIcon = prog?.icon;
                  const enrStatus = getEnrollStatus(student);
                  const payStatus = PAYMENT_STATUS[student._paymentStatus] || PAYMENT_STATUS.none;

                  return (
                    <tr key={student.id} className="border-b border-border hover:bg-muted/30 transition-colors group">
                      {/* Étudiant */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                            {student._fullName?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate max-w-[140px]">{student._fullName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Programme */}
                      <td className="py-3 px-4">
                        {prog ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${prog.badge}`}>
                            {ProgIcon && <ProgIcon className="w-3 h-3" />}
                            {prog.label}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Non classifié</span>
                        )}
                      </td>

                      {/* Cours */}
                      <td className="py-3 px-4">
                        <p className="text-xs font-medium text-foreground max-w-[120px] truncate" title={student._courseName}>
                          {student._courseName || <span className="text-muted-foreground italic">—</span>}
                        </p>
                      </td>

                      {/* Niveau */}
                      <td className="py-3 px-4">
                        {student.Level ? (
                          <span className={`px-2 py-0.5 rounded text-xs font-bold border ${NIVEAU_STYLE[student.Level] || 'bg-gray-100 text-gray-600'}`}>
                            {student.Level}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>

                      {/* Progression */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <Progress value={student._progress || 0}
                            className={`h-1.5 flex-1 ${(student._progress || 0) >= 100 ? '[&>div]:bg-green-500' : (student._progress || 0) >= 50 ? '[&>div]:bg-blue-500' : '[&>div]:bg-orange-400'}`}
                          />
                          <span className={`text-xs font-bold w-9 shrink-0 ${(student._progress || 0) >= 70 ? 'text-green-600' : (student._progress || 0) >= 30 ? 'text-blue-600' : 'text-orange-500'}`}>
                            {student._progress || 0}%
                          </span>
                        </div>
                        {student._lastActivity && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {new Date(student._lastActivity).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                        {student._enrollmentCount > 0 && (
                          <p className="text-[10px] text-muted-foreground">
                            {student._enrollmentCount} cours · {student._enrollmentCount <= FREE_COURSES_LIMIT ? `Gratuit` : 'Payant'}
                          </p>
                        )}
                      </td>

                      {/* Paiement */}
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {(student._totalPaid || 0).toLocaleString('fr-FR')} MAD
                          </p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${payStatus.cls}`}>
                            {payStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Statut formation */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ENROLL_STATUS[enrStatus]?.cls}`}>
                          {ENROLL_STATUS[enrStatus]?.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {student._studentOrders.length > 0 && (
                            <Button size="sm" variant="ghost"
                              className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                              title="Voir le reçu"
                              onClick={() => openReceipt(student._studentOrders[0], student)}>
                              <Receipt className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Link to={`/admin/students/${student.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-muted">
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          <Button size="sm" variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(student.id, student._fullName)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {((page-1)*ITEMS_PER_PAGE)+1}–{Math.min(page*ITEMS_PER_PAGE, filtered.length)} / {filtered.length} étudiants
              </p>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="h-7 w-7 p-0">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i+1).map(p => (
                  <Button key={p} variant={p===page ? 'default' : 'ghost'} size="sm"
                    onClick={() => setPage(p)} className="h-7 w-7 p-0 text-xs">{p}
                  </Button>
                ))}
                <Button variant="ghost" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="h-7 w-7 p-0">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Enrollment Modal */}
      <EnrollmentModal
        open={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        students={students}
        courses={courses}
        onSaved={fetchAll}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
        companyName="IWS — Centre de Formation"
      />
    </AdminLayout>
  );
};

export default AdminStudentsPage;
