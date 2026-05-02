
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useLanguage } from '@/hooks/useLanguage.jsx';
import DashboardLayout from '@/components/DashboardLayout.jsx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen, ClipboardList, BarChart3,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, Loader2, ArrowLeft,
  Trophy, Brain, Lightbulb, TrendingUp, Lock,
  CreditCard, Banknote, Smartphone, GraduationCap, Sparkles, PartyPopper,
  MessageCircle, Send, ChevronRight as ChevronRightIcon,
} from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import PayPalButton from '@/components/PayPalButton.jsx';

// ─────────────────────────────────────────────────────────────────
// LEÇONS — "Exprimer le temps" (FR / EN / AR)
// ─────────────────────────────────────────────────────────────────
const LESSON_PAGES_TEMPS = {
  fr: [
    { id: 1, title: 'Introduction — Exprimer le temps', content: `<div class="lesson-intro"><div class="lesson-badge">📚 Grammaire Française</div><h2>Exprimer le temps en français</h2><p class="lead">Les <strong>prépositions de temps</strong> permettent de situer une action dans le temps — avant, pendant, après, ou à un moment précis.</p><div class="lesson-objectives"><h4>🎯 Objectifs de cette leçon</h4><ul><li>Comprendre et utiliser correctement les prépositions de temps</li><li>Distinguer les prépositions selon le contexte</li><li>Maîtriser 16 cas pratiques de la langue française</li></ul></div><div class="lesson-highlight"><strong>Dans cette leçon :</strong> à · en · dans · depuis · pendant · après · avant · entre · vers · au · pour</div></div>` },
    { id: 2, title: 'À — Heure et moment précis', content: `<h3>La préposition <span class="prep">à</span></h3><p>On utilise <strong>à</strong> pour indiquer une <em>heure précise</em> ou un <em>moment fixe</em>.</p><div class="rule-box"><div class="rule-icon">⏰</div><div><strong>Règle :</strong> <em>à</em> + heure précise<br/><strong>Exemples :</strong><ul><li>J'arrive au cinéma <strong>à</strong> 7 heures.<span class="inline-trans">= I arrive at the cinema at 7 o'clock.</span></li><li>La réunion commence <strong>à</strong> midi.<span class="inline-trans">= The meeting starts at noon.</span></li><li>Il se lève <strong>à</strong> 6h30 chaque matin.<span class="inline-trans">= He wakes up at 6:30 every morning.</span></li></ul></div></div><div class="info-box">💡 <strong>À retenir :</strong> «à» répond à la question <em>«À quelle heure ?»</em></div>` },
    { id: 3, title: 'En — Mois, saisons et années', content: `<h3>La préposition <span class="prep">en</span></h3><p>On utilise <strong>en</strong> avec les <em>mois</em>, la plupart des <em>saisons</em>, et les <em>années</em>.</p><div class="rule-box"><div class="rule-icon">📅</div><div><strong>Exemples :</strong><ul><li>Marie part en vacances <strong>en</strong> été.<span class="inline-trans">= Marie goes on holiday in summer.</span></li><li>Les cours commencent <strong>en</strong> septembre.<span class="inline-trans">= Classes start in September.</span></li><li>J'ai commencé le piano <strong>en</strong> 2015.<span class="inline-trans">= I started playing the piano in 2015.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>en</strong> été, en automne, en hiver</div><div class="compare-item special">⚠️ <strong>au</strong> printemps (masculin !)</div></div>` },
    { id: 4, title: 'Dans — Durée future', content: `<h3>La préposition <span class="prep">dans</span></h3><p><strong>Dans</strong> exprime un délai ou une durée <em>à venir</em>.</p><div class="rule-box"><div class="rule-icon">🔮</div><div><strong>Exemples :</strong><ul><li>Mon anniversaire est <strong>dans</strong> dix jours.<span class="inline-trans">= My birthday is in ten days.</span></li><li>Nous arrivons <strong>dans</strong> quinze minutes.<span class="inline-trans">= We arrive in fifteen minutes.</span></li></ul></div></div><div class="info-box">💡 «dans» répond à <em>«Dans combien de temps ?»</em> — la durée est <strong>future</strong>.</div>` },
    { id: 5, title: 'Depuis — Durée passée jusqu\'à maintenant', content: `<h3>La préposition <span class="prep">depuis</span></h3><p><strong>Depuis</strong> exprime une action qui <em>a commencé dans le passé</em> et qui <em>continue au présent</em>.</p><div class="rule-box"><div class="rule-icon">📆</div><div><strong>Exemples :</strong><ul><li>Pierre travaille ici <strong>depuis</strong> 2018.<span class="inline-trans">= Pierre has been working here since 2018.</span></li><li><strong>Depuis</strong> deux semaines, je suis malade.<span class="inline-trans">= For two weeks, I have been sick.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ Je travaille ici <strong>depuis</strong> 2018 (encore maintenant)</div><div class="compare-item bad">❌ J'ai travaillé ici <strong>depuis</strong> 2018 (incorrect au passé composé)</div></div>` },
    { id: 6, title: 'Pendant, Avant, Après', content: `<h3><span class="prep">Pendant</span> · <span class="prep">Avant</span> · <span class="prep">Après</span></h3><div class="rule-box"><div class="rule-icon">⌛</div><div><strong>pendant</strong> — durée déterminée<ul><li>Je suis en vacances <strong>pendant</strong> trois semaines.<span class="inline-trans">= I am on holiday for three weeks.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>avant</strong> — antériorité<ul><li>Je me brosse les dents <strong>avant</strong> d'aller dormir.<span class="inline-trans">= I brush my teeth before going to sleep.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>après</strong> — postériorité<ul><li><strong>Après</strong> le petit-déjeuner, je vais au travail.<span class="inline-trans">= After breakfast, I go to work.</span></li></ul></div></div>` },
    { id: 7, title: 'Entre et Vers', content: `<h3><span class="prep">Entre</span> · <span class="prep">Vers</span></h3><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>entre</strong> — intervalle entre deux moments<ul><li>Je vais chez ma mère <strong>entre</strong> 10 heures et midi.<span class="inline-trans">= I go to my mother's between 10 o'clock and noon.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">≈</div><div><strong>vers</strong> — approximation temporelle<ul><li>Tu viendras <strong>vers</strong> 5 heures.<span class="inline-trans">= You will come around 5 o'clock.</span></li></ul></div></div><div class="info-box">💡 <strong>Vers</strong> exprime une heure <em>approximative</em>.</div>` },
    { id: 8, title: 'Tableau récapitulatif', content: `<h3>📊 Récapitulatif des prépositions de temps</h3><div class="summary-table"><div class="summary-row header"><div>Préposition</div><div>Usage</div><div>Exemple</div></div><div class="summary-row"><div><span class="prep">à</span></div><div>Heure précise</div><div>à 7 heures</div></div><div class="summary-row"><div><span class="prep">en</span></div><div>Mois, saison (fém.), année</div><div>en été, en 2015</div></div><div class="summary-row"><div><span class="prep">dans</span></div><div>Durée future</div><div>dans dix jours</div></div><div class="summary-row"><div><span class="prep">depuis</span></div><div>Durée passée → présent</div><div>depuis 2018</div></div><div class="summary-row"><div><span class="prep">pendant</span></div><div>Durée déterminée</div><div>pendant trois semaines</div></div><div class="summary-row"><div><span class="prep">avant</span></div><div>Avant un événement</div><div>avant de dormir</div></div><div class="summary-row"><div><span class="prep">après</span></div><div>Après un événement</div><div>après le déjeuner</div></div><div class="summary-row"><div><span class="prep">entre</span></div><div>Intervalle</div><div>entre 10h et midi</div></div><div class="summary-row"><div><span class="prep">vers</span></div><div>Approximation</div><div>vers 5 heures</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>` },
  ],
  en: [
    { id: 1, title: 'Introduction — Expressing Time', content: `<div class="lesson-intro"><div class="lesson-badge">📚 English Grammar</div><h2>Expressing Time in English</h2><p class="lead">Time <strong>prepositions</strong> help you place an action in time — before, during, after, or at a specific moment.</p><div class="lesson-objectives"><h4>🎯 Lesson Objectives</h4><ul><li>Understand and correctly use English time prepositions</li><li>Distinguish prepositions based on context</li><li>Master 16 practical cases in English</li></ul></div><div class="lesson-highlight"><strong>In this lesson:</strong> at · in · on · for · since · during · before · after · between · by · ago · around</div></div>` },
    { id: 2, title: 'AT — Exact time', content: `<h3>The preposition <span class="prep">at</span></h3><p>We use <strong>at</strong> for a <em>precise time</em> or a <em>fixed moment</em>.</p><div class="rule-box"><div class="rule-icon">⏰</div><div><strong>Rule:</strong> <em>at</em> + exact time<br/><strong>Examples:</strong><ul><li>I arrive at the cinema <strong>at</strong> 7 o'clock.<span class="inline-trans">= J'arrive au cinéma à 7 heures.</span></li><li>The meeting starts <strong>at</strong> noon.<span class="inline-trans">= La réunion commence à midi.</span></li><li>He wakes up <strong>at</strong> 6:30 every morning.<span class="inline-trans">= Il se lève à 6h30 chaque matin.</span></li></ul></div></div><div class="info-box">💡 <strong>Remember:</strong> «at» answers the question <em>«At what time?»</em></div>` },
    { id: 3, title: 'IN — Month, season and year', content: `<h3>The preposition <span class="prep">in</span></h3><p>We use <strong>in</strong> with <em>months</em>, <em>seasons</em>, <em>years</em>, and for future events (after a delay).</p><div class="rule-box"><div class="rule-icon">📅</div><div><strong>Examples:</strong><ul><li>Marie goes on holiday <strong>in</strong> summer.<span class="inline-trans">= Marie part en vacances en été.</span></li><li>Classes start <strong>in</strong> September.<span class="inline-trans">= Les cours commencent en septembre.</span></li><li>I started playing piano <strong>in</strong> 2015.<span class="inline-trans">= J'ai commencé le piano en 2015.</span></li><li>My birthday is <strong>in</strong> ten days (future delay).<span class="inline-trans">= Mon anniversaire est dans dix jours (délai futur).</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>in</strong> summer / winter / autumn / spring</div><div class="compare-item good">✅ <strong>in</strong> January · in 2015 · in the morning</div></div>` },
    { id: 4, title: 'ON — Days and dates', content: `<h3>The preposition <span class="prep">on</span></h3><p><strong>On</strong> is used for specific <em>days</em> and <em>dates</em>.</p><div class="rule-box"><div class="rule-icon">📆</div><div><strong>Examples:</strong><ul><li>The meeting is <strong>on</strong> Monday.<span class="inline-trans">= La réunion est le lundi.</span></li><li>I was born <strong>on</strong> March 5th.<span class="inline-trans">= Je suis né(e) le 5 mars.</span></li><li>See you <strong>on</strong> your birthday!<span class="inline-trans">= À bientôt pour ton anniversaire !</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>on</strong> Monday · on March 5th · on Christmas Day</div><div class="compare-item special">⚠️ <strong>at</strong> Christmas (the holiday period) vs <strong>on</strong> Christmas Day</div></div>` },
    { id: 5, title: 'FOR and SINCE — Duration', content: `<h3><span class="prep">For</span> · <span class="prep">Since</span></h3><div class="rule-box"><div class="rule-icon">⌛</div><div><strong>for</strong> — a specific duration (how long?)<ul><li>I am on holiday <strong>for</strong> three weeks.<span class="inline-trans">= Je suis en vacances pendant trois semaines.</span></li><li>She has been learning English <strong>for</strong> two years.<span class="inline-trans">= Elle apprend l'anglais depuis deux ans.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">📆</div><div><strong>since</strong> — from a past point until now<ul><li>Pierre has worked here <strong>since</strong> 2018.<span class="inline-trans">= Pierre travaille ici depuis 2018.</span></li><li><strong>Since</strong> last Monday, I have been sick.<span class="inline-trans">= Depuis lundi dernier, je suis malade.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ I've lived here <strong>for</strong> 5 years (duration)</div><div class="compare-item good">✅ I've lived here <strong>since</strong> 2019 (start point)</div><div class="compare-item bad">❌ I've lived here <strong>since</strong> 5 years (incorrect!)</div></div>` },
    { id: 6, title: 'BEFORE, AFTER and DURING', content: `<h3><span class="prep">Before</span> · <span class="prep">After</span> · <span class="prep">During</span></h3><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>before</strong> — earlier than an event<ul><li>I brush my teeth <strong>before</strong> going to sleep.<span class="inline-trans">= Je me brosse les dents avant d'aller dormir.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>after</strong> — later than an event<ul><li><strong>After</strong> breakfast, I go to work.<span class="inline-trans">= Après le petit-déjeuner, je vais au travail.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>during</strong> — within a defined period<ul><li><strong>During</strong> the summer, she worked very hard.<span class="inline-trans">= Pendant l'été, elle a beaucoup travaillé.</span></li></ul></div></div>` },
    { id: 7, title: 'BY, AGO, BETWEEN and AROUND', content: `<h3><span class="prep">By</span> · <span class="prep">Ago</span> · <span class="prep">Between</span> · <span class="prep">Around</span></h3><div class="rule-box"><div class="rule-icon">⚑</div><div><strong>by</strong> — deadline (no later than)<ul><li>I will finish the project <strong>by</strong> Friday.<span class="inline-trans">= Je finirai le projet avant vendredi.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⏮️</div><div><strong>ago</strong> — in the past, counting back from now<ul><li>She arrived two years <strong>ago</strong>.<span class="inline-trans">= Elle est arrivée il y a deux ans.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>between</strong> — interval between two times<ul><li>I visit my mother <strong>between</strong> 10 and noon.<span class="inline-trans">= Je visite ma mère entre 10h et midi.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">≈</div><div><strong>around</strong> — approximate time<ul><li>You will come <strong>around</strong> 5 o'clock.<span class="inline-trans">= Tu viendras vers 5 heures.</span></li></ul></div></div>` },
    { id: 8, title: 'Summary Table', content: `<h3>📊 Summary — Time Prepositions</h3><div class="summary-table"><div class="summary-row header"><div>Preposition</div><div>Usage</div><div>Example</div></div><div class="summary-row"><div><span class="prep">at</span></div><div>Exact time</div><div>at 7 o'clock</div></div><div class="summary-row"><div><span class="prep">in</span></div><div>Month / season / year</div><div>in summer, in 2015</div></div><div class="summary-row"><div><span class="prep">on</span></div><div>Day / date</div><div>on Monday, on March 5th</div></div><div class="summary-row"><div><span class="prep">for</span></div><div>Duration (how long)</div><div>for three weeks</div></div><div class="summary-row"><div><span class="prep">since</span></div><div>Past → present (start point)</div><div>since 2018</div></div><div class="summary-row"><div><span class="prep">during</span></div><div>Within a period</div><div>during the summer</div></div><div class="summary-row"><div><span class="prep">before</span></div><div>Earlier than</div><div>before sleeping</div></div><div class="summary-row"><div><span class="prep">after</span></div><div>Later than</div><div>after breakfast</div></div><div class="summary-row"><div><span class="prep">by</span></div><div>Deadline</div><div>by Friday</div></div><div class="summary-row"><div><span class="prep">ago</span></div><div>Past (from now)</div><div>two years ago</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Lesson complete! Move to the <strong>Exercises</strong> tab to test your knowledge.</div>` },
  ],
  ar: [
    { id: 1, title: 'مقدمة — التعبير عن الزمن', content: `<div class="lesson-intro"><div class="lesson-badge">📚 قواعد اللغة الإنجليزية</div><h2>التعبير عن الزمن بالإنجليزية</h2><p class="lead">تساعدنا <strong>حروف الجر الزمنية</strong> على تحديد موقع الفعل في الزمن — قبل، أثناء، بعد، أو في لحظة محددة.</p><div class="lesson-objectives"><h4>🎯 أهداف الدرس</h4><ul><li>فهم حروف الجر الزمنية باللغة الإنجليزية واستخدامها بشكل صحيح</li><li>التمييز بين حروف الجر حسب السياق</li><li>إتقان 16 حالة عملية في اللغة الإنجليزية</li></ul></div><div class="lesson-highlight"><strong>في هذا الدرس:</strong> at · in · on · for · since · during · before · after · between · by · ago · around</div></div>` },
    { id: 2, title: 'AT — الوقت المحدد', content: `<h3>حرف الجر <span class="prep">at</span></h3><p>نستخدم <strong>at</strong> للإشارة إلى <em>وقت محدد</em> أو <em>لحظة ثابتة</em>.</p><div class="rule-box"><div class="rule-icon">⏰</div><div><strong>القاعدة:</strong> <em>at</em> + وقت محدد<br/><strong>أمثلة:</strong><ul><li>I arrive at the cinema <strong>at</strong> 7 o'clock.</li><li>The meeting starts <strong>at</strong> noon.</li><li>He wakes up <strong>at</strong> 6:30 every morning.</li></ul></div></div><div class="info-box">💡 <strong>تذكر:</strong> «at» يجيب على سؤال <em>«At what time?»</em> (في أي وقت؟)</div>` },
    { id: 3, title: 'IN — الشهر والفصل والسنة', content: `<h3>حرف الجر <span class="prep">in</span></h3><p>نستخدم <strong>in</strong> مع <em>الأشهر</em> و<em>الفصول</em> و<em>السنوات</em> وللأحداث المستقبلية.</p><div class="rule-box"><div class="rule-icon">📅</div><div><strong>أمثلة:</strong><ul><li>Marie goes on holiday <strong>in</strong> summer. (في الصيف)</li><li>Classes start <strong>in</strong> September. (في سبتمبر)</li><li>I started piano <strong>in</strong> 2015. (في عام 2015)</li><li>My birthday is <strong>in</strong> ten days. (بعد عشرة أيام)</li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>in</strong> summer / in January / in 2015 / in the morning</div></div>` },
    { id: 4, title: 'ON — الأيام والتواريخ', content: `<h3>حرف الجر <span class="prep">on</span></h3><p>نستخدم <strong>on</strong> مع <em>أيام الأسبوع</em> و<em>التواريخ المحددة</em>.</p><div class="rule-box"><div class="rule-icon">📆</div><div><strong>أمثلة:</strong><ul><li>The meeting is <strong>on</strong> Monday. (يوم الاثنين)</li><li>I was born <strong>on</strong> March 5th. (في الخامس من مارس)</li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ <strong>on</strong> Monday / on March 5th / on Christmas Day</div><div class="compare-item special">⚠️ <strong>at</strong> Christmas (فترة العيد) مقابل <strong>on</strong> Christmas Day (يوم العيد نفسه)</div></div>` },
    { id: 5, title: 'FOR و SINCE — المدة الزمنية', content: `<h3><span class="prep">For</span> · <span class="prep">Since</span></h3><div class="rule-box"><div class="rule-icon">⌛</div><div><strong>for</strong> — مدة محددة (كم من الوقت؟)<ul><li>I am on holiday <strong>for</strong> three weeks. (لمدة ثلاثة أسابيع)</li><li>She has been learning English <strong>for</strong> two years. (منذ سنتين / لمدة سنتين)</li></ul></div></div><div class="rule-box"><div class="rule-icon">📆</div><div><strong>since</strong> — من نقطة في الماضي حتى الآن<ul><li>Pierre has worked here <strong>since</strong> 2018. (منذ عام 2018)</li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ I've lived here <strong>for</strong> 5 years (مدة)</div><div class="compare-item good">✅ I've lived here <strong>since</strong> 2019 (نقطة البداية)</div><div class="compare-item bad">❌ I've lived here <strong>since</strong> 5 years (خطأ شائع!)</div></div>` },
    { id: 6, title: 'BEFORE و AFTER و DURING', content: `<h3><span class="prep">Before</span> · <span class="prep">After</span> · <span class="prep">During</span></h3><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>before</strong> (قبل) — قبل حدوث شيء<ul><li>I brush my teeth <strong>before</strong> going to sleep.</li></ul></div></div><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>after</strong> (بعد) — بعد حدوث شيء<ul><li><strong>After</strong> breakfast, I go to work.</li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>during</strong> (خلال / أثناء) — داخل فترة زمنية محددة<ul><li><strong>During</strong> the summer, she worked very hard.</li></ul></div></div>` },
    { id: 7, title: 'BY و AGO و BETWEEN و AROUND', content: `<h3><span class="prep">By</span> · <span class="prep">Ago</span> · <span class="prep">Between</span> · <span class="prep">Around</span></h3><div class="rule-box"><div class="rule-icon">⚑</div><div><strong>by</strong> (بحلول / قبل) — الموعد النهائي<ul><li>I will finish the project <strong>by</strong> Friday. (بحلول يوم الجمعة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">⏮️</div><div><strong>ago</strong> (منذ / مضت) — في الماضي<ul><li>She arrived two years <strong>ago</strong>. (منذ سنتين)</li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>between</strong> (بين) — بين وقتين<ul><li>I visit my mother <strong>between</strong> 10 and noon.</li></ul></div></div><div class="rule-box"><div class="rule-icon">≈</div><div><strong>around</strong> (حوالي) — وقت تقريبي<ul><li>You will come <strong>around</strong> 5 o'clock.</li></ul></div></div>` },
    { id: 8, title: 'جدول ملخص', content: `<h3>📊 ملخص — حروف الجر الزمنية بالإنجليزية</h3><div class="summary-table"><div class="summary-row header"><div>الحرف</div><div>الاستخدام</div><div>مثال</div></div><div class="summary-row"><div><span class="prep">at</span></div><div>وقت محدد</div><div>at 7 o'clock</div></div><div class="summary-row"><div><span class="prep">in</span></div><div>شهر / فصل / سنة</div><div>in summer, in 2015</div></div><div class="summary-row"><div><span class="prep">on</span></div><div>يوم / تاريخ</div><div>on Monday</div></div><div class="summary-row"><div><span class="prep">for</span></div><div>مدة زمنية</div><div>for three weeks</div></div><div class="summary-row"><div><span class="prep">since</span></div><div>من الماضي حتى الآن</div><div>since 2018</div></div><div class="summary-row"><div><span class="prep">during</span></div><div>خلال فترة</div><div>during the summer</div></div><div class="summary-row"><div><span class="prep">before</span></div><div>قبل</div><div>before sleeping</div></div><div class="summary-row"><div><span class="prep">after</span></div><div>بعد</div><div>after breakfast</div></div><div class="summary-row"><div><span class="prep">by</span></div><div>الموعد النهائي</div><div>by Friday</div></div><div class="summary-row"><div><span class="prep">ago</span></div><div>في الماضي</div><div>two years ago</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 أكملت الدرس! انتقل إلى تبويب <strong>التمارين</strong> لاختبار معلوماتك.</div>` },
  ],
};

// ─────────────────────────────────────────────────────────────────
// LEÇONS — "Exprimer un lieu" (FR / EN / AR)
// ─────────────────────────────────────────────────────────────────
const LESSON_PAGES_LIEU = {
  fr: [
    { id: 1, title: 'Introduction — Exprimer un lieu', content: `<div class="lesson-intro"><div class="lesson-badge">📚 Grammaire Française</div><h2>Exprimer un lieu en français</h2><p class="lead">Les <strong>prépositions de lieu</strong> permettent de situer une personne ou un objet dans l'espace — où il est, où il va, d'où il vient.</p><div class="lesson-objectives"><h4>🎯 Objectifs de cette leçon</h4><ul><li>Comprendre et utiliser correctement les prépositions de lieu</li><li>Distinguer dans, chez, à, sur, sous, devant, derrière...</li><li>Maîtriser 16 cas pratiques de la langue française</li></ul></div><div class="lesson-highlight"><strong>Dans cette leçon :</strong> dans · chez · à · sur · sous · devant · derrière · entre · autour de · au-dessus de · en-dessous de · loin de</div></div>` },
    { id: 2, title: 'Dans / En — Intérieur d\'un espace', content: `<h3>Les prépositions <span class="prep">dans</span> et <span class="prep">en</span></h3><p>On utilise <strong>dans</strong> pour indiquer l'intérieur d'un espace délimité.</p><div class="rule-box"><div class="rule-icon">📦</div><div><strong>dans</strong> + article + nom<br/><strong>Exemples :</strong><ul><li>Je mets du café <strong>dans</strong> ma tasse.<span class="inline-trans">= I put coffee in my cup.</span></li><li>Ma femme fait le repas <strong>dans</strong> la cuisine.<span class="inline-trans">= My wife cooks in the kitchen.</span></li><li>J'aime lire <strong>dans</strong> l'herbe.<span class="inline-trans">= I like reading in the grass.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🌍</div><div><strong>en</strong> (sans article) + pays féminin ou continent<br/><strong>Exemples :</strong><ul><li>Je vis <strong>en</strong> France.<span class="inline-trans">= I live in France.</span></li><li>Il voyage <strong>en</strong> Afrique.<span class="inline-trans">= He travels in Africa.</span></li></ul></div></div><div class="info-box">💡 <strong>Dans</strong> = à l'intérieur d'un espace concret. <strong>En</strong> = pour les pays féminins (sans article).</div>` },
    { id: 3, title: 'Sur / Sous — Dessus et dessous', content: `<h3><span class="prep">Sur</span> · <span class="prep">Sous</span></h3><div class="rule-box"><div class="rule-icon">⬆️</div><div><strong>sur</strong> — à la surface de, par-dessus<ul><li>Il y a une peinture <strong>au-dessus du</strong> canapé.<span class="inline-trans">= There is a painting above the sofa.</span></li><li>On peut marcher <strong>autour du</strong> lac.<span class="inline-trans">= We can walk around the lake.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬇️</div><div><strong>sous</strong> — en dessous de<ul><li>Le chat se cache <strong>sous</strong> le canapé.<span class="inline-trans">= The cat hides under the sofa.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ Le livre est <strong>sur</strong> la table (à la surface)</div><div class="compare-item good">✅ Le chat est <strong>sous</strong> la table (en dessous)</div></div>` },
    { id: 4, title: 'Devant / Derrière / À côté de', content: `<h3><span class="prep">Devant</span> · <span class="prep">Derrière</span> · <span class="prep">À côté de</span></h3><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>devant</strong> — en face de, avant<ul><li>Pour lire mon ordinateur, je suis <strong>devant</strong> mon écran.<span class="inline-trans">= To read my screen, I sit in front of it.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>derrière</strong> — dans le dos de, après<ul><li>Sans ses lunettes, Sonia ne voit pas quand je suis <strong>derrière</strong> elle.<span class="inline-trans">= Without her glasses, Sonia can't see when I'm behind her.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>à côté de</strong> — à la proximité de<ul><li>3 est <strong>entre</strong> 2 et 4. (entre = au milieu de)<span class="inline-trans">= 3 is between 2 and 4.</span></li></ul></div></div>` },
    { id: 5, title: 'Chez — Lieu de vie ou d\'activité', content: `<h3>La préposition <span class="prep">chez</span></h3><p><strong>Chez</strong> s'utilise pour indiquer le domicile ou le lieu habituel d'une personne.</p><div class="rule-box"><div class="rule-icon">🏠</div><div><strong>chez</strong> + personne (nom ou pronom)<br/><strong>Exemples :</strong><ul><li>Après l'école, ma petite sœur va <strong>chez</strong> son amie.<span class="inline-trans">= After school, my little sister goes to her friend's house.</span></li><li>Quand je vais en vacances, je vis <strong>chez</strong> mon oncle.<span class="inline-trans">= When I go on holiday, I stay with my uncle.</span></li><li>Je mange <strong>au</strong> restaurant (≠ chez → lieu public, pas une personne).<span class="inline-trans">= I eat at a restaurant (not a person's home).</span></li></ul></div></div><div class="info-box">💡 <strong>Chez</strong> = toujours suivi d'une <em>personne</em> (nom propre, pronom, profession). <br/>Ex : chez le médecin, chez Marie, chez moi.</div>` },
    { id: 6, title: 'À / Au / Aux — Villes, pays et lieux publics', content: `<h3><span class="prep">À</span> · <span class="prep">Au</span> · <span class="prep">Aux</span></h3><div class="rule-box"><div class="rule-icon">🏙️</div><div><strong>à</strong> + ville<ul><li>Toute ma vie, j'ai habité <strong>à</strong> Paris.<span class="inline-trans">= All my life, I have lived in Paris.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🌎</div><div><strong>au</strong> + pays masculin singulier<ul><li>Tu as toujours vécu <strong>au</strong> Mexique ?<span class="inline-trans">= Have you always lived in Mexico?</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🍽️</div><div><strong>au</strong> + lieu public masculin<ul><li>Tous les soirs, je mange <strong>au</strong> restaurant.<span class="inline-trans">= Every evening, I eat at a restaurant.</span></li><li>À 8 heures, les enfants vont <strong>à</strong> l'école.<span class="inline-trans">= At 8 o'clock, the children go to school.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🚽</div><div><strong>aux</strong> + nom pluriel<ul><li>Ma petite sœur doit aller <strong>aux</strong> toilettes.<span class="inline-trans">= My little sister needs to go to the bathroom.</span></li></ul></div></div>` },
    { id: 7, title: 'Autour de / Loin de / Au-dessus de', content: `<h3><span class="prep">Autour de</span> · <span class="prep">Loin de</span> · <span class="prep">Au-dessus de</span></h3><div class="rule-box"><div class="rule-icon">⭕</div><div><strong>autour de</strong> — en cercle, tout autour<ul><li>On peut marcher <strong>autour du</strong> lac si tu veux.<span class="inline-trans">= We can walk around the lake if you want.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↗️</div><div><strong>au-dessus de</strong> — plus haut que<ul><li>Il y a une peinture <strong>au-dessus du</strong> canapé.<span class="inline-trans">= There is a painting above the sofa.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">📏</div><div><strong>loin de</strong> — à grande distance de<ul><li>Sans ses lunettes, Sonia ne voit pas quand je suis <strong>loin d'elle</strong>.<span class="inline-trans">= Without her glasses, Sonia can't see when I'm far from her.</span></li></ul></div></div>` },
    { id: 8, title: 'Tableau récapitulatif', content: `<h3>📊 Récapitulatif des prépositions de lieu</h3><div class="summary-table"><div class="summary-row header"><div>Préposition</div><div>Usage</div><div>Exemple</div></div><div class="summary-row"><div><span class="prep">dans</span></div><div>Intérieur d'un espace</div><div>dans la cuisine</div></div><div class="summary-row"><div><span class="prep">chez</span></div><div>Domicile d'une personne</div><div>chez mon oncle</div></div><div class="summary-row"><div><span class="prep">à / au / aux</span></div><div>Ville, pays, lieu public</div><div>à Paris, au Mexique</div></div><div class="summary-row"><div><span class="prep">sur</span></div><div>À la surface</div><div>sur la table</div></div><div class="summary-row"><div><span class="prep">sous</span></div><div>En dessous</div><div>sous le canapé</div></div><div class="summary-row"><div><span class="prep">devant</span></div><div>En face</div><div>devant l'écran</div></div><div class="summary-row"><div><span class="prep">derrière</span></div><div>Dans le dos de</div><div>derrière elle</div></div><div class="summary-row"><div><span class="prep">entre</span></div><div>Au milieu de deux éléments</div><div>entre 2 et 4</div></div><div class="summary-row"><div><span class="prep">autour de</span></div><div>En cercle autour</div><div>autour du lac</div></div><div class="summary-row"><div><span class="prep">au-dessus de</span></div><div>Plus haut que</div><div>au-dessus du canapé</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Vous avez terminé la leçon ! Passez aux <strong>Exercices</strong> pour tester vos connaissances.</div>` },
  ],
  en: [
    { id: 1, title: 'Introduction — Expressing a Place', content: `<div class="lesson-intro"><div class="lesson-badge">📚 English Grammar</div><h2>Expressing a Place in English</h2><p class="lead">Place <strong>prepositions</strong> describe where someone or something is — inside, outside, above, below, in front of, or behind.</p><div class="lesson-objectives"><h4>🎯 Lesson Objectives</h4><ul><li>Understand and correctly use English place prepositions</li><li>Distinguish in, at, on, under, above, in front of, behind...</li><li>Master 16 practical cases in English</li></ul></div><div class="lesson-highlight"><strong>In this lesson:</strong> in · at · on · under · above · in front of · behind · next to · between · around · with · far from</div></div>` },
    { id: 2, title: 'IN — Inside a space', content: `<h3>The preposition <span class="prep">in</span></h3><p>We use <strong>in</strong> to indicate the <em>interior of a space</em> or a <em>country/city</em>.</p><div class="rule-box"><div class="rule-icon">📦</div><div><strong>in</strong> + enclosed space<br/><strong>Examples:</strong><ul><li>I put coffee <strong>in</strong> my cup.<span class="inline-trans">= Je mets du café dans ma tasse.</span></li><li>My wife cooks <strong>in</strong> the kitchen.<span class="inline-trans">= Ma femme fait le repas dans la cuisine.</span></li><li>I like reading <strong>in</strong> the grass.<span class="inline-trans">= J'aime lire dans l'herbe.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🌍</div><div><strong>in</strong> + city / country<br/><strong>Examples:</strong><ul><li>All my life, I have lived <strong>in</strong> Paris.<span class="inline-trans">= Toute ma vie, j'ai habité à Paris.</span></li><li>Have you always lived <strong>in</strong> Mexico?<span class="inline-trans">= Tu as toujours vécu au Mexique ?</span></li></ul></div></div><div class="info-box">💡 <strong>In</strong> = inside a space or geographical location.</div>` },
    { id: 3, title: 'ON / UNDER — Surface and below', content: `<h3><span class="prep">On</span> · <span class="prep">Under</span></h3><div class="rule-box"><div class="rule-icon">⬆️</div><div><strong>on</strong> — on the surface of<ul><li>The book is <strong>on</strong> the table.<span class="inline-trans">= Le livre est sur la table.</span></li><li>There is a painting <strong>above</strong> the sofa. (au-dessus)<span class="inline-trans">= Il y a une peinture au-dessus du canapé.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬇️</div><div><strong>under / below</strong> — beneath<ul><li>The cat hides <strong>under</strong> the sofa.<span class="inline-trans">= Le chat se cache sous le canapé.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ The book is <strong>on</strong> the table (on the surface)</div><div class="compare-item good">✅ The cat is <strong>under</strong> the table (beneath)</div></div>` },
    { id: 4, title: 'IN FRONT OF / BEHIND / NEXT TO', content: `<h3><span class="prep">In front of</span> · <span class="prep">Behind</span> · <span class="prep">Next to</span></h3><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>in front of</strong> — facing, before<ul><li>To read my screen, I sit <strong>in front of</strong> it.<span class="inline-trans">= Pour lire mon écran, je m'assieds devant lui.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>behind</strong> — at the back of<ul><li>Without her glasses, Sonia can't see when I'm <strong>behind</strong> her.<span class="inline-trans">= Sans ses lunettes, Sonia ne voit pas quand je suis derrière elle.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>next to / beside</strong> — close to<ul><li>3 is <strong>between</strong> 2 and 4. (between = in the middle of two things)<span class="inline-trans">= 3 est entre 2 et 4.</span></li></ul></div></div>` },
    { id: 5, title: 'WITH — Someone\'s home', content: `<h3>The preposition <span class="prep">with</span> (and <span class="prep">at</span>)</h3><p>To indicate someone's home, we use <strong>with</strong> + person or <strong>at</strong> + person's.</p><div class="rule-box"><div class="rule-icon">🏠</div><div><strong>with</strong> + person (staying at their home)<br/><strong>Examples:</strong><ul><li>After school, my sister goes to <strong>her friend's</strong> house.<span class="inline-trans">= Après l'école, ma sœur va chez son amie.</span></li><li>When I go on holiday, I stay <strong>with</strong> my uncle.<span class="inline-trans">= Quand je pars en vacances, je vis chez mon oncle.</span></li><li>Every evening, I eat <strong>at</strong> a restaurant (not a person's home).<span class="inline-trans">= Tous les soirs, je mange au restaurant.</span></li></ul></div></div><div class="info-box">💡 In English: "stay <strong>with</strong> someone" (at their home) or "at someone's place".<br/>French equivalent: <em>chez</em></div>` },
    { id: 6, title: 'AT — Specific locations and public places', content: `<h3>The preposition <span class="prep">at</span></h3><p>We use <strong>at</strong> for specific locations, addresses, and public places.</p><div class="rule-box"><div class="rule-icon">🏙️</div><div><strong>at</strong> + specific place<ul><li>I arrive <strong>at</strong> the cinema at 7.<span class="inline-trans">= J'arrive au cinéma à 7 heures.</span></li><li>The children go <strong>to</strong> school at 8. (movement: go to)<span class="inline-trans">= Les enfants vont à l'école à 8 heures.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">🍽️</div><div><strong>at</strong> + place of activity<ul><li>Every evening, I eat <strong>at</strong> a restaurant.<span class="inline-trans">= Tous les soirs, je mange au restaurant.</span></li><li>My sister needs to go <strong>to</strong> the bathroom. (movement)<span class="inline-trans">= Ma sœur doit aller aux toilettes.</span></li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ I am <strong>at</strong> school (location)</div><div class="compare-item good">✅ I go <strong>to</strong> school (movement/direction)</div></div>` },
    { id: 7, title: 'AROUND / ABOVE / FAR FROM', content: `<h3><span class="prep">Around</span> · <span class="prep">Above</span> · <span class="prep">Far from</span></h3><div class="rule-box"><div class="rule-icon">⭕</div><div><strong>around</strong> — in a circle, all around<ul><li>We can walk <strong>around</strong> the lake.<span class="inline-trans">= On peut marcher autour du lac.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">↗️</div><div><strong>above / over</strong> — higher than<ul><li>There is a painting <strong>above</strong> the sofa.<span class="inline-trans">= Il y a une peinture au-dessus du canapé.</span></li></ul></div></div><div class="rule-box"><div class="rule-icon">📏</div><div><strong>far from</strong> — at a great distance<ul><li>Without her glasses, Sonia can't see when I'm <strong>far from</strong> her.<span class="inline-trans">= Sans ses lunettes, Sonia ne voit pas quand je suis loin d'elle.</span></li></ul></div></div>` },
    { id: 8, title: 'Summary Table', content: `<h3>📊 Summary — Place Prepositions</h3><div class="summary-table"><div class="summary-row header"><div>Preposition</div><div>Usage</div><div>Example</div></div><div class="summary-row"><div><span class="prep">in</span></div><div>Inside a space / city / country</div><div>in the kitchen, in Paris</div></div><div class="summary-row"><div><span class="prep">at</span></div><div>Specific location</div><div>at the cinema</div></div><div class="summary-row"><div><span class="prep">on</span></div><div>On a surface</div><div>on the table</div></div><div class="summary-row"><div><span class="prep">under</span></div><div>Beneath</div><div>under the sofa</div></div><div class="summary-row"><div><span class="prep">above</span></div><div>Higher than</div><div>above the sofa</div></div><div class="summary-row"><div><span class="prep">in front of</span></div><div>Facing</div><div>in front of the screen</div></div><div class="summary-row"><div><span class="prep">behind</span></div><div>At the back of</div><div>behind her</div></div><div class="summary-row"><div><span class="prep">between</span></div><div>In the middle of two things</div><div>between 2 and 4</div></div><div class="summary-row"><div><span class="prep">around</span></div><div>In a circle around</div><div>around the lake</div></div><div class="summary-row"><div><span class="prep">far from</span></div><div>At a great distance</div><div>far from home</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 Lesson complete! Move to the <strong>Exercises</strong> tab to test your knowledge.</div>` },
  ],
  ar: [
    { id: 1, title: 'مقدمة — التعبير عن المكان', content: `<div class="lesson-intro"><div class="lesson-badge">📚 قواعد اللغة الإنجليزية</div><h2>التعبير عن المكان بالإنجليزية</h2><p class="lead">تساعدنا <strong>حروف الجر المكانية</strong> على وصف أين يوجد شخص أو شيء ما — داخل، خارج، فوق، تحت، أمام، أو خلف.</p><div class="lesson-objectives"><h4>🎯 أهداف الدرس</h4><ul><li>فهم حروف الجر المكانية بالإنجليزية واستخدامها صحيحاً</li><li>التمييز بين in، at، on، under، above، in front of، behind...</li><li>إتقان 16 حالة عملية في اللغة الإنجليزية</li></ul></div><div class="lesson-highlight"><strong>في هذا الدرس:</strong> in · at · on · under · above · in front of · behind · next to · between · around · with · far from</div></div>` },
    { id: 2, title: 'IN — داخل فضاء', content: `<h3>حرف الجر <span class="prep">in</span></h3><p>نستخدم <strong>in</strong> للإشارة إلى <em>داخل مكان ما</em> أو <em>مدينة/دولة</em>.</p><div class="rule-box"><div class="rule-icon">📦</div><div><strong>in</strong> + فضاء مغلق<br/><strong>أمثلة:</strong><ul><li>I put coffee <strong>in</strong> my cup. (في الكوب)</li><li>My wife cooks <strong>in</strong> the kitchen. (في المطبخ)</li><li>I like reading <strong>in</strong> the grass. (في العشب)</li></ul></div></div><div class="rule-box"><div class="rule-icon">🌍</div><div><strong>in</strong> + مدينة / دولة<br/><strong>أمثلة:</strong><ul><li>All my life, I have lived <strong>in</strong> Paris. (في باريس)</li><li>Have you always lived <strong>in</strong> Mexico? (في المكسيك)</li></ul></div></div>` },
    { id: 3, title: 'ON / UNDER — على السطح وتحته', content: `<h3><span class="prep">On</span> · <span class="prep">Under</span></h3><div class="rule-box"><div class="rule-icon">⬆️</div><div><strong>on</strong> — على السطح<ul><li>The book is <strong>on</strong> the table. (على الطاولة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">⬇️</div><div><strong>under / below</strong> — تحت<ul><li>The cat hides <strong>under</strong> the sofa. (تحت الأريكة)</li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ The book is <strong>on</strong> the table (على السطح)</div><div class="compare-item good">✅ The cat is <strong>under</strong> the table (تحت)</div></div>` },
    { id: 4, title: 'IN FRONT OF / BEHIND / NEXT TO', content: `<h3><span class="prep">In front of</span> · <span class="prep">Behind</span> · <span class="prep">Next to</span></h3><div class="rule-box"><div class="rule-icon">➡️</div><div><strong>in front of</strong> (أمام) — مواجهة، قبل<ul><li>To read my screen, I sit <strong>in front of</strong> it. (أمام الشاشة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">⬅️</div><div><strong>behind</strong> (خلف) — في الخلف<ul><li>Sonia can't see when I'm <strong>behind</strong> her. (خلفها)</li></ul></div></div><div class="rule-box"><div class="rule-icon">↔️</div><div><strong>between</strong> (بين) — بين شيئين<ul><li>3 is <strong>between</strong> 2 and 4. (بين 2 و 4)</li></ul></div></div>` },
    { id: 5, title: 'WITH — منزل شخص ما', content: `<h3>حرف الجر <span class="prep">with</span></h3><p>للإشارة إلى الإقامة عند شخص ما، نستخدم <strong>with</strong> + شخص أو <strong>at</strong> + منزل شخص.</p><div class="rule-box"><div class="rule-icon">🏠</div><div><strong>with</strong> + شخص (الإقامة في منزله)<br/><strong>أمثلة:</strong><ul><li>After school, my sister goes to <strong>her friend's</strong> house. (إلى منزل صديقتها)</li><li>When I go on holiday, I stay <strong>with</strong> my uncle. (عند عمي)</li><li>Every evening, I eat <strong>at</strong> a restaurant. (في مطعم — ليس منزل شخص)</li></ul></div></div><div class="info-box">💡 بالإنجليزية: "stay <strong>with</strong> someone" أو "at someone's place"<br/>ما يعادلها بالفرنسية: <em>chez</em></div>` },
    { id: 6, title: 'AT — المواقع والأماكن العامة', content: `<h3>حرف الجر <span class="prep">at</span></h3><p>نستخدم <strong>at</strong> للمواقع المحددة والأماكن العامة.</p><div class="rule-box"><div class="rule-icon">🏙️</div><div><strong>at</strong> + مكان محدد<ul><li>I arrive <strong>at</strong> the cinema at 7. (في السينما)</li><li>The children go <strong>to</strong> school at 8. (إلى المدرسة — حركة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">🍽️</div><div><strong>at</strong> + مكان نشاط<ul><li>Every evening, I eat <strong>at</strong> a restaurant. (في مطعم)</li></ul></div></div><div class="compare-box"><div class="compare-item good">✅ I am <strong>at</strong> school (موقع — أنا فيها)</div><div class="compare-item good">✅ I go <strong>to</strong> school (حركة — أذهب إليها)</div></div>` },
    { id: 7, title: 'AROUND / ABOVE / FAR FROM', content: `<h3><span class="prep">Around</span> · <span class="prep">Above</span> · <span class="prep">Far from</span></h3><div class="rule-box"><div class="rule-icon">⭕</div><div><strong>around</strong> (حول) — في دائرة، حول شيء<ul><li>We can walk <strong>around</strong> the lake. (حول البحيرة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">↗️</div><div><strong>above / over</strong> (فوق) — أعلى من<ul><li>There is a painting <strong>above</strong> the sofa. (فوق الأريكة)</li></ul></div></div><div class="rule-box"><div class="rule-icon">📏</div><div><strong>far from</strong> (بعيداً عن) — على بُعد كبير<ul><li>Sonia can't see when I'm <strong>far from</strong> her. (بعيداً عنها)</li></ul></div></div>` },
    { id: 8, title: 'جدول ملخص', content: `<h3>📊 ملخص — حروف الجر المكانية بالإنجليزية</h3><div class="summary-table"><div class="summary-row header"><div>الحرف</div><div>الاستخدام</div><div>مثال</div></div><div class="summary-row"><div><span class="prep">in</span></div><div>داخل مكان / مدينة / دولة</div><div>in the kitchen</div></div><div class="summary-row"><div><span class="prep">at</span></div><div>موقع محدد</div><div>at the cinema</div></div><div class="summary-row"><div><span class="prep">on</span></div><div>على السطح</div><div>on the table</div></div><div class="summary-row"><div><span class="prep">under</span></div><div>تحت</div><div>under the sofa</div></div><div class="summary-row"><div><span class="prep">above</span></div><div>فوق</div><div>above the sofa</div></div><div class="summary-row"><div><span class="prep">in front of</span></div><div>أمام</div><div>in front of the screen</div></div><div class="summary-row"><div><span class="prep">behind</span></div><div>خلف</div><div>behind her</div></div><div class="summary-row"><div><span class="prep">between</span></div><div>بين شيئين</div><div>between 2 and 4</div></div><div class="summary-row"><div><span class="prep">around</span></div><div>حول</div><div>around the lake</div></div><div class="summary-row"><div><span class="prep">far from</span></div><div>بعيداً عن</div><div>far from home</div></div></div><div class="lesson-highlight" style="margin-top:1.5rem">🎓 أكملت الدرس! انتقل إلى تبويب <strong>التمارين</strong> لاختبار معلوماتك.</div>` },
  ],
};

// ─────────────────────────────────────────────────────────────────
// Sélectionne les leçons selon les données du cours.
// Priorité :
//   1. course.pages (JSON stocké en base) → cours créé via import PDF
//   2. Leçons codées en dur → cours "Exprimer le temps" et "Exprimer un lieu"
// ─────────────────────────────────────────────────────────────────
function getLessonPages(course, langKey) {
  // ── 1. Pages dynamiques stockées dans PocketBase ──────────────
  if (course?.pages) {
    try {
      const parsed = typeof course.pages === 'string'
        ? JSON.parse(course.pages)
        : course.pages;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch { /* JSON invalide → fallback */ }
  }

  // ── 2. Si le cours a un fichier PDF → laisser le viewer PDF gérer ──
  if (course?.pdf) {
    return [];
  }

  // ── 3. Cours traduit (source_course_id présent) → forcer la langue du cours ──
  // Les versions EN/AR créées par create-multilingual-courses.mjs ont langue='en'/'ar'
  // On ignore langKey (langue UI) et on force la langue du cours lui-même
  let effectiveLang = langKey;
  if (course?.source_course_id && course?.langue) {
    const l = (course.langue || '').toLowerCase();
    if (l === 'en' || l === 'english' || l === 'anglais') effectiveLang = 'en';
    else if (l === 'ar' || l === 'arabic' || l === 'arabe') effectiveLang = 'ar';
    else effectiveLang = 'fr';
  }

  // ── 4. Fallback : leçons codées en dur (uniquement pour cours sans PDF ni pages DB) ──
  const titre  = (course?.titre || course?.title || '').toLowerCase();
  const desc   = (course?.description || '').toLowerCase();
  const cNom   = (course?.cours_nom || '').toLowerCase();
  const langue = (course?.langue || '').toLowerCase();
  const haystack = `${titre} ${desc}`;

  // effectiveLang est déjà défini plus haut (force EN/AR pour cours traduits)
  // Pour les cours originaux, on affine selon cours_nom
  let courseLang = effectiveLang;
  if (courseLang === langKey) {
    // Pas de forçage → détecter selon cours_nom (comportement original)
    courseLang = 'fr';
    if (cNom.includes('anglais') || cNom.includes('english') || langue === 'anglais') {
      courseLang = 'en';
    } else if (cNom.includes('arabe') || cNom.includes('arabic') || langue === 'arabe') {
      courseLang = 'ar';
    } else {
      // Utiliser la langue UI (effectiveLang / langKey) comme dernier recours
      courseLang = effectiveLang;
    }
  }

  // Normaliser 'ar-MA' → 'ar' pour les clés de LESSON_PAGES_*
  if (courseLang === 'ar-MA') courseLang = 'ar';

  // ── Détection précise du topic pour choisir le bon fallback ──────
  const isLieu  = haystack.match(/\blieu\b|place express|prépositions? de lieu|exprimer (un|le) lieu|مكان/);
  const isTemps = haystack.match(/\btemps\b|time express|prépositions? de temps|exprimer le temps/);

  if (isLieu)  return LESSON_PAGES_LIEU[courseLang]  || LESSON_PAGES_LIEU.fr;
  if (isTemps) return LESSON_PAGES_TEMPS[courseLang] || LESSON_PAGES_TEMPS.fr;

  // Cours sans topic reconnu et sans pages DB → retourner tableau vide
  // (le viewer affichera directement les exercices, sans fausse leçon)
  return [];
}

// ─────────────────────────────────────────────────────────────────
// Convertit le format PocketBase → format d'affichage QCM
// PB : { id, question, options: string[], answer: number }
// UI : { id, q, opts: [{k,v}], correct: 'a'|'b'|'c'|'d' }
// ─────────────────────────────────────────────────────────────────
const LETTERS = ['a', 'b', 'c', 'd'];

function parseExercises(raw) {
  if (!raw) return [];
  try {
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr) || arr.length === 0) return [];

    return arr.map((q, idx) => {
      // Format PocketBase (options array + answer index)
      if (Array.isArray(q.options) && typeof q.answer === 'number') {
        const optTrans = q.opt_translations || [];
        return {
          id: q.id || `q${idx + 1}`,
          q: q.question || '',
          translation: q.translation || '',
          opts: q.options.map((v, i) => ({ k: LETTERS[i] || String(i), v, t: optTrans[i] || '' })),
          correct: LETTERS[q.answer] || 'a',
        };
      }
      // Format legacy (opts + correct lettre)
      if (Array.isArray(q.opts) && q.correct) {
        return {
          id: q.id || `q${idx + 1}`,
          q: q.q || q.question || '',
          translation: q.translation || '',
          opts: q.opts.map(o => typeof o === 'string' ? { k: o, v: o, t: '' } : { ...o, t: o.t || '' }),
          correct: q.correct,
        };
      }
      return null;
    }).filter(Boolean);
  } catch {
    return [];
  }
}

// Langue de traduction à afficher selon la langue du cours
function getTranslationHintLang(course) {
  const l = (course?.langue || '').toLowerCase();
  if (l.includes('arabe') || l.includes('arabic') || l.includes('ar')) return 'en';
  if (l.includes('anglais') || l.includes('english') || l.includes('en')) return 'fr';
  return 'en'; // cours français → traduction anglaise
}

// ─────────────────────────────────────────────────────────────────
// CSS sécurisé (filigrane + styles leçon)
// ─────────────────────────────────────────────────────────────────
const SECURE_CSS = `
  .secure-content { user-select:none; -webkit-user-select:none; -moz-user-select:none; -ms-user-select:none; }
  .lesson-content h2 { font-size:1.5rem; font-weight:800; margin-bottom:1rem; color:#1e293b; }
  .lesson-content h3 { font-size:1.2rem; font-weight:700; margin-bottom:.75rem; color:#1e293b; }
  .lesson-content p  { margin-bottom:.75rem; line-height:1.7; color:#334155; }
  .lesson-content ul { padding-left:1.5rem; margin-bottom:.75rem; }
  .lesson-content li { margin-bottom:.4rem; color:#334155; line-height:1.6; }
  .lesson-intro { text-align:center; padding:1rem 0; }
  .lesson-badge { display:inline-block; background:linear-gradient(135deg,#dc2626,#ef4444); color:white; padding:.35rem 1rem; border-radius:999px; font-size:.8rem; font-weight:700; margin-bottom:1rem; }
  .lead { font-size:1.05rem; color:#475569; max-width:560px; margin:0 auto 1.25rem; }
  .lesson-objectives { background:#fff5f5; border:1px solid #fecaca; border-radius:12px; padding:1rem 1.25rem; text-align:left; margin-bottom:1rem; }
  .lesson-objectives h4 { font-weight:700; margin-bottom:.5rem; color:#991b1b; }
  .lesson-objectives ul { padding-left:1.25rem; margin:0; }
  .lesson-highlight { background:linear-gradient(135deg,#fff1f2,#ffe4e6); border:1px solid #fca5a5; border-radius:12px; padding:.85rem 1.25rem; font-size:.92rem; color:#b91c1c; margin-top:.75rem; }
  .rule-box { display:flex; gap:.85rem; align-items:flex-start; background:#f8fafc; border-left:4px solid #dc2626; border-radius:0 12px 12px 0; padding:.9rem 1rem; margin-bottom:.85rem; }
  .rule-icon { font-size:1.5rem; flex-shrink:0; }
  .info-box { background:#fefce8; border:1px solid #fde68a; border-radius:10px; padding:.75rem 1rem; font-size:.9rem; color:#92400e; margin-top:.5rem; }
  .compare-box { display:flex; flex-direction:column; gap:.4rem; margin:.75rem 0; }
  .compare-item { padding:.5rem .85rem; border-radius:8px; font-size:.9rem; }
  .compare-item.good { background:#f0fdf4; border:1px solid #86efac; color:#166534; }
  .compare-item.bad { background:#fef2f2; border:1px solid #fca5a5; color:#991b1b; }
  .compare-item.special { background:#fffbeb; border:1px solid #fcd34d; color:#92400e; }
  .prep { display:inline-block; background:#dc2626; color:white; padding:.15rem .6rem; border-radius:6px; font-weight:900; font-size:1em; letter-spacing:.02em; box-shadow:0 1px 3px rgba(220,38,38,.35); }
  .rule-box li strong { color:#dc2626; font-weight:900; }
  .compare-item strong { color:#dc2626; font-weight:900; }
  .info-box strong { color:#b91c1c; }
  .summary-table { border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }
  .summary-row { display:grid; grid-template-columns:1fr 2fr 1.5fr; }
  .summary-row > div { padding:.55rem .85rem; border-bottom:1px solid #f1f5f9; font-size:.88rem; }
  .summary-row.header > div { background:#dc2626; color:white; font-weight:700; }
  .summary-row .prep { background:#dc2626; }
  .summary-row:last-child > div { border-bottom:none; }
  .summary-row:nth-child(even) > div { background:#f8fafc; }
  .watermark-overlay { position:absolute; inset:0; pointer-events:none; z-index:10; display:flex; align-items:center; justify-content:center; overflow:hidden; }
  .watermark-text { position:absolute; opacity:.055; font-size:1.1rem; font-weight:800; color:#6366f1; white-space:nowrap; transform:rotate(-35deg); user-select:none; pointer-events:none; letter-spacing:.05em; }

  /* ─── Blocs exemples (cours générés via PDF) ─── */
  .example-block { display:flex; gap:.85rem; align-items:flex-start; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:.9rem 1rem; margin-bottom:.85rem; }
  .example-number { background:linear-gradient(135deg,#dc2626,#ef4444); color:white; min-width:1.9rem; height:1.9rem; display:flex; align-items:center; justify-content:center; border-radius:50%; font-size:.78rem; font-weight:800; flex-shrink:0; box-shadow:0 2px 6px rgba(220,38,38,.3); }
  .example-content { flex:1; min-width:0; }
  .example-sentence { margin-bottom:.3rem !important; font-size:.97rem; }
  .highlight { background:linear-gradient(120deg,#fef9c3 0%,#fef08a 100%); padding:.1rem .4rem; border-radius:5px; font-weight:700; color:#92400e; }

  /* ─── Traduction bilingue (class="translation") ─── */
  .translation {
    display:block;
    margin-top:.3rem !important;
    margin-bottom:.1rem !important;
    padding:.35rem .7rem;
    background:#eff6ff;
    border-left:3px solid #3b82f6;
    border-radius:0 8px 8px 0;
    color:#1d4ed8;
    font-size:.88rem;
    font-style:italic;
    line-height:1.5;
  }
  .translation::before { content:''; }

  /* ─── Translittération latine (arabe → latin, class="transliteration") ─── */
  .transliteration {
    display:block;
    margin-top:.3rem !important;
    margin-bottom:.1rem !important;
    padding:.3rem .7rem;
    background:#f5f3ff;
    border-left:3px solid #8b5cf6;
    border-radius:0 8px 8px 0;
    color:#6d28d9;
    font-size:.88rem;
    font-family:Georgia, 'Times New Roman', serif;
    letter-spacing:.04em;
    font-style:italic;
  }
  [dir="rtl"] { direction:rtl; text-align:right; font-family:'Segoe UI', Arial, sans-serif; }
  .lesson-content [dir="rtl"] { line-height:1.9; }

  /* ─── Traduction inline (à côté de chaque exemple) ─── */
  .inline-trans { display:block; margin-top:.18rem; font-size:.82rem; color:#6b7280; font-style:italic; padding-left:.6rem; border-left:2px solid #d1d5db; line-height:1.5; }
`;



// ─────────────────────────────────────────────────────────────────
// COMPOSANT — Drill de prononciation "Écoute et répète"
// ─────────────────────────────────────────────────────────────────
const AudioDrillPanel = ({ page }) => {
  const drillData = page.drillData || {};
  const letters   = drillData.letters || [];
  const lang      = drillData.lang    || 'fr-FR';
  const pauseSec  = drillData.pauseSeconds || 3;

  const [isRunning,   setIsRunning]   = useState(false);
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [phase,       setPhase]       = useState('idle'); // idle | speaking | waiting | done
  const [countdown,   setCountdown]   = useState(pauseSec);
  const [voiceStatus, setVoiceStatus] = useState('checking'); // checking | ok | missing
  const [foundVoice,  setFoundVoice]  = useState(null);
  const [dismissed,   setDismissed]   = useState(false);
  const timerRef = useRef(null);

  // ── Détection asynchrone de la voix (voiceschanged est async dans Chrome) ──
  useEffect(() => {
    if (!window.speechSynthesis) { setVoiceStatus('missing'); return; }
    const detect = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return false;
      const prefix = lang.split('-')[0];
      const v = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(prefix));
      setFoundVoice(v || null);
      setVoiceStatus(v ? 'ok' : 'missing');
      return true;
    };
    if (!detect()) {
      const handler = () => detect();
      window.speechSynthesis.addEventListener('voiceschanged', handler);
      const t = setTimeout(() => { if (!detect()) setVoiceStatus('missing'); }, 2500);
      return () => { window.speechSynthesis.removeEventListener('voiceschanged', handler); clearTimeout(t); };
    }
  }, [lang]);

  // ── TTS ───────────────────────────────────────────────────────────
  const speakLetter = useCallback((text, onEnd) => {
    if (!window.speechSynthesis) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang  = lang;
    utter.rate  = 0.75;
    utter.pitch = 1;
    if (foundVoice) utter.voice = foundVoice;
    utter.onend   = () => onEnd?.();
    utter.onerror = (e) => { console.warn('TTS:', e.error); onEnd?.(); };
    window.speechSynthesis.speak(utter);
  }, [lang, foundVoice]);

  const runLetter = useCallback((idx) => {
    if (idx >= letters.length) { setPhase('done'); setIsRunning(false); return; }
    setCurrentIdx(idx);
    setPhase('speaking');
    speakLetter(letters[idx].speak || letters[idx].char, () => {
      setPhase('waiting');
      let c = pauseSec;
      setCountdown(c);
      timerRef.current = setInterval(() => {
        c -= 1; setCountdown(c);
        if (c <= 0) { clearInterval(timerRef.current); runLetter(idx + 1); }
      }, 1000);
    });
  }, [letters, pauseSec, speakLetter]);

  const handleStart = () => { setIsRunning(true); runLetter(currentIdx); };
  const handlePause = () => {
    setIsRunning(false); setPhase('idle');
    clearInterval(timerRef.current); window.speechSynthesis?.cancel();
  };
  const handleReset = () => { handlePause(); setCurrentIdx(0); setCountdown(pauseSec); };
  const jumpTo = (i) => { handlePause(); setCurrentIdx(i); };

  useEffect(() => () => { clearInterval(timerRef.current); window.speechSynthesis?.cancel(); }, []);

  const letter = letters[currentIdx];
  const pct    = letters.length ? Math.round((currentIdx / letters.length) * 100) : 0;

  // ── Nom lisible de la langue ──────────────────────────────────────
  const langLabel = (
    { 'fr-FR':'français','fr':'français','en-US':'anglais','en':'anglais','ar-SA':'arabe','ar':'arabe' }[lang] || lang
  );

  // ── Textes de l'interface selon la langue du cours ────────────────
  const UI_STRINGS = {
    'fr-FR': {
      idleStart:   'Appuie sur ▶ pour commencer',
      idleResume:  (n) => `Reprise depuis la lettre ${n}`,
      speaking:    'Écoute…',
      repeat:      '→ Répète !',
      done:        'Bravo ! Toutes les lettres passées 🎉',
      start:       'Commencer',
      resume:      'Continuer',
      pause:       'Pause',
      reset:       'Reset',
      letterOf:    (cur, tot) => `Lettre ${cur} / ${tot}`,
      gridHint:    'Clique sur une lettre pour commencer depuis là',
      retryBtn:    '🔄 Réessayer la détection',
      skipBtn:     'Continuer sans son',
      howToTitle:  'Comment installer la voix :',
      restartNote: '⚠️ Après installation, redémarre Windows puis relance le navigateur.',
      noVoice:     (lbl) => `Aucune voix « ${lbl} » détectée par le navigateur. Si tu viens d'installer la langue, redémarre Windows complètement, puis relance le navigateur.`,
      voiceFound:  (names) => `✅ Voix détectée : ${names} — Clique sur « Réessayer » pour activer.`,
    },
    'en-US': {
      idleStart:   'Press ▶ to start',
      idleResume:  (n) => `Resume from letter ${n}`,
      speaking:    'Listen…',
      repeat:      '→ Repeat!',
      done:        'Well done! All letters completed 🎉',
      start:       'Start',
      resume:      'Continue',
      pause:       'Pause',
      reset:       'Reset',
      letterOf:    (cur, tot) => `Letter ${cur} / ${tot}`,
      gridHint:    'Click a letter to start from there',
      retryBtn:    '🔄 Retry detection',
      skipBtn:     'Continue without audio',
      howToTitle:  'How to install the voice:',
      restartNote: '⚠️ After installation, restart Windows then relaunch the browser.',
      noVoice:     (lbl) => `No "${lbl}" voice detected by the browser. If you just installed the language, restart Windows completely, then relaunch the browser.`,
      voiceFound:  (names) => `✅ Voice detected: ${names} — Click "Retry" to activate.`,
    },
    'ar-SA': {
      idleStart:   'اضغط ▶ للبدء',
      idleResume:  (n) => `استئناف من الحرف ${n}`,
      speaking:    '🔊 استمع…',
      repeat:      'كرر ! ←',
      done:        'أحسنت ! اكتملت جميع الحروف 🎉',
      start:       'ابدأ',
      resume:      'متابعة',
      pause:       'إيقاف',
      reset:       'إعادة',
      letterOf:    (cur, tot) => `الحرف ${cur} / ${tot}`,
      gridHint:    'انقر على حرف للبدء منه',
      retryBtn:    '🔄 إعادة الكشف',
      skipBtn:     'متابعة بدون صوت',
      howToTitle:  'كيفية تثبيت الصوت:',
      restartNote: '⚠️ بعد التثبيت، أعد تشغيل Windows ثم أعد تشغيل المتصفح.',
      noVoice:     (lbl) => `لم يتم اكتشاف صوت "${lbl}" في المتصفح. إذا قمت للتو بتثبيت اللغة، أعد تشغيل Windows بالكامل ثم أعد تشغيل المتصفح.`,
      voiceFound:  (names) => `✅ تم اكتشاف الصوت: ${names} — انقر على "إعادة الكشف" للتفعيل.`,
    },
  };
  const t = UI_STRINGS[lang] || UI_STRINGS['fr-FR'];

  // ── Instructions d'installation selon la plateforme ──────────────
  const getInstallSteps = () => {
    const ua = navigator.userAgent || '';
    const pf = navigator.platform  || '';
    const isIOS     = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    const isMac     = /Mac/.test(pf) && !isIOS;
    const isWindows = /Win/.test(pf) || /Windows/.test(ua);
    if (isWindows) return {
      icon: '🖥️',
      steps: [
        'Appuie sur ⊞ Win + I pour ouvrir les Paramètres',
        'Va dans Heure et langue → Parole',
        'Clique sur « Ajouter des voix »',
        `Recherche « ${langLabel} » et clique sur Installer`,
        'Relance le navigateur, puis recharge cette page',
      ],
    };
    if (isAndroid) return {
      icon: '📱',
      steps: [
        'Ouvre les Paramètres de ton téléphone',
        'Gestion générale → Langue et saisie',
        'Synthèse vocale → icône ⚙ à côté du moteur TTS',
        `Installe les données vocales pour « ${langLabel} »`,
        'Reviens ici et recharge la page',
      ],
    };
    if (isIOS) return {
      icon: '📱',
      steps: [
        'Ouvre les Réglages de ton iPhone/iPad',
        'Accessibilité → Contenu énoncé → Voix',
        `Sélectionne « ${langLabel} »`,
        'Télécharge une voix (connexion Wi-Fi recommandée)',
        'Reviens ici et recharge la page',
      ],
    };
    if (isMac) return {
      icon: '🖥️',
      steps: [
        'Ouvre Préférences Système → Accessibilité',
        'Contenu parlé → Voix du système',
        `Choisir « ${langLabel} » dans le menu`,
        'Clique sur Télécharger à côté de la voix',
        'Relance le navigateur',
      ],
    };
    return {
      icon: '🔊',
      steps: [
        `Installe une voix « ${langLabel} » dans les paramètres de synthèse vocale de ton appareil`,
        'Relance le navigateur',
      ],
    };
  };

  // ── Re-détection manuelle (après installation de la voix) ─────────
  const handleRetry = useCallback(() => {
    setVoiceStatus('checking');
    setFoundVoice(null);
    // Forcer Chrome à rafraîchir la liste des voix SAPI
    window.speechSynthesis.getVoices();
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      const prefix = lang.split('-')[0];
      const v = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(prefix));
      setFoundVoice(v || null);
      setVoiceStatus(v ? 'ok' : 'missing');
    }, 800);
  }, [lang]);

  // ── Écran "voix manquante" ────────────────────────────────────────
  if (voiceStatus === 'missing' && !dismissed) {
    const { icon, steps } = getInstallSteps();
    // Voix disponibles avec le même préfixe de langue (debug visible)
    const allVoices   = window.speechSynthesis?.getVoices() || [];
    const prefix      = lang.split('-')[0];
    const nearVoices  = allVoices.filter(v => v.lang.startsWith(prefix));
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-full max-w-md rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-lg dark:border-amber-600 dark:bg-amber-900/20">
          {/* En-tête */}
          <div className="mb-4 flex items-start gap-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <p className="text-lg font-bold text-amber-800 dark:text-amber-200">
                Voix « {langLabel} » introuvable
              </p>
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-400">
                Ton appareil n'a pas de voix <strong>{langLabel}</strong> installée.
                Sans elle, les lettres ne seront pas prononcées.
              </p>
            </div>
          </div>

          {/* Voix détectées (si aucune correspondance) */}
          {nearVoices.length === 0 && (
            <div className="mb-3 rounded-lg bg-white/60 px-3 py-2 text-xs text-muted-foreground dark:bg-black/20">
              ℹ️ {t.noVoice(langLabel)}
            </div>
          )}
          {nearVoices.length > 0 && (
            <div className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-800 dark:bg-green-900/20 dark:text-green-300">
              {t.voiceFound(nearVoices.map(v => `${v.name} (${v.lang})`).join(', '))}
            </div>
          )}

          {/* Étapes */}
          <div className="mb-4 rounded-xl bg-white/70 p-4 dark:bg-black/20">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.howToTitle}
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-foreground">
              {steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">{t.restartNote}</p>
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white shadow transition-colors hover:bg-amber-600">
              {t.retryBtn}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-xl border bg-muted px-4 py-2.5 text-sm text-muted-foreground transition-opacity hover:opacity-80">
              {t.skipBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Chargement ────────────────────────────────────────────────────
  if (voiceStatus === 'checking') {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <span className="animate-spin">⏳</span>
        <span>Chargement de la voix…</span>
      </div>
    );
  }

  // ── Drill normal ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-5 py-2 select-none">
      {/* Sous-titre */}
      <p className="text-sm text-muted-foreground text-center" dir={lang.startsWith('ar') ? 'rtl' : 'ltr'}>
        {drillData.subtitle || t.idleStart}
      </p>

      {/* Lettre principale */}
      <div className={`w-44 h-44 rounded-3xl flex flex-col items-center justify-center shadow-lg border-2 transition-all duration-300 ${
        phase === 'speaking' ? 'bg-primary/10 border-primary scale-105' :
        phase === 'waiting'  ? 'bg-green-50 border-green-400 dark:bg-green-900/20' :
        phase === 'done'     ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20' :
                               'bg-muted/40 border-border'
      }`}>
        {phase === 'done' ? (
          <span className="text-5xl">🎉</span>
        ) : letter ? (
          <>
            <span className="text-7xl font-black text-foreground leading-none">{letter.char}</span>
            {letter.name && <span className="text-xs text-muted-foreground mt-1 font-medium">/{letter.name}/</span>}
          </>
        ) : null}
      </div>

      {/* Statut */}
      <div className="min-h-[3.5rem] flex flex-col items-center justify-center text-center">
        {phase === 'speaking' && (
          <div className="flex items-center gap-2 text-primary font-semibold animate-pulse">
            <span>{t.speaking}</span>
          </div>
        )}
        {phase === 'waiting' && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-green-600 dark:text-green-400 font-bold text-base">{t.repeat}</span>
            <span className="text-5xl font-black text-green-500 leading-none">{countdown}</span>
          </div>
        )}
        {phase === 'done' && (
          <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">{t.done}</p>
        )}
        {phase === 'idle' && (
          <p className="text-muted-foreground text-sm">
            {currentIdx === 0 ? t.idleStart : t.idleResume(currentIdx + 1)}
          </p>
        )}
      </div>

      {/* Barre de progression */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{t.letterOf(Math.min(currentIdx + 1, letters.length), letters.length)}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button onClick={handleStart}
            className="px-7 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity shadow">
            ▶ {currentIdx > 0 && phase !== 'done' ? t.resume : t.start}
          </button>
        ) : (
          <button onClick={handlePause}
            className="px-7 py-2.5 bg-muted text-foreground rounded-xl font-bold border hover:opacity-90 transition-opacity">
            ⏸ {t.pause}
          </button>
        )}
        <button onClick={handleReset}
          className="px-4 py-2.5 bg-muted text-muted-foreground rounded-xl font-medium border hover:opacity-90 transition-opacity">
          ↺ {t.reset}
        </button>
      </div>

      {/* Grille de lettres cliquables */}
      <div className="w-full mt-1">
        <p className="text-xs text-muted-foreground text-center mb-2">{t.gridHint}</p>
        <div className="flex flex-wrap gap-1.5 justify-center">
          {letters.map((l, i) => (
            <button key={i} onClick={() => jumpTo(i)}
              title={l.name}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all hover:scale-110 ${
                i < currentIdx   ? 'bg-primary/20 text-primary' :
                i === currentIdx ? 'bg-primary text-primary-foreground scale-110 shadow' :
                                   'bg-muted text-muted-foreground'
              }`}>
              {l.char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────
const SecureCourseViewer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { language } = useLanguage();

  // Lire le paramètre ?page= pour reprendre là où l'étudiant s'était arrêté
  const initialPage = (() => {
    const p = parseInt(searchParams.get('page'), 10);
    return isNaN(p) || p < 0 ? 0 : p;
  })();

  const [activeTab,    setActiveTab]    = useState('lecture');
  const [currentPage,  setCurrentPage]  = useState(initialPage);
  const [answers,      setAnswers]      = useState({});
  const [submitted,    setSubmitted]    = useState(false);
  const [correction,   setCorrection]   = useState(null);
  const [correcting,   setCorrecting]   = useState(false);
  const [history,      setHistory]      = useState([]);
  const [enrollment,   setEnrollment]   = useState(null);
  const [hasAccess,    setHasAccess]    = useState(null);
  const [course,       setCourse]       = useState(null);
  const [questions,    setQuestions]    = useState([]);  // chargé depuis PB
  const [pages,        setPages]        = useState([]);  // leçons sélectionnées
  const [pdfViewerUrl, setPdfViewerUrl] = useState('');  // URL du PDF direct (si pas de pages)
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [coursePrice,      setCoursePrice]      = useState(0);
  const [paymentMethod,    setPaymentMethod]    = useState('especes');
  const [paymentLoading,   setPaymentLoading]   = useState(false);
  const [paymentSuccess,   setPaymentSuccess]   = useState(false);
  const [paidViaPaypal,    setPaidViaPaypal]    = useState(false);
  const [nextCourse,       setNextCourse]       = useState(null);

  // ── Progression pédagogique ─────────────────────────────────────
  const [moduleValidated,  setModuleValidated]  = useState(false);  // ≥80% déjà obtenu
  const [lastScore,        setLastScore]        = useState(null);   // dernier score (0-100)
  const [scoreDecision,    setScoreDecision]    = useState(null);   // { passed, score, message, action } après soumission
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // ── Tarification ─────────────────────────────────────────────────
  // Deux options : cours individuel ($4.90) ou pack 12 cours ($49)
  const PRICE_INDIVIDUAL = 4.90;
  const PRICE_PACK_12    = 49.00;
  const [selectedPlan,   setSelectedPlan]   = useState('individual'); // 'individual' | 'pack'
  const effectivePrice = selectedPlan === 'pack' ? PRICE_PACK_12 : PRICE_INDIVIDUAL;

  // ── Chat IA ──────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: '👋 Bonjour ! Je suis IWS IA, votre tuteur. Posez-moi vos questions sur le cours ou demandez-moi de vous faire pratiquer !' }
  ]);
  const [chatInput,    setChatInput]    = useState('');
  const [chatSending,  setChatSending]  = useState(false);
  const chatEndRef = useRef(null);

  const contentRef = useRef(null);
  const saveTimer  = useRef(null);

  const langKey = language === 'ar-MA' ? 'ar-MA' : language === 'en' ? 'en' : 'fr';

  // RTL si UI arabe OU si le cours enseigne l'arabe
  const isCourseArabic = ['arabe','arabic'].some(w =>
    (course?.cours_nom || '').toLowerCase().includes(w) ||
    (course?.langue || '').toLowerCase().includes(w)
  );
  const isRtl = language?.startsWith('ar') || isCourseArabic;

  const displayName = currentUser
    ? (`${currentUser.prenom || ''} ${currentUser.nom || currentUser.name || ''}`.trim() || 'Étudiant')
    : 'Étudiant';

  // ── Sécurité : bloque clic droit, raccourcis, sélection ──
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = SECURE_CSS;
    document.head.appendChild(styleEl);
    const blockContext = e => e.preventDefault();
    const blockKeys = e => {
      if ((e.ctrlKey || e.metaKey) && ['c','a','p','s','u'].includes(e.key.toLowerCase())) e.preventDefault();
    };
    document.addEventListener('contextmenu', blockContext);
    document.addEventListener('keydown', blockKeys);
    document.addEventListener('dragstart', e => e.preventDefault());
    return () => {
      document.head.removeChild(styleEl);
      document.removeEventListener('contextmenu', blockContext);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  // ── Vérification accès + chargement cours ──
  useEffect(() => {
    if (!currentUser) return;
    const checkAccess = async () => {
      try {
        let courseData = null;
        if (courseId) {
          try { courseData = await pb.collection('courses').getOne(courseId, { requestKey: null }); } catch {}
        }
        setCourse(courseData);

        // ── Chercher le cours suivant (même section, trié par création) ──
        if (courseData?.section || courseData?.cours_nom) {
          try {
            const filter = courseData.section
              ? `section="${courseData.section}"`
              : `cours_nom="${courseData.cours_nom}"`;
            const allSection = await pb.collection('courses').getFullList({
              filter, sort: '+created', fields: 'id,titre,title,niveau,cours_nom', requestKey: null,
            });
            const idx = allSection.findIndex(c => c.id === courseId);
            if (idx >= 0 && idx < allSection.length - 1) {
              setNextCourse(allSection[idx + 1]);
            }
          } catch { /* pas critique */ }
        }

        // Charger les exercices depuis PocketBase
        const parsed = parseExercises(courseData?.exercises);
        setQuestions(parsed);

        // Sélectionner les leçons selon le titre du cours
        setPages(getLessonPages(courseData, langKey));

        // Vérifier accès
        const [allOrders, enrollments] = await Promise.allSettled([
          pb.collection('orders').getFullList({ filter: `user_id="${currentUser.id}"`, requestKey: null }),
          pb.collection('course_enrollments').getFullList({
            filter: `user_id="${currentUser.id}"${courseId ? ` && course_id="${courseId}"` : ''}`,
            requestKey: null,
          }),
        ]);

        const orders     = allOrders.status === 'fulfilled' ? allOrders.value : [];
        const enrollList = enrollments.status === 'fulfilled' ? enrollments.value : [];
        const enrolled   = enrollList.length > 0;

        // Nombre total de cours suivis (pour affichage dans le mur de paiement)
        let totalEnrollments = enrollList.length;
        try {
          const allEnr = await pb.collection('course_enrollments').getFullList({ filter: `user_id="${currentUser.id}"`, requestKey: null });
          totalEnrollments = allEnr.length;
        } catch {}

        const coursePrice = courseData?.prix ?? courseData?.price ?? 0;
        const courseTitle = courseData?.titre || courseData?.title || '';
        const isFreePrice = coursePrice === 0;
        // hasSection : uniquement pour les admins ou comptes avec abonnement global (pas les étudiants normaux)
        const hasSection  = currentUser.role === 'admin' || currentUser.isAdmin === true;

        // ── Helpers pour matcher les commandes même sans course_id (anciens enregistrements) ──
        const matchesThisCourse = (o) =>
          o.course_id === courseId ||
          (courseTitle && o.note?.includes(courseTitle));

        // hasPaid : commande COMPLÉTÉE pour CE cours spécifiquement
        const hasPaid = orders.some(o => o.status === 'completed' && matchesThisCourse(o));

        // hasPendingOrderForCourse : commande EN ATTENTE pour CE cours → l'admin demande le paiement
        const hasPendingOrderForCourse = orders.some(o => o.status === 'pending' && matchesThisCourse(o));

        // isGrandfathered : inscrit avant que le cours devienne payant
        // MAIS seulement si AUCUNE commande pending n'existe pour ce cours
        // (si une commande pending existe, c'est que le paiement a été explicitement demandé)
        const isGrandfathered = enrolled && !hasPendingOrderForCourse;

        // Stocker pour le mur de paiement
        setTotalEnrollments(totalEnrollments);
        setCoursePrice(coursePrice);

        // ── Règles d'accès ────────────────────────────────────────────
        // 1. Admin                          → accès total
        // 2. Commande PayPal complétée      → accès payé confirmé
        // 3. Pack acheté (order pack_12)    → accès à tous les cours
        // 4. Déjà inscrit à ce cours        → accès (grandfathered ou cours gratuit)
        // 5. Moins de 3 cours au total      → les 3 premiers cours sont gratuits
        // ─ BLOQUÉ sinon                    → mur de paiement (4ème cours et au-delà)

        const FREE_COURSE_LIMIT = 3;
        const hasPackOrder = orders.some(o => o.status === 'completed' && o.order_type === 'pack_12');
        const grantAccess  = hasSection || hasPaid || hasPackOrder || enrolled || totalEnrollments < FREE_COURSE_LIMIT;

        setTotalEnrollments(totalEnrollments);
        setCoursePrice(coursePrice);

        if (grantAccess) {
          setHasAccess(true);

          if (enrollList.length > 0) {
            setEnrollment(enrollList[0]);
          } else if (courseId) {
            // Auto-inscription au premier accès (cours gratuit ou payé)
            try {
              const newEnroll = await pb.collection('course_enrollments').create({
                user_id: currentUser.id, course_id: courseId,
                progression: 0, complete: false,
                start_date: new Date().toISOString(),
              }, { requestKey: null });
              setEnrollment(newEnroll);
            } catch {}
          }
        } else {
          // 4ème cours et au-delà sans paiement → mur de paiement
          setHasAccess(false);
        }
      } catch {
        setHasAccess(currentUser?.role === 'admin' || currentUser?.isAdmin === true);
      }
    };
    checkAccess();
  }, [currentUser, courseId, langKey]);

  // ── Charger le score existant (module déjà validé ?) ──────────────
  useEffect(() => {
    if (!currentUser || !courseId || hasAccess !== true) return;
    const loadScore = async () => {
      try {
        const res  = await fetch(`${API_URL}/courses/${courseId}/my-score`, {
          headers: { 'Authorization': `Bearer ${pb.authStore.token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.hasScore) {
          setLastScore(data.score);
          if (data.passed) {
            setModuleValidated(true);
            // Si le module est déjà validé, démarrer sur les exercices
            setActiveTab('exercices');
          }
        }
      } catch { /* non-bloquant */ }
    };
    loadScore();
  }, [currentUser, courseId, hasAccess]);

  // ── Mise à jour des leçons si la langue change ──
  useEffect(() => {
    if (course) setPages(getLessonPages(course, langKey));
  }, [langKey, course]);

  // ── URL du PDF direct (pour cours sans pages structurées) ──
  useEffect(() => {
    if (!course?.pdf) { setPdfViewerUrl(''); return; }
    const buildUrl = async () => {
      try {
        // PocketBase exige un token pour accéder aux fichiers protégés
        const fileToken = await pb.files.getToken();
        const url = pb.files.getUrl(course, course.pdf, { token: fileToken });
        setPdfViewerUrl(url);
      } catch {
        // Fallback sans token (si la collection est publique)
        try { setPdfViewerUrl(pb.files.getUrl(course, course.pdf)); }
        catch { setPdfViewerUrl(''); }
      }
    };
    buildUrl();
  }, [course]);

  // ── Sauvegarder la progression de lecture + dernière page ──
  useEffect(() => {
    if (!courseId) return;
    // Toujours sauvegarder la dernière page visitée dans localStorage
    // (utilisé par CourseDetailPage pour le bouton "Continuer")
    try { localStorage.setItem(`lastPage_${courseId}`, String(currentPage)); } catch {}

    if (!enrollment || !currentUser || pages.length === 0) return;
    const readingPct = Math.round(((currentPage + 1) / pages.length) * 70);
    const newProg    = Math.max(enrollment.progression || 0, readingPct);
    if (newProg <= (enrollment.progression || 0)) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await pb.collection('course_enrollments').update(enrollment.id, {
          progression: newProg, last_activity: new Date().toISOString(),
        }, { requestKey: null });
        setEnrollment(prev => prev ? { ...prev, progression: newProg } : prev);
      } catch {}
    }, 1500);
    return () => clearTimeout(saveTimer.current);
  }, [currentPage, enrollment?.id, pages.length, courseId]);

  // ── Sélection réponse ──
  const selectAnswer = useCallback((qId, key) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: key }));
  }, [submitted]);

  // ── Soumission quiz ──
  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) return;
    setCorrecting(true);

    const enrichedAnswers = questions.map(q => ({
      id: q.id,
      question: q.q,
      chosen: answers[q.id],
      chosenLabel: q.opts.find(o => o.k === answers[q.id])?.v || '',
      correct: q.correct,
      correctLabel: q.opts.find(o => o.k === q.correct)?.v || '',
      isCorrect: answers[q.id] === q.correct,
    }));

    const score = enrichedAnswers.filter(a => a.isCorrect).length;
    const pct   = Math.round((score / questions.length) * 100);
    const courseTitle = course?.titre || course?.title || 'Cours de français';

    // ── Correction via API (utilise VITE_API_URL, pas localhost hardcodé) ──
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    let correctionData;
    try {
      const res = await fetch(`${API_URL}/courses/correct-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName: displayName, courseTitle, answers: enrichedAnswers, lang: langKey }),
      });
      correctionData = await res.json();
    } catch {
      // Fallback local si l'API est indisponible
      correctionData = {
        score, total: questions.length, percentage: pct,
        encouragement: pct === 100 ? '🏆 Score parfait !' : `Score : ${score}/${questions.length}`,
        recommendation: pct < 70 ? 'Révisez la leçon et réessayez.' : 'Bonne maîtrise, continuez !',
        corrections: [],
      };
    }

    setCorrection({ ...correctionData, enrichedAnswers });

    const attempt = {
      date: new Date().toLocaleString('fr-FR'),
      score: correctionData.score,
      total: correctionData.total,
      percentage: correctionData.percentage,
    };
    setHistory(prev => [attempt, ...prev].slice(0, 10));

    // ── Soumission du score au backend (règle pédagogique ≥80 / ≤79) ──
    const quizPct = correctionData.percentage ?? pct;
    try {
      const scoreRes = await fetch(`${API_URL}/courses/${courseId}/submit-score`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${pb.authStore.token}`,
        },
        body: JSON.stringify({ score: quizPct }),
      });
      if (scoreRes.ok) {
        const decision = await scoreRes.json();
        setScoreDecision(decision);
        setLastScore(decision.score);
        if (decision.passed) {
          setModuleValidated(true);
          // Recharger l'enrollment mis à jour par le backend
          if (enrollment?.id) {
            try {
              const updated = await pb.collection('course_enrollments').getOne(enrollment.id, { requestKey: null });
              setEnrollment(updated);
            } catch {}
          }
        }
      }
    } catch (se) {
      console.error('[Score] submit-score error:', se.message);
      // Fallback local si le backend est indisponible
      if (enrollment?.id) {
        try {
          const newProg = Math.min(100, Math.round(70 + (quizPct * 0.3)));
          const updated = await pb.collection('course_enrollments').update(enrollment.id, {
            progression: Math.max(enrollment.progression || 0, newProg),
            complete:    newProg >= 100,
            last_activity: new Date().toISOString(),
          }, { requestKey: null });
          setEnrollment(updated);
        } catch {}
      }
    }

    setSubmitted(true);
    setCorrecting(false);
    setActiveTab('resultats');
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrection(null);
    setScoreDecision(null);
    // Toujours retourner aux exercices (l'étudiant peut retourner au cours manuellement)
    setActiveTab('exercices');
  };

  const restartFromLecture = () => {
    setAnswers({});
    setSubmitted(false);
    setCorrection(null);
    setScoreDecision(null);
    setCurrentPage(0);
    setActiveTab('lecture');
    // Réinitialiser la dernière page sauvegardée
    try { localStorage.setItem(`lastPage_${courseId}`, '0'); } catch {}
  };

  // ── Envoyer un message au tuteur IA ──
  const sendChatMessage = async () => {
    const msg = chatInput.trim();
    if (!msg || chatSending) return;
    setChatInput('');
    setChatSending(true);

    const userMsg = { role: 'user', content: msg };
    setChatMessages(prev => [...prev, userMsg]);

    // Extraire un résumé textuel léger (pas tout le HTML — trop lourd)
    // On prend juste les titres + 1ère page, max 1500 chars
    const courseContentText = pages
      .slice(0, 3)
      .map(p => `${p.title || ''}: ${(p.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400)}`)
      .join('\n')
      .slice(0, 1500);

    const VITE_API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    try {
      const res = await fetch(`${VITE_API}/courses/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message:       msg,
          courseTitle,
          courseContent: courseContentText,
          history:       chatMessages.slice(-10),
          lang:          langKey,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        // Réponse non-JSON (HTML 404, etc.) → l'API n'a pas encore le endpoint
        throw new Error(`Réponse invalide du serveur (status ${res.status}) — redémarrez l'API`);
      }

      const reply = data.reply || (data.error ? `⚠️ ${data.error}` : "Je n'ai pas pu répondre, réessayez.");
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      const errMsg = e?.message || '';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errMsg.includes('redémarrez')
          ? `⚠️ ${errMsg}`
          : '⚠️ Impossible de joindre le tuteur IA. Vérifiez que l\'API est démarrée (npm run dev dans apps/api).',
      }]);
    } finally {
      setChatSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  // ── Soumettre une demande de paiement (méthodes non-PayPal) ──
  const handlePayment = async () => {
    if (!currentUser || paymentLoading) return;
    setPaymentLoading(true);
    try {
      const courseTitle = course?.titre || course?.title || 'Formation IWS';
      const isPack = selectedPlan === 'pack';
      await pb.collection('orders').create({
        user_id:        currentUser.id,
        course_id:      isPack ? null : (courseId || null),
        total_price:    effectivePrice,
        payment_method: paymentMethod,
        status:         'pending',
        note: isPack
          ? `Pack 12 cours IWS — $${PRICE_PACK_12} (${paymentMethod})`
          : `Accès cours : ${courseTitle} — $${PRICE_INDIVIDUAL} (${paymentMethod})`,
      }, { requestKey: null });
      setPaymentSuccess(true);
      setTimeout(() => navigate('/dashboard/orders'), 3000);
    } catch (e) {
      console.error('Erreur création commande :', e);
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Titre dynamique ──
  const courseTitle = course?.titre || course?.title || 'Cours de français';
  const answeredCount = Object.keys(answers).length;
  const allAnswered   = questions.length > 0 && answeredCount === questions.length;

  // ── Loading ──
  if (hasAccess === null) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  // ── Mur de paiement — après 5 cours gratuits ──
  if (hasAccess === false) {
    const PAYMENT_METHODS = [
      { value: 'especes',   label: 'Espèces en agence IWS',      icon: Banknote,    desc: 'Payez directement à notre agence de Laâyoune' },
      { value: 'virement',  label: 'Virement bancaire',           icon: CreditCard,  desc: 'Virement vers notre compte Attijariwafa Bank' },
      { value: 'cmi',       label: 'Paiement en ligne (CMI)',     icon: CreditCard,  desc: 'Carte bancaire Visa / Mastercard sécurisée' },
      { value: 'cashplus',  label: 'Cash Plus / Wafacash',        icon: Smartphone,  desc: 'Transfert via agences Cash Plus ou Wafacash' },
      { value: 'paypal',    label: 'PayPal (paiement immédiat)',  icon: CreditCard,  desc: 'Visa, Mastercard ou compte PayPal — paiement en ligne sécurisé' },
    ];

    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-8 px-4">

          {/* ── Succès ── */}
          {paymentSuccess ? (
            <div className="text-center py-12 space-y-4 animate-in fade-in">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-black text-foreground">
                {paidViaPaypal ? 'Paiement confirmé !' : 'Demande envoyée !'}
              </h2>
              <p className="text-muted-foreground">
                {paidViaPaypal ? (
                  <>Votre paiement PayPal a été capturé avec succès.<br/>Votre accès sera activé très prochainement.</>
                ) : (
                  <>Votre demande de paiement a bien été enregistrée.<br/>Notre équipe vous contactera pour finaliser le paiement.</>
                )}
              </p>
              <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-sm text-emerald-700 font-medium">
                🔄 Redirection vers vos commandes dans quelques secondes…
              </div>
            </div>
          ) : (
            <>
              {/* ── En-tête ── */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <GraduationCap className="w-10 h-10 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> {totalEnrollments} cours gratuits utilisés sur 3
                </div>
                <h2 className="text-2xl font-black text-foreground leading-tight">
                  Continuez votre apprentissage 🚀
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Vous avez profité de vos <strong className="text-foreground">3 cours gratuits</strong>.<br/>
                  Pour accéder à <strong className="text-foreground">{courseTitle}</strong> et à la suite, choisissez votre offre ci-dessous.
                </p>
              </div>

              {/* ── Carte cours ── */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-4 mb-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">{courseTitle}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Formation continue — accès illimité</p>
                </div>
              </div>

              {/* ── Choix du plan tarifaire ── */}
              <div className="mb-5">
                <p className="text-sm font-bold text-foreground mb-3">Choisissez votre offre :</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* Option individuelle */}
                  <button
                    onClick={() => setSelectedPlan('individual')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all ${
                      selectedPlan === 'individual'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-card hover:border-primary/40'
                    }`}
                  >
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">1 cours</p>
                    <p className="text-2xl font-black text-primary">${PRICE_INDIVIDUAL.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Accès à ce cours uniquement</p>
                  </button>
                  {/* Pack 12 cours */}
                  <button
                    onClick={() => setSelectedPlan('pack')}
                    className={`rounded-2xl border-2 p-4 text-left transition-all relative overflow-hidden ${
                      selectedPlan === 'pack'
                        ? 'border-emerald-500 bg-emerald-50 shadow-md'
                        : 'border-border bg-card hover:border-emerald-400'
                    }`}
                  >
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      -16%
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Pack 12 cours</p>
                    <p className="text-2xl font-black text-emerald-600">${PRICE_PACK_12.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">≈ $4.08 / cours</p>
                  </button>
                </div>
              </div>

              {/* ── Choix méthode de paiement ── */}
              <div className="space-y-2 mb-6">
                <p className="text-sm font-bold text-foreground mb-3">Choisissez votre mode de paiement :</p>
                {PAYMENT_METHODS.map(m => {
                  const Icon = m.icon;
                  const selected = paymentMethod === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                        selected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-foreground'}`}>{m.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                        selected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                      }`}>
                        {selected && <div className="w-full h-full rounded-full bg-white scale-[0.45] block" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── Boutons / PayPal ── */}
              {paymentMethod === 'paypal' ? (
                <div className="space-y-3">
                  {/* Résumé de commande avant paiement */}
                  <div className="bg-muted rounded-xl px-4 py-3 text-sm text-center">
                    <span className="font-bold text-foreground">
                      {selectedPlan === 'pack' ? '🎁 Pack 12 cours' : '📚 1 cours'}
                    </span>
                    {' — '}
                    <span className="font-black text-primary text-base">${effectivePrice.toFixed(2)}</span>
                  </div>
                  <PayPalButton
                    amount={effectivePrice}
                    description={selectedPlan === 'pack'
                      ? `Pack 12 cours IWS — accès illimité`
                      : `Accès cours : ${courseTitle}`}
                    courseId={courseId || null}
                    userId={currentUser?.id || null}
                    orderType={selectedPlan === 'pack' ? 'pack_12' : 'formation'}
                    onSuccess={async ({ transactionId }) => {
                      // 1. Créer la commande complétée dans PocketBase
                      try {
                        await pb.collection('orders').create({
                          user_id:         currentUser.id,
                          course_id:       selectedPlan === 'pack' ? null : (courseId || null),
                          total_price:     effectivePrice,
                          payment_method:  'paypal',
                          status:          'completed',
                          note:            selectedPlan === 'pack'
                            ? `Pack 12 cours IWS — $${PRICE_PACK_12}`
                            : `Accès cours : ${courseTitle}`,
                          paypal_order_id: transactionId,
                          paid_at:         new Date().toISOString(),
                        }, { requestKey: null });
                      } catch (e) {
                        console.error('PB order creation after PayPal failed:', e);
                      }
                      // 2. Inscrire au cours (individuel) ou aux 12 premiers cours (pack)
                      if (selectedPlan === 'pack') {
                        try {
                          const allCourses = await pb.collection('courses').getFullList({
                            sort: '+created', fields: 'id', requestKey: null,
                          });
                          for (const c of allCourses.slice(0, 12)) {
                            await pb.collection('course_enrollments').create({
                              user_id: currentUser.id, course_id: c.id,
                              progression: 0, complete: false,
                              start_date: new Date().toISOString(),
                            }, { requestKey: null }).catch(() => {});
                          }
                        } catch { /* non-bloquant */ }
                      } else if (courseId) {
                        try {
                          await pb.collection('course_enrollments').create({
                            user_id: currentUser.id, course_id: courseId,
                            progression: 0, complete: false,
                            start_date: new Date().toISOString(),
                          }, { requestKey: null });
                        } catch { /* déjà inscrit */ }
                      }
                      setPaidViaPaypal(true);
                      setPaymentSuccess(true);
                      setTimeout(() => navigate('/dashboard/orders'), 3500);
                    }}
                    onError={(msg) => console.error('PayPal error:', msg)}
                    onCancel={() => setPaymentMethod('especes')}
                  />
                  <button
                    onClick={() => setPaymentMethod('especes')}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    ← Choisir un autre mode de paiement
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard/courses')}
                      className="rounded-xl flex-shrink-0"
                    >
                      Retour
                    </Button>
                    <Button
                      onClick={handlePayment}
                      disabled={paymentLoading}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl h-12 gap-2 shadow-lg shadow-primary/20 text-base"
                    >
                      {paymentLoading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours…</>
                        : <><CreditCard className="w-4 h-4" /> Confirmer la demande de paiement</>
                      }
                    </Button>
                  </div>

                  {/* ── Note ── */}
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    🔒 Votre demande sera traitée par notre équipe sous 24h. Aucun paiement en ligne immédiat.
                  </p>
                </>
              )}
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // RENDU PRINCIPAL
  // ─────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <Helmet><title>{courseTitle} — IWS Formation</title></Helmet>

      <div className="max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/courses')} className="gap-2 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-foreground">{courseTitle}</h1>
            <p className="text-xs text-muted-foreground">Grammaire Française</p>
          </div>
          <Badge variant="outline" className="border-emerald-400 text-emerald-700 bg-emerald-50 text-xs gap-1">
            <CheckCircle2 className="w-3 h-3" /> Accès actif
          </Badge>
        </div>

        {/* ── Progression indicator ── */}
        {(() => {
          const hasReadCourse  = pages.length === 0 || currentPage >= pages.length - 1 || pdfViewerUrl;
          const hasSubmitted   = submitted;
          const hasPerfect     = correction?.percentage === 100;
          const steps = [
            { label: 'Lecture',      done: hasReadCourse },
            { label: 'Exercices',    done: hasSubmitted  },
            { label: 'Score 100%',   done: hasPerfect    },
            { label: 'Dialogue IA',  done: hasPerfect    },
          ];
          return (
            <div className="flex items-center gap-1 px-1">
              {steps.map((s, i) => (
                <React.Fragment key={s.label}>
                  <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full transition-all ${
                    s.done ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'
                  }`}>
                    {s.done ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded-full ${s.done ? 'bg-emerald-300' : 'bg-border'}`} />}
                </React.Fragment>
              ))}
            </div>
          );
        })()}

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl">
          {(() => {
            const hasReadCourse = pages.length === 0 || currentPage >= pages.length - 1 || pdfViewerUrl;
            const hasPerfect    = correction?.percentage === 100;
            // Lecture toujours accessible ; Dialogue débloqué uniquement à 100%
            const tabs = [
              { key: 'lecture',   icon: BookOpen,      label: 'Lecture',     locked: false, lockMsg: '' },
              { key: 'exercices', icon: ClipboardList, label: 'Exercices',   locked: false, lockMsg: '' },
              { key: 'resultats', icon: BarChart3,     label: 'Résultats',
                locked: !submitted,
                lockMsg: 'Faites les exercices d\'abord' },
              { key: 'dialogue',  icon: MessageCircle, label: 'Dialogue IA',
                locked: !hasPerfect,
                lockMsg: !submitted ? 'Obtenez 100% aux exercices pour débloquer' : `Score actuel : ${correction?.percentage ?? 0}% — 100% requis` },
            ];
            return tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.locked) return;
                    setActiveTab(tab.key);
                  }}
                  title={tab.locked ? tab.lockMsg : ''}
                  disabled={tab.locked}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    tab.locked
                      ? 'text-muted-foreground/40 cursor-not-allowed'
                      : isActive
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.locked
                    ? <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    : <TabIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  }
                  <span className="truncate">{tab.label}</span>
                  {tab.key === 'resultats' && correction && !tab.locked && (
                    <span className={`text-xs font-black ${correction.percentage === 100 ? 'text-emerald-600' : correction.percentage >= 70 ? 'text-amber-600' : 'text-red-500'}`}>
                      {correction.percentage}%
                    </span>
                  )}
                  {tab.key === 'dialogue' && !tab.locked && (
                    <span className="text-xs bg-emerald-500 text-white px-1.5 rounded-full font-bold">✓</span>
                  )}
                </button>
              );
            });
          })()}
        </div>

        {/* ══ TAB : LECTURE — PDF direct (pas de pages structurées) ══ */}
        {activeTab === 'lecture' && pages.length === 0 && pdfViewerUrl && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Barre supérieure */}
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{courseTitle}</span>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                Document de cours
              </Badge>
            </div>
            {/* Filigrane + PDF viewer */}
            <div className="relative" style={{ height: '80vh' }}>
              {/* Filigrane discret */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="absolute text-indigo-400/10 font-black text-2xl whitespace-nowrap"
                    style={{ top:`${(i%3)*38}%`, left:`${Math.floor(i/3)*55-10}%`, transform:'rotate(-30deg)' }}>
                    {displayName} — IWS
                  </div>
                ))}
              </div>
              <iframe
                src={pdfViewerUrl}
                className="w-full h-full border-0"
                title={courseTitle}
                onContextMenu={e => e.preventDefault()}
              />
            </div>
            <div className="px-5 py-3 border-t border-border bg-muted/30 flex justify-end">
              <Button onClick={() => setActiveTab('exercices')} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                Faire les exercices <ClipboardList className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ══ TAB : LECTURE — aucune page et pas de PDF ══ */}
        {activeTab === 'lecture' && pages.length === 0 && !pdfViewerUrl && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center">
            <BookOpen className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
            <p className="font-semibold text-foreground mb-2">Contenu de la leçon à venir</p>
            <p className="text-sm text-muted-foreground">
              La leçon sera disponible prochainement.
              En attendant, vous pouvez accéder directement aux <strong>exercices</strong>.
            </p>
            <Button variant="outline" onClick={() => setActiveTab('exercices')} className="mt-4 gap-2 rounded-xl">
              <ClipboardList className="w-4 h-4" /> Aller aux exercices
            </Button>
          </div>
        )}

        {/* ══ TAB : LECTURE ══ */}
        {activeTab === 'lecture' && pages.length > 0 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 pt-4 pb-2 border-b border-border">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-muted-foreground">Page {currentPage + 1} sur {pages.length}</span>
                <span className="text-xs font-bold text-primary">{Math.round(((currentPage + 1) / pages.length) * 100)}%</span>
              </div>
              <Progress value={((currentPage + 1) / pages.length) * 100} className="h-1.5" />
            </div>

            <div ref={contentRef} className="relative p-6 sm:p-8 min-h-[420px] secure-content select-none">
              <div className="watermark-overlay">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="watermark-text" style={{ top:`${(i%4)*27-5}%`, left:`${Math.floor(i/4)*38-10}%` }}>
                    {displayName} — IWS {new Date().toLocaleDateString('fr-FR')}
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Cours</span>
                <h2 className="text-xl font-black text-foreground mt-0.5">{pages[currentPage]?.title}</h2>
              </div>
              {pages[currentPage]?.type === 'audio-drill'
                ? <AudioDrillPanel page={pages[currentPage]} />
                : <div className="lesson-content" dir={isRtl ? 'rtl' : 'ltr'}
                    dangerouslySetInnerHTML={{ __html: pages[currentPage]?.content || '' }} />
              }
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
              <Button variant="outline" onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="gap-2 rounded-xl">
                <ChevronLeft className="w-4 h-4" /> Précédent
              </Button>
              <div className="flex gap-1.5">
                {pages.map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === currentPage ? 'bg-primary w-5' : i < currentPage ? 'bg-primary/40' : 'bg-border'}`} />
                ))}
              </div>
              {currentPage < pages.length - 1 ? (
                <Button onClick={() => setCurrentPage(p => p + 1)} className="gap-2 rounded-xl bg-primary text-primary-foreground">
                  Suivant <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={() => setActiveTab('exercices')} className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                  Faire les exercices <ClipboardList className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ══ TAB : EXERCICES ══ */}
        {activeTab === 'exercices' && (
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <ClipboardList className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-semibold text-foreground mb-2">Aucun exercice disponible</p>
                <p className="text-sm text-muted-foreground">Les exercices seront ajoutés prochainement.</p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">{answeredCount} / {questions.length} réponses</p>
                    <Progress value={(answeredCount / questions.length) * 100} className="h-1.5 mt-1.5 w-48" />
                  </div>
                  {submitted ? (
                    <Button onClick={resetQuiz} variant="outline" className="gap-2 rounded-xl">
                      <RefreshCw className="w-4 h-4" /> Réessayer
                    </Button>
                  ) : (
                    <Button onClick={submitQuiz} disabled={!allAnswered || correcting}
                      className="gap-2 rounded-xl bg-primary text-primary-foreground font-bold">
                      {correcting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {correcting ? 'Correction IA…' : 'Soumettre'}
                    </Button>
                  )}
                </div>

                {!allAnswered && !submitted && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Répondez à toutes les questions avant de soumettre.
                  </div>
                )}

                <div className="space-y-3 secure-content">
                  {questions.map((q, idx) => {
                    const selected  = answers[q.id];
                    const isCorrect = selected === q.correct;
                    return (
                      <div key={q.id} className={`bg-card border rounded-2xl p-5 transition-all ${
                        submitted ? isCorrect ? 'border-emerald-300 bg-emerald-50/30' : 'border-red-300 bg-red-50/20'
                          : 'border-border hover:border-primary/30'
                      }`}>
                        <div className="flex items-start gap-3 mb-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                            submitted ? isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              : selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>{idx + 1}</span>
                          <p className="font-semibold text-foreground text-sm leading-relaxed">{q.q}</p>
                          {submitted && (isCorrect
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 ml-auto" />
                            : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-auto" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {q.opts.map(opt => {
                            const isSelected = selected === opt.k;
                            const isRight    = opt.k === q.correct;
                            let cls = 'border-border bg-muted/30 text-foreground hover:border-primary/50 hover:bg-primary/5';
                            if (submitted) {
                              if (isRight)              cls = 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold';
                              else if (isSelected)      cls = 'border-red-400 bg-red-50 text-red-800 line-through';
                              else                      cls = 'border-border bg-muted/10 text-muted-foreground';
                            } else if (isSelected) {   cls = 'border-primary bg-primary/10 text-primary font-bold'; }
                            return (
                              <button key={opt.k} onClick={() => selectAnswer(q.id, opt.k)} disabled={submitted}
                                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all text-left ${cls}`}>
                                <span className="w-5 h-5 rounded-full border-current border flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {opt.k}
                                </span>
                                {opt.v}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!submitted && (
                  <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
                    <p className="text-sm font-bold text-foreground">{answeredCount} / {questions.length} réponses</p>
                    <Button onClick={submitQuiz} disabled={!allAnswered || correcting}
                      className="gap-2 rounded-xl bg-primary text-primary-foreground font-bold">
                      {correcting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {correcting ? 'Correction IA…' : 'Soumettre'}
                    </Button>
                  </div>
                )}

                {submitted && (
                  <div className="text-center pt-2">
                    <Button onClick={() => setActiveTab('resultats')} className="bg-primary text-primary-foreground font-bold rounded-xl gap-2">
                      <BarChart3 className="w-4 h-4" /> Voir mes résultats
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══ TAB : DIALOGUE IA ══ */}
        {activeTab === 'dialogue' && correction?.percentage !== 100 && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="text-lg font-black text-foreground">Dialogue IA verrouillé</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Pour accéder au tuteur IA, vous devez d'abord obtenir <strong className="text-foreground">100%</strong> aux exercices.
              {correction && <><br/><span className="text-amber-600 font-semibold">Votre score actuel : {correction.percentage}%</span></>}
            </p>
            <div className="flex gap-3 justify-center pt-2">
              {!submitted ? (
                <Button onClick={() => setActiveTab('exercices')} className="gap-2 rounded-xl bg-primary text-primary-foreground">
                  <ClipboardList className="w-4 h-4" /> Faire les exercices
                </Button>
              ) : (
                <>
                  <Button onClick={resetQuiz} variant="outline" className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Réessayer (obtenir 100%)
                  </Button>
                  <Button onClick={() => { setActiveTab('lecture'); setCurrentPage(0); }} className="gap-2 rounded-xl bg-primary text-primary-foreground">
                    <BookOpen className="w-4 h-4" /> Réviser le cours
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'dialogue' && correction?.percentage === 100 && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ height: '72vh' }}>
            {/* Header */}
            <div className="px-5 py-3 border-b border-border bg-emerald-50/50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  IWS IA — Tuteur <span className="text-xs bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded-full font-black">🏆 100%</span>
                </p>
                <p className="text-xs text-muted-foreground">Basé sur : {courseTitle}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-emerald-600 font-medium">En ligne</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollBehavior: 'smooth' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatSending && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mr-2">
                    <Brain className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0,1,2].map(d => (
                      <span key={d} className="w-2 h-2 rounded-full bg-primary/40 animate-bounce"
                        style={{ animationDelay: `${d * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-muted/20">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
                  placeholder="Écrivez votre message… (Entrée pour envoyer)"
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 placeholder:text-muted-foreground"
                  disabled={chatSending}
                />
                <button
                  onClick={sendChatMessage}
                  disabled={chatSending || !chatInput.trim()}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 hover:bg-primary/90 disabled:opacity-40 transition-all"
                >
                  {chatSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                💡 Essayez : "Explique-moi la règle principale" · "Donne-moi un exercice" · "Corrige ma phrase"
              </p>
            </div>
          </div>
        )}

        {/* ══ TAB : RÉSULTATS ══ */}
        {activeTab === 'resultats' && (
          <div className="space-y-4">
            {!correction ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <BarChart3 className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <p className="font-semibold text-foreground mb-2">Aucun résultat encore</p>
                <p className="text-sm text-muted-foreground mb-5">Complétez les exercices pour voir vos résultats.</p>
                <Button onClick={() => setActiveTab('exercices')} className="bg-primary text-primary-foreground rounded-xl gap-2">
                  <ClipboardList className="w-4 h-4" /> Aller aux exercices
                </Button>
              </div>
            ) : (
              <>
                <div className={`rounded-2xl border-2 p-6 text-center ${
                  correction.percentage === 100 ? 'border-yellow-400 bg-yellow-50' :
                  correction.percentage >= 70 ? 'border-emerald-400 bg-emerald-50' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="text-6xl mb-3">
                    {correction.percentage === 100 ? '🏆' : correction.percentage >= 70 ? '🎉' : '📚'}
                  </div>
                  <div className={`text-5xl font-black mb-1 ${
                    correction.percentage === 100 ? 'text-yellow-600' :
                    correction.percentage >= 70 ? 'text-emerald-600' : 'text-red-600'
                  }`}>{correction.percentage}%</div>
                  <p className="text-lg font-bold text-foreground">{correction.score} / {correction.total}</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {correction.percentage === 100 ? 'Excellent ! Score parfait !' :
                     correction.percentage >= 70 ? 'Bon travail !' : 'Révisez et réessayez.'}
                  </p>
                </div>

                {correction.encouragement && (
                  <div className="bg-card border border-border rounded-2xl p-5 flex gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">IA — Correction intelligente</p>
                      <p className="font-semibold text-foreground">{correction.encouragement}</p>
                      {correction.recommendation && <p className="text-sm text-muted-foreground mt-1">{correction.recommendation}</p>}
                    </div>
                  </div>
                )}

                {correction.enrichedAnswers && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-primary" /> Correction détaillée
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {correction.enrichedAnswers.map((a, i) => {
                        const aiCorrection = correction.corrections?.find(c => c.id === a.id);
                        return (
                          <div key={a.id} className={`p-4 ${a.isCorrect ? 'bg-emerald-50/30' : 'bg-red-50/20'}`}>
                            <div className="flex items-start gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${a.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground mb-1">{a.question}</p>
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {!a.isCorrect && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">✗ {a.chosenLabel}</span>}
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">✓ {a.correctLabel}</span>
                                </div>
                                {aiCorrection && (
                                  <div className="mt-2 bg-white border border-border rounded-lg p-2.5">
                                    <p className="text-xs text-muted-foreground">{aiCorrection.explanation}</p>
                                    {aiCorrection.tip && <p className="text-xs text-primary font-medium mt-1">💡 {aiCorrection.tip}</p>}
                                  </div>
                                )}
                              </div>
                              {a.isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {history.length > 1 && (
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border">
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Historique des tentatives
                      </h3>
                    </div>
                    <div className="divide-y divide-border">
                      {history.map((h, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">Tentative {history.length - i}</p>
                            <p className="text-xs text-muted-foreground">{h.date}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`text-lg font-black ${h.percentage >= 70 ? 'text-emerald-600' : 'text-red-500'}`}>{h.percentage}%</div>
                            <Badge variant="outline" className={`text-xs ${h.percentage >= 70 ? 'border-emerald-300 text-emerald-700' : 'border-red-300 text-red-700'}`}>
                              {h.score}/{h.total}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Résultat de la tentative ── */}
                {correction && (
                  <div className={`rounded-2xl border-2 p-5 ${
                    correction.percentage === 100
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-amber-400 bg-amber-50 dark:bg-amber-950/20'
                  }`}>
                    <p className={`font-black text-lg mb-1 ${correction.percentage === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {correction.percentage === 100 ? '🎉 Parfait ! 100% obtenu !' : `📊 Score : ${correction.percentage}%`}
                    </p>
                    <p className="text-sm text-foreground/80">
                      {correction.percentage === 100
                        ? 'Félicitations ! Vous pouvez maintenant pratiquer avec le tuteur IA.'
                        : 'Continuez à pratiquer pour atteindre 100% et débloquer le dialogue IA.'}
                    </p>
                    {history.length >= 3 && correction.percentage < 100 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {history.length} tentative{history.length > 1 ? 's' : ''} effectuée{history.length > 1 ? 's' : ''} — vous pouvez reprendre le cours depuis le début si besoin.
                      </p>
                    )}
                  </div>
                )}

                {/* ── Boutons selon la progression ── */}
                <div className="flex flex-wrap gap-3 justify-center pb-4">
                  {/* Toujours : refaire les exercices */}
                  <Button onClick={resetQuiz} variant="outline" className="gap-2 rounded-xl">
                    <RefreshCw className="w-4 h-4" /> Refaire les exercices
                  </Button>

                  {/* 100% obtenu → accès au dialogue + cours suivant */}
                  {correction?.percentage === 100 && (
                    <>
                      <Button
                        onClick={() => setActiveTab('dialogue')}
                        className="gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <MessageCircle className="w-4 h-4" /> Pratiquer avec l'IA
                      </Button>
                      {nextCourse ? (
                        <Button
                          onClick={() => navigate(`/dashboard/courses/${nextCourse.id}/view`)}
                          className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                        >
                          Cours suivant <ChevronRightIcon className="w-4 h-4" />
                          <span className="text-xs opacity-80 truncate max-w-[120px]">
                            {nextCourse.titre || nextCourse.title}
                          </span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => navigate('/dashboard/courses')}
                          className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                        >
                          <GraduationCap className="w-4 h-4" /> Tous les cours
                        </Button>
                      )}
                    </>
                  )}

                  {/* ≥ 3 tentatives sans 100% → bouton retour au cours */}
                  {history.length >= 3 && correction?.percentage !== 100 && (
                    <Button
                      onClick={restartFromLecture}
                      className="gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                      <BookOpen className="w-4 h-4" /> Refaire le cours depuis le début
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SecureCourseViewer;
