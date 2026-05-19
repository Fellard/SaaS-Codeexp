
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus, BookOpen, Edit, Trash2, Eye, Search,
  Languages, Monitor, Code2, AlertCircle, Download,
  Loader2, FileUp, CheckCircle2, RefreshCw, FileText,
  ChevronDown, ChevronUp,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────
// CONFIGURATION — Programmes / Cours / Niveaux
// ─────────────────────────────────────────────────────────────────
export const PROGRAMME_CFG = {
  langues: {
    label: 'Langues', icon: Languages,
    gradient: 'from-blue-600 to-sky-500',
    badge: 'bg-blue-100 text-blue-700 border-blue-300',
    cours: ['Français', 'Anglais', 'Arabe', 'Espagnol', 'Allemand', 'Autre'],
    niveaux: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  },
  informatique: {
    label: 'Informatique', icon: Monitor,
    gradient: 'from-green-600 to-emerald-500',
    badge: 'bg-green-100 text-green-700 border-green-300',
    cours: ['Bureautique', 'Maintenance informatique', 'Réseaux', 'Graphisme', 'Sécurité informatique', 'Autre'],
    niveaux: ['Débutant', 'Intermédiaire', 'Avancé'],
  },
  programmation: {
    label: 'Programmation', icon: Code2,
    gradient: 'from-purple-600 to-indigo-500',
    badge: 'bg-purple-100 text-purple-700 border-purple-300',
    cours: ['HTML/CSS', 'JavaScript', 'React', 'Python', 'PHP', 'Développement mobile', 'Autre'],
    niveaux: ['Débutant', 'Intermédiaire', 'Avancé'],
  },
};

const EMPTY_COURSE = {
  id: '', title: '', description: '',
  section: 'langues', cours_nom: 'Français', niveau: 'A1',
  duration: 60, price: 0,
};

const SEL_CLS = 'w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring';

// ─────────────────────────────────────────────────────────────────
// Lecture fichier → base64
// ─────────────────────────────────────────────────────────────────
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result = "data:application/pdf;base64,XXXXX"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────
const AdminCoursesPage = () => {
  const [courses, setCourses]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterSection, setFilterSection] = useState('all');
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [formData, setFormData]         = useState(EMPTY_COURSE);
  const [saving, setSaving]             = useState(false);
  const [seeding, setSeeding]           = useState(false);
  const [seedingLieu, setSeedingLieu]   = useState(false);

  // ── État upload PDF ───────────────────────────────────────────
  const [pdfFile, setPdfFile]           = useState(null);   // File object
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [extractedPages, setExtractedPages] = useState([]);   // [{id,title,content}]
  const [extractedExercises, setExtractedExercises] = useState([]);
  const [showPagesPreview, setShowPagesPreview] = useState(false);

  // ── Exercices éditables manuellement ─────────────────────────
  const [exercises, setExercises]       = useState([]);

  const fileInputRef = useRef(null);

  // ── Fetch ─────────────────────────────────────────────────────
  const fetchCourses = async () => {
    try {
      const res = await pb.collection('courses').getFullList({ sort: '-created', requestKey: null });
      setCourses(res);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCourses(); }, []);

  // ── Section helper ────────────────────────────────────────────
  const getCourseSection = (c) => {
    if (c.section && PROGRAMME_CFG[c.section]) return c.section;
    const cat = (c.categorie || c.category || c.language || '').toLowerCase();
    if (['langue','langues','français','anglais','arabe','espagnol','french','english','arabic','fr'].some(k => cat.includes(k))) return 'langues';
    if (['informatique','bureautique','maintenance','réseau','network','graphisme','it'].some(k => cat.includes(k))) return 'informatique';
    if (['programmation','développement','web','mobile','python','javascript','html','css','react','code'].some(k => cat.includes(k))) return 'programmation';
    return null;
  };

  // ── Helpers exercices ─────────────────────────────────────────
  const addExercise    = () => setExercises(p => [...p, { id: Date.now(), question: '', options: ['', '', '', ''], answer: 0 }]);
  const updateExercise = (i, f, v) => setExercises(p => { const u=[...p]; u[i][f]=v; return u; });
  const updateOption   = (ei, oi, v) => setExercises(p => { const u=[...p]; u[ei].options[oi]=v; return u; });
  const removeExercise = (i) => setExercises(p => p.filter((_,idx)=>idx!==i));

  // ── Helper : appel API admin ──────────────────────────────────
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

  // ── Extraction PDF via Claude ─────────────────────────────────
  const handlePdfSelect = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF valide');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Le fichier PDF ne doit pas dépasser 20 Mo');
      return;
    }

    setPdfFile(file);
    setPdfExtracting(true);
    setExtractedPages([]);
    setExtractedExercises([]);

    try {
      const base64 = await readFileAsBase64(file);
      const token  = pb.authStore.token;

      const res = await fetch('http://localhost:3001/admin/courses/parse-pdf', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pdf_base64: base64, pdf_filename: file.name }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erreur ${res.status}`);

      setExtractedPages(data.pages || []);
      setExtractedExercises(data.exercises || []);
      setExercises(data.exercises || []);

      // Auto-remplir titre + description si vides
      if (data.title  && !formData.title)       setFormData(p => ({ ...p, title: data.title }));
      if (data.description && !formData.description) setFormData(p => ({ ...p, description: data.description }));

      toast.success(`✅ ${data.pages?.length || 0} pages et ${data.exercises?.length || 0} exercices extraits !`);
      setShowPagesPreview(true);
    } catch (err) {
      toast.error('Erreur extraction : ' + err.message);
      setPdfFile(null);
    } finally {
      setPdfExtracting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handlePdfSelect(file);
  };

  // ── Save ──────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.section || !formData.cours_nom || !formData.niveau) {
      toast.error('Programme, cours et niveau sont obligatoires !');
      return;
    }
    // Au moins un contenu (pages ou exercices)
    if (extractedPages.length === 0 && exercises.length === 0) {
      toast.error('Importez un PDF ou ajoutez au moins un exercice manuellement.');
      return;
    }
    setSaving(true);
    try {
      const finalTitle = formData.title.trim() || `${formData.cours_nom} — Niveau ${formData.niveau}`;

      const data = {
        title:       finalTitle,
        titre:       finalTitle,
        description: formData.description,
        section:     formData.section,
        cours_nom:   formData.cours_nom,
        niveau:      formData.niveau,
        level:       formData.niveau,
        category:    formData.section,
        categorie:   formData.section,
        duration:    formData.duration,
        price:       formData.price,
        prix:        formData.price,
        pages:       extractedPages.length > 0 ? JSON.stringify(extractedPages) : '',
        exercises:   JSON.stringify(exercises),
        // Réinitialiser le champ content (plus utilisé)
        content:     '',
      };

      if (formData.id) {
        await apiCourse('PATCH', `/courses/${formData.id}`, data);
        toast.success('Cours mis à jour ✓');
      } else {
        await apiCourse('POST', '/courses', { ...data, auto_enroll: true });
        toast.success('Cours créé et étudiants inscrits ✓');
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce cours définitivement ?')) return;
    try {
      await apiCourse('DELETE', `/courses/${id}`);
      toast.success('Cours supprimé');
      fetchCourses();
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    }
  };

  const openModal = (course = null) => {
    if (course) {
      const sec = getCourseSection(course) || 'langues';
      setFormData({
        ...EMPTY_COURSE, ...course,
        section:   course.section   || sec,
        cours_nom: course.cours_nom || course.current_course || '',
        niveau:    course.niveau    || course.level || course.Level || '',
      });
      // Charger pages existantes
      try { setExtractedPages(JSON.parse(course.pages || '[]')); } catch { setExtractedPages([]); }
      try { setExercises(JSON.parse(course.exercises || '[]')); } catch { setExercises([]); }
      setExtractedExercises([]);
    } else {
      setFormData(EMPTY_COURSE);
      setExtractedPages([]);
      setExercises([]);
      setExtractedExercises([]);
    }
    setPdfFile(null);
    setPdfExtracting(false);
    setShowPagesPreview(false);
    setIsModalOpen(true);
  };

  const openPreview = (course) => {
    setFormData({ ...EMPTY_COURSE, ...course });
    try { setExercises(JSON.parse(course.exercises || '[]')); } catch { setExercises([]); }
    try { setExtractedPages(JSON.parse(course.pages || '[]')); } catch { setExtractedPages([]); }
    setIsPreviewOpen(true);
  };

  // ── Seed demo courses ─────────────────────────────────────────
  const seedDemoCourse = async () => {
    setSeeding(true);
    try {
      const res  = await fetch('http://localhost:3001/courses/seed-demo-course', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) { toast.success(`✅ Cours créé ! ID: ${data.courseId}`); fetchCourses(); }
      else toast.error('Erreur : ' + (data.error || 'Inconnue'));
    } catch (e) { toast.error('API injoignable : ' + e.message); }
    finally { setSeeding(false); }
  };

  const seedLieuCourse = async () => {
    setSeedingLieu(true);
    try {
      const res  = await fetch('http://localhost:3001/courses/seed-lieu-course', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (data.success) { toast.success(`Cours "Exprimer un lieu" créé !`); fetchCourses(); }
      else toast.error('Erreur : ' + (data.error || 'Inconnue'));
    } catch (e) { toast.error('API injoignable : ' + e.message); }
    finally { setSeedingLieu(false); }
  };

  const handleSectionChange = (sec) => {
    const cfg = PROGRAMME_CFG[sec];
    setFormData(p => ({ ...p, section: sec, cours_nom: cfg?.cours[0] || '', niveau: cfg?.niveaux[0] || '' }));
  };

  // ── Filter ────────────────────────────────────────────────────
  const filtered = courses.filter(c => {
    const matchSearch = (c.title||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cours_nom||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.niveau||c.level||'').toLowerCase().includes(searchTerm.toLowerCase());
    const sec = getCourseSection(c);
    return matchSearch && (filterSection === 'all' || sec === filterSection);
  });

  const counts = Object.keys(PROGRAMME_CFG).reduce((acc, k) => {
    acc[k] = courses.filter(c => getCourseSection(c) === k).length; return acc;
  }, {});

  const isComplete  = (c) => !!(getCourseSection(c) && (c.cours_nom||c.current_course) && (c.niveau||c.level||c.Level));
  const hasContent  = (c) => {
    try { return JSON.parse(c.pages||'[]').length > 0 || JSON.parse(c.exercises||'[]').length > 0; } catch { return !!(c.content); }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <Helmet><title>Gestion des Cours — Admin IWS</title></Helmet>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-foreground">📚 Gestion des Cours</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {courses.length} cours · {courses.filter(isComplete).length} complets · {courses.filter(hasContent).length} avec contenu
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={seedDemoCourse} disabled={seeding} className="gap-2 font-semibold border-indigo-300 text-indigo-700 hover:bg-indigo-50">
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exprimer le temps (A1)
            </Button>
            <Button variant="outline" onClick={seedLieuCourse} disabled={seedingLieu} className="gap-2 font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              {seedingLieu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Exprimer un lieu (A1)
            </Button>
            <Button onClick={() => openModal()} className="gap-2 font-bold">
              <Plus className="w-4 h-4" /> Créer un cours
            </Button>
          </div>
        </div>

        {/* Section pills */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterSection('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${filterSection==='all' ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
            Tous ({courses.length})
          </button>
          {Object.entries(PROGRAMME_CFG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setFilterSection(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${filterSection===key ? `border-transparent ${cfg.badge}` : 'border-border text-muted-foreground hover:border-foreground/40'}`}>
                <Icon className="w-3.5 h-3.5" /> {cfg.label} ({counts[key]})
              </button>
            );
          })}
        </div>

        {/* Table */}
        <Card>
          <div className="p-4 border-b border-border flex gap-4 items-center bg-muted/20">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Rechercher…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 bg-background" />
            </div>
            <span className="text-sm text-muted-foreground ml-auto">{filtered.length} résultat(s)</span>
          </div>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-sm">
                <thead>
                  <tr>
                    <th className="w-6"></th>
                    <th>Titre</th>
                    <th>Programme</th>
                    <th>Cours</th>
                    <th>Niveau</th>
                    <th>Contenu</th>
                    <th>Prix</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="8" className="text-center py-10 text-muted-foreground">Chargement…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-14 text-muted-foreground">
                        <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-semibold">Aucun cours</p>
                        <p className="text-xs mt-1">Cliquez sur « Créer un cours » pour commencer</p>
                      </td>
                    </tr>
                  ) : filtered.map(c => {
                    const sec = getCourseSection(c);
                    const cfg = sec ? PROGRAMME_CFG[sec] : null;
                    const Icon = cfg?.icon || BookOpen;
                    const nom = c.cours_nom || c.current_course || '—';
                    const niv = c.niveau || c.level || c.Level || '—';
                    const complete = isComplete(c);
                    const hasPages = (() => { try { return JSON.parse(c.pages||'[]').length > 0; } catch { return false; } })();
                    const hasEx = (() => { try { return JSON.parse(c.exercises||'[]').length > 0; } catch { return false; } })();
                    return (
                      <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                        <td>{!complete && <span title="Cours incomplet"><AlertCircle className="w-4 h-4 text-amber-400" /></span>}</td>
                        <td>
                          <div className="font-medium line-clamp-1">{c.title || `${nom} — ${niv}`}</div>
                          {c.description && <div className="text-xs text-muted-foreground line-clamp-1">{c.description}</div>}
                        </td>
                        <td>
                          {cfg ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${cfg.badge}`}>
                              <Icon className="w-3 h-3" /> {cfg.label}
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">Non classé</span>
                          )}
                        </td>
                        <td className="font-medium text-sm">{nom}</td>
                        <td><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{niv}</span></td>
                        <td>
                          <div className="flex gap-1">
                            {hasPages && <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700" title="Leçons disponibles">📖 Leçons</span>}
                            {hasEx && <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700" title="Exercices disponibles">📝 Quiz</span>}
                            {!hasPages && !hasEx && <span className="text-xs text-muted-foreground italic">Aucun contenu</span>}
                          </div>
                        </td>
                        <td className="font-mono font-semibold">{c.price > 0 ? `${c.price} MAD` : <span className="text-emerald-600">Gratuit</span>}</td>
                        <td className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => openPreview(c)} className="h-7 w-7 p-0"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => openModal(c)} className="h-7 w-7 p-0"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── MODAL Créer / Modifier ─────────────────────────────── */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[94vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {formData.id ? '✏️ Modifier le cours' : '➕ Créer un cours'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-5 pt-2">

            {/* ── CLASSIFICATION ────────────────────────────── */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Classement du cours (obligatoire)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Programme *</Label>
                  <select required value={formData.section} onChange={e => handleSectionChange(e.target.value)} className={SEL_CLS}>
                    {Object.entries(PROGRAMME_CFG).map(([k, cfg]) => <option key={k} value={k}>{cfg.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Cours *</Label>
                  <select required value={formData.cours_nom} onChange={e => setFormData(p => ({ ...p, cours_nom: e.target.value }))} className={SEL_CLS}>
                    {(PROGRAMME_CFG[formData.section]?.cours || []).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold">Niveau *</Label>
                  <select required value={formData.niveau} onChange={e => setFormData(p => ({ ...p, niveau: e.target.value }))} className={SEL_CLS}>
                    {(PROGRAMME_CFG[formData.section]?.niveaux || []).map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              {formData.section && formData.cours_nom && formData.niveau && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 font-medium">
                  <span>Affiché pour :</span>
                  <span className={`px-2 py-0.5 rounded-full border font-bold text-xs ${PROGRAMME_CFG[formData.section]?.badge}`}>
                    {PROGRAMME_CFG[formData.section]?.label}
                  </span>
                  <span>→ {formData.cours_nom} → Niveau {formData.niveau}</span>
                </div>
              )}
            </div>

            {/* ── INFOS GÉNÉRALES ───────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Titre du cours</Label>
                <Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  placeholder={`Ex: ${formData.cours_nom} — ${formData.niveau} — Les prépositions`} className="bg-background" />
                <p className="text-xs text-muted-foreground">Laissez vide pour générer automatiquement. Rempli automatiquement à l'import PDF.</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Durée (minutes)</Label>
                <Input type="number" min="0" value={formData.duration} onChange={e => setFormData(p => ({ ...p, duration: Number(e.target.value) }))} className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Prix (MAD) — 0 = Gratuit</Label>
                <Input type="number" min="0" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))} className="bg-background" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs font-bold">Description</Label>
                <textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2}
                  placeholder="Objectifs du cours… (rempli automatiquement à l'import PDF)"
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {/* ── IMPORT PDF ────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold flex items-center gap-2">
                  📄 Contenu du cours
                  {extractedPages.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {extractedPages.length} pages chargées
                    </span>
                  )}
                </Label>
                {extractedPages.length > 0 && (
                  <Button type="button" variant="ghost" size="sm" className="text-xs gap-1"
                    onClick={() => setShowPagesPreview(p => !p)}>
                    {showPagesPreview ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showPagesPreview ? 'Masquer' : 'Afficher'} l'aperçu
                  </Button>
                )}
              </div>

              {/* Zone d'upload PDF */}
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => !pdfExtracting && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all
                  ${pdfExtracting ? 'border-blue-400 bg-blue-50' :
                    extractedPages.length > 0 ? 'border-green-400 bg-green-50' :
                    'border-border hover:border-primary/60 hover:bg-muted/30'}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handlePdfSelect(f); e.target.value = ''; }}
                />

                {pdfExtracting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <div>
                      <p className="font-semibold text-blue-700">Analyse du PDF en cours…</p>
                      <p className="text-xs text-blue-600 mt-0.5">Claude structure le contenu en pages et exercices</p>
                    </div>
                  </div>
                ) : extractedPages.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                    <div>
                      <p className="font-semibold text-green-700">
                        {pdfFile?.name || 'PDF'} — {extractedPages.length} pages extraites
                      </p>
                      <p className="text-xs text-green-600 mt-0.5">
                        {exercises.length} exercices · Cliquez pour remplacer par un autre PDF
                      </p>
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-1 gap-1.5 text-xs border-green-300 text-green-700">
                      <RefreshCw className="w-3 h-3" /> Importer un autre PDF
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <FileUp className="w-10 h-10 text-muted-foreground/50" />
                    <div>
                      <p className="font-semibold text-foreground">Glissez votre PDF ici ou cliquez pour sélectionner</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Claude extraira automatiquement les leçons et les exercices depuis le document
                      </p>
                      <p className="text-xs text-muted-foreground">PDF · max 20 Mo</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Aperçu des pages extraites */}
              {showPagesPreview && extractedPages.length > 0 && (
                <div className="border border-border rounded-xl overflow-hidden">
                  <div className="bg-muted/30 px-4 py-2.5 border-b border-border">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Aperçu des pages extraites</p>
                  </div>
                  <div className="divide-y divide-border max-h-64 overflow-y-auto">
                    {extractedPages.map((page, i) => (
                      <div key={page.id || i} className="flex items-start gap-3 px-4 py-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm">{page.title}</p>
                          <p className="text-xs text-muted-foreground truncate"
                            dangerouslySetInnerHTML={{ __html: page.content?.replace(/<[^>]+>/g, ' ').slice(0, 120) + '…' }} />
                        </div>
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── EXERCICES ──────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold">
                  📝 Exercices ({exercises.length})
                  {exercises.length > 0 && extractedExercises.length > 0 && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">(extraits du PDF)</span>
                  )}
                </Label>
                <Button type="button" variant="outline" size="sm" onClick={addExercise} className="gap-1.5 text-xs">
                  <Plus className="w-3 h-3" /> Ajouter manuellement
                </Button>
              </div>

              {exercises.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-4 text-center text-sm text-muted-foreground">
                  Aucun exercice. Importez un PDF pour en générer automatiquement,
                  ou ajoutez-en manuellement avec le bouton ci-dessus.
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {exercises.map((ex, i) => (
                    <div key={ex.id || i} className="border border-border rounded-xl p-4 space-y-3 bg-muted/20">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">Question {i + 1}</span>
                        <Button type="button" variant="destructive" size="sm" className="h-7 px-2 text-xs" onClick={() => removeExercise(i)}>Supprimer</Button>
                      </div>
                      <Input placeholder="Ex: Nous allons ___ la montagne." value={ex.question}
                        onChange={e => updateExercise(i, 'question', e.target.value)} className="bg-background" />
                      <div className="grid grid-cols-2 gap-2">
                        {(ex.options || ['', '', '', '']).map((opt, j) => (
                          <div key={j} className="flex items-center gap-2">
                            <input type="radio" name={`answer-${i}`} checked={ex.answer === j}
                              onChange={() => updateExercise(i, 'answer', j)} className="accent-primary" />
                            <Input placeholder={`Option ${String.fromCharCode(97 + j)})`} value={opt}
                              onChange={e => updateOption(i, j, e.target.value)}
                              className={`bg-background text-sm ${ex.answer === j ? 'border-green-500 ring-1 ring-green-500' : ''}`} />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">● Cliquez sur le bouton radio pour marquer la bonne réponse</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" className="flex-1 font-bold" disabled={saving || pdfExtracting}>
                {saving ? 'Sauvegarde…' : pdfExtracting ? 'Extraction en cours…' : formData.id ? 'Mettre à jour' : 'Créer le cours'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── PREVIEW ──────────────────────────────────────────── */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>👁️ Aperçu — {formData.title || `${formData.cours_nom} ${formData.niveau}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="flex gap-2 flex-wrap">
              {formData.section && PROGRAMME_CFG[formData.section] && (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold border ${PROGRAMME_CFG[formData.section].badge}`}>
                  {React.createElement(PROGRAMME_CFG[formData.section].icon, { className: 'w-3.5 h-3.5' })}
                  {PROGRAMME_CFG[formData.section].label}
                </span>
              )}
              {formData.cours_nom && <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-100 text-slate-700">{formData.cours_nom}</span>}
              {formData.niveau   && <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-100 text-indigo-700">{formData.niveau}</span>}
              {formData.duration > 0 && <span className="px-3 py-1 rounded-full text-sm bg-muted">{formData.duration} min</span>}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${formData.price > 0 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {formData.price > 0 ? `${formData.price} MAD` : 'Gratuit'}
              </span>
            </div>
            {formData.description && <p className="text-muted-foreground text-sm">{formData.description}</p>}

            {/* Pages preview */}
            {extractedPages.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">📖 Leçons ({extractedPages.length} pages)</h4>
                <div className="space-y-2">
                  {extractedPages.map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                      <span className="font-medium">{p.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercices preview */}
            {exercises.length > 0 && (
              <div>
                <h4 className="font-bold mb-3">📝 Exercices ({exercises.length})</h4>
                <div className="space-y-4">
                  {exercises.slice(0, 3).map((ex, i) => (
                    <div key={i} className="border border-border rounded-xl p-4">
                      <p className="font-semibold mb-3 text-sm">{i + 1}. {ex.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(ex.options||[]).map((opt, j) => (
                          <div key={j} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${j===ex.answer ? 'border-green-500 bg-green-50 text-green-700 font-semibold' : 'border-border'}`}>
                            <span className="text-xs font-bold w-4">{String.fromCharCode(97+j)})</span>{opt}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {exercises.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">… et {exercises.length - 3} autres exercices</p>
                  )}
                </div>
              </div>
            )}

            {extractedPages.length === 0 && exercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                <p className="font-semibold">Aucun contenu</p>
                <p className="text-xs mt-1">Modifiez ce cours et importez un PDF pour ajouter du contenu</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoursesPage;
