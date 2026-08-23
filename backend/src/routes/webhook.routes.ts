import { Router, Response } from 'express';
import { authenticate, requireWorkspace } from '../middlewares/auth.middleware.js';
import { AuthenticatedRequest } from '../types/index.js';
import { webhookService } from '../services/webhook.service.js';

export const webhookRouter = Router();

// Require authentication and workspace context for all webhook routes
webhookRouter.use(authenticate as any);
webhookRouter.use(requireWorkspace as any);

/**
 * GET /api/v1/workspaces/webhooks
 * List all configured webhooks for the workspace
 */
webhookRouter.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const workspaceId = req.workspaceId!;
  const webhooks = await webhookService.getSubscriptions(workspaceId);

  res.json({
    success: true,
    data: { webhooks },
  });
});

/**
 * POST /api/v1/workspaces/webhooks
 * Create a new webhook subscription
 */
webhookRouter.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const workspaceId = req.workspaceId!;
  const { url, events } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    res.status(400).json({
      success: false,
      message: 'A valid HTTPS/HTTP webhook URL is required',
    });
    return;
  }

  const webhook = await webhookService.createSubscription(
    workspaceId,
    url,
    Array.isArray(events) ? events : ['recording.completed', 'job.created']
  );

  res.status(201).json({
    success: true,
    data: { webhook },
    message: 'Webhook subscription created successfully',
  });
});

/**
 * POST /api/v1/workspaces/webhooks/test-ping
 * Test an endpoint URL by firing an HMAC test ping
 */
webhookRouter.post('/test-ping', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { url, secret } = req.body;

  if (!url || typeof url !== 'string') {
    res.status(400).json({
      success: false,
      message: 'URL is required for test ping',
    });
    return;
  }

  const result = await webhookService.testPing(url, secret);

  res.json({
    success: result.success,
    data: result,
  });
});

/**
 * DELETE /api/v1/workspaces/webhooks/:id
 * Delete a webhook subscription
 */
webhookRouter.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const workspaceId = req.workspaceId!;
  const id = req.params.id as string;

  await webhookService.deleteSubscription(id, workspaceId);

  res.json({
    success: true,
    message: 'Webhook deleted successfully',
  });
});

export default webhookRouter;
