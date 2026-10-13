const ACCESS_TOKEN_KEY = 'jagyeok:access-token';

export type GoogleLoginResponse = {
  user: {
    id: string;
    email: string;
  };
  profile_completed: boolean;
  calendar_connected: boolean;
  access_token: string;
  token_type: string;
  expires_in: number;
};

export class AuthApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

function apiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  }
  return `${baseUrl.replace(/\/+$/, '')}${path}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
    });
  } catch (error) {
    throw new Error('백엔드 서버에 연결할 수 없습니다. API 주소와 서버 상태를 확인해주세요.', {
      cause: error,
    });
  }

  if (!response.ok) {
    let message = `인증 요청에 실패했습니다. (${response.status})`;
    try {
      const body: unknown = await response.json();
      if (
        body &&
        typeof body === 'object' &&
        'detail' in body &&
        typeof body.detail === 'string'
      ) {
        message = body.detail;
      } else if (
        body &&
        typeof body === 'object' &&
        'error' in body &&
        body.error &&
        typeof body.error === 'object' &&
        'message' in body.error &&
        typeof body.error.message === 'string'
      ) {
        message = body.error.message;
      }
    } catch {
      // Keep the status-based message when the server does not return JSON.
    }
    throw new AuthApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function getGoogleAuthorizationUrl(): Promise<string> {
  const result = await request<{ authorization_url: string }>('/auth/google/authorize');
  if (!result.authorization_url) {
    throw new Error('백엔드 응답에 Google 로그인 주소가 없습니다.');
  }
  return result.authorization_url;
}

export async function completeGoogleLogin(
  code: string,
  state: string,
): Promise<GoogleLoginResponse> {
  const result = await request<GoogleLoginResponse>('/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, state }),
  });
  if (!result.access_token) {
    throw new Error('백엔드 응답에 액세스 토큰이 없습니다.');
  }
  return result;
}

export async function refreshAccessToken(): Promise<string> {
  const result = await request<{ access_token: string }>('/auth/refresh', {
    method: 'POST',
  });
  if (!result.access_token) {
    throw new Error('백엔드 응답에 액세스 토큰이 없습니다.');
  }
  return result.access_token;
}

export function saveAccessToken(token: string): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}
