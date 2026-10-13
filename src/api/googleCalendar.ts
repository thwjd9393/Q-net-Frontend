import type { CertificateSchedule } from './certificates';

export type CalendarEventType = 'registration' | 'written_exam' | 'practical_exam' | 'result';
export type CalendarRegistrationResult = {
  registration_id: string;
  status: 'completed' | 'partial' | 'failed' | 'pending_confirmation';
  items: {
    item_key: string;
    event_type: CalendarEventType;
    status: 'created' | 'already_registered' | 'failed' | 'unknown';
    google_event_id: string | null;
    html_link: string | null;
    code: string | null;
    message: string | null;
    retryable: boolean;
  }[];
  excluded_items: { event_type: CalendarEventType; reason: string; schedule_id?: string | null }[];
  message: string;
};

export class CalendarApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'CalendarApiError';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, {
      ...init, credentials: 'include',
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new Error('Calendar 서버에 연결할 수 없습니다. 다시 시도해주세요.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(' ')
      : detail?.message;
    throw new CalendarApiError(`${message || 'Calendar 요청에 실패했습니다.'} (HTTP ${response.status}${detail?.code ? ` · ${detail.code}` : ''})`, response.status);
  }
  if (!data) throw new Error('Calendar 응답을 읽을 수 없습니다.');
  return data as T;
}

export async function getCalendarAuthorizationUrl(): Promise<string> {
  const data = await request<{ authorization_url: string }>('/calendar/google/authorize');
  if (!data.authorization_url) throw new Error('Calendar 연결 주소가 없습니다.');
  return data.authorization_url;
}

export async function completeCalendarAuthorization(code: string, state: string) {
  const data = await request<{ calendar_connected: boolean; expires_in: number }>('/calendar/google/callback', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, state }),
  });
  if (!data.calendar_connected) throw new Error('Google Calendar 연결을 완료하지 못했습니다.');
  return data;
}

export function calendarEventOptions(schedule: CertificateSchedule): { type: CalendarEventType; label: string }[] {
  const options: { type: CalendarEventType; label: string }[] = [];
  if (schedule.registration_periods.length || (schedule.registration_start && schedule.registration_end)) {
    options.push({ type: 'registration', label: '원서접수 기간' });
  }
  if (schedule.exam_start && schedule.phase === 'written') options.push({ type: 'written_exam', label: '필기 시험' });
  if (schedule.exam_start && schedule.phase === 'practical') options.push({ type: 'practical_exam', label: '실기 시험' });
  if (schedule.result_date) options.push({ type: 'result', label: '합격발표' });
  return options;
}

export async function registerGoogleCalendar(schedule: CertificateSchedule, eventTypes: CalendarEventType[], key: string) {
  if (!schedule.updated_at) throw new Error('시험 일정 버전이 없습니다. 상세 페이지에서 일정을 다시 조회해주세요.');
  if (!eventTypes.length) throw new Error('등록할 일정 항목을 선택해주세요.');
  const data = await request<CalendarRegistrationResult>('/calendar/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({
      certificate_id: schedule.certificate_id,
      schedule_ids: [schedule.id],
      schedule_versions: { [schedule.id]: schedule.updated_at },
      event_types: eventTypes,
    }),
  });
  if (!Array.isArray(data.items) || !Array.isArray(data.excluded_items)) throw new Error('Calendar 등록 결과 형식이 올바르지 않습니다.');
  return data;
}

export const calendarStatusLabel = (status?: CalendarRegistrationResult['status']) =>
  status === 'completed' ? '✓ Google Calendar 등록 완료' : status === 'partial' ? 'Google Calendar 일부 등록' :
  status === 'pending_confirmation' ? 'Google Calendar 등록 확인 필요' : 'Google Calendar 등록 실패';

export function needsCalendarReconnection(result: CalendarRegistrationResult): boolean {
  return result.items.some(item => item.status === 'failed' && [
    'GOOGLE_CALENDAR_PERMISSION_DENIED', 'GOOGLE_CALENDAR_PERMISSION_REQUIRED',
    'GOOGLE_CALENDAR_REAUTH_REQUIRED',
  ].includes(item.code || ''));
}

export function googleCalendarLink(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'calendar.google.com' || url.hostname === 'www.google.com') ? url.href : undefined;
  } catch { return undefined; }
}
