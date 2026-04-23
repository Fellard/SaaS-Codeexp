import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import pb from '../utils/pocketbaseClient.js';
import logger from '../utils/logger.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Alias RBAC : routes pédagogiques réservées aux étudiants et admins ──────
// Utilisation : router.post('/route', requireEtudiant, handler)
const requireEtudiant = requireRole('etudiant', 'admin', 'manager');

/**
 * Middleware: vérifie qu'un token Bearer valide est présent.
 * N'exige pas de rôle spécifique — tout utilisateur connecté est accepté.
 * @deprecated Préférer requireEtudiant ou requireRole() explicitement
 */
async function verifyToken(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ error: 'Token manquant' });
  try {
    const parts = token.split('.');
    if (parts.length < 2) throw new Error('JWT malformé');
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    );
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return res.status(401).json({ error: 'Token expiré' });
    }
    req.userId = payload.id || payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

/**
 * POST /courses/seed-demo-course
 * Crée le cours démo "Exprimer le temps" dans PocketBase avec section/cours_nom/niveau
 * et inscrit automatiquement tous les étudiants Langues/Français/A1
 */
router.post('/seed-demo-course', async (req, res) => {
  try {
    logger.info('Seeding demo course: Exprimer le temps');

    const EXERCISES = JSON.stringify([
      { id:'q1',  question:"J'arrive au cinéma ___ 7 heures.",              options:['dans','pour','avec','à'],        answer:3 },
      { id:'q2',  question:'Marie part en vacances ___ été.',                options:['pour','dans','vers','en'],       answer:3 },
      { id:'q3',  question:'Mon anniversaire est ___ dix jours.',            options:['sur','dans','à','en'],           answer:1 },
      { id:'q4',  question:'Mon vol pour Paris est prévu ___ lundi.',        options:['dans','vers','à','pour'],        answer:3 },
      { id:'q5',  question:'Ils se sont mariés ___ printemps.',              options:['à','au','pour','en'],            answer:1 },
      { id:'q6',  question:'Je vais chez ma mère ___ 10h et midi.',          options:['entre','pour','en','avant'],     answer:0 },
      { id:'q7',  question:'Je suis en vacances ___ trois semaines.',        options:['avant','à','entre','pendant'],   answer:3 },
      { id:'q8',  question:'___ deux semaines, je suis malade.',             options:['Entre','Depuis','Vers','Après'], answer:1 },
      { id:'q9',  question:"___ le petit-déjeuner, je vais au travail.",     options:['En','Après','Entre','À'],        answer:1 },
      { id:'q10', question:'Les cours commencent ___ septembre.',            options:['à','pour','dans','en'],          answer:3 },
      { id:'q11', question:'Pierre travaille ici ___ 2018.',                 options:['pour','à','vers','depuis'],      answer:3 },
      { id:'q12', question:"J'ai commencé le piano ___ 2015.",               options:['pendant','à','entre','en'],      answer:3 },
      { id:'q13', question:'Il pleut ___ plusieurs jours.',                  options:['sur','pendant','dans','à'],      answer:1 },
      { id:'q14', question:"Je me brosse les dents ___ d'aller dormir.",     options:['en','avant','après','pendant'],  answer:1 },
      { id:'q15', question:'Nous arrivons ___ quinze minutes.',              options:['dans','vers','sur','en'],        answer:0 },
      { id:'q16', question:'Tu viendras ___ 5 heures pour amener ma sœur.', options:['en','vers','dans','sous'],       answer:1 },
    ]);

    const courseData = {
      // ── Champs requis (Nonempty) ───────────────────────────────
      titre:         'Exprimer le temps en français — Niveau A1',
      langue:        'Francais',
      categorie_age: 'Ados (13-17 ans)',

      // ── Champs optionnels ──────────────────────────────────────
      description:   'Maîtrisez les prépositions de temps en français : à, en, dans, depuis, pendant, avant, après, entre, vers. 8 leçons + 16 exercices avec correction par IA.',
      categorie:     'langue',
      duree:         45,
      prix:          0,
      instructeur:   'IWS Laayoune',

      // ── Champs de classification (pour le frontend) ────────────
      section:       'langues',
      cours_nom:     'Français',
      niveau:        'A1',
      content:       'Leçon sur les prépositions de temps : à · en · au · dans · depuis · pendant · avant · après · entre · vers',
      exercises:     EXERCISES,
    };

    // Check if course already exists
    let courseRecord;
    try {
      const existing = await pb.collection('courses').getFullList({
        filter: `section="langues" && cours_nom="Français" && niveau="A1"`,
        $autoCancel: false,
      });
      if (existing.length > 0) {
        courseRecord = await pb.collection('courses').update(existing[0].id, courseData, { $autoCancel: false });
        logger.info(`Updated existing course: ${courseRecord.id}`);
      } else {
        courseRecord = await pb.collection('courses').create(courseData, { $autoCancel: false });
        logger.info(`Created new course: ${courseRecord.id}`);
      }
    } catch (e) {
      logger.error('Error creating course:', e);
      return res.status(500).json({ error: 'Failed to create course: ' + e.message });
    }

    // Enroll matching students
    let enrolledCount = 0;
    const enrolledStudents = [];
    try {
      // Try strict filter first
      let students = [];
      try {
        students = await pb.collection('users').getFullList({
          filter: `section="langues"`,
          $autoCancel: false,
        });
      } catch { /* ignore */ }

      for (const student of students) {
        try {
          const existing = await pb.collection('course_enrollments').getFullList({
            filter: `user_id="${student.id}" && course_id="${courseRecord.id}"`,
            $autoCancel: false,
          });
          if (existing.length === 0) {
            await pb.collection('course_enrollments').create({
              user_id:     student.id,
              course_id:   courseRecord.id,
              progression: 0,
              complete:    false,
            }, { $autoCancel: false });
            enrolledCount++;
            enrolledStudents.push(student.email || student.id);
          }
        } catch { /* ignore */ }
      }
    } catch { /* ignore */ }

    res.json({
      success:   true,
      courseId:  courseRecord.id,
      title:     courseRecord.title,
      section:   courseRecord.section,
      cours_nom: courseRecord.cours_nom,
      niveau:    courseRecord.niveau,
      enrolled:  enrolledCount,
      students:  enrolledStudents,
    });
  } catch (err) {
    logger.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /courses/seed-lieu-course
 * 1. Supprime TOUS les cours contenant "lieu" dans le titre + enrollments associés
 * 2. Crée le cours "Exprimer un lieu" avec la structure EXACTE du cours fonctionnel
 * 3. Inscrit automatiquement les étudiants Langues
 *
 * Structure identique au seed-demo-course (Exprimer le temps) qui fonctionne.
 * Le champ `titre` est REQUIS dans la collection PocketBase.
 */
router.post('/seed-lieu-course', async (req, res) => {
  try {
    logger.info('=== SEED LIEU: cleanup + création ===');

    // ── ÉTAPE 1 : Nettoyage complet ──────────────────────────────────
    const deletedInfo = { courses: [], enrollments: 0 };
    try {
      // Chercher tous les cours "lieu" par différents filtres
      const allCourses = await pb.collection('courses').getFullList({ $autoCancel: false });
      const lieuCourses = allCourses.filter(c =>
        (c.title   || '').toLowerCase().includes('lieu') ||
        (c.titre   || '').toLowerCase().includes('lieu')
      );

      for (const course of lieuCourses) {
        // Supprimer les enrollments liés
        try {
          const enrollments = await pb.collection('course_enrollments').getFullList({
            filter: `course_id="${course.id}"`,
            $autoCancel: false,
          });
          for (const e of enrollments) {
            await pb.collection('course_enrollments').delete(e.id, { $autoCancel: false });
            deletedInfo.enrollments++;
          }
        } catch { /* pas d'enrollments — OK */ }

        // Supprimer le cours
        await pb.collection('courses').delete(course.id, { $autoCancel: false });
        deletedInfo.courses.push({ id: course.id, title: course.title || course.titre });
        logger.info(`Supprimé cours "${course.title || course.titre}" (${course.id}) + ${deletedInfo.enrollments} enrollments`);
      }
    } catch (e) {
      logger.warn('Cleanup partiel:', e.message);
    }

    logger.info(`Cleanup terminé: ${deletedInfo.courses.length} cours, ${deletedInfo.enrollments} enrollments supprimés`);

    // ── ÉTAPE 2 : Créer le cours avec structure IDENTIQUE au cours fonctionnel ──

    const EXERCISES = JSON.stringify([
      { id:'q1',  question:'3 est ___ 2 et 4.',                                                      options:['entre','à côté de','avec','pour'],                answer:0 },
      { id:'q2',  question:"Après l'école, ma petite sœur va ___ son amie.",                          options:['dans','chez','à','derrière'],                     answer:1 },
      { id:'q3',  question:'Je mets du café ___ ma tasse.',                                           options:['dans','au-dessus de','sur','devant'],             answer:0 },
      { id:'q4',  question:"À 8 heures, les enfants vont ___ l'école.",                               options:['à','à la','en','au'],                             answer:0 },
      { id:'q5',  question:'Le chat se cache ___ le canapé.',                                         options:['devant','à','sur','sous'],                        answer:3 },
      { id:'q6',  question:"Toute ma vie, j'ai habité ___ Paris.",                                    options:['chez','sous','dans','à'],                         answer:3 },
      { id:'q7',  question:'Tu as toujours vécu ___ Mexique ?',                                       options:['au','en','chez','à la'],                          answer:0 },
      { id:'q8',  question:'Tous les soirs, je mange ___ restaurant.',                                options:['au','à la','dans','en'],                          answer:0 },
      { id:'q9',  question:'On peut marcher ___ lac si tu veux.',                                     options:['sous le','sur le','dans le','autour du'],         answer:3 },
      { id:'q10', question:'Il y a une peinture ___ canapé.',                                         options:['sous','sur','en-dessous du','au-dessus du'],      answer:3 },
      { id:'q11', question:'Ma femme fait le repas ___ la cuisine.',                                  options:['au milieu de','dans','sur','devant'],             answer:1 },
      { id:'q12', question:'Ma petite sœur doit aller ___ toilettes.',                                options:['à la','chez','aux','en'],                         answer:2 },
      { id:'q13', question:"Sans ses lunettes, Sonia ne voit pas quand je suis ___ elle.",            options:["loin d'elle",'chez','dans','derrière'],           answer:0 },
      { id:'q14', question:'Quand je vais en vacances, je vis ___ mon oncle.',                        options:['au','chez','au centre de','dans'],                answer:1 },
      { id:'q15', question:"J'aime lire ___ l'herbe.",                                                options:['dans','en-dessous de','chez','en'],               answer:0 },
      { id:'q16', question:'Pour lire mon ordinateur, je suis ___ mon écran.',                        options:['loin de','à gauche de','à droite de','devant'],   answer:3 },
    ]);

    // Payload avec les champs EXACTS de la collection PocketBase
    // Champs requis (Nonempty) : titre, langue, categorie_age
    const courseData = {
      // ── Champs requis ──────────────────────────────────────────
      titre:         'Exprimer un lieu - Feuille de travail 1',
      langue:        'Francais',           // Select: Anglais | Francais | Arabe
      categorie_age: 'Ados (13-17 ans)',   // Select requis

      // ── Champs optionnels ──────────────────────────────────────
      description:   'Cette feuille de travail permet aux apprenants de pratiquer les prépositions de lieu en français. À travers une série d\'exercices à choix multiples, les étudiants apprendront à utiliser correctement les prépositions pour exprimer une position, un déplacement ou une localisation dans différents contextes du quotidien.',
      categorie:     'langue',
      duree:         45,
      prix:          0,
      instructeur:   'IWS Laayoune',

      // ── Champs de classification (pour le frontend) ────────────
      section:       'langues',
      cours_nom:     'Français',
      niveau:        'A1',
      content:       'Grammaire française : Choisis la bonne préposition exprimant un lieu.',
      exercises:     EXERCISES,
    };

    let courseRecord;
    try {
      courseRecord = await pb.collection('courses').create(courseData, { $autoCancel: false });
      logger.info(`Cours créé: ${courseRecord.id} — "${courseRecord.title}"`);
    } catch (e) {
      logger.error('Erreur création cours lieu:', e);
      // Retourner les détails complets de l'erreur PocketBase pour diagnostic
      return res.status(500).json({
        error: 'Échec création du cours: ' + e.message,
        pbError: e?.response || e?.data || null,
        pbStatus: e?.status || null,
        deleted: deletedInfo,
      });
    }

    // ── ÉTAPE 3 : Auto-enrollment des étudiants Langues ─────────────
    let enrolledCount = 0;
    const enrolledStudents = [];
    try {
      // Chercher tous les étudiants de la section langues
      let students = [];
      try {
        students = await pb.collection('users').getFullList({
          filter: `section="langues"`,
          $autoCancel: false,
        });
      } catch {
        // Fallback: chercher par rôle étudiant
        try {
          students = await pb.collection('users').getFullList({
            filter: `role="etudiant"`,
            $autoCancel: false,
          });
        } catch { /* ignore */ }
      }

      for (const student of students) {
        try {
          // Vérifier si déjà inscrit
          const existing = await pb.collection('course_enrollments').getFullList({
            filter: `user_id="${student.id}" && course_id="${courseRecord.id}"`,
            $autoCancel: false,
          });
          if (existing.length === 0) {
            await pb.collection('course_enrollments').create({
              user_id:     student.id,
              course_id:   courseRecord.id,
              progression: 0,
              complete:    false,
              status:      'active',
              start_date:  new Date().toISOString(),
            }, { $autoCancel: false });
            enrolledCount++;
            enrolledStudents.push(student.email || student.id);
          }
        } catch { /* ignore erreur individuelle */ }
      }
      logger.info(`Auto-enrollment: ${enrolledCount} étudiants inscrits au cours ${courseRecord.id}`);
    } catch (e) {
      logger.warn('Enrollment partiel:', e.message);
    }

    // ── Réponse ─────────────────────────────────────────────────────
    res.json({
      success:   true,
      courseId:   courseRecord.id,
      title:     courseRecord.title || courseRecord.titre,
      section:   courseRecord.section,
      cours_nom: courseRecord.cours_nom,
      niveau:    courseRecord.niveau,
      enrolled:  enrolledCount,
      students:  enrolledStudents,
      deleted:   deletedInfo,
    });
  } catch (err) {
    logger.error('Seed lieu error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Logique d'analyse IA mutualisée (appellée par /analyze-course ET /generate-analysis).
 * @param {object} params - { courseId, courseTitle, courseDescription, pdfUrl }
 * @returns {Promise<{resume, objectifs, taches, points_cles}>}
 */
async function runCourseAnalysis({ courseId, courseTitle, courseDescription, pdfUrl }) {
  let courseContent = `Titre du cours: ${courseTitle}\n`;
  if (courseDescription) courseContent += `Description: ${courseDescription}\n`;
  if (pdfUrl)            courseContent += `URL du PDF: ${pdfUrl}\n`;

  const prompt = `Analysez le cours suivant et fournissez une analyse structurée en JSON.

${courseContent}

Fournissez une réponse JSON valide avec exactement cette structure (sans markdown, juste le JSON):
{
  "resume": "Résumé du cours en 2-3 phrases en français",
  "objectifs": ["Objectif 1", "Objectif 2", "Objectif 3", "Objectif 4"],
  "taches": ["Tâche 1", "Tâche 2", "Tâche 3", "Tâche 4"],
  "points_cles": ["Point clé 1", "Point clé 2", "Point clé 3", "Point clé 4"]
}

Assurez-vous que:
- Le résumé est en français et contient 2-3 phrases
- Les objectifs sont en français (3-4 items)
- Les tâches sont en français (3-4 items)
- Les points clés sont en français (3-4 items)
- La réponse est un JSON valide`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  const analysis = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

  return {
    resume:     analysis.resume     || 'Analyse non disponible',
    objectifs:  Array.isArray(analysis.objectifs)  ? analysis.objectifs  : [],
    taches:     Array.isArray(analysis.taches)     ? analysis.taches     : [],
    points_cles: Array.isArray(analysis.points_cles) ? analysis.points_cles : [],
  };
}

/**
 * POST /analyze-course
 * Analyze course content using Claude API
 * Body: { courseId, courseTitle, courseDescription, pdfUrl }
 * Returns: { resume, objectifs, taches, points_cles }
 */
router.post('/analyze-course', requireEtudiant, async (req, res) => {
  const { courseId, courseTitle, courseDescription, pdfUrl } = req.body;

  if (!courseId || !courseTitle) {
    return res.status(400).json({ error: 'courseId and courseTitle are required' });
  }

  logger.info(`Analyzing course: ${courseId} - ${courseTitle}`);

  try {
    const result = await runCourseAnalysis({ courseId, courseTitle, courseDescription, pdfUrl });
    res.json(result);
  } catch (error) {
    logger.error('Erreur analyse cours:', error);
    res.status(500).json({ error: 'Échec de l\'analyse du cours', detail: error.message });
  }
});

/**
 * POST /:courseId/generate-analysis
 * Generate and cache course analysis from PDF
 * Params: courseId
 * Returns: { courseId, resume, objectifs, taches, points_cles }
 */
router.post('/:courseId/generate-analysis', requireEtudiant, async (req, res) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ error: 'courseId is required' });
  }

  logger.info(`Generating analysis for course: ${courseId}`);

  try {
    // Step 1: Vérifier si une analyse existe déjà en cache PocketBase
    try {
      const existing = await pb.collection('course_analysis').getFirstListItem(
        `courseId='${courseId}'`, { $autoCancel: false }
      );
      logger.info(`Analyse en cache pour le cours ${courseId}`);
      return res.json({
        courseId: existing.courseId,
        resume:   existing.resume,
        objectifs:   typeof existing.objectifs   === 'string' ? JSON.parse(existing.objectifs)   : existing.objectifs,
        taches:      typeof existing.taches      === 'string' ? JSON.parse(existing.taches)      : existing.taches,
        points_cles: typeof existing.points_cles === 'string' ? JSON.parse(existing.points_cles) : existing.points_cles,
      });
    } catch (cacheErr) {
      if (cacheErr.status !== 404) throw cacheErr;
      // Pas de cache → on génère
    }

    // Step 2: Récupérer le cours
    const course = await pb.collection('courses').getOne(courseId, { $autoCancel: false });
    logger.info(`Cours récupéré: ${courseId}`);

    // Step 3: Construire l'URL du PDF si disponible
    const pdfUrl = course.pdf ? pb.files.getURL(course, course.pdf) : null;
    logger.info(`URL PDF: ${pdfUrl}`);

    // Step 4: Appel direct à la fonction d'analyse (plus de fetch localhost)
    const analysis = await runCourseAnalysis({
      courseId:          course.id,
      courseTitle:       course.titre || course.title || course.name || 'Cours',
      courseDescription: course.description || '',
      pdfUrl,
    });
    logger.info(`Analyse générée pour le cours ${courseId}`);

    // Step 5: Mettre en cache dans PocketBase
    const saved = await pb.collection('course_analysis').create({
      courseId:   course.id,
      resume:     analysis.resume,
      objectifs:  JSON.stringify(analysis.objectifs),
      taches:     JSON.stringify(analysis.taches),
      points_cles: JSON.stringify(analysis.points_cles),
    }, { $autoCancel: false });

    logger.info(`Analyse sauvegardée pour le cours ${courseId}`);

    res.json({
      courseId:   saved.courseId,
      resume:     saved.resume,
      objectifs:   JSON.parse(saved.objectifs),
      taches:      JSON.parse(saved.taches),
      points_cles: JSON.parse(saved.points_cles),
    });
  } catch (error) {
    logger.error(`Erreur generate-analysis pour ${courseId}:`, error);
    res.status(500).json({ error: 'Échec de la génération d\'analyse', detail: error.message });
  }
});

/**
 * POST /courses/correct-quiz
 * AI-powered quiz correction with explanations and recommendations
 * Body: { studentName, courseTitle, answers: [{id, question, chosen, chosenLabel, correct, correctLabel, isCorrect}], lang }
 * Returns: { score, total, percentage, corrections: [{id, explanation, tip}], recommendation, encouragement }
 */
router.post('/correct-quiz', async (req, res) => {
  const { studentName, courseTitle, answers, lang = 'fr' } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'answers array is required' });
  }

  const score = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const percentage = Math.round((score / total) * 100);

  // Build prompt
  const wrongAnswers = answers.filter(a => !a.isCorrect);
  const langLabels = { fr: 'français', en: 'English', 'ar-MA': 'arabe (darija marocaine)' };
  const replyLang = langLabels[lang] || 'français';

  const wrongList = wrongAnswers.map((a, i) =>
    `${i + 1}. Question: "${a.question}"\n   Réponse choisie: "${a.chosenLabel}"\n   Bonne réponse: "${a.correctLabel}"`
  ).join('\n\n');

  const prompt = `Tu es un professeur de français qui corrige un quiz sur "${courseTitle || 'Grammaire française'}".

Élève: ${studentName || 'Étudiant(e)'}
Score: ${score}/${total} (${percentage}%)

${wrongAnswers.length > 0 ? `Erreurs commises:\n${wrongList}` : 'Aucune erreur — score parfait!'}

Réponds en ${replyLang}. Fournis une réponse JSON valide (sans markdown) avec exactement cette structure:
{
  "encouragement": "Message d'encouragement personnalisé (1 phrase)",
  "recommendation": "Conseil pédagogique global basé sur le score (2-3 phrases)",
  "corrections": [${wrongAnswers.map(a => `{"id": "${a.id}", "explanation": "explication claire de la règle", "tip": "astuce mnémotechnique courte"}`).join(', ')}]
}

${percentage === 100 ? 'Le score est parfait, félicite chaleureusement.' : percentage >= 70 ? 'Bon score, encourage à consolider les points faibles.' : 'Score insuffisant, explique les règles de base et encourage la révision.'}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0]?.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const aiData = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    res.json({
      score,
      total,
      percentage,
      encouragement: aiData.encouragement || `Score: ${score}/${total}`,
      recommendation: aiData.recommendation || '',
      corrections: Array.isArray(aiData.corrections) ? aiData.corrections : [],
    });
  } catch (error) {
    logger.error('AI correction error:', error);
    // Fallback without AI
    res.json({
      score,
      total,
      percentage,
      encouragement: percentage === 100 ? 'Parfait !' : `Bien joué ! ${score}/${total}`,
      recommendation: percentage < 70 ? 'Révisez les prépositions de temps avant de réessayer.' : 'Continuez à pratiquer pour consolider vos acquis.',
      corrections: [],
    });
  }
});

/**
 * POST /courses/:courseId/save-progress
 * Save student quiz attempt to PocketBase
 */
router.post('/:courseId/save-progress', requireEtudiant, async (req, res) => {
  const { courseId } = req.params;
  const { userId, score, total, percentage, attemptData } = req.body;

  if (!userId || score === undefined) {
    return res.status(400).json({ error: 'userId and score are required' });
  }

  try {
    // Update course enrollment progress
    const enrollments = await pb.collection('course_enrollments').getFullList({
      filter: `user_id="${userId}" && course_id="${courseId}"`,
    });

    const progressRecord = {
      score,
      total,
      percentage,
      last_attempt: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      attempt_data: JSON.stringify(attemptData || {}),
    };

    if (enrollments.length > 0) {
      const enrollment = enrollments[0];
      const newProgression = Math.max(enrollment.progression || 0, percentage);
      await pb.collection('course_enrollments').update(enrollment.id, {
        progression: newProgression,
        complete: newProgression >= 100,
        ...progressRecord,
      });
    } else {
      // Auto-create enrollment (free tier student who didn't enroll via UI)
      await pb.collection('course_enrollments').create({
        user_id:     userId,
        course_id:   courseId,
        progression: percentage,
        complete:    percentage >= 100,
        status:      'active',
        start_date:  new Date().toISOString(),
        ...progressRecord,
      });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

/**
 * POST /courses/chat
 * Dialogue IA contextuel — tuteur qui répond aux messages basés sur le contenu du cours.
 * Body: { message, courseTitle, courseContent, history, lang }
 * Response: { reply }
 */
router.post('/chat', async (req, res) => {
  const {
    message,
    courseTitle   = 'le cours',
    courseContent = '',
    history       = [],
    lang          = 'fr',
  } = req.body;

  if (!message?.trim()) return res.status(400).json({ error: 'Message requis' });

  const langMap = { fr: 'français', en: 'anglais', ar: 'arabe', 'ar-MA': 'arabe' };
  const langName = langMap[lang] || 'français';

  // Extraire un résumé de texte brut du contenu HTML des pages
  const textContent = courseContent
    ? courseContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 2000)
    : '';

  const systemPrompt = `Tu es IWS IA, un tuteur bienveillant pour le cours : "${courseTitle}".
${textContent ? `\nRésumé du contenu du cours :\n${textContent}\n` : ''}
Directives :
- Réponds en ${langName} sauf si le cours apprend une autre langue (dans ce cas, mélange pour pratiquer)
- Sois amical et pédagogique — comme un professeur via WhatsApp
- Réponses courtes (2-4 phrases) sauf si explication détaillée nécessaire
- Corrige poliment les erreurs de grammaire ou de vocabulaire de l'étudiant
- Propose des exercices ou exemples supplémentaires si demandé
- Si l'étudiant écrit "bonjour" ou démarre la conversation, présente-toi brièvement et propose de l'aider à pratiquer`;

  const messages = [
    ...history.slice(-12).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message.trim() },
  ];

  // Essayer claude-sonnet-4-6 en premier, puis fallback sur claude-3-5-sonnet-20241022
  const CHAT_MODELS = ['claude-sonnet-4-6', 'claude-3-5-sonnet-20241022'];
  let lastErr = null;

  for (const model of CHAT_MODELS) {
    try {
      const response = await anthropic.messages.create({
        model,
        max_tokens: 600,
        system:     systemPrompt,
        messages,
      });
      const reply = response.content[0]?.text || 'Je suis désolé, je ne peux pas répondre pour le moment.';
      logger.info(`Courses /chat OK avec ${model}`);
      return res.json({ reply });
    } catch (err) {
      lastErr = err;
      logger.warn(`Courses /chat échec avec ${model}: ${err.message}`);
    }
  }

  logger.error('Courses /chat: tous les modèles ont échoué:', lastErr?.message);
  res.status(500).json({ error: 'Erreur IA', reply: `⚠️ Le tuteur IA est temporairement indisponible. (${lastErr?.message || 'erreur inconnue'}) Réessayez dans un instant.` });
});

// ── Auto-création collection course_scores ────────────────────────
let scoresCollectionReady = false;
async function ensureScoresCollection() {
  if (scoresCollectionReady) return true;
  try {
    await pb.collection('course_scores').getList(1, 1, { $autoCancel: false });
    scoresCollectionReady = true;
    return true;
  } catch {
    try {
      const usersColl   = await pb.send('/api/collections/_pb_users_auth_', { method: 'GET' }).catch(() => ({ id: '_pb_users_auth_' }));
      const coursesColl = await pb.send('/api/collections/courses',          { method: 'GET' }).catch(() => ({ id: 'courses' }));
      await pb.send('/api/collections', {
        method: 'POST',
        body: {
          name: 'course_scores',
          type: 'base',
          listRule:   "@request.auth.id = user_id || @request.auth.role = 'admin'",
          viewRule:   "@request.auth.id = user_id || @request.auth.role = 'admin'",
          createRule: "@request.auth.id != ''",
          updateRule: "@request.auth.role = 'admin'",
          deleteRule: "@request.auth.role = 'admin'",
          fields: [
            { name: 'user_id',        type: 'relation', collectionId: usersColl.id,   maxSelect: 1, cascadeDelete: true, required: true  },
            { name: 'course_id',      type: 'relation', collectionId: coursesColl.id, maxSelect: 1, cascadeDelete: true, required: true  },
            { name: 'score',          type: 'number',   min: 0, max: 100,  required: true  },
            { name: 'passed',         type: 'bool',     required: false },
            { name: 'attempt_number', type: 'number',   min: 1, onlyInt: true, required: false },
            { name: 'submitted_at',   type: 'date',     required: false },
          ],
        },
      });
      scoresCollectionReady = true;
      return true;
    } catch (ce) {
      if (ce?.message?.includes('already exists')) { scoresCollectionReady = true; return true; }
      logger.error('ensureScoresCollection:', ce.message);
      return false;
    }
  }
}

/**
 * POST /courses/:courseId/submit-score
 * Valide le score d'un quiz et applique la règle pédagogique ≥80 / ≤79.
 * Body : { score: number 0-100 }
 * Response : { passed, score, action, message, nextStep }
 */
router.post('/:courseId/submit-score', requireEtudiant, async (req, res) => {
  const { courseId } = req.params;
  const { score }    = req.body;
  const userId       = req.userId;

  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'Champ score (0-100) requis' });
  }

  const scoreNum = Math.min(100, Math.max(0, Math.round(Number(score))));
  const PASS_THRESHOLD = 80;
  const passed = scoreNum >= PASS_THRESHOLD;

  logger.info(`submit-score | user=${userId} course=${courseId} score=${scoreNum} passed=${passed}`);

  await ensureScoresCollection();

  try {
    // ── 1. Chercher l'enrollment ──────────────────────────────────
    const enrollments = await pb.collection('course_enrollments').getFullList({
      filter: `user_id="${userId}" && course_id="${courseId}"`,
      $autoCancel: false,
    });

    // ── 2. Compter les tentatives précédentes ─────────────────────
    let attemptNumber = 1;
    try {
      const prev = await pb.collection('course_scores').getFullList({
        filter: `user_id="${userId}" && course_id="${courseId}"`,
        $autoCancel: false,
      });
      attemptNumber = prev.length + 1;
    } catch { /* première tentative */ }

    // ── 3. Sauvegarder le score dans course_scores ────────────────
    try {
      await pb.collection('course_scores').create({
        user_id:        userId,
        course_id:      courseId,
        score:          scoreNum,
        passed,
        attempt_number: attemptNumber,
        submitted_at:   new Date().toISOString(),
      }, { $autoCancel: false });
    } catch (se) {
      logger.warn('save course_scores:', se.message);
    }

    // ── 4. Mettre à jour l'enrollment ─────────────────────────────
    if (enrollments.length > 0) {
      const enroll = enrollments[0];
      try {
        if (passed) {
          // Validé : progression 100%, module complet
          await pb.collection('course_enrollments').update(enroll.id, {
            progression:   100,
            complete:      true,
            last_activity: new Date().toISOString(),
          }, { $autoCancel: false });
        } else {
          // Échoué : remettre la progression à max 70% (partie lecture seulement)
          await pb.collection('course_enrollments').update(enroll.id, {
            progression:   Math.min(enroll.progression || 0, 70),
            complete:      false,
            last_activity: new Date().toISOString(),
          }, { $autoCancel: false });
        }
      } catch (ue) {
        logger.warn('update enrollment:', ue.message);
      }
    }

    // ── 5. Réponse ────────────────────────────────────────────────
    return res.json({
      passed,
      score:    scoreNum,
      attempt:  attemptNumber,
      // action que le frontend doit exécuter
      action:   passed ? 'proceed_to_next' : 'restart_lecture',
      message:  passed
        ? `✅ Félicitations ! Module validé avec ${scoreNum}/100. Vous pouvez passer à la suite.`
        : `❌ Score insuffisant : ${scoreNum}/100 (minimum requis : ${PASS_THRESHOLD}). Révisez le cours et réessayez.`,
      nextStep: passed
        ? 'Passez au cours suivant ou au dialogue IA pour pratiquer.'
        : 'Reprenez la leçon depuis le début, puis retentez les exercices.',
    });
  } catch (err) {
    logger.error('submit-score error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /courses/:courseId/my-score
 * Retourne le dernier score de l'utilisateur pour ce cours.
 * Response : { score, passed, attempt, hasScore }
 */
router.get('/:courseId/my-score', requireEtudiant, async (req, res) => {
  const { courseId } = req.params;
  const userId       = req.userId;

  await ensureScoresCollection();

  try {
    const scores = await pb.collection('course_scores').getFullList({
      filter: `user_id="${userId}" && course_id="${courseId}"`,
      sort:   '-submitted_at',
      $autoCancel: false,
    });

    if (scores.length === 0) {
      return res.json({ hasScore: false });
    }

    const best = scores.reduce((a, b) => (b.score > a.score ? b : a), scores[0]);
    return res.json({
      hasScore:    true,
      score:       best.score,
      passed:      best.passed,
      attempt:     scores.length,
      lastAttempt: scores[0],
    });
  } catch (err) {
    // Collection pas encore créée → aucun score
    return res.json({ hasScore: false });
  }
});

export default router;