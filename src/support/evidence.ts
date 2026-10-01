import type { ConsoleMessage, Page, Response, TestInfo } from '@playwright/test';

export async function attachFailureEvidence(page: Page, testInfo: TestInfo): Promise<() => Promise<void>> {
  const consoleErrors: string[] = [];
  const failedResponses: string[] = [];

  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  };
  const onResponse = (response: Response) => {
    if (response.status() >= 400) {
      failedResponses.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  };

  page.on('console', onConsole);
  page.on('response', onResponse);

  return async () => {
    page.off('console', onConsole);
    page.off('response', onResponse);

    if (testInfo.status !== testInfo.expectedStatus) {
      if (consoleErrors.length > 0) {
        await testInfo.attach('console-errors', { body: consoleErrors.join('\n'), contentType: 'text/plain' });
      }
      if (failedResponses.length > 0) {
        await testInfo.attach('failed-network-responses', { body: failedResponses.join('\n'), contentType: 'text/plain' });
      }
    }
  };
}
