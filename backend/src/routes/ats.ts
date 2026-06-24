import { Router } from 'express';
import multer from 'multer';
import { scoreATS } from '../controllers/atsScoreController';
import { authenticate } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  },
});

const router = Router();

router.use(authenticate);
router.post('/score', upload.single('resume'), scoreATS);

export default router;