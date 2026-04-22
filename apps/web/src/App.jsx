
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext.jsx';
import { CartProvider } from '@/hooks/useCart.jsx';
import { LanguageProvider } from '@/contexts/LanguageContext.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { ProtectedRoute, AdminRoute } from '@/components/ProtectedRoute.jsx';

// Public Pages
import HomePage from '@/pages/HomePage.jsx';
import EntreprisePage from '@/pages/EntreprisePage.jsx';
import ServicesPage from '@/pages/ServicesPage.jsx';
import CoursesListPage from '@/pages/CoursesListPage.jsx';
import CourseDetailPage from '@/pages/CourseDetailPage.jsx';
import FormationInscriptionPage from '@/pages/FormationInscriptionPage.jsx';
import StorePage from '@/pages/StorePage.jsx';
import ProductDetailPage from '@/pages/ProductDetailPage.jsx';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage.jsx';
import PaymentCapturePage from '@/pages/PaymentCapturePage.jsx';
import StudioPage from '@/pages/StudioPage.jsx';
import StudioReservationPage from '@/pages/StudioReservationPage.jsx';
import StudioConfirmationPage from '@/pages/StudioConfirmationPage.jsx';
import ContactPage from '@/pages/ContactPage.jsx';

// Auth Pages
import LoginPage from '@/pages/LoginPage.jsx';
import SignupPage from '@/pages/SignupPage.jsx';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from '@/pages/ResetPasswordPage.jsx';
import PendingApprovalPage from '@/pages/PendingApprovalPage.jsx';
import ApprovalRedirectPage from '@/pages/ApprovalRedirectPage.jsx';

// Dashboard Pages
import DashboardPage from '@/pages/DashboardPage.jsx';
import ProfilePage from '@/pages/ProfilePage.jsx';
import OrdersPage from '@/pages/OrdersPage.jsx';
import CoursesPage from '@/pages/CoursesPage.jsx';
import SettingsPage from '@/pages/SettingsPage.jsx';
import SecureCourseViewer from '@/pages/SecureCourseViewer.jsx';

// Admin Pages
import AdminDashboard from '@/pages/AdminDashboard.jsx';
import AdminProductsPage from '@/pages/AdminProductsPage.jsx';
import AdminStudentsPage from '@/pages/AdminStudentsPage.jsx';
import AdminCoursesPage from '@/pages/AdminCoursesPage.jsx';
import AdminContentsPage from '@/pages/AdminContentsPage.jsx';
import AdminSettingsPage from '@/pages/AdminSettingsPage.jsx';
import AdminStudentDetailPage from '@/pages/AdminStudentDetailPage.jsx';
import AdminPaymentsPage from '@/pages/AdminPaymentsPage.jsx';
import NotificationsPage from '@/pages/NotificationsPage.jsx';
// Admin — Formation
import AdminFormationPage from '@/pages/AdminFormationPage.jsx';
import AdminFormationSubPage from '@/pages/AdminFormationSubPage.jsx';
import AdminFormationPaymentsPage from '@/pages/AdminFormationPaymentsPage.jsx';
// Admin — Magasin & Studio
import AdminMagasinPage from '@/pages/AdminMagasinPage.jsx';
import AdminStudioPage from '@/pages/AdminStudioPage.jsx';
// Admin — Web Agency
import AdminWebAgencyPage from '@/pages/AdminWebAgencyPage.jsx';

// Web Agency Pages
import WebAgencyPage from '@/pages/WebAgencyPage.jsx';
import WebOrderPage from '@/pages/WebOrderPage.jsx';
import WebOrderConfirmationPage from '@/pages/WebOrderConfirmationPage.jsx';
import WordPressBuilderPage from '@/pages/WordPressBuilderPage.jsx';

// Hostinger Pages
import HostingerHomePage from '@/pages/HostingerHomePage.jsx';
import HostingerOffersPage from '@/pages/HostingerOffersPage.jsx';
import HostingerFaqPage from '@/pages/HostingerFaqPage.jsx';
import HostingerContactPage from '@/pages/HostingerContactPage.jsx';

// Legal Pages
import LegalPage from '@/pages/LegalPage.jsx';
import TermsPage from '@/pages/TermsPage.jsx';

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Toaster position="top-center" richColors />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/entreprise" element={<EntreprisePage />} />
              <Route path="/about" element={<EntreprisePage />} />
              <Route path="/a-propos" element={<EntreprisePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/formation" element={<CoursesListPage />} />
              <Route path="/formation/inscription" element={<FormationInscriptionPage />} />
              <Route path="/courses/:id" element={<CourseDetailPage />} />
              <Route path="/store" element={<StorePage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/success" element={<ProtectedRoute><PaymentCapturePage /></ProtectedRoute>} />
              <Route path="/payment/cancel"  element={<ProtectedRoute><PaymentCapturePage /></ProtectedRoute>} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/studio/reservation" element={<StudioReservationPage />} />
              <Route path="/studio/confirmation/:id" element={<StudioConfirmationPage />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Web Agency Routes */}
              <Route path="/agence" element={<WebAgencyPage />} />
              <Route path="/agence/commande" element={<WebOrderPage />} />
              <Route path="/agence/confirmation" element={<WebOrderConfirmationPage />} />
              <Route path="/agence/wordpress" element={<WordPressBuilderPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/approval-redirect" element={<ApprovalRedirectPage />} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/dashboard/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/dashboard/courses" element={<ProtectedRoute><CoursesPage /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/dashboard/courses/:courseId/view" element={<ProtectedRoute><SecureCourseViewer /></ProtectedRoute>} />
              <Route path="/dashboard/courses/view" element={<ProtectedRoute><SecureCourseViewer /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} />
              <Route path="/admin/students" element={<AdminRoute><AdminStudentsPage /></AdminRoute>} />
              <Route path="/admin/students/:id" element={<AdminRoute><AdminStudentDetailPage /></AdminRoute>} />
              <Route path="/admin/courses" element={<AdminRoute><AdminCoursesPage /></AdminRoute>} />
              <Route path="/admin/contents" element={<AdminRoute><AdminContentsPage /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPaymentsPage /></AdminRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><NotificationsPage /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

              {/* Admin — Centre de Formation */}
              <Route path="/admin/formation" element={<AdminRoute><AdminFormationPage /></AdminRoute>} />
              <Route path="/admin/formation/paiements" element={<AdminRoute><AdminFormationPaymentsPage /></AdminRoute>} />
              <Route path="/admin/formation/:section" element={<AdminRoute><AdminFormationSubPage /></AdminRoute>} />

              {/* Admin — Magasin */}
              <Route path="/admin/magasin" element={<AdminRoute><AdminMagasinPage /></AdminRoute>} />
              <Route path="/admin/magasin/:store" element={<AdminRoute><AdminMagasinPage /></AdminRoute>} />

              {/* Admin — Studio */}
              <Route path="/admin/studio" element={<AdminRoute><AdminStudioPage /></AdminRoute>} />
              <Route path="/admin/studio/:subsection" element={<AdminRoute><AdminStudioPage /></AdminRoute>} />

              {/* Admin — Web Agency */}
              <Route path="/admin/agence" element={<AdminRoute><AdminWebAgencyPage /></AdminRoute>} />

              {/* Hostinger Routes */}
              <Route path="/hostinger" element={<HostingerHomePage />} />
              <Route path="/hostinger/offres" element={<HostingerOffersPage />} />
              <Route path="/hostinger/faq" element={<HostingerFaqPage />} />
              <Route path="/hostinger/contact" element={<HostingerContactPage />} />

              {/* Legal Routes */}
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/terms" element={<TermsPage />} />
              
              {/* Catch all */}
              <Route 
                path="*" 
                element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-4">
                    <h1 className="text-7xl font-extrabold text-primary mb-6">404</h1>
                    <p className="text-2xl text-muted-foreground mb-10">Page introuvable</p>
                    <a href="/" className="px-8 py-4 bg-accent text-primary font-bold rounded-xl hover:bg-accent/90 transition-colors shadow-lg">
                      Retour à l'accueil
                    </a>
                  </div>
                } 
              />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}

export default App;
