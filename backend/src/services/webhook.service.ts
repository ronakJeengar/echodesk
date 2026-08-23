import crypto from 'crypto';
import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';

export interface WebhookPayload {
  id: string;
  event: string;
  timestamp: string;
  workspaceId: string;
  data: any;
}

export class WebhookService {
  /**
   * Create a new webhook subscription for a workspace
   */
  public async createSubscription(workspaceId: string, url: string, events: string[]) {
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const subscription = await prisma.webhookSubscription.create({
      data: {
        workspaceId,
        url,
        secret,
        events: events.length > 0 ? events : ['recording.completed', 'job.created'],
        isActive: true,
      },
    });

    return subscription;
  }

  /**
   * List all webhook subscriptions for a workspace
   */
  public async getSubscriptions(workspaceId: string) {
    return prisma.webhookSubscription.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete a webhook subscription
   */
  public async deleteSubscription(id: string, workspaceId: string) {
    return prisma.webhookSubscription.deleteMany({
      where: { id, workspaceId },
    });
  }

  /**
   * Dispatch an event to all active webhooks subscribed to this event
   */
  public async dispatch(workspaceId: string, event: string, data: any) {
    try {
      const subscriptions = await prisma.webhookSubscription.findMany({
        where: {
          workspaceId,
          isActive: true,
          events: { has: event },
        },
      });

      if (subscriptions.length === 0) return;

      const payload: WebhookPayload = {
        id: `evt_${crypto.randomUUID()}`,
        event,
        timestamp: new Date().toISOString(),
        workspaceId,
        data,
      };

      const payloadString = JSON.stringify(payload);

      for (const sub of subscriptions) {
        this.sendWebhook(sub.url, sub.secret, event, payloadString).catch((err) => {
          logger.warn(`Failed to dispatch webhook to ${sub.url}: ${err.message}`);
        });
      }
    } catch (err: any) {
      logger.error(`Webhook dispatch error for event '${event}': ${err.message}`);
    }
  }

  /**
   * Helper to send single HTTP webhook with HMAC-SHA256 signature using native fetch
   */
  private async sendWebhook(url: string, secret: string, event: string, payloadString: string) {
    const signature = crypto
      .createHmac('sha256', secret)
      .update(payloadString)
      .digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-EchoDesk-Signature': `sha256=${signature}`,
          'X-EchoDesk-Event': event,
          'User-Agent': 'EchoDesk-Webhook-Dispatcher/1.0',
        },
        body: payloadString,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Test Ping a webhook URL
   */
  public async testPing(url: string, secret?: string) {
    const testSecret = secret || 'whsec_test_ping_secret';
    const payload: WebhookPayload = {
      id: `evt_test_${crypto.randomUUID()}`,
      event: 'ping',
      timestamp: new Date().toISOString(),
      workspaceId: 'test-workspace',
      data: {
        message: 'EchoDesk Webhook Connection Test Successful 🚀',
      },
    };

    const payloadString = JSON.stringify(payload);
    const signature = crypto
      .createHmac('sha256', testSecret)
      .update(payloadString)
      .digest('hex');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-EchoDesk-Signature': `sha256=${signature}`,
          'X-EchoDesk-Event': 'ping',
          'User-Agent': 'EchoDesk-Webhook-Dispatcher/1.0',
        },
        body: payloadString,
        signal: controller.signal,
      });

      return {
        success: response.ok,
        statusCode: response.status,
        message: `Received HTTP ${response.status} from endpoint.`,
      };
    } catch (err: any) {
      return {
        success: false,
        statusCode: 500,
        message: err.message || 'Failed to reach webhook URL',
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const webhookService = new WebhookService();
