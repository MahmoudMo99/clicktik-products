import { HttpErrorResponse } from '@angular/common/http';

const INVALID_LOGIN_STATUS_CODES = new Set([400, 401]);

export function getLoginErrorMessage(error: unknown): string {
  if (isInvalidLoginError(error)) {
    return 'Invalid username or password.';
  }

  return 'Something went wrong. Please try again.';
}

function isInvalidLoginError(error: unknown): boolean {
  return error instanceof HttpErrorResponse && INVALID_LOGIN_STATUS_CODES.has(error.status);
}
