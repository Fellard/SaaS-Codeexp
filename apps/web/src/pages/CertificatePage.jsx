/**
 * CertificatePage — Certificat IWS de formation linguistique
 * Design identique au modèle physique IWS Laayoune.
 * Accessible à : /etudiant/certificate/:courseId
 */
import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// ── Mapping langue → libellé & niveau ──────────────────────────────────────
const LANGUE_LABEL = {
  Francais: { training: 'French language training', level: 'Elementary' },
  Anglais:  { training: 'English language training', level: 'Elementary' },
  Arabe:    { training: 'Arabic language training',  level: 'Elementary' },
};

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return new Date(dateStr).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function CertificatePage() {
  const { courseId }   = useParams();
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const certRef         = useRef(null);

  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [data,    setData]      = useState(null); // { studentName, langue, score, completedAt, photo, niveau }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        // 1 ── Données de l'étudiant
        const user = await pb.collection('users').getOne(currentUser.id, { requestKey: null });

        // 2 ── Données du cours
        const course = await pb.collection('courses').getOne(courseId, { requestKey: null });

        // 3 ── Meilleur score
        let score = null, completedAt = null;
        try {
          const token = pb.authStore.token;
          const res = await fetch(`${API_URL}/courses/${courseId}/my-score`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const sd = await res.json();
            if (sd.hasScore) { score = sd.score; completedAt = sd.lastAttempt?.submitted_at; }
          }
        } catch { /* fallback */ }

        // 4 ── Photo profil (URL PocketBase si disponible)
        let photoUrl = null;
        if (user.avatar) {
          photoUrl = pb.files.getURL(user, user.avatar, { thumb: '200x200' });
        }

        // 5 ── URL de vérification QR unique par étudiant + cours
        const origin    = window.location.origin;
        const verifyUrl = `${origin}/verify/${courseId}/${currentUser.id}`;

        setData({
          studentName: `${user.name || user.username || currentUser.email}`,
          langue:       course.langue || 'Anglais',
          score:        score ?? '—',
          completedAt:  completedAt,
          photo:        photoUrl,
          niveau:       course.niveau || 'A1',
          pronoun:      'his',
          verifyUrl,
          courseId,
          userId:       currentUser.id,
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, currentUser]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-600 font-medium">Génération du certificat…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <p className="text-red-600 font-semibold mb-4">{error}</p>
        <Button onClick={() => navigate(-1)} variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Retour</Button>
      </div>
    </div>
  );

  const cfg     = LANGUE_LABEL[data?.langue] || LANGUE_LABEL.Anglais;
  const awardDate = formatDate(data?.completedAt);
  const pronoun   = data?.pronoun || 'his';

  return (
    <>
      <Helmet><title>Certificat IWS — {data?.studentName}</title></Helmet>

      {/* ── Barre d'actions (masquée à l'impression) ── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <Button variant="ghost" className="text-white hover:text-white hover:bg-slate-700 gap-2" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Retour
        </Button>
        <span className="font-semibold text-sm">Certificat de formation — IWS Laayoune</span>
        <div className="flex gap-2">
          <Button variant="outline" className="text-white border-slate-500 hover:bg-slate-700 gap-2" onClick={handlePrint}>
            <Printer className="w-4 h-4" /> Imprimer / PDF
          </Button>
        </div>
      </div>

      {/* ── Page du certificat ─────────────────────────────────────── */}
      <div className="cert-wrapper">
        <div className="cert-page" ref={certRef} id="certificate">

          {/* ══ Décoration vagues en bas ══ */}
          <div className="cert-waves">
            <svg viewBox="0 0 900 180" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d="M0,90 Q225,0 450,90 Q675,180 900,90 L900,180 L0,180 Z" fill="#1565c0" opacity="0.9"/>
              <path d="M0,110 Q225,30 450,110 Q675,190 900,110 L900,180 L0,180 Z" fill="#0097a7" opacity="0.85"/>
              <path d="M0,125 Q225,55 450,125 Q675,195 900,125 L900,180 L0,180 Z" fill="#2e7d32" opacity="0.8"/>
              <path d="M0,138 Q225,75 450,138 Q675,200 900,138 L900,180 L0,180 Z" fill="#f9a825" opacity="0.8"/>
              <path d="M0,150 Q225,95 450,150 Q675,205 900,150 L900,180 L0,180 Z" fill="#c62828" opacity="0.75"/>
            </svg>
          </div>

          {/* ══ Tache aquarelle en haut à droite ══ */}
          <div className="cert-watercolor">
            <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="170" cy="70" rx="120" ry="90" fill="#64b5f6" opacity="0.25" transform="rotate(-20 170 70)"/>
              <ellipse cx="210" cy="50" rx="80" ry="60" fill="#ab47bc" opacity="0.18" transform="rotate(15 210 50)"/>
              <ellipse cx="140" cy="90" rx="60" ry="45" fill="#ef9a9a" opacity="0.2" transform="rotate(-10 140 90)"/>
            </svg>
          </div>

          {/* ══ Filigrane carte du Maroc ══ */}
          <div className="cert-morocco-map">
            <svg viewBox="0 0 260 300" xmlns="http://www.w3.org/2000/svg" opacity="0.06">
              <path d="M60,10 L80,8 L110,15 L140,12 L170,20 L195,35 L210,55 L220,80 L215,110 L200,135 L185,155 L175,180 L170,210 L155,235 L135,255 L115,265 L95,260 L75,250 L60,235 L50,215 L45,195 L40,170 L35,145 L30,115 L32,85 L40,58 L50,35 Z" fill="#8d6e63" stroke="#6d4c41" strokeWidth="1"/>
              <path d="M40,170 L20,185 L10,200 L15,215 L30,225 L45,215 Z" fill="#8d6e63"/>
            </svg>
          </div>

          {/* ══ Bande gauche : CERTIFICATE ══ */}
          <div className="cert-left-band">
            <div className="cert-vertical-title">
              <span className="cert-main-title">CERTIFICATE</span>
              <span className="cert-sub-title">o f &nbsp; c o m p l e t i o n</span>
            </div>
          </div>

          {/* ══ Contenu principal ══ */}
          <div className="cert-content">

            {/* ── Photo + Cachet rond ── */}
            <div className="cert-stamp-area">
              {/* Photo étudiant */}
              <div className="cert-photo-wrapper">
                {data?.photo ? (
                  <img src={data.photo} alt={data.studentName} className="cert-photo" />
                ) : (
                  <div className="cert-photo-initials">
                    {data?.studentName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Cachet / Tampon IWS */}
              <div className="cert-stamp">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  {/* Cercle extérieur */}
                  <circle cx="100" cy="100" r="95" fill="none" stroke="#1a237e" strokeWidth="3"/>
                  <circle cx="100" cy="100" r="88" fill="none" stroke="#1a237e" strokeWidth="1"/>
                  {/* Texte circulaire haut */}
                  <path id="topArc" d="M 20,100 A 80,80 0 0,1 180,100" fill="none"/>
                  <text fontSize="9" fill="#1a237e" fontWeight="bold" letterSpacing="2">
                    <textPath href="#topArc" startOffset="5%">CENTRE DE FORMATION PROFESSIONNEL</textPath>
                  </text>
                  {/* Texte circulaire bas */}
                  <path id="botArc" d="M 25,105 A 80,80 0 0,0 175,105" fill="none"/>
                  <text fontSize="9" fill="#1a237e" fontWeight="bold" letterSpacing="3">
                    <textPath href="#botArc" startOffset="15%">IWS LAAYOUNE</textPath>
                  </text>
                  {/* Globe simplifié au centre */}
                  <circle cx="100" cy="95" r="28" fill="none" stroke="#1a237e" strokeWidth="1.5"/>
                  <ellipse cx="100" cy="95" rx="15" ry="28" fill="none" stroke="#1a237e" strokeWidth="1"/>
                  <line x1="72" y1="95" x2="128" y2="95" stroke="#1a237e" strokeWidth="1"/>
                  <line x1="74" y1="82" x2="126" y2="82" stroke="#1a237e" strokeWidth="0.8"/>
                  <line x1="74" y1="108" x2="126" y2="108" stroke="#1a237e" strokeWidth="0.8"/>
                  {/* Texte niveau */}
                  <text x="100" y="138" textAnchor="middle" fontSize="7.5" fill="#1a237e" fontWeight="bold">Level: {cfg.level}</text>
                  <text x="100" y="150" textAnchor="middle" fontSize="7" fill="#1a237e">Awarded in {awardDate}</text>
                </svg>
              </div>
            </div>

            {/* ── Texte central ── */}
            <div className="cert-body">
              <p className="cert-proudly">P R O U D L Y &nbsp; P R E S E N T &nbsp; T O &nbsp; :</p>
              <h1 className="cert-name">{data?.studentName?.toUpperCase()}</h1>
              <p className="cert-description">
                For {pronoun} achievements in participating in {cfg.training}.
              </p>
              {data?.score !== '—' && (
                <p className="cert-score">Score d'examen : <strong>{data.score}/100</strong></p>
              )}
            </div>

            {/* ── Bloc directeur (droite) ── */}
            <div className="cert-director-block">
              <div className="cert-director-info">
                <p className="cert-company">IWS LAAYOUNE S.A.R.L au</p>
                <p className="cert-director-name">MAAMBANDZILA UWH FELLARD</p>
                <p className="cert-director-title">Directeur Général</p>
                <div className="cert-contact">
                  <p>Email : contactez@interwebservice.org</p>
                  <p>Tél : 07 01 31 22 02 / Fax : 05 28 99 37 90</p>
                </div>
                {/* Signature stylisée */}
                <div className="cert-signature-img">
                  <svg viewBox="0 0 150 60" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10,45 C30,15 50,50 70,30 C90,10 110,45 140,35" stroke="#1a237e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                    <path d="M15,48 C35,38 55,52 75,42" stroke="#1a237e" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
                <p className="cert-sign-label">Signature and signature</p>
                <div className="cert-divider" />
                <p className="cert-director-role">Director of the vocational training center (CFP)</p>
                <p className="cert-director-role">IWS Laayoune</p>
              </div>
            </div>

            {/* ── Logo IWS bas gauche ── */}
            <div className="cert-logo-bottom">
              <div className="cert-logo-circle">
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#1a237e"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="white" strokeWidth="1.5"/>
                  <circle cx="50" cy="50" r="20" fill="none" stroke="white" strokeWidth="1.2"/>
                  <ellipse cx="50" cy="50" rx="10" ry="20" fill="none" stroke="white" strokeWidth="1"/>
                  <line x1="30" y1="50" x2="70" y2="50" stroke="white" strokeWidth="1"/>
                  <line x1="32" y1="40" x2="68" y2="40" stroke="white" strokeWidth="0.8"/>
                  <line x1="32" y1="60" x2="68" y2="60" stroke="white" strokeWidth="0.8"/>
                  <text x="50" y="80" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" letterSpacing="1">IWS</text>
                </svg>
              </div>
              <p className="cert-logo-sub">interwebservice.org</p>
            </div>

            {/* ── Lignes de signature bas droite ── */}
            <div className="cert-signatures-bottom">
              <div className="cert-sig-line">
                <div className="cert-sig-rule" />
                <p>signature</p>
              </div>
              <div className="cert-sig-line">
                <div className="cert-sig-rule" />
                <p>Certificate owner</p>
              </div>
            </div>

            {/* ── QR Code d'authenticité ── */}
            {data?.verifyUrl && (
              <div className="cert-qr-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&margin=4&color=1a237e&data=${encodeURIComponent(data.verifyUrl)}`}
                  alt="QR code de vérification"
                  className="cert-qr-img"
                  crossOrigin="anonymous"
                />
                <p className="cert-qr-label">Scan to verify</p>
                <p className="cert-qr-id">ID: {data.userId?.slice(-8).toUpperCase()}</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ══ STYLES ══════════════════════════════════════════════════════════ */}
      <style>{`
        * { box-sizing: border-box; }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .cert-wrapper { padding: 0; background: white; }
          .cert-page { box-shadow: none; }
        }

        .cert-wrapper {
          background: #e8e8e8;
          min-height: 100vh;
          padding: 60px 20px 20px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .cert-page {
          position: relative;
          width: 794px;
          min-height: 1123px;
          background: #f8f6f2;
          box-shadow: 0 8px 40px rgba(0,0,0,0.25);
          overflow: hidden;
          font-family: 'Georgia', serif;
        }

        /* ── Vagues du bas ── */
        .cert-waves {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 180px;
          z-index: 1;
        }
        .cert-waves svg {
          width: 100%;
          height: 100%;
        }

        /* ── Aquarelle haut droit ── */
        .cert-watercolor {
          position: absolute;
          top: 0;
          right: 0;
          width: 280px;
          height: 200px;
          z-index: 2;
          pointer-events: none;
        }

        /* ── Filigrane Maroc ── */
        .cert-morocco-map {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-20%, -45%);
          width: 420px;
          height: 480px;
          z-index: 1;
          pointer-events: none;
        }

        /* ── Bande gauche ── */
        .cert-left-band {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 72px;
          background: transparent;
          border-right: 3px solid #1a237e;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .cert-vertical-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transform: rotate(-90deg);
          white-space: nowrap;
        }

        .cert-main-title {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: 6px;
          color: #1a237e;
          text-transform: uppercase;
          font-family: 'Arial Black', sans-serif;
        }

        .cert-sub-title {
          font-size: 11px;
          color: #455a64;
          letter-spacing: 3px;
          font-style: italic;
        }

        /* ── Contenu ── */
        .cert-content {
          position: relative;
          z-index: 10;
          margin-left: 90px;
          padding: 30px 30px 200px 20px;
        }

        /* ── Photo + Cachet ── */
        .cert-stamp-area {
          display: flex;
          align-items: flex-start;
          gap: 0;
          margin-bottom: 30px;
          position: relative;
        }

        .cert-photo-wrapper {
          position: absolute;
          top: -10px;
          left: 50px;
          z-index: 20;
          width: 70px;
          height: 80px;
          border: 3px solid #1a237e;
          overflow: hidden;
          background: #cfd8dc;
          box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
        }

        .cert-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cert-photo-initials {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1a237e;
          color: white;
          font-size: 22px;
          font-weight: bold;
          font-family: 'Arial', sans-serif;
        }

        .cert-stamp {
          margin-left: 80px;
          width: 170px;
          height: 170px;
          flex-shrink: 0;
        }

        /* ── Corps du texte ── */
        .cert-body {
          margin-top: 10px;
          margin-left: 10px;
        }

        .cert-proudly {
          font-size: 13px;
          letter-spacing: 3px;
          color: #b8860b;
          font-weight: bold;
          margin-bottom: 12px;
          font-family: 'Arial', sans-serif;
        }

        .cert-name {
          font-size: 30px;
          font-weight: 900;
          color: #1a237e;
          margin: 0 0 18px;
          font-family: 'Arial Black', 'Georgia', serif;
          line-height: 1.2;
        }

        .cert-description {
          font-size: 16px;
          color: #37474f;
          max-width: 380px;
          line-height: 1.6;
          margin-bottom: 8px;
          font-family: 'Georgia', serif;
        }

        .cert-score {
          font-size: 13px;
          color: #455a64;
          margin-top: 4px;
          font-family: 'Arial', sans-serif;
        }

        /* ── Bloc directeur (droite) ── */
        .cert-director-block {
          position: absolute;
          top: 140px;
          right: 30px;
          width: 210px;
          z-index: 10;
        }

        .cert-director-info {
          text-align: right;
          font-family: 'Arial', sans-serif;
        }

        .cert-company {
          font-size: 11px;
          font-weight: bold;
          color: #1a237e;
          margin-bottom: 2px;
        }

        .cert-director-name {
          font-size: 10px;
          font-weight: bold;
          color: #1a237e;
        }

        .cert-director-title {
          font-size: 9.5px;
          color: #37474f;
          margin-bottom: 6px;
        }

        .cert-contact {
          font-size: 8.5px;
          color: #546e7a;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .cert-signature-img {
          height: 50px;
          display: flex;
          justify-content: flex-end;
        }

        .cert-sign-label {
          font-size: 8px;
          color: #78909c;
          font-style: italic;
          text-align: right;
        }

        .cert-divider {
          border-top: 1px solid #b0bec5;
          margin: 10px 0 6px;
        }

        .cert-director-role {
          font-size: 9px;
          color: #37474f;
          text-align: right;
          line-height: 1.4;
        }

        /* ── Logo bas gauche ── */
        .cert-logo-bottom {
          position: absolute;
          bottom: 160px;
          left: 20px;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .cert-logo-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          overflow: hidden;
        }

        .cert-logo-sub {
          font-size: 8px;
          color: #546e7a;
          font-style: italic;
          text-align: center;
        }

        /* ── Signatures bas ── */
        .cert-signatures-bottom {
          position: absolute;
          bottom: 165px;
          right: 30px;
          display: flex;
          gap: 30px;
          z-index: 10;
        }

        .cert-sig-line {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .cert-sig-rule {
          width: 90px;
          height: 1px;
          background: #1a237e;
        }

        .cert-sig-line p {
          font-size: 8px;
          color: #546e7a;
          text-align: center;
        }

        /* ── QR Code authenticité ── */
        .cert-qr-block {
          position: absolute;
          bottom: 120px;
          right: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          z-index: 10;
        }

        .cert-qr-img {
          width: 90px;
          height: 90px;
          border: 2px solid #1a237e;
          border-radius: 6px;
          padding: 3px;
          background: white;
        }

        .cert-qr-label {
          font-size: 7.5px;
          color: #1a237e;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin: 0;
        }

        .cert-qr-id {
          font-size: 6.5px;
          color: #78909c;
          font-family: monospace;
          margin: 0;
        }

        @media print {
          .cert-qr-img {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
}
