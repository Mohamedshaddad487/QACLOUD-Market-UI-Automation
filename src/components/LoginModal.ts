import type { Locator, Page, Request, Response } from '@playwright/test';
import { awaitRequestFrom } from '../support/basket-requests';

function isLoginSubmit(request: Request): boolean {
  return request.method() === 'POST' && new URL(request.url()).pathname === '/api/login';
}

export class LoginModal {
  readonly page: Page;
  private readonly loginForm: Locator;
  private readonly loginTabButton: Locator;
  readonly usernameOrEmailField: Locator;
  private readonly passwordField: Locator;
  private readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly resetPasswordHeading: Locator;
  readonly resetEmailField: Locator;
  readonly sendResetLinkButton: Locator;
  readonly backToLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginTabButton = page.getByRole('button', { name: 'Login', exact: true });
    this.loginForm = page.locator('#loginForm');
    this.usernameOrEmailField = this.loginForm.getByRole('textbox', { name: 'Username or Email' });
    this.passwordField = this.loginForm.locator('input[type="password"]');
    this.submitButton = this.loginForm.locator('button[type="submit"]');
    this.forgotPasswordLink = page.getByText('Forgot password?');
    this.resetPasswordHeading = page.getByText('Reset Password', { exact: true });
    this.resetEmailField = page.locator('#forgotEmail');
    this.sendResetLinkButton = page.getByRole('button', { name: 'Send Reset Link' });
    this.backToLoginLink = page.getByRole('link', { name: '← Back to Login' });
  }

  async switchToLoginTab(): Promise<void> {
    await this.loginTabButton.click();
  }

  async login(identifier: string, password: string): Promise<void> {
    await this.usernameOrEmailField.fill(identifier);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async loginAndAwaitResponse(identifier: string, password: string): Promise<Response> {
    await this.usernameOrEmailField.fill(identifier);
    await this.passwordField.fill(password);
    return awaitRequestFrom(this.page, isLoginSubmit, () => this.submitButton.click());
  }

  async openForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async backToLogin(): Promise<void> {
    await this.backToLoginLink.click();
  }
}
