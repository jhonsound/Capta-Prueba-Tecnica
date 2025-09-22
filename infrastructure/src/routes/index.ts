
import { Router } from 'express';
import { getCalculatedDate } from '../controllers/dateCalculator.controller';

const router = Router();

router.get('/calculate', getCalculatedDate);

export default router;