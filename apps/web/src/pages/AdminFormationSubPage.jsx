import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { FORMATION_SECTIONS, getCourseSection } from './AdminFormationPage.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus, Edit, Trash2, Search, BookOpen, Users,
  Clock, DollarSign, Tag, ChevronLeft, Eye, Filter, BarChart3,
  UserCheck, FileUp, CheckCircle2, FileText, RefreshCw, AlertTriangle,
} from 'lucide-react';

// ── Lecture fichier PDF → base64 ─────────────────────────────────
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Config niveaux / matières par section ────────────────────────
const SECTION_CFG = {
  langues:       { cours: ['Français','Anglais','Arabe','Espagnol','Allemand','Italien','Autre'],           niveaux: ['A1','A2','B1','B2','C1','C2'],         defaultNiveau: 'A1' },
  informatique:  { cours: ['Bureautique','Excel / Word','Maintenance','Réseaux','Graphisme','Sécurité','Autre'], niveaux: ['Débutant','Intermédiaire','Avancé'], defaultNiveau: 'Débutant' },
  programmation: { cours: ['HTML / CSS','JavaScript','React','Python','PHP','Mobile','Autre'],               niveaux: ['Débutant','Intermédiaire','Avancé'],   defaultNiveau: 'Débutant' },
};

// ── Config visuelle par matière (langue / discipline) ─────────────
const MATIERE_CFG = {
  // Langues
  'Français':      { flag: '🇫🇷', gradient: 'from-blue-600 to-blue-400',      headerBg: 'bg-blue-600',    lightBg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'      },
  'Anglais':       { flag: '🇬🇧', gradient: 'from-red-600 to-rose-400',        headerBg: 'bg-red-600',     lightBg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700'        },
  'Arabe':         { flag: '🌍',  gradient: 'from-emerald-600 to-teal-400',    headerBg: 'bg-emerald-600', lightBg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-700' },
  'Espagnol':      { flag: '🇪🇸', gradient: 'from-yellow-500 to-orange-400',   headerBg: 'bg-yellow-500',  lightBg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700'  },
  'Allemand':      { flag: '🇩🇪', gradient: 'from-gray-700 to-gray-500',       headerBg: 'bg-gray-700',    lightBg: 'bg-gray-50',    border: 'border-gray-200',   badge: 'bg-gray-100 text-gray-700'      },
  'Italien':       { flag: '🇮🇹', gradient: 'from-green-600 to-red-500',       headerBg: 'bg-green-600',   lightBg: 'bg-green-50',   border: 'border-green-200',  badge: 'bg-green-100 text-green-700'    },
  // Informatique
  'Bureautique':         { flag: '💼', gradient: 'from-sky-600 to-sky-400',       headerBg: 'bg-sky-600',     lightBg: 'bg-sky-50',     border: 'border-sky-200',    badge: 'bg-sky-100 text-sky-700'        },
  'Excel / Word':        { flag: '📊', gradient: 'from-green-600 to-emerald-400', headerBg: 'bg-green-600',   lightBg: 'bg-green-50',   border: 'border-green-200',  badge: 'bg-green-100 text-green-700'    },
  'Maintenance':         { flag: '🔧', gradient: 'from-slate-600 to-slate-400',   headerBg: 'bg-slate-600',   lightBg: 'bg-slate-50',   border: 'border-slate-200',  badge: 'bg-slate-100 text-slate-700'    },
  'Réseaux':             { flag: '🌐', gradient: 'from-cyan-600 to-cyan-400',     headerBg: 'bg-cyan-600',    lightBg: 'bg-cyan-50',    border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-700'      },
  'Graphisme':           { flag: '🎨', gradient: 'from-pink-600 to-rose-400',     headerBg: 'bg-pink-600',    lightBg: 'bg-pink-50',    border: 'border-pink-200',   badge: 'bg-pink-100 text-pink-700'      },
  'Sécurité':            { flag: '🔒', gradient: 'from-red-700 to-red-500',       headerBg: 'bg-red-700',     lightBg: 'bg-red-50',     border: 'border-red-200',    badge: 'bg-red-100 text-red-700'        },
  // Programmation
  'HTML / CSS':          { flag: '🌐', gradient: 'from-orange-500 to-amber-400',  headerBg: 'bg-orange-500',  lightBg: 'bg-orange-50',  border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700'  },
  'JavaScript':          { flag: '⚡', gradient: 'from-yellow-500 to-yellow-400', headerBg: 'bg-yellow-500',  lightBg: 'bg-yellow-50',  border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700'  },
  'React':               { flag: '⚛️', gradient: 'from-cyan-600 to-sky-400',     headerBg: 'bg-cyan-600',    lightBg: 'bg-cyan-50',    border: 'border-cyan-200',   badge: 'bg-cyan-100 text-cyan-700'      },
  'Python':              { flag: '🐍', gradient: 'from-blue-700 to-yellow-500',   headerBg: 'bg-blue-700',    lightBg: 'bg-blue-50',    border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700'      },
  'PHP':                 { flag: '🐘', gradient: 'from-violet-700 to-purple-500', headerBg: 'bg-violet-700',  lightBg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700'  },
  'Mobile':              { flag: '📱', gradient: 'from-teal-600 to-emerald-400',  headerBg: 'bg-teal-600',    lightBg: 'bg-teal-50',    border: 'border-teal-200',   badge: 'bg-teal-100 text-teal-700'      },
  'Autre':               { flag: '📚', gradient: 'from-violet-600 to-purple-400', headerBg: 'bg-violet-600',  lightBg: 'bg-violet-50',  border: 'border-violet-200', badge: 'bg-violet-100 text-violet-700'  },
};

// Champs Select obligatoires dans PocketBase
const LANGUE_OPTIONS    = ['Francais', 'Anglais', 'Arabe'];
const CAT_AGE_OPTIONS   = ['Enfants (6-12 ans)', 'Ados (13-17 ans)', 'Adultes (18+ ans)'];

const LEVEL_COLORS = {
  A1:'bg-green-100 text-green-700',   A2:'bg-emerald-100 text-emerald-700',
  B1:'bg-blue-100 text-blue-700',     B2:'bg-indigo-100 text-indigo-700',
  C1:'bg-purple-100 text-purple-700', C2:'bg-pink-100 text-pink-700',
  'Débutant':'bg-sky-100 text-sky-700', 'Intermédiaire':'bg-violet-100 text-violet-700', 'Avancé':'bg-orange-100 text-orange-700',
};

// Langue select → label affiché
const LANGUE_LABEL = { Francais: 'Français', Anglais: 'Anglais', Arabe: 'Arabe' };

// Construit un formulaire vide adapté à la section
const buildEmpty = (sec) => {
  const cfg = SECTION_CFG[sec] || SECTION_CFG.langues;
  return {
    titre:         '',
    langue:        'Francais',
    categorie_age: 'Ados (13-17 ans)',
    cours_nom:     cfg.cours[0],
    niveau:        cfg.defaultNiveau,
    description:   '',
    content:       '',
    instructeur:   'IWS Laayoune',
    duree:         60,
    prix:          0,
    exercises:     '[]',
  };
};

// ─────────────────────────────────────────────────────────────────
const AdminFormationSubPage = () => {
  const { section } = useParams();
  const { t } = useTranslation();

  const cfg    = FORMATION_SECTIONS[section] || FORMATION_SECTIONS.langues;
  const secCfg = SECTION_CFG[section] || SECTION_CFG.langues;
  const Icon   = cfg.icon;

  const [courses,       setCourses]       = useState([]);
  const [enrollments,   setEnrollments]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [levelFilter,   setLevelFilter]   = useState('all');
  const [modalOpen,     setModalOpen]     = useState(false);
  const [deleteConfirm,     setDeleteConfirm]     = useState(null); // { id, titre }
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [viewCourse,    setViewCourse]    = useState(null);
  const [editId,        setEditId]        = useState(null);
  const [formData,      setFormData]      = useState(() => buildEmpty(section));
  const [autoEnroll,    setAutoEnroll]    = useState(true);
  const [saving,        setSaving]        = useState(false);

  // ── État upload PDF ────────────────────────────────────────────
  const [pdfFile,        setPdfFile]        = useState(null);
  const [existingPdf,    setExistingPdf]    = useState('');
  const [pdfExtracting,  setPdfExtracting]  = useState(false);
  const [extractedPages, setExtractedPages] = useState([]);
  const fileInputRef = useRef(null);

  // ── Exercices QCM (édition manuelle) ─────────────────────────
  const [exercises,     setExercises]     = useState([]);
  const [showExEditor,  setShowExEditor]  = useState(false);

  const EMPTY_EXERCISE = () => ({ id: `q${Date.now()}`, question: '', options: ['', '', '', ''], answer: 0 });
  const addExercise = () => setExercises(p => [...p, EMPTY_EXERCISE()]);
  const removeExercise = (i) => setExercises(p => p.filter((_, idx) => idx !== i));
  const updateExQuestion = (i, v) => setExercises(p => p.map((e, idx) => idx === i ? { ...e, question: v } : e));
  const updateExOption = (i, oi, v) => setExercises(p => p.map((e, idx) =>
    idx === i ? { ...e, options: e.options.map((o, j) => j === oi ? v : o) } : e));
  const updateExAnswer = (i, v) => setExercises(p => p.map((e, idx) => idx === i ? { ...e, answer: Number(v) } : e));

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await pb.collection('courses').getFullList({ sort: '-created', requestKey: null });
      setCourses(all.filter(c => getCourseSection(c) === section));
    } catch { setCourses([]); }
    try {
      const token = pb.authStore.token;
      const res = await fetch('http://localhost:3001/admin/enrollments', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const { enrollments: allEnr } = await res.json();
        setEnrollments(allEnr);
      } else { setEnrollments([]); }
    } catch { setEnrollments([]); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [section]);

  // ── Stats ────────────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = courses;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c =>
        (c.titre || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.cours_nom || '').toLowerCase().includes(q)
      );
    }
    if (levelFilter !== 'all') list = list.filter(c => c.niveau === levelFilter);
    return list;
  }, [courses, search, levelFilter]);

  const stats = useMemo(() => {
    const ids = new Set(courses.map(c => c.id));
    const uniqueStudents = new Set(enrollments.filter(e => ids.has(e.course_id)).map(e => e.user_id)).size;
    const avgPrice = courses.length ? courses.reduce((s, c) => s + (c.prix || 0), 0) / courses.length : 0;
    const revenue  = courses.reduce((s, c) => s + (c.prix || 0) * enrollments.filter(e => e.course_id === c.id).length, 0);
    return { uniqueStudents, avgPrice, revenue };
  }, [courses, enrollments]);

  // ── Groupement des cours affichés par matière (cours_nom) ────────
  const groupedDisplayed = useMemo(() => {
    const groups = {};
    displayed.forEach(c => {
      const key = c.cours_nom || 'Autre';
      if (!groups[key]) groups[key] = [];
      groups[key].push(c);
    });
    // Conserver l'ordre de SECTION_CFG.cours pour avoir Français avant Anglais avant Arabe…
    const order = secCfg.cours;
    return Object.entries(groups).sort(([a], [b]) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [displayed, secCfg.cours]);

  // ── API helper ───────────────────────────────────────────────────
  const apiCourse = async (method, path, body) => {
    const token = pb.authStore.token;
    const res = await fetch(`http://localhost:3001/admin${path}`, {
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
    return data;
  };

  // ── Sélection PDF ─────────────────────────────────────────────
  const handlePdfChange = (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF valide'); return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.error('Le fichier PDF ne doit pas dépasser 30 Mo'); return;
    }
    setPdfFile(file);
    setExtractedPages([]);
    toast.success(`📄 ${file.name} sélectionné`);
  };

  // ── Extraction IA (optionnelle) ───────────────────────────────
  const handleExtractWithAI = async () => {
    if (!pdfFile) { toast.error('Sélectionnez d\'abord un PDF'); return; }
    setPdfExtracting(true);
    try {
      const base64 = await readFileAsBase64(pdfFile);
      const token  = pb.authStore.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/admin/courses/parse-pdf`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdf_base64: base64, pdf_filename: pdfFile.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);

      if (data.warning) {
        // Erreur API (crédits insuffisants, etc.) → NE PAS stocker le fallback
        // Le cours affichera le PDF directement côté étudiant
        setExtractedPages([]);
        toast.warning(
          `⚠️ Génération impossible : ${data.warning}\n\nLe cours sera enregistré avec le PDF uniquement.`,
          { duration: 15000 }
        );
      } else {
        // Succès → on stocke les pages générées
        setExtractedPages(data.pages || []);
        if (data.exercises?.length > 0 && exercises.length === 0) setExercises(data.exercises);
        if (data.title && !formData.titre)             setFormData(p => ({ ...p, titre: data.title }));
        if (data.description && !formData.description) setFormData(p => ({ ...p, description: data.description }));
        toast.success(`✅ ${data.pages?.length || 0} pages et ${data.exercises?.length || 0} exercices extraits !`);
      }
    } catch (err) {
      toast.error('Extraction IA : ' + err.message, { duration: 8000 });
    } finally {
      setPdfExtracting(false);
    }
  };

  // ── CRUD ─────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditId(null);
    setFormData(buildEmpty(section));
    setAutoEnroll(true);
    setPdfFile(null);
    setExistingPdf('');
    setExercises([]);
    setExtractedPages([]);
    setShowExEditor(false);
    setModalOpen(true);
  };

  const openEdit = (course) => {
    setEditId(course.id);
    setFormData({
      titre:         course.titre || '',
      langue:        course.langue || 'Francais',
      categorie_age: course.categorie_age || 'Ados (13-17 ans)',
      cours_nom:     course.cours_nom || secCfg.cours[0],
      niveau:        course.niveau || secCfg.defaultNiveau,
      description:   course.description || '',
      content:       course.content || '',
      instructeur:   course.instructeur || 'IWS Laayoune',
      duree:         course.duree || 60,
      prix:          course.prix ?? 0,
    });
    setPdfFile(null);
    setExistingPdf(course.pdf || '');
    setExtractedPages([]);
    try {
      const parsed = JSON.parse(course.exercises || '[]');
      setExercises(Array.isArray(parsed) ? parsed : []);
    } catch { setExercises([]); }
    setShowExEditor(false);
    setAutoEnroll(false);
    setModalOpen(true);
  };

  const f = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!formData.titre.trim()) { toast.error('Le titre est obligatoire'); return; }
    if (!formData.langue)        { toast.error('La langue est obligatoire'); return; }
    if (!formData.categorie_age) { toast.error('La catégorie d\'âge est obligatoire'); return; }
    setSaving(true);
    try {
      // ── PDF : convertir en base64 si nouveau fichier sélectionné ──
      let pdfPayload = {};
      if (pdfFile) {
        const base64 = await readFileAsBase64(pdfFile);
        pdfPayload = {
          pdf_base64:   base64,
          pdf_filename: pdfFile.name,
          pdf_mimetype: pdfFile.type || 'application/pdf',
        };
      }

      // Payload avec les VRAIS noms de champs PocketBase
      const payload = {
        // ── Champs requis (Nonempty dans PB) ──
        titre:         formData.titre.trim(),
        langue:        formData.langue,
        categorie_age: formData.categorie_age,

        // ── Classification ──
        section,
        cours_nom:     formData.cours_nom,
        niveau:        formData.niveau,
        categorie:     section === 'langues' ? 'langue' : section,

        // ── Contenu ──
        description:   formData.description || '',
        content:       '',
        instructeur:   formData.instructeur || 'IWS Laayoune',

        // ── Paramètres ──
        duree:         Number(formData.duree) || 60,
        prix:          Number(formData.prix) || 0,

        // ── Pages extraites par IA (si dispo) ──
        ...(extractedPages.length > 0 ? { pages: JSON.stringify(extractedPages) } : {}),

        // ── Exercices QCM (édition manuelle) ──
        exercises:     exercises.filter(e => e.question.trim()).length > 0
          ? JSON.stringify(exercises.filter(e => e.question.trim()).map((e, i) => ({
              ...e,
              id: e.id || `q${i + 1}`,
              answer: Number(e.answer),
            })))
          : undefined,   // undefined = ne pas écraser si vide

        // ── Auto-enrollment (traité côté API) ──
        auto_enroll:   autoEnroll && !editId,

        // ── Fichier PDF (envoyé en base64, converti en FormData côté API) ──
        ...pdfPayload,
      };

      if (editId) {
        await apiCourse('PATCH', `/courses/${editId}`, payload);
        toast.success('Cours mis à jour ✓');
      } else {
        const result = await apiCourse('POST', '/courses', payload);
        const n = result?.enrolled ?? 0;
        toast.success(`Cours créé ✓${n > 0 ? ` — ${n} étudiant(s) inscrit(s)` : ''}`);
      }

      setModalOpen(false);
      fetchData();
    } catch (e) {
      toast.error('Erreur : ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await apiCourse('DELETE', `/courses/${deleteConfirm.id}`);
      toast.success('Cours supprimé');
      setDeleteConfirm(null);
      setDeleteConfirmText('');
      fetchData();
    } catch (e) { toast.error(e.message); }
  };

  const enrollCount = (id) => enrollments.filter(e => e.course_id === id).length;
  const sectionName = t(`admin.formation.section.${section}`);

  // ── Génération automatique de description ────────────────────────
  const [generatingDesc, setGeneratingDesc] = useState(null); // id du cours en cours

  const handleGenerateDescription = async (course) => {
    setGeneratingDesc(course.id);
    try {
      const token = pb.authStore.token;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/admin/courses/${course.id}/generate-description`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);
      toast.success('✅ Description générée avec succès !');
      fetchData(); // Recharger la liste
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setGeneratingDesc(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <Helmet><title>{sectionName} — Centre de Formation</title></Helmet>

      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Link to="/admin/formation" className="hover:text-foreground transition-colors">
            {t('admin.formation.title')}
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
          <span className={cfg.color}>{sectionName}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${cfg.gradient} text-white shadow-lg`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{sectionName}</h1>
              <p className="text-muted-foreground text-sm">{t(`admin.formation.section.${section}.desc`)}</p>
            </div>
          </div>
          <Button onClick={openCreate} className={`bg-gradient-to-r ${cfg.gradient} text-white border-0 shadow-md`}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un cours
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: BookOpen,   value: courses.length,                                  label: 'Cours',           color: cfg.color },
          { icon: Users,      value: stats.uniqueStudents,                             label: 'Étudiants',       color: 'text-green-600' },
          { icon: DollarSign, value: `${stats.avgPrice.toFixed(0)} MAD`,              label: 'Prix moyen',      color: 'text-orange-600' },
          { icon: BarChart3,  value: `${stats.revenue.toLocaleString('fr-FR')} MAD`,  label: 'Revenus estimés', color: 'text-purple-600' },
        ].map(({ icon: Ic, value, label, color }) => (
          <Card key={label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  {loading
                    ? <><Skeleton className="h-7 w-20 mb-1" /><Skeleton className="h-3 w-24" /></>
                    : <><p className={`text-2xl font-bold ${color}`}>{value}</p><p className="text-xs text-muted-foreground mt-0.5">{label}</p></>
                  }
                </div>
                <div className={`p-2 rounded-lg bg-muted ${color}`}><Ic className="w-4 h-4" /></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un cours…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Tous les niveaux" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les niveaux</SelectItem>
            {secCfg.niveaux.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Cours groupés par matière */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map(i => (
            <div key={i} className="rounded-2xl border-2 border-border overflow-hidden">
              <Skeleton className="h-14 w-full" />
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(j => <Skeleton key={j} className="h-48 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-16 px-6 rounded-2xl border-2 border-dashed ${cfg.border} ${cfg.bg}`}>
          <Icon className={`w-12 h-12 ${cfg.color} mb-4 opacity-50`} />
          <p className="text-lg font-semibold text-foreground mb-1">Aucun cours pour le moment</p>
          <p className="text-muted-foreground text-sm mb-4">Créez votre premier cours pour cette section.</p>
          <Button onClick={openCreate} variant="outline" className={`border-2 ${cfg.border} ${cfg.color}`}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter un cours
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedDisplayed.map(([matiere, matieresCourses]) => {
            const mcfg = MATIERE_CFG[matiere] || MATIERE_CFG['Autre'];
            const totalInscrits = matieresCourses.reduce((s, c) => s + enrollCount(c.id), 0);
            return (
              <div key={matiere} className={`rounded-2xl border-2 overflow-hidden ${mcfg.border} shadow-sm`}>
                {/* En-tête du groupe */}
                <div className={`bg-gradient-to-r ${mcfg.gradient} px-5 py-3.5 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{mcfg.flag}</span>
                    <div>
                      <h3 className="font-black text-white text-base">{matiere}</h3>
                      <p className="text-white/70 text-xs">
                        {matieresCourses.length} cours · {totalInscrits} inscription(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={openCreate}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30 gap-1.5 text-xs font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Ajouter
                  </Button>
                </div>

                {/* Grille des cours */}
                <div className={`p-4 ${mcfg.lightBg} grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                  {matieresCourses.map(course => (
                    <Card key={course.id} className="border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className={`h-1.5 bg-gradient-to-r ${mcfg.gradient}`} />
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-semibold text-foreground truncate text-sm">{course.titre}</h3>
                            {course.description ? (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{course.description}</p>
                            ) : (
                              <button
                                onClick={() => handleGenerateDescription(course)}
                                disabled={generatingDesc === course.id}
                                className="mt-1 flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md transition-colors disabled:opacity-60"
                              >
                                {generatingDesc === course.id ? (
                                  <><span className="w-3 h-3 border border-amber-500 border-t-transparent rounded-full animate-spin inline-block" /> Génération…</>
                                ) : (
                                  <>✨ Générer la description</>
                                )}
                              </button>
                            )}
                          </div>
                          <Badge className={`${LEVEL_COLORS[course.niveau] || 'bg-gray-100 text-gray-700'} text-xs shrink-0`}>
                            {course.niveau}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2.5">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duree || 0}min</span>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {enrollCount(course.id)} inscrits</span>
                          <span className={`flex items-center gap-1 font-semibold ${course.prix > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
                            <DollarSign className="w-3 h-3" /> {course.prix > 0 ? `${(course.prix).toLocaleString('fr-FR')} MAD` : 'Gratuit'}
                          </span>
                        </div>
                        {course.langue && (
                          <div className="mb-2.5">
                            <Badge variant="outline" className={`text-xs ${mcfg.badge}`}>
                              {LANGUE_LABEL[course.langue] || course.langue}
                            </Badge>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 border-t border-border">
                          <Button size="sm" variant="ghost" className="flex-1 text-xs h-8" onClick={() => setViewCourse(course)}>
                            <Eye className="w-3.5 h-3.5 mr-1" /> Voir
                          </Button>
                          <Button size="sm" variant="ghost" className={`flex-1 text-xs h-8 ${cfg.color}`} onClick={() => openEdit(course)}>
                            <Edit className="w-3.5 h-3.5 mr-1" /> Modifier
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:bg-destructive/10 px-2"
                            onClick={() => { setDeleteConfirm({ id: course.id, titre: course.titre }); setDeleteConfirmText(''); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          Modal — Création / Édition (formulaire professionnel)
      ═══════════════════════════════════════════════════════════ */}
      <Dialog open={modalOpen} onOpenChange={v => { if (!saving) setModalOpen(v); }}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className={`text-lg font-bold ${cfg.color}`}>
              {editId ? '✏️ Modifier le cours' : '➕ Nouveau cours'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Les champs marqués <span className="text-destructive">*</span> sont obligatoires.
            </p>
          </DialogHeader>

          <div className="space-y-5 py-2">

            {/* ── Section 1 : Identification ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${cfg.gradient}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Titre */}
                <div className="sm:col-span-2">
                  <Label className="text-sm font-semibold">
                    Titre du cours <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    className="mt-1"
                    value={formData.titre}
                    onChange={e => f('titre', e.target.value)}
                    placeholder="ex : Grammaire — Exprimer un lieu"
                    autoFocus
                  />
                </div>

                {/* Matière */}
                <div>
                  <Label className="text-sm font-semibold">Matière <span className="text-destructive">*</span></Label>
                  <Select value={formData.cours_nom} onValueChange={v => f('cours_nom', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {secCfg.cours.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Niveau */}
                <div>
                  <Label className="text-sm font-semibold">Niveau <span className="text-destructive">*</span></Label>
                  <Select value={formData.niveau} onValueChange={v => f('niveau', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {secCfg.niveaux.map(n => (
                        <SelectItem key={n} value={n}>
                          <Badge className={`${LEVEL_COLORS[n] || 'bg-gray-100 text-gray-700'} mr-2 text-xs`}>{n}</Badge>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Langue */}
                <div>
                  <Label className="text-sm font-semibold">Langue <span className="text-destructive">*</span></Label>
                  <Select value={formData.langue} onValueChange={v => f('langue', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {LANGUE_OPTIONS.map(l => (
                        <SelectItem key={l} value={l}>{LANGUE_LABEL[l] || l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Catégorie d'âge */}
                <div>
                  <Label className="text-sm font-semibold">Catégorie d'âge <span className="text-destructive">*</span></Label>
                  <Select value={formData.categorie_age} onValueChange={v => f('categorie_age', v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAT_AGE_OPTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>

            {/* ── Section 2 : Description + Import PDF ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${cfg.gradient}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Descriptions</span>
              </div>
              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Description courte</Label>
                  <Textarea
                    className="mt-1" rows={2}
                    value={formData.description}
                    onChange={e => f('description', e.target.value)}
                    placeholder="Résumé visible dans la liste des cours (2-3 phrases)… — rempli automatiquement à l'import PDF"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 3 : Fichier PDF (stockage direct) ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${cfg.gradient}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Fichier PDF du cours
                </span>
              </div>

              {/* Zone d'upload PDF — simple et direct */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => { const f2 = e.target.files?.[0]; if (f2) handlePdfChange(f2); e.target.value = ''; }}
              />
              <div
                onDrop={e => { e.preventDefault(); const f2 = e.dataTransfer.files[0]; if (f2) handlePdfChange(f2); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${pdfFile
                    ? 'border-green-400 bg-green-50'
                    : existingPdf
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-border hover:border-primary/50 hover:bg-muted/20'
                  }`}
              >
                {pdfFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="w-10 h-10 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700">{pdfFile.name}</p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {(pdfFile.size / 1024 / 1024).toFixed(1)} Mo — Prêt à être envoyé
                        {extractedPages.length > 0 && (
                          <span className="ml-2 font-bold text-indigo-600">· {extractedPages.length} pages extraites ✓</span>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <button type="button" onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="flex items-center gap-1.5 text-xs border border-green-300 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100">
                        <RefreshCw className="w-3 h-3" /> Changer
                      </button>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); handleExtractWithAI(); }}
                        disabled={pdfExtracting}
                        className="flex items-center gap-1.5 text-xs border border-indigo-300 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 disabled:opacity-50">
                        {pdfExtracting
                          ? <><span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin inline-block" /> Extraction…</>
                          : <>✨ Générer le cours avec Claude</>}
                      </button>
                    </div>
                  </div>
                ) : existingPdf ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-blue-500" />
                    <div>
                      <p className="font-semibold text-blue-700">PDF actuel : {existingPdf}</p>
                      <p className="text-xs text-blue-600 mt-0.5">Cliquez pour remplacer par un nouveau fichier</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="w-10 h-10 text-muted-foreground/40" />
                    <div>
                      <p className="font-semibold text-foreground">Glissez votre PDF ou cliquez pour sélectionner</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Le fichier PDF sera stocké et affiché directement aux étudiants inscrits
                      </p>
                      <p className="text-xs text-muted-foreground">PDF · max 30 Mo</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 4 : Exercices QCM ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${cfg.gradient}`} />
                <div className="flex items-center justify-between flex-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Exercices QCM
                    {exercises.filter(e => e.question.trim()).length > 0 && (
                      <span className="ml-2 normal-case px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                        {exercises.filter(e => e.question.trim()).length} question(s)
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <button type="button"
                      onClick={() => setShowExEditor(p => !p)}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {showExEditor ? '▲ Réduire' : '▼ Gérer les exercices'}
                    </button>
                    {showExEditor && (
                      <button type="button" onClick={addExercise}
                        className="flex items-center gap-1 text-xs bg-emerald-600 text-white px-2.5 py-1 rounded-lg hover:bg-emerald-700">
                        <Plus className="w-3 h-3" /> Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {showExEditor && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {exercises.length === 0 ? (
                    <div className="border-2 border-dashed border-border rounded-xl p-5 text-center text-sm text-muted-foreground">
                      Aucun exercice. Cliquez sur <strong>Ajouter</strong> pour créer votre premier QCM.
                    </div>
                  ) : exercises.map((ex, i) => (
                    <div key={ex.id} className="border border-border rounded-xl p-3 space-y-2 bg-muted/20">
                      <div className="flex items-start gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <Input
                          className="flex-1 text-sm"
                          placeholder="Question (ex: Je vais ___ Paris tous les jours.)"
                          value={ex.question}
                          onChange={e => updateExQuestion(i, e.target.value)}
                        />
                        <button type="button" onClick={() => removeExercise(i)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pl-8">
                        {['a', 'b', 'c', 'd'].map((letter, oi) => (
                          <label key={letter} className={`flex items-center gap-1.5 p-1.5 rounded-lg border cursor-pointer text-xs transition-all ${
                            ex.answer === oi ? 'border-emerald-400 bg-emerald-50' : 'border-border hover:border-slate-300'
                          }`}>
                            <input type="radio" name={`answer-${ex.id}`} value={oi}
                              checked={ex.answer === oi}
                              onChange={() => updateExAnswer(i, oi)}
                              className="accent-emerald-600 w-3 h-3" />
                            <span className="font-bold text-muted-foreground w-3">{letter})</span>
                            <Input
                              className="border-0 p-0 h-auto text-xs focus-visible:ring-0 bg-transparent"
                              placeholder={`Option ${letter.toUpperCase()}`}
                              value={ex.options[oi] || ''}
                              onChange={e => updateExOption(i, oi, e.target.value)}
                              onClick={e => e.stopPropagation()}
                            />
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-emerald-700 pl-8">
                        ✓ Bonne réponse : {['a', 'b', 'c', 'd'][ex.answer]}) {ex.options[ex.answer] || '—'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Section 5 : Paramètres ── */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1 h-4 rounded-full bg-gradient-to-b ${cfg.gradient}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paramètres</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm flex items-center gap-1"><Clock className="w-3 h-3" /> Durée (min)</Label>
                  <Input className="mt-1" type="number" min={0} value={formData.duree}
                    onChange={e => f('duree', Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-1"><DollarSign className="w-3 h-3" /> Prix (MAD)</Label>
                  <Input className="mt-1" type="number" min={0} value={formData.prix}
                    onChange={e => f('prix', Number(e.target.value))} />
                  {Number(formData.prix) === 0 && (
                    <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /> Cours gratuit
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-1"><UserCheck className="w-3 h-3" /> Instructeur</Label>
                  <Input className="mt-1" value={formData.instructeur}
                    onChange={e => f('instructeur', e.target.value)} />
                </div>
              </div>
            </div>

            {/* ── Section 6 : Auto-enrollment (création uniquement) ── */}
            {!editId && (
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <input id="auto-enroll" type="checkbox" checked={autoEnroll}
                  onChange={e => setAutoEnroll(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-blue-600 cursor-pointer shrink-0" />
                <label htmlFor="auto-enroll" className="text-sm cursor-pointer">
                  <span className="font-semibold text-blue-800">Inscrire automatiquement les étudiants</span>
                  <span className="block text-xs text-blue-600 mt-0.5">
                    Tous les étudiants du programme {sectionName} seront inscrits dès la création
                  </span>
                </label>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>Annuler</Button>
            <Button
              className={`bg-gradient-to-r ${cfg.gradient} text-white border-0 min-w-40`}
              onClick={handleSave}
              disabled={saving || !formData.titre.trim()}
            >
              {saving
                ? (pdfFile ? 'Envoi du PDF…' : 'Enregistrement…')
                : editId ? 'Enregistrer les modifications' : 'Créer le cours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Aperçu ─────────────────────────────────────────── */}
      <Dialog open={!!viewCourse} onOpenChange={() => setViewCourse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium w-fit mb-1 ${cfg.badge}`}>
              <Icon className="w-3.5 h-3.5" /> {sectionName}
            </div>
            <DialogTitle className="text-xl">{viewCourse?.titre}</DialogTitle>
          </DialogHeader>
          {viewCourse && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">{viewCourse.description}</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`p-3 rounded-xl ${cfg.bg}`}>
                  <Badge className={LEVEL_COLORS[viewCourse.niveau] || 'bg-gray-100 text-gray-700'}>
                    {viewCourse.niveau}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">Niveau</p>
                </div>
                <div className={`p-3 rounded-xl ${cfg.bg}`}>
                  <p className={`font-bold ${cfg.color}`}>{viewCourse.duree || 0}min</p>
                  <p className="text-xs text-muted-foreground mt-1">Durée</p>
                </div>
                <div className={`p-3 rounded-xl ${cfg.bg}`}>
                  <p className={`font-bold ${cfg.color}`}>{(viewCourse.prix || 0).toLocaleString('fr-FR')} MAD</p>
                  <p className="text-xs text-muted-foreground mt-1">Prix</p>
                </div>
              </div>
              {viewCourse.content && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contenu</p>
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-muted rounded-lg p-3">{viewCourse.content}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {viewCourse.cours_nom && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${cfg.bg}`}>
                    <Tag className={`w-3 h-3 ${cfg.color}`} />
                    <span className="text-muted-foreground">Matière :</span>
                    <span className="font-medium">{viewCourse.cours_nom}</span>
                  </div>
                )}
                {viewCourse.instructeur && (
                  <div className={`flex items-center gap-2 p-2 rounded-lg ${cfg.bg}`}>
                    <UserCheck className={`w-3 h-3 ${cfg.color}`} />
                    <span className="text-muted-foreground">Instructeur :</span>
                    <span className="font-medium">{viewCourse.instructeur}</span>
                  </div>
                )}
              </div>
              <div className={`flex items-center gap-2 p-3 rounded-xl ${cfg.bg} text-sm`}>
                <Users className={`w-4 h-4 ${cfg.color}`} />
                <span className="text-muted-foreground">Étudiants inscrits :</span>
                <span className={`font-bold ${cfg.color}`}>{enrollCount(viewCourse.id)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCourse(null)}>Fermer</Button>
            <Button className={`bg-gradient-to-r ${cfg.gradient} text-white border-0`}
              onClick={() => { openEdit(viewCourse); setViewCourse(null); }}>
              <Edit className="w-3.5 h-3.5 mr-1.5" /> Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Confirmation suppression (sécurisée) ─────────────────── */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => { setDeleteConfirm(null); setDeleteConfirmText(''); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Supprimer ce cours ?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
              <p className="text-sm font-semibold text-destructive">⚠️ Action irréversible</p>
              <p className="text-xs text-muted-foreground mt-1">
                Le cours <strong>"{deleteConfirm?.titre}"</strong> et toutes ses inscriptions seront définitivement supprimés.
              </p>
            </div>
            <div>
              <Label className="text-sm">
                Pour confirmer, saisissez le titre exact du cours :
              </Label>
              <Input
                className="mt-1 border-destructive/50 focus-visible:ring-destructive"
                placeholder={deleteConfirm?.titre}
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                autoFocus
              />
              {deleteConfirmText.length > 0 && deleteConfirmText !== deleteConfirm?.titre && (
                <p className="text-xs text-destructive mt-1">Le titre ne correspond pas.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteConfirm(null); setDeleteConfirmText(''); }}>Annuler</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== deleteConfirm?.titre}
              onClick={handleDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default AdminFormationSubPage;
