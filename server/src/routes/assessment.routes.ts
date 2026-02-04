import { Router } from 'express';
import { startAssessment, submitAssessment, executeCode, logIntegrity } from '../controllers/assessment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/start', authenticate, startAssessment);
router.post('/submit', authenticate, submitAssessment);
router.post('/execute', authenticate, executeCode);
router.post('/log-integrity', authenticate, logIntegrity);

export default router;
