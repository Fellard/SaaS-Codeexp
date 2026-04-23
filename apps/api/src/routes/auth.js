import express from 'express';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ─── Transporter SMTP ───────────────────────────────────────────────────────
const createTransporter = () => nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const COMPANY_EMAIL = process.env.SMTP_USER || 'contactez@iwsrecords.com';
const NOTIFY_EMAIL  = 'contactez@iwsrecords.com';
const SITE_URL      = process.env.SITE_URL || 'http://localhost:3000';
const API_URL       = process.env.API_URL  || 'http://localhost:3001';

// ─── Templates email ────────────────────────────────────────────────────────
const baseLayout = (content) => `
<div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px;border-radius:16px;">
  <div style="background:#0f172a;padding:28px 24px;border-radius:12px;text-align:center;margin-bottom:24px;">
    <h1 style="color:#f59e0b;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">IWS LAAYOUNE</h1>
    <p style="color:#94a3b8;margin:6px 0 0;font-size:13px;">Plateforme digitale professionnelle</p>
  </div>
  <div style="background:white;padding:32px;border-radius:12px;border:1px solid #e2e8f0;">
    ${content}
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:20px;">
    &copy; ${new Date().getFullYear()} IWS LAAYOUNE SARL AU — Tous droits réservés
  </p>
</div>`;

const btn = (url, label, color = '#f59e0b', textColor = '#0f172a') =>
  `<a href="${url}" style="display:inline-block;background:${color};color:${textColor};padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;margin-top:8px;">${label}</a>`;

// ─── POST /register — Inscription standard (client, etudiant, musicien) ─────
router.post('/register', async (req, res) => {
  const { name, email, password, role = 'client' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  const allowedRoles = ['client', 'etudiant', 'musicien'];
  if (!allowedRoles.includes(role)) {
    return res.status(400).json({ error: 'Role non autorisé.' });
  }

  try {
    // Créer l'utilisateur dans PocketBase
    const nameParts = name.trim().split(' ');
    const prenom = nameParts[0] || name;
    const nom = nameParts.slice(1).join(' ') || nameParts[0] || name;

    const newUser = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      nom,
      prenom,
      role,
      emailVisibility: true,
      approved: true,
    }, { $autoCancel: false });

    // Marquer l'email comme vérifié via le superuser
    try {
      await pb.collection('users').update(newUser.id, { verified: true }, { $autoCancel: false });
    } catch(verifyErr) {
      // Non bloquant
    }

    // ── Auto-inscription aux 3 premiers cours gratuits (étudiant) ──
    if (role === 'etudiant') {
      try {
        // On essaie d'inscrire l'étudiant aux 3 premiers cours disponibles (toutes sections).
        // La section sera affinée plus tard via le profil. On inscrit aux 3 premiers cours globaux.
        const freeCourses = await pb.collection('courses').getList(1, 3, {
          sort: 'created',
          $autoCancel: false,
        });
        for (const course of freeCourses.items) {
          try {
            await pb.collection('course_enrollments').create({
              user_id:    newUser.id,
              course_id:  course.id,
              progression: 0,
              complete:   false,
              status:     'active',
              start_date: new Date().toISOString(),
            }, { $autoCancel: false });
          } catch { /* déjà inscrit ou non-bloquant */ }
        }
        logger.info(`Auto-enrollment: ${freeCourses.items.length} cours gratuits pour ${newUser.id}`);
      } catch (enrollErr) {
        logger.warn('Auto-enrollment failed (non-bloquant):', enrollErr.message);
      }
    }

    // Envoyer email de bienvenue
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"IWS LAAYOUNE" <${COMPANY_EMAIL}>`,
        to: email,
        subject: 'Bienvenue sur IWS LAAYOUNE — Votre compte est actif',
        html: baseLayout(`
          <h2 style="color:#0f172a;margin-top:0;font-size:22px;">Bienvenue, ${name} !</h2>
          <p style="color:#475569;line-height:1.7;">
            Nous sommes ravis de vous accueillir sur la plateforme digitale d'<strong>IWS LAAYOUNE</strong>.
            Votre compte a été créé avec succès et est immédiatement actif.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="margin:0;color:#166534;font-weight:600;">Vos informations de connexion</p>
            <p style="margin:8px 0 0;color:#166534;">Email : <strong>${email}</strong></p>
            <p style="margin:4px 0 0;color:#166534;">Rôle : <strong>${role === 'client' ? 'Client' : role === 'etudiant' ? 'Étudiant' : role === 'musicien' ? 'Musicien' : role.charAt(0).toUpperCase() + role.slice(1)}</strong></p>
          </div>
          <p style="color:#475569;line-height:1.7;">
            Vous pouvez dès maintenant accéder à votre espace personnel et profiter de tous nos services.
          </p>
          ${btn(`${SITE_URL}/login`, 'Accéder à mon espace')}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
          <p style="color:#94a3b8;font-size:13px;margin:0;">
            Si vous n'êtes pas à l'origine de cette inscription, veuillez contacter notre support à 
            <a href="mailto:${COMPANY_EMAIL}" style="color:#f59e0b;">${COMPANY_EMAIL}</a>
          </p>
        `),
      });
    } catch (emailErr) {
      logger.error('Welcome email failed:', emailErr);
    }

    res.status(201).json({ success: true, message: 'Compte créé avec succès.' });
  } catch (err) {
    logger.error('Register error:', err);
    if (err?.response?.data?.email) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du compte.' });
  }
});

// ─── POST /request-admin — Demande d'accès administrateur ───────────────────
router.post('/request-admin', async (req, res) => {
  const { name, email, password, phone = '', company = '' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    // Générer un token unique pour approbation/refus
    const approveToken = crypto.randomBytes(32).toString('hex');
    const rejectToken  = crypto.randomBytes(32).toString('hex');

    // Décomposer le nom
    const nameParts = name.trim().split(' ');
    const prenom = nameParts[0] || '';
    const nom = nameParts.slice(1).join(' ') || nameParts[0] || '';

    // Créer l'utilisateur avec approved=false
    const user = await pb.collection('users').create({
      email,
      password,
      passwordConfirm: password,
      name,
      nom,
      prenom,
      role: 'admin',
      emailVisibility: true,
      approved: false,
      verified: true,
    }, { $autoCancel: false });

    // Sauvegarder la demande dans pending_approval

    await pb.collection('pending_approval').create({
      user_id: user.id,
      nom,
      prenom,
      email,
      approve_token: approveToken,
      reject_token: rejectToken,
      status: 'pending',
      registration_date: new Date().toISOString(),
    }, { $autoCancel: false });

    // Email à l'entreprise avec boutons Approuver / Refuser
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"IWS LAAYOUNE Système" <${COMPANY_EMAIL}>`,
        to: NOTIFY_EMAIL,
        subject: `[ACTION REQUISE] Nouvelle demande d'accès administrateur — ${name}`,
        html: baseLayout(`
          <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:14px 18px;margin-bottom:24px;">
            <p style="margin:0;color:#92400e;font-weight:700;font-size:14px;">ACTION REQUISE — Demande d'accès administrateur</p>
          </div>
          <h2 style="color:#0f172a;margin-top:0;">Nouvelle demande en attente</h2>
          <p style="color:#475569;line-height:1.7;">
            Un utilisateur vient de soumettre une demande d'accès au tableau de bord administrateur
            de la plateforme IWS LAAYOUNE. Veuillez examiner les informations ci-dessous et 
            <strong>approuver ou refuser</strong> cette demande.
          </p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;">
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-weight:700;color:#374151;width:35%;border-bottom:1px solid #e2e8f0;">Nom complet</td>
              <td style="padding:12px 16px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${name}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:700;color:#374151;border-bottom:1px solid #e2e8f0;">Adresse email</td>
              <td style="padding:12px 16px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${email}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-weight:700;color:#374151;border-bottom:1px solid #e2e8f0;">Téléphone</td>
              <td style="padding:12px 16px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${phone || 'Non renseigné'}</td>
            </tr>
            <tr>
              <td style="padding:12px 16px;font-weight:700;color:#374151;border-bottom:1px solid #e2e8f0;">Entreprise</td>
              <td style="padding:12px 16px;color:#0f172a;border-bottom:1px solid #e2e8f0;">${company || 'Non renseignée'}</td>
            </tr>
            <tr style="background:#f8fafc;">
              <td style="padding:12px 16px;font-weight:700;color:#374151;">Date de demande</td>
              <td style="padding:12px 16px;color:#0f172a;">${new Date().toLocaleString('fr-FR')}</td>
            </tr>
          </table>
          <div style="display:flex;gap:16px;margin-top:28px;text-align:center;">
            ${btn(`${SITE_URL}/approval-redirect?action=approve&token=${approveToken}`, '✅ Approuver cet accès', '#16a34a', '#ffffff')}
            &nbsp;&nbsp;&nbsp;
            ${btn(`${SITE_URL}/approval-redirect?action=reject&token=${rejectToken}`, '❌ Refuser cette demande', '#dc2626', '#ffffff')}
          </div>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px;">
            Ces liens sont sécurisés et à usage unique. Ne les partagez pas.
          </p>
        `),
      });
      logger.info(`Admin request notification sent for ${email}`);
    } catch (emailErr) {
      logger.error('Admin request email failed:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'Demande envoyée. Vous recevrez un email après examen de votre dossier.',
    });
  } catch (err) {
    logger.error('Request admin error:', err);
    if (err?.response?.data?.email) {
      return res.status(409).json({ error: 'Un compte avec cet email existe déjà.' });
    }
    res.status(500).json({ error: 'Erreur lors de la soumission de la demande.' });
  }
});

// ─── GET /approve/:token — Approbation admin (clic depuis email) ─────────────
router.get('/approve/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const record = await pb.collection('pending_approval').getFirstListItem(
      `approve_token="${token}" && status="pending"`,
      { $autoCancel: false }
    );

    // Approuver l'utilisateur
    await pb.collection('users').update(record.user_id, { approved: true }, { $autoCancel: false });
    await pb.collection('pending_approval').update(record.id, {
      status: 'approved',
      processed_at: new Date().toISOString(),
    }, { $autoCancel: false });

    // Email de confirmation à l'utilisateur
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"IWS LAAYOUNE" <${COMPANY_EMAIL}>`,
        to: record.email,
        subject: 'Votre accès administrateur a été approuvé — IWS LAAYOUNE',
        html: baseLayout(`
          <div style="text-align:center;margin-bottom:28px;">
            <div style="display:inline-block;background:#f0fdf4;border-radius:50%;padding:20px;margin-bottom:16px;">
              <span style="font-size:40px;">✅</span>
            </div>
            <h2 style="color:#0f172a;margin:0;font-size:24px;">Accès approuvé !</h2>
          </div>
          <p style="color:#475569;line-height:1.7;">
            Bonjour <strong>${(record.prenom + ' ' + record.nom).trim()}</strong>,
          </p>
          <p style="color:#475569;line-height:1.7;">
            Nous avons le plaisir de vous informer que votre demande d'accès au tableau de bord 
            administrateur d'<strong>IWS LAAYOUNE</strong> a été <strong style="color:#16a34a;">approuvée</strong>.
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#166534;font-weight:700;font-size:15px;">Votre compte est maintenant actif</p>
            <p style="margin:8px 0 0;color:#166534;line-height:1.6;">
              Vous pouvez dès à présent vous connecter avec votre email <strong>${record.email}</strong> 
              et accéder à l'ensemble des fonctionnalités du tableau de bord.
            </p>
          </div>
          <p style="color:#475569;line-height:1.7;">
            En tant qu'administrateur, vous aurez accès à la gestion des produits, des formations, 
            des utilisateurs et des paramètres de la plateforme.
          </p>
          ${btn(`${SITE_URL}/login`, 'Se connecter au tableau de bord')}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
          <p style="color:#94a3b8;font-size:13px;line-height:1.6;">
            Si vous avez des questions, notre équipe est disponible à 
            <a href="mailto:${COMPANY_EMAIL}" style="color:#f59e0b;">${COMPANY_EMAIL}</a>.<br>
            Nous vous souhaitons la bienvenue dans l'équipe IWS LAAYOUNE.
          </p>
        `),
      });
    } catch (emailErr) {
      logger.error('Approval confirmation email failed:', emailErr);
    }

    // Retourner JSON (appelé depuis le frontend) ou rediriger
    const fullName = (record.prenom + ' ' + record.nom).trim();
    if (req.headers.accept?.includes('application/json') || req.headers['content-type']?.includes('application/json')) {
      res.json({ success: true, name: fullName });
    } else {
      res.json({ success: true, name: fullName });
    }
  } catch (err) {
    logger.error('Approve error:', err);
    res.status(404).json({ success: false, error: 'Token invalide ou déjà utilisé' });
  }
});

// ─── GET /reject/:token — Refus admin (clic depuis email) ────────────────────
router.get('/reject/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const record = await pb.collection('pending_approval').getFirstListItem(
      `reject_token="${token}" && status="pending"`,
      { $autoCancel: false }
    );

    await pb.collection('pending_approval').update(record.id, {
      status: 'rejected',
      processed_at: new Date().toISOString(),
    }, { $autoCancel: false });

    // Optionnel : supprimer l'utilisateur ou le laisser avec approved=false
    // await pb.collection('users').delete(record.user_id, { $autoCancel: false });

    // Email de refus professionnel à l'utilisateur
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"IWS LAAYOUNE" <${COMPANY_EMAIL}>`,
        to: record.email,
        subject: 'Suivi de votre demande d\'accès — IWS LAAYOUNE',
        html: baseLayout(`
          <p style="color:#475569;line-height:1.7;">Bonjour <strong>${(record.prenom + ' ' + record.nom).trim()}</strong>,</p>
          <p style="color:#475569;line-height:1.7;">
            Nous vous remercions de l'intérêt que vous portez à la plateforme 
            <strong>IWS LAAYOUNE</strong> et de la confiance que vous nous témoignez.
          </p>
          <p style="color:#475569;line-height:1.7;">
            Après examen attentif de votre dossier, nous sommes dans l'obligation de vous informer 
            que votre demande d'accès au tableau de bord administrateur n'a pas pu être accordée 
            à ce stade.
          </p>
          <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:24px 0;">
            <p style="margin:0;color:#991b1b;font-weight:700;">Motifs possibles</p>
            <ul style="margin:10px 0 0;color:#7f1d1d;line-height:1.8;padding-left:20px;">
              <li>Les informations fournies sont incomplètes ou ne correspondent pas à nos critères</li>
              <li>Une vérification complémentaire est nécessaire</li>
              <li>Le nombre d'administrateurs actifs est actuellement suffisant</li>
            </ul>
          </div>
          <p style="color:#475569;line-height:1.7;">
            Cette décision ne remet pas en cause vos qualités ou votre sérieux. 
            Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez obtenir 
            plus d'informations, nous vous invitons à nous contacter directement.
          </p>
          ${btn(`mailto:${COMPANY_EMAIL}`, 'Contacter notre équipe', '#0f172a', '#ffffff')}
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0;">
          <p style="color:#94a3b8;font-size:13px;">
            Vous pouvez néanmoins utiliser notre plateforme en tant qu'utilisateur standard.<br>
            Merci de votre compréhension.
          </p>
        `),
      });
    } catch (emailErr) {
      logger.error('Rejection email failed:', emailErr);
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Reject error:', err);
    res.status(404).json({ success: false, error: 'Token invalide ou déjà utilisé' });
  }
});

// ─── POST /forgot-password ───────────────────────────────────────────────────
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requis.' });

  try {
    await pb.collection('users').requestPasswordReset(email, { $autoCancel: false });
    res.json({ success: true });
  } catch (err) {
    logger.error('Forgot password error:', err);
    // On retourne toujours success pour ne pas révéler si l'email existe
    res.json({ success: true });
  }
});

// ─── POST /verify-role — Vérification côté serveur du rôle utilisateur ───────
// Utilisé par le frontend après login pour confirmer le rôle réel (double check).
// Body: { token: string }
// Returns: { role, email, approved, dashboardPath }
router.post('/verify-role', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token requis.' });

  try {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('JWT malformé');

    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );

    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return res.status(401).json({ error: 'Token expiré' });
    }

    const userId = payload.id || payload.sub;
    if (!userId) throw new Error('ID absent du token');

    // Charge l'utilisateur réel depuis la DB (source de vérité)
    const user = await pb.collection('users').getOne(userId, { $autoCancel: false });

    // Vérifie que le compte admin est approuvé
    if (user.role === 'admin' && !user.approved) {
      return res.status(403).json({ error: 'Compte en attente de validation' });
    }

    // Mappe le rôle vers le chemin du dashboard
    const dashboardPaths = {
      admin:    '/admin',
      manager:  '/admin',
      etudiant: '/etudiant/dashboard',
      client:   '/client/dashboard',
      musicien: '/musicien/dashboard',
    };

    logger.info(`[VERIFY-ROLE] ${user.email} → rôle: ${user.role}`);

    res.json({
      success:       true,
      role:          user.role,
      email:         user.email,
      approved:      user.approved,
      dashboardPath: dashboardPaths[user.role] || '/dashboard',
    });
  } catch (err) {
    logger.error('Verify-role error:', err);
    res.status(401).json({ error: 'Token invalide ou utilisateur introuvable' });
  }
});

export default router;
