import { Router } from 'express';
import {
  TasksController,
  createTaskSchema,
  updateTaskSchema,
} from '../controllers/tasks.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get('/', TasksController.list);
tasksRouter.post('/', validate({ body: createTaskSchema }), TasksController.create);
tasksRouter.patch('/:id', validate({ body: updateTaskSchema }), TasksController.update);
tasksRouter.patch('/:id/toggle', TasksController.toggleStatus);
