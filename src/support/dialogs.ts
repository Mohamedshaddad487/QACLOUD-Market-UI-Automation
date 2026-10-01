import type { Dialog, Page } from '@playwright/test';

export type DialogDecision = 'accept' | 'dismiss';

export type HandledDialog = {
  message: string;
  type: string;
  decision: DialogDecision;
};

let activeScopedHandlers = 0;

export async function withNativeDialog(
  page: Page,
  decision: DialogDecision,
  action: () => Promise<void>,
): Promise<HandledDialog> {
  let handled: HandledDialog | undefined;
  let secondDialog: string | undefined;

  const onDialog = (dialog: Dialog): void => {
    if (handled) {
      secondDialog = dialog.message();
      void dialog.dismiss();
      return;
    }
    handled = { message: dialog.message(), type: dialog.type(), decision };
    void (decision === 'accept' ? dialog.accept() : dialog.dismiss());
  };

  page.on('dialog', onDialog);
  activeScopedHandlers += 1;
  try {
    await action();
  } finally {
    activeScopedHandlers -= 1;
    page.off('dialog', onDialog);
  }

  if (secondDialog !== undefined) {
    throw new Error(`Unexpected second native dialog during the same action: "${secondDialog}"`);
  }
  if (!handled) {
    throw new Error(
      'Expected a native dialog during this action, but none appeared. The action may have ' +
        'silently done nothing, or the application may no longer use a native confirm() here.',
    );
  }
  return handled;
}

export function failOnUnexpectedDialogs(page: Page): () => void {
  const unexpected: string[] = [];

  const onDialog = (dialog: Dialog): void => {
    if (activeScopedHandlers > 0) return;
    unexpected.push(`${dialog.type()}: "${dialog.message()}"`);
    void dialog.dismiss();
  };

  page.on('dialog', onDialog);

  return () => {
    page.off('dialog', onDialog);
    if (unexpected.length > 0) {
      throw new Error(`Unexpected native dialog(s) appeared during this test:\n  ${unexpected.join('\n  ')}`);
    }
  };
}
