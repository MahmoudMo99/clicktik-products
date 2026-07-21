export const AUTHENTICATED_HOME_URL = '/products';

const LOGIN_URL = '/login';

export function getPostLoginRedirectUrl(returnUrl: string | null): string {
  if (returnUrl && isSafeInternalUrl(returnUrl) && !returnUrl.startsWith(LOGIN_URL)) {
    return returnUrl;
  }

  return AUTHENTICATED_HOME_URL;
}

function isSafeInternalUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
