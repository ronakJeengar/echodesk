import { Router } from 'express';
import {
  CustomersController,
  createCustomerSchema,
} from '../controllers/customers.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

export const customersRouter = Router();

customersRouter.use(authenticate);

customersRouter.get('/', CustomersController.list);
customersRouter.post('/', validate({ body: createCustomerSchema }), CustomersController.create);
customersRouter.get('/:id', CustomersController.getById);
customersRouter.get('/:id/timeline', CustomersController.getTimeline);
