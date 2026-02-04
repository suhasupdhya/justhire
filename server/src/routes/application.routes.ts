import { Router } from 'express';
import multer from 'multer';
import { applyForJob, getMyApplications, getJobApplications, getApplicationById } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/apply', authenticate, upload.single('resume'), applyForJob);
router.get('/my-applications', authenticate, getMyApplications);
router.get('/job/:jobId', authenticate, getJobApplications);
router.get('/:id', authenticate, getApplicationById);

export default router;
