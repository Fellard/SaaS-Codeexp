import { Router } from 'express';
import healthCheck from './health-check.js';
import aiChatRouter from './aiChat.js';
import coursesRouter from './courses.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';
import webAgencyRouter from './webAgency.js';
import paypalRouter from './paypal.js';
import ordersRouter from './orders.js';

const router = Router();

export default () => {
  router.get('/health', healthCheck);
  router.use('/ai-chat', aiChatRouter);
  router.use('/courses', coursesRouter);
  router.use('/auth', authRouter);
  router.use('/api/auth', authRouter);        // pour les liens email approve/reject
  router.use('/admin', adminRouter);          // routes admin (delete étudiant, etc.)
  router.use('/web-agency', webAgencyRouter); // IA Web Agency
  router.use('/paypal', paypalRouter);        // PayPal Checkout
  router.use('/orders', ordersRouter);        // Orders management (cancel, mark-paid)

  return router;
};
