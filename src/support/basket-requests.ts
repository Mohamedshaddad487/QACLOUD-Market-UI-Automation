import type { Page, Request, Response } from '@playwright/test';

function pathOf(request: Request): string {
  return new URL(request.url()).pathname;
}

export function isBasketRead(request: Request): boolean {
  return request.method() === 'GET' && pathOf(request) === '/api/basket';
}

export function isBasketAdd(request: Request): boolean {
  return request.method() === 'POST' && pathOf(request) === '/api/basket';
}

export function isBasketQuantityUpdate(request: Request): boolean {
  return request.method() === 'PUT' && pathOf(request) === '/api/basket';
}

export function isBasketLineRemoval(request: Request): boolean {
  const path = pathOf(request);
  return request.method() === 'DELETE' && path.startsWith('/api/basket/') && path !== '/api/basket/clear';
}

export function isBasketClear(request: Request): boolean {
  return request.method() === 'DELETE' && pathOf(request) === '/api/basket/clear';
}

export function isBasketWrite(request: Request): boolean {
  return request.method() !== 'GET' && pathOf(request).startsWith('/api/basket');
}

export async function awaitRequestFrom(
  page: Page,
  predicate: (request: Request) => boolean,
  action: () => Promise<void>,
): Promise<Response> {
  const requestPromise = page.waitForRequest(predicate);
  requestPromise.catch(() => undefined);

  await action();

  const request = await requestPromise;
  const response = await request.response();
  if (!response) {
    throw new Error(`${request.method()} ${pathOf(request)} failed without a response.`);
  }
  const failure = await response.finished();
  if (failure) {
    throw new Error(`${request.method()} ${pathOf(request)} did not complete: ${failure.message}`);
  }
  return response;
}

export function recordRequests(page: Page, predicate: (request: Request) => boolean): () => string[] {
  const seen: string[] = [];
  const onRequest = (request: Request): void => {
    if (predicate(request)) seen.push(`${request.method()} ${pathOf(request)}`);
  };
  page.on('request', onRequest);
  return () => {
    page.off('request', onRequest);
    return seen;
  };
}
