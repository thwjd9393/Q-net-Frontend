import { useRef, useState } from 'react';
import type { CertificateSchedule } from '../api/certificates';
import { downloadCalendar, formatRoundLabel } from '../api/calendar';
import {
  CalendarApiError, calendarEventOptions, getCalendarAuthorizationUrl, registerGoogleCalendar, needsCalendarReconnection,
  type CalendarEventType, type CalendarRegistrationResult,
} from '../api/googleCalendar';

export const CALENDAR_OAUTH_PENDING = 'jagyeok:calendar-oauth-pending';
export const CALENDAR_CONNECTED_UNTIL = 'jagyeok:calendar-connected-until';
const ATTEMPT_KEY = 'jagyeok:calendar-registration-attempt';

export default function CalendarRegistrationDialog({ name, schedule, onClose, onSaved }: {
  name: string; schedule: CertificateSchedule; onClose: () => void;
  onSaved: (result: CalendarRegistrationResult) => void;
}) {
  const options = calendarEventOptions(schedule);
  const [types, setTypes] = useState<CalendarEventType[]>(() => {
    try {
      const previous = JSON.parse(sessionStorage.getItem(ATTEMPT_KEY) || 'null');
      if (previous?.scheduleId === schedule.id && previous.version === schedule.updated_at) {
        return previous.types.filter((type: CalendarEventType) => options.some(option => option.type === type));
      }
    } catch { /* Use the available schedule items. */ }
    return options.map(option => option.type);
  });
  const [connected, setConnected] = useState(() => Number(sessionStorage.getItem(CALENDAR_CONNECTED_UNTIL)) > Date.now());
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CalendarRegistrationResult | null>(null);
  const rememberAttempt = () => {
    const fingerprint = JSON.stringify([schedule.id, schedule.updated_at, [...types].sort()]);
    let previous;
    try { previous = JSON.parse(sessionStorage.getItem(ATTEMPT_KEY) || 'null'); } catch { /* Create a new attempt. */ }
    const attempt = { fingerprint, key: previous?.fingerprint === fingerprint ? previous.key : crypto.randomUUID(),
      scheduleId: schedule.id, version: schedule.updated_at, types };
    sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify(attempt));
    return attempt.key;
  };
  const connect = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const url = await getCalendarAuthorizationUrl();
      const redirect = new URL(url).searchParams.get('redirect_uri');
      if (redirect && new URL(redirect).origin !== location.origin) {
        throw new Error('Calendar 콜백 주소와 현재 사이트 주소가 다릅니다. 백엔드의 Calendar 리다이렉트 주소를 확인해주세요.');
      }
      rememberAttempt();
      sessionStorage.setItem(CALENDAR_OAUTH_PENDING, JSON.stringify({ name, schedule }));
      location.assign(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Calendar 연결에 실패했습니다.');
      pending.current = false; setBusy(false);
    }
  };
  const register = async () => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(''); setResult(null);
    try {
      const response = await registerGoogleCalendar(schedule, types, rememberAttempt());
      setResult(response);
      onSaved(response);
      if (needsCalendarReconnection(response)) {
        sessionStorage.removeItem(CALENDAR_CONNECTED_UNTIL);
        setConnected(false);
      }
    } catch (cause) {
      if (cause instanceof CalendarApiError && (cause.status === 401 || cause.status === 403)) {
        sessionStorage.removeItem(CALENDAR_CONNECTED_UNTIL); setConnected(false);
      }
      if (cause instanceof CalendarApiError && cause.status === 409) sessionStorage.removeItem(ATTEMPT_KEY);
      setError(cause instanceof Error ? cause.message : 'Calendar 등록에 실패했습니다.');
    } finally { pending.current = false; setBusy(false); }
  };

  return (
    <div className="modal-backdrop" onClick={() => { if (!busy) onClose(); }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="calendar-dialog-title" onClick={event => event.stopPropagation()}>
        <h2 id="calendar-dialog-title">Google Calendar 일정 추가</h2>
        <p>{name} · {schedule.year}년 {formatRoundLabel(schedule.year, schedule.round_label)}</p>
        <fieldset className="calendar-event-options" disabled={busy}>
          <legend>등록할 일정 항목</legend>
          {options.map(option => <label key={option.type}><input type="checkbox" checked={types.includes(option.type)} onChange={event => {
            setTypes(previous => event.target.checked ? [...previous, option.type] : previous.filter(type => type !== option.type)); setResult(null);
          }}/>{option.label}</label>)}
          {!options.length && <p>등록할 수 있는 날짜 정보가 없습니다.</p>}
        </fieldset>
        {!connected && <p>Google Calendar 권한 동의 후 선택한 일정을 등록할 수 있습니다.</p>}
        {error && <p role="alert">{error}</p>}
        {result && <div className="calendar-registration-results" role="status">
          <p>{result.message}</p>
          <ul>{result.items.map(item => <li key={item.item_key}>
            {options.find(option => option.type === item.event_type)?.label || item.event_type}: {item.status === 'created' ? '등록 완료' : item.status === 'already_registered' ? '이미 등록됨' : item.status === 'unknown' ? '등록 확인 필요' : '등록 실패'}{item.message ? ` · ${item.message}` : ''}
          </li>)}{result.excluded_items.map((item, index) => <li key={`excluded-${index}`}>{item.reason}</li>)}</ul>
        </div>}
        <div>
          <button className="button" disabled={busy} onClick={onClose}>닫기</button>
          <button className="button" onClick={() => downloadCalendar(name, schedule)}>일정 파일 다운로드</button>
          {!connected ? <button className="button primary" disabled={busy || !types.length} onClick={connect}>{busy ? '연결 중…' : 'Google Calendar 연결'}</button> :
            <button className="button primary" disabled={busy || !types.length || result?.status === 'completed'} onClick={register}>{busy ? '등록 중…' : result?.status === 'completed' ? '등록 완료' : '선택한 일정 등록'}</button>}
        </div>
      </section>
    </div>
  );
}
