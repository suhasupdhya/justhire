import { Router } from 'express';
import { createJob, getJobs, getJobById } from '../controllers/job.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createJob);
router.get('/', authenticate, getJobs); // Authenticated just to see list? Or public? Let's keep auth for now.
router.get('/:id', authenticate, getJobById);

export default router;
