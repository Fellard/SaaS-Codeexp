
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient';
import AdminLayout from '@/components/AdminLayout.jsx';
import { useTranslation } from '@/i18n/useTranslation.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, Languages, Monitor, Code2,
  Users, BookOpen, TrendingUp, CreditCard,
  ArrowRight, Award, BarChart3,
} from 'lucide-react';

// ── Section configuration ─────────────────────────────────────────
export const FORMATION_SECTIONS = {
  langues: {
    key: 'langues',
    icon: Languages,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    gradient: 'from-blue-500 to-indigo-600',
    categories: ['grammaire', 'vocabulaire', 'conjugaison', 'phonétique', 'conversation', 'langue', 'langues', 'français', 'anglais', 'arabe'],
    path: '/admin/formation/langues',
  },
  informatique: {
    key: 'informatique',
    icon: Monitor,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    gradient: 'from-green-500 to-emerald-600',
    categories: ['informatique', 'bureautique', 'réseaux', 'système', 'office', 'windows', 'excel', 'word'],
    path: '/admin/formation/informatique',
  },
  programmation: {
    key: 'programmation',
    icon: Code2,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800',
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    gradient: 'from-purple-500 to-pink-600',
    categories: ['programmation', 'web', 'mobile', 'python', 'javascript', 'react', 'php', 'java', 'développement', 'dev'],
    path: '/admin/formation/programmation',
  },
};

// Map a course to its section
export const getCourseSection = (course) => {
  if (course.section) return course.section;
  const cat = (course.category || '').toLowerCase();
  for (const [key, cfg] of Object.entries(FORMATION_SECTIONS)) {
    if (cfg.categories.some(c => cat.includes(c))) return key;
  }
  return 'langues'; // default
};

const AdminFormationPage = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, studentsRes, ordersRes] = await Promise.allSettled([
          pb.collection('courses').getFullList({ requestKey: null }),
          pb.collection('users').getFullList({ filter: 'role="student"', requestKey: null }),
          pb.collection('orders').getFullList({ requestKey: null }),
        ]);
        setCourses(coursesRes.status === 'fulfilled' ? coursesRes.value : []);
        setStudents(studentsRes.status === 'fulfilled' ? studentsRes.value : []);
        setOrders(ordersRes.status === 'fulfilled' ? ordersRes.value : []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Per-section stats ─────────────────────────────────────────────
  const sectionStats = Object.entries(FORMATION_SECTIONS).map(([key, cfg]) => {
    const sectionCourses = courses.filter(c => getCourseSection(c) === key);
    const sectionOrders = orders.filter(o => {
      const products = o.expand?.products || [];
      return products.some(p => getCourseSection({ category: p.category || '' }) === key);
    });
    const revenue = orders
      .filter(o => o.status === 'paid')
      .reduce((sum, o) => sum + (o.total_price || 0), 0);

    return {
      key,
      cfg,
      coursesCount: sectionCourses.length,
      ordersCount: sectionOrders.length,
      revenue: revenue / 3, // approximate split
    };
  });

  const totalCourses = courses.length;
  const totalStudents = students.length;
  const totalRevenue = orders
    .filter(o => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total_price || 0), 0);
  const approvedStudents = students.filter(s => s.approved).length;

  const StatCard = ({ icon: Icon, value, label, color = 'text-primary', loading: l }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            {l ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </>
            ) : (
              <>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-muted-foreground mt-1">{label}</p>
              </>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-muted ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <Helmet><title>{t('admin.formation.title')} — IWS Admin</title></Helmet>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('admin.formation.title')}</h1>
          <p className="text-muted-foreground">{t('admin.formation.subtitle')}</p>
        </div>
      </div>

      {/* Global stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={BookOpen} value={totalCourses} label={t('admin.formation.stat.courses')} color="text-blue-600" loading={loading} />
        <StatCard icon={Users} value={totalStudents} label={t('admin.formation.stat.students')} color="text-green-600" loading={loading} />
        <StatCard icon={Award} value={approvedStudents} label={t('admin.formation.stat.approved')} color="text-purple-600" loading={loading} />
        <StatCard icon={CreditCard} value={`${totalRevenue.toLocaleString('fr-FR')} MAD`} label={t('admin.formation.stat.revenue')} color="text-orange-600" loading={loading} />
      </div>

      {/* Section cards */}
      <h2 className="text-lg font-bold mb-4 text-foreground">{t('admin.formation.sections')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sectionStats.map(({ key, cfg, coursesCount, ordersCount, revenue }) => {
          const Icon = cfg.icon;
          return (
            <Card key={key} className={`border-2 ${cfg.border} hover:shadow-lg transition-all duration-300 group`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${cfg.gradient} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge className={cfg.badge}>
                    {loading ? '…' : `${coursesCount} ${t('admin.formation.courses')}`}
                  </Badge>
                </div>
                <CardTitle className={`text-lg ${cfg.color}`}>
                  {t(`admin.formation.section.${key}`)}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  {t(`admin.formation.section.${key}.desc`)}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className={`p-3 rounded-xl ${cfg.bg}`}>
                      <p className={`text-xl font-bold ${cfg.color}`}>{coursesCount}</p>
                      <p className="text-xs text-muted-foreground">{t('admin.formation.courses')}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${cfg.bg}`}>
                      <p className={`text-xl font-bold ${cfg.color}`}>{revenue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</p>
                      <p className="text-xs text-muted-foreground">MAD</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Link to={cfg.path} className="flex-1">
                    <Button variant="outline" size="sm" className={`w-full text-xs border ${cfg.border} ${cfg.color} hover:bg-muted group-hover:border-current`}>
                      <BookOpen className="w-3.5 h-3.5 mr-1" />
                      {t('admin.formation.manageCourses')}
                    </Button>
                  </Link>
                  <Link to={`/admin/formation/paiements?section=${key}`}>
                    <Button variant="ghost" size="sm" className="text-xs px-2">
                      <CreditCard className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { to: '/admin/students', icon: Users, label: t('admin.formation.manageStudents'), color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { to: '/admin/formation/paiements', icon: CreditCard, label: t('admin.formation.managePayments'), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { to: '/admin/contents', icon: BarChart3, label: t('admin.formation.manageContents'), color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
        ].map(({ to, icon: Icon, label, color, bg }) => (
          <Link key={to} to={to}>
            <div className={`flex items-center justify-between p-4 rounded-xl ${bg} border border-border hover:shadow-md transition-all duration-200 cursor-pointer group`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <span className={`text-sm font-medium ${color}`}>{label}</span>
              </div>
              <ArrowRight className={`w-4 h-4 ${color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminFormationPage;
