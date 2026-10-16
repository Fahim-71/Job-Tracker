import { Router } from 'express';
import {
  listApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/stats', getStats); // must stay above '/:id'
router.route('/').get(listApplications).post(createApplication);
router.route('/:id').get(getApplication).patch(updateApplication).delete(deleteApplication);

export default router;
