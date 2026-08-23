import { Router } from 'express';
import {
  JobsController,
  createJobSchema,
  updateJobSchema,
} from '../controllers/jobs.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const jobsRouter = Router();

jobsRouter.use(authenticate);

jobsRouter.get('/', JobsController.list);
jobsRouter.post('/', validate({ body: createJobSchema }), JobsController.create);
jobsRouter.get('/:id', JobsController.getById);
jobsRouter.patch('/:id', validate({ body: updateJobSchema }), JobsController.update);
