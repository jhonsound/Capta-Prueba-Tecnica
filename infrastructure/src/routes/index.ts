import { Router } from 'express';
import { getCalculatedDate } from '../controllers/date.controller';

const router = Router();

router.get('/calculate', getCalculatedDate);

export default router;
