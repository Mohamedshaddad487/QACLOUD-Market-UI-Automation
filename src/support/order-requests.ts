import type { Request } from '@playwright/test';

function pathOf(request: Request): string {
  return new URL(request.url()).pathname;
}

export function isOrdersRead(request: Request): boolean {
  return request.method() === 'GET' && pathOf(request) === '/api/orders';
}

export function isOrderCreate(request: Request): boolean {
  return request.method() === 'POST' && pathOf(request) === '/api/orders';
}

export function isOrderDelete(request: Request): boolean {
  return request.method() === 'DELETE' && pathOf(request).startsWith('/api/orders/');
}

export function isOrderStatusUpdate(request: Request): boolean {
  return request.method() === 'PUT' && pathOf(request).startsWith('/api/orders/');
}
