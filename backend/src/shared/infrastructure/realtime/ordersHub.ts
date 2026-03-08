import type { Response } from 'express';

export type KitchenOrder = {
  id: string;
  tenantId: string;
  tableId?: string;
  tableLabel?: string;
  items: Array<{ name: string; quantity: number; notes?: string }>;
  status: 'NEW' | 'IN_PROGRESS' | 'DONE';
  createdAt: string;
};

const subscribers = new Map<string, Set<Response>>();

export function addKitchenSubscriber(tenantId: string, res: Response) {
  const set = subscribers.get(tenantId) || new Set<Response>();
  set.add(res);
  subscribers.set(tenantId, set);
}

export function removeKitchenSubscriber(tenantId: string, res: Response) {
  const set = subscribers.get(tenantId);
  if (!set) return;
  set.delete(res);
  if (!set.size) {
    subscribers.delete(tenantId);
  }
}

export function publishKitchenOrder(tenantId: string, order: KitchenOrder) {
  const set = subscribers.get(tenantId);
  if (!set) return;
  const payload = `event: order\ndata: ${JSON.stringify(order)}\n\n`;
  set.forEach((res) => {
    res.write(payload);
  });
}
