
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import ReceiptModal from '@/components/ReceiptModal.jsx';
import { FORMATION_SECTIONS, getCourseSection } from '@/pages/AdminFormationPage.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ArrowLeft, Mail, Calendar, GraduationCap, ShoppingBag,
  CheckCircle2, XCircle, PlayCircle, BookOpen, Clock, Edit3,
  TrendingUp, Award, User, DollarSign, Save, X,
  CreditCard, Printer, Languages, Monitor, Code2, Star, Layers, Gift,
} from 'lucide-react';

// ── Programme config (mirrored from AdminStudentsPage) ───────────
const PROGRAMME_CFG = {
  langues:       { icon: Languages, label: 'Langues',       badge: 'bg-blue-100 text-blue-700 border-blue-300',    color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',    gradient: 'from-blue-600 to-sky-500' },
  informatique:  { icon: Monitor,   label: 'Informatique',  badge: 'bg-green-100 text-green-700 border-green-300',  color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20',  gradient: 'from-green-600 to-emerald-500' },
  programmation: { icon: Code2,     label: 'Programmation', badge: 'bg-purple-100 text-purple-700 border-purple-300', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', gradient: 'from-purple-600 to-indigo-500' },
};

const ProgrammeBadge = ({ programme, size = 'md' }) => {
  const cfg = PROGRAMME_CFG[programme];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold border ${cfg.badge} ${size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm'}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {cfg.label}
    </span>
  );
};

// ── Niveau styles ────────────────────────────────────────────────
const NIVEAU_STYLE = {
  A1: { cls: 'bg-sky-100 text-sky-700 border-sky-300', desc: 'Débutant' },
  A2: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-300', desc: 'Élémentaire' },
  B1: { cls: 'bg-violet-100 text-violet-700 border-violet-300', desc: 'Intermédiaire' },
  B2: { cls: 'bg-amber-100 text-amber-700 border-amber-300', desc: 'Intermédiaire avancé' },
  C1: { cls: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Avancé' },
  C2: { cls: 'bg-red-100 text-red-700 border-red-300', desc: 'Maîtrise' },
};
const NIVEAUX = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const NIVEAU_ORDER = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };

const NiveauBadge = ({ niveau, size = 'md' }) => {
  const style = NIVEAU_STYLE[niveau];
  if (!style) return <span className="text-muted-foreground text-sm">Non défini</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold border ${style.cls} ${size === 'lg' ? 'text-base px-4 py-1.5' : 'text-sm'}`}>
      <Star className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {niveau}
      {size === 'lg' && <span className="font-normal opacity-70 text-xs ml-1">· {style.desc}</span>}
    </span>
  );
};

const LevelRoadmap = ({ currentLevel }) => {
  const current = NIVEAU_ORDER[currentLevel] || 0;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {NIVEAUX.map((n, i) => {
        const order = i + 1;
        const isDone = order < current;
        const isCurrent = order === current;
        return (
          <React.Fragment key={n}>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
              isCurrent
                ? `${NIVEAU_STYLE[n]?.cls} border-current scale-110 shadow-md`
                : isDone
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-muted text-muted-foreground border-border'
            }`}>
              {isDone ? '✓' : n}
            </div>
            {i < NIVEAUX.length - 1 && (
              <div className={`h-0.5 w-4 rounded-full ${isDone ? 'bg-emerald-500' : 'bg-border'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Enrollment status ────────────────────────────────────────────
const FREE_COURSES_LIMIT = 5;

const ENROLL_STATUS = {
  actif:    { label: 'En cours',               cls: 'border-blue-500   text-blue-700   bg-blue-50',   icon: PlayCircle },
  termine:  { label: 'Terminé',                cls: 'border-emerald-500 text-emerald-700 bg-emerald-50', icon: CheckCircle2 },
  inscrit:  { label: 'Inscrit',                cls: 'border-purple-500 text-purple-700 bg-purple-50', icon: GraduationCap },
  gratuit:  { label: 'Cours gratuit',          cls: 'border-emerald-400 text-emerald-700 bg-emerald-50', icon: GraduationCap },
  attente:  { label: 'En attente paiement',    cls: 'border-amber-400  text-amber-700  bg-amber-50',  icon: CreditCard },
};

const getEnrollStatus = (enrollment, studentOrders, totalEnrollments) => {
  if (enrollment.complete || (enrollment.progression || 0) >= 100) return 'termine';
  if ((enrollment.progression || 0) > 0) return 'actif';
  // check payment (accepte 'paid' ET 'completed')
  const hasPaid = studentOrders.some(o => o.status === 'paid' || o.status === 'completed');
  if (hasPaid) return 'inscrit';
  // free tier check — first 5 courses are free
  if ((totalEnrollments || 1) <= FREE_COURSES_LIMIT) return 'gratuit';
  return 'attente';
};

// ── Payment status helpers ───────────────────────────────────────
const ORDER_STATUS = {
  completed: { label: 'Payé',       cls: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
  pending:   { label: 'En attente', cls: 'border-amber-400   text-amber-700   bg-amber-50'   },
  cancelled: { label: 'Annulé',     cls: 'border-red-400     text-red-700     bg-red-50'     },
};

// ── Build receipt object ─────────────────────────────────────────
const buildReceipt = (order, student, displayName, courses) => {
  const products = order.expand?.products || [];
  const items = products.length > 0
    ? products.map(p => ({ label: p.titre || p.nom || p.name || 'Formation', qty: 1, unitPrice: p.price || p.prix || 0 }))
    : [{ label: 'Formation — Centre IWS', qty: 1, unitPrice: order.total_price || 0 }];

  // Try to get section from first product matched against courses
  let sectionLabel = 'Centre de Formation';
  if (courses.length > 0 && products.length > 0) {
    const matchedCourse = courses.find(c =>
      products.some(p => p.id === c.id || p.titre === c.titre || p.title === c.title)
    );
    if (matchedCourse) {
      const sec = getCourseSection(matchedCourse);
      sectionLabel = PROGRAMME_CFG[sec]?.label || sectionLabel;
    }
  }

  return {
    id: order.id,
    ref: order.id.slice(0, 8).toUpperCase(),
    date: new Date(order.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    service: sectionLabel,
    studentName: displayName,
    studentEmail: student?.email || '',
    items,
    total: order.total_price || 0,
    status: order.status === 'completed' ? 'paid' : order.status === 'cancelled' ? 'cancelled' : 'pending',
    paymentMethod: order.payment_method || 'Espèces',
  };
};

// ── Edit modal ──────────────────────────────────────────────────
const EditStudentModal = ({ student, onClose, onSaved }) => {
  const [form, setForm] = useState({
    Level: student.Level || '',
    current_course: student.current_course || '',
    section: student.section || '',
    payment: student.payment || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await pb.collection('users').update(student.id, {
        Level: form.Level || null,
        current_course: form.current_course || null,
        section: form.section || null,
        payment: form.payment ? Number(form.payment) : 0,
      }, { requestKey: null });
      toast.success('Profil étudiant mis à jour');
      onSaved();
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-primary" /> Modifier le profil
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Programme */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Programme</Label>
            <Select value={form.section} onValueChange={v => setForm(f => ({ ...f, section: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un programme..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROGRAMME_CFG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Niveau */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Niveau</Label>
            <Select value={form.Level} onValueChange={v => setForm(f => ({ ...f, Level: v }))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un niveau..." />
              </SelectTrigger>
              <SelectContent>
                {NIVEAUX.map(n => (
                  <SelectItem key={n} value={n}>
                    <span className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${NIVEAU_STYLE[n]?.cls}`}>{n}</span>
                      <span className="text-muted-foreground">{NIVEAU_STYLE[n]?.desc}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cours actuel */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Cours actuel</Label>
            <Input
              value={form.current_course}
              onChange={e => setForm(f => ({ ...f, current_course: e.target.value }))}
              placeholder="ex: Grammaire A2, Python avancé..."
            />
          </div>

          {/* Paiement */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Montant payé (MAD)</Label>
            <Input
              type="number"
              value={form.payment}
              onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────
const AdminStudentDetailPage = () => {
  const { id } = useParams();
  const [student, setStudent]         = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [orders, setOrders]           = useState([]);
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showEdit, setShowEdit]       = useState(false);
  const [receipt, setReceipt]         = useState(null);

  // ── fetchAll : un seul appel backend (superuser) ──────────────
  // Contourne les listRules PocketBase sur course_enrollments ET orders
  // (toutes deux ont user_id=@request.auth.id → inaccessibles en admin direct).
  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = pb.authStore.token;
      const res = await fetch(`http://localhost:3001/admin/student/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();

      // Student
      setStudent(data.student || null);

      // Enrollments — enrichir chaque inscription avec son cours (_course)
      const allCourses = data.courses || [];
      const enriched = (data.enrollments || []).map(e => {
        const course = allCourses.find(c => c.id === e.course_id);
        return {
          ...e,
          _course: course ? {
            ...course,
            title:    course.titre    || course.title    || '',
            level:    course.niveau   || course.level    || '',
            price:    course.prix     ?? course.price    ?? 0,
            category: course.categorie || course.category || '',
          } : null,
        };
      }).sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0));

      setEnrollments(enriched);
      setCourses(allCourses);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('fetchAll étudiant:', err);
      toast.error('Impossible de charger les données de cet étudiant');
      // Fallback minimal : tenter de récupérer au moins le profil
      try {
        const s = await pb.collection('users').getOne(id, { requestKey: null });
        setStudent(s);
      } catch { /* introuvable */ }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  // ── Derived programme ────────────────────────────────────────
  const programme = (() => {
    if (student?.section && PROGRAMME_CFG[student.section]) return student.section;
    // From first enrollment → use enriched _course
    const firstCourse = enrollments[0]?._course || enrollments[0]?.expand?.course_id;
    if (firstCourse) return getCourseSection(firstCourse);
    // From current_course: match against loaded courses
    if (student?.current_course && courses.length > 0) {
      const curr = (student.current_course || '').toLowerCase();
      const matched = courses.find(c =>
        (c.titre || c.title || '').toLowerCase().includes(curr) ||
        curr.includes((c.titre || c.title || '').toLowerCase().split(' ')[0])
      );
      if (matched) return getCourseSection(matched);
      // Fallback: keyword match against section categories
      for (const [key, cfg] of Object.entries(FORMATION_SECTIONS)) {
        if (cfg.categories?.some(cat => curr.includes(cat) || cat.includes(curr))) {
          return key;
        }
      }
    }
    return null;
  })();

  const programmeCfg = programme ? PROGRAMME_CFG[programme] : null;

  // ── Stats ────────────────────────────────────────────────────
  const totalCourses     = enrollments.length;
  const completedCourses = enrollments.filter(e => e.complete || e.progression >= 100).length;
  const avgProgress      = totalCourses > 0
    ? Math.round(enrollments.reduce((s, e) => s + (e.progression || 0), 0) / totalCourses)
    : (student?.progress || 0);
  const totalPaid = orders
    .filter(o => o.status === 'completed' || o.status === 'paid')
    .reduce((s, o) => s + (o.total_price || 0), 0)
    || (student?.payment || 0);
  const isFreeTier = totalPaid === 0 && totalCourses <= FREE_COURSES_LIMIT;

  const displayName = student
    ? `${student.prenom || ''} ${student.nom || student.name || ''}`.trim() || student.name || '?'
    : '';

  // ── Header gradient color from programme ─────────────────────
  const headerGradient = programmeCfg
    ? `bg-gradient-to-r ${programmeCfg.gradient} opacity-30`
    : 'bg-gradient-to-r from-primary/25 via-primary/10 to-transparent';

  return (
    <AdminLayout>
      <Helmet>
        <title>{student ? `${displayName} · Fiche étudiant` : 'Chargement...'} - Admin IWS</title>
      </Helmet>

      {showEdit && student && (
        <EditStudentModal student={student} onClose={() => setShowEdit(false)} onSaved={fetchAll} />
      )}

      <ReceiptModal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        receipt={receipt}
        companyName="IWS — Centre de Formation"
      />

      <div className="space-y-6 animate-slide-up">

        {/* ── Back ──────────────────────────────────────────── */}
        <Link to="/admin/students">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux étudiants
          </Button>
        </Link>

        {/* ── Profile card ──────────────────────────────────── */}
        <Card className="dashboard-card overflow-hidden">
          {/* Coloured header band */}
          <div className={`h-24 relative overflow-hidden ${programmeCfg ? `bg-gradient-to-r ${programmeCfg.gradient}` : 'bg-gradient-to-r from-primary/25 via-primary/10 to-transparent'}`}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 60%)' }} />
          </div>

          <CardContent className="px-6 pb-6 -mt-12">
            {loading ? (
              <div className="flex items-end gap-4">
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <div className="space-y-2 mb-2 flex-1">
                  <Skeleton className="h-7 w-52" />
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ) : student ? (
              <div className="flex flex-col sm:flex-row items-start gap-5">
                {/* Avatar */}
                <div className={`w-24 h-24 rounded-2xl text-white flex items-center justify-center font-black text-3xl shadow-xl ring-4 ring-background flex-shrink-0 ${
                  programmeCfg ? `bg-gradient-to-br ${programmeCfg.gradient}` : 'bg-primary'
                }`}>
                  {displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 pt-2 sm:pt-0 sm:mt-10">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{displayName}</h1>

                      {/* Programme badge — prominent */}
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {programme ? (
                          <ProgrammeBadge programme={programme} size="lg" />
                        ) : (
                          <span className="text-sm text-muted-foreground italic">Programme non défini</span>
                        )}
                        {student.current_course && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {student.current_course}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" />{student.email}</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Inscrit le {new Date(student.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Niveau + roadmap */}
                      {student.Level && (
                        <div className="mt-3 space-y-2">
                          <NiveauBadge niveau={student.Level} size="lg" />
                          <LevelRoadmap currentLevel={student.Level} />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {student.approved ? (
                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 bg-emerald-50 gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Approuvé
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-400 text-orange-600 bg-orange-50 gap-1">
                          <XCircle className="w-3 h-3" /> En attente approbation
                        </Badge>
                      )}
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => setShowEdit(true)}>
                        <Edit3 className="w-3.5 h-3.5" /> Modifier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground py-4">Étudiant introuvable.</p>
            )}
          </CardContent>
        </Card>

        {/* ── Stats row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: GraduationCap, label: 'Cours inscrits',   value: loading ? '…' : totalCourses,                               color: { bg: 'bg-indigo-100 dark:bg-indigo-900/20',   text: 'text-indigo-600'  } },
            { icon: TrendingUp,    label: 'Progression moy.', value: loading ? '…' : `${avgProgress}%`,                          color: { bg: 'bg-blue-100 dark:bg-blue-900/20',       text: 'text-blue-600'    } },
            { icon: Award,         label: 'Cours terminés',   value: loading ? '…' : completedCourses,                            color: { bg: 'bg-emerald-100 dark:bg-emerald-900/20', text: 'text-emerald-600' } },
            { icon: DollarSign,    label: 'Total payé',       value: loading ? '…' : `${totalPaid.toLocaleString('fr-FR')} MAD`, color: { bg: 'bg-purple-100 dark:bg-purple-900/20',   text: 'text-purple-600'  } },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="admin-stat-card">
              <div className={`p-2.5 rounded-xl ${color.bg} w-fit mb-3`}>
                <Icon className={`w-5 h-5 ${color.text}`} />
              </div>
              <p className="text-muted-foreground text-sm">{label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${color.text}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Free tier status banner ───────────────────────── */}
        {!loading && (
          <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
            totalCourses >= FREE_COURSES_LIMIT
              ? 'bg-amber-50 border-amber-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <Gift className={`w-5 h-5 flex-shrink-0 ${totalCourses >= FREE_COURSES_LIMIT ? 'text-amber-600' : 'text-emerald-600'}`} />
            <div>
              <p className={`text-sm font-semibold ${totalCourses >= FREE_COURSES_LIMIT ? 'text-amber-800' : 'text-emerald-800'}`}>
                {totalCourses >= FREE_COURSES_LIMIT
                  ? `Période gratuite terminée (${totalCourses} cours — paiement requis)`
                  : `Période gratuite : ${totalCourses}/${FREE_COURSES_LIMIT} cours utilisés`}
              </p>
              <p className={`text-xs mt-0.5 ${totalCourses >= FREE_COURSES_LIMIT ? 'text-amber-700' : 'text-emerald-700'}`}>
                {totalCourses >= FREE_COURSES_LIMIT
                  ? "L'étudiant doit effectuer un paiement pour continuer."
                  : `L'étudiant peut encore accéder à ${FREE_COURSES_LIMIT - totalCourses} cours gratuitement.`}
              </p>
            </div>
            <div className={`ml-auto text-xl font-black ${totalCourses >= FREE_COURSES_LIMIT ? 'text-amber-700' : 'text-emerald-700'}`}>
              {totalCourses}/{FREE_COURSES_LIMIT}
            </div>
          </div>
        )}

        {/* ── Programme info card (if available) ────────────── */}
        {(programme || student?.current_course) && !loading && (
          <Card className={`border-2 ${programmeCfg?.badge?.replace('text-', 'border-')?.split(' ')[2] || 'border-primary/20'} overflow-hidden`}>
            <div className={`h-1.5 bg-gradient-to-r ${programmeCfg?.gradient || 'from-primary to-primary/60'}`} />
            <CardContent className="py-4 px-5">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Programme</p>
                  {programme ? <ProgrammeBadge programme={programme} /> : <span className="text-sm text-muted-foreground">—</span>}
                </div>
                {student?.Level && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Niveau</p>
                    <NiveauBadge niveau={student.Level} />
                  </div>
                )}
                {student?.current_course && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Cours actuel</p>
                    <p className="text-sm font-semibold text-foreground">{student.current_course}</p>
                  </div>
                )}
                {totalCourses > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Formations inscrites</p>
                    <p className="text-sm font-semibold text-foreground">{totalCourses} cours</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Statut paiement</p>
                  {totalPaid > 0 ? (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700 bg-emerald-50 gap-1 text-xs">
                      <CheckCircle2 className="w-3 h-3" /> Payé — {totalPaid.toLocaleString('fr-FR')} MAD
                    </Badge>
                  ) : isFreeTier ? (
                    <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50 gap-1 text-xs">
                      <Gift className="w-3 h-3" /> Cours gratuit ({totalCourses}/{FREE_COURSES_LIMIT})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-400 text-amber-700 bg-amber-50 text-xs">
                      En attente de paiement
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Tabs ──────────────────────────────────────────── */}
        <Tabs defaultValue="courses">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="w-4 h-4" /> Formations ({totalCourses})
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="w-4 h-4" /> Paiements ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Courses tab ──────────────────────────────────── */}
          <TabsContent value="courses">
            <Card className="dashboard-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" /> Formations suivies
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-2 w-full" /></div>
                      </div>
                    ))}
                  </div>
                ) : enrollments.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground">
                    <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Aucun cours inscrit pour le moment</p>
                    <p className="text-xs mt-1 opacity-60">Utilisez le bouton "Nouvelle inscription" depuis la liste des étudiants</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {enrollments.map(e => {
                      // Utilise _course (enrichi via API) ou fallback sur expand
                      const course = e._course || e.expand?.course_id;
                      const done = e.complete || (e.progression || 0) >= 100;
                      const prog = e.progression || 0;
                      const courseName = course?.titre || course?.title || e.course_id || 'Formation';
                      const sec = course ? getCourseSection(course) : programme;
                      const secCfg = sec ? PROGRAMME_CFG[sec] : null;
                      const enrollStatus = getEnrollStatus(e, orders, enrollments.length);
                      const statusInfo = ENROLL_STATUS[enrollStatus];
                      const StatusIcon = statusInfo?.icon || PlayCircle;

                      return (
                        <div key={e.id} className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors">
                          {/* Icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            done ? 'bg-emerald-100' : prog > 0 ? 'bg-indigo-100' : secCfg ? secCfg.bg : 'bg-slate-100'
                          }`}>
                            {done ? (
                              <Award className="w-6 h-6 text-emerald-600" />
                            ) : prog > 0 ? (
                              <PlayCircle className="w-6 h-6 text-indigo-600" />
                            ) : secCfg ? (
                              React.createElement(secCfg.icon, { className: `w-6 h-6 ${secCfg.color}` })
                            ) : (
                              <BookOpen className="w-6 h-6 text-slate-400" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground truncate">
                                {courseName}
                              </p>
                              {sec && <ProgrammeBadge programme={sec} />}
                              {(course?.level || course?.niveau) && (
                                <NiveauBadge niveau={course.niveau || course.level} />
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                              {course?.duration && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{course.duration} min
                                </span>
                              )}
                              {(course?.category || course?.categorie) && (
                                <span>{course.categorie || course.category}</span>
                              )}
                              {(course?.price || course?.prix) > 0 && (
                                <span className="font-medium">{course.prix || course.price} MAD</span>
                              )}
                              {e.start_date && (
                                <span>Inscrit le {new Date(e.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-3">
                              <Progress
                                value={prog}
                                className={`h-1.5 flex-1 ${prog >= 80 ? '[&>div]:bg-emerald-500' : prog >= 40 ? '[&>div]:bg-blue-500' : '[&>div]:bg-amber-500'}`}
                              />
                              <span className={`text-xs font-bold w-10 text-right ${
                                prog >= 80 ? 'text-emerald-600' : prog >= 40 ? 'text-blue-600' : 'text-amber-600'
                              }`}>{prog}%</span>
                            </div>
                          </div>

                          <Badge variant="outline" className={`text-xs shrink-0 gap-1 ${statusInfo?.cls || ''}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo?.label || enrollStatus}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Payments tab ─────────────────────────────────── */}
          <TabsContent value="payments">
            <Card className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Historique des paiements
                  </CardTitle>
                  {programme && (
                    <ProgrammeBadge programme={programme} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {/* Payment summary banner */}
                {!loading && totalPaid > 0 && (
                  <div className={`px-5 py-3 border-b border-border flex items-center justify-between ${programmeCfg?.bg || 'bg-purple-50 dark:bg-purple-900/10'}`}>
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-purple-500" />
                      Total des paiements confirmés
                    </span>
                    <span className="font-bold text-lg text-emerald-700">{totalPaid.toLocaleString('fr-FR')} MAD</span>
                  </div>
                )}

                {loading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-1/3" /></div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-14 text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Aucun paiement enregistré</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders.map(o => {
                      const products = o.expand?.products || [];
                      const orderStatus = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                      const receiptData = buildReceipt(o, student, displayName, courses);

                      // Derive section from order products
                      let orderSection = null;
                      if (products.length > 0 && courses.length > 0) {
                        const matched = courses.find(c =>
                          products.some(p => p.id === c.id || (p.titre || p.title) === (c.titre || c.title))
                        );
                        if (matched) orderSection = getCourseSection(matched);
                      }
                      if (!orderSection) orderSection = programme;

                      return (
                        <div key={o.id} className="flex items-start gap-4 p-4 hover:bg-muted/20 transition-colors">
                          {/* Status icon */}
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            o.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                            o.status === 'pending'   ? 'bg-amber-100 text-amber-600'   : 'bg-red-100 text-red-600'
                          }`}>
                            <CreditCard className="w-6 h-6" />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-foreground">
                                Reçu #{o.id.slice(0, 8).toUpperCase()}
                              </p>
                              {orderSection && <ProgrammeBadge programme={orderSection} />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {new Date(o.created).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            {products.length > 0 && (
                              <p className="text-xs text-muted-foreground mt-1 truncate">
                                {products.map(p => p.titre || p.nom || p.name || 'Formation').join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Amount + status + print */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className="font-bold text-foreground text-base">
                              {(o.total_price || 0).toLocaleString('fr-FR')} MAD
                            </span>
                            <Badge variant="outline" className={`text-xs ${orderStatus.cls}`}>
                              {orderStatus.label}
                            </Badge>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="gap-1.5 text-xs h-7 px-2 text-primary hover:bg-primary/10"
                              onClick={() => setReceipt(receiptData)}
                            >
                              <Printer className="w-3.5 h-3.5" /> Reçu
                            </Button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Grand total footer */}
                    <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                      <div>
                        <span className="text-sm font-semibold text-muted-foreground">Total des paiements confirmés</span>
                        {programme && (
                          <span className="ml-2 text-xs text-muted-foreground opacity-60">({PROGRAMME_CFG[programme]?.label})</span>
                        )}
                      </div>
                      <span className="font-bold text-lg text-emerald-600">{totalPaid.toLocaleString('fr-FR')} MAD</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminStudentDetailPage;
