import { useAppContext } from '../AppContext';
import { calendarId, formatRoundLabel } from '../api/calendar';
import { OutlineIcon } from '../components/Icons';
import { SmallTitle } from '../components/PageHelpers';
import { calendarStatusLabel, googleCalendarLink } from '../api/googleCalendar';

function scheduleTitle(year: number | undefined, roundLabel: string | undefined, round: number) {
  const scheduleYear = year ?? 2026;
  const label = roundLabel
    ? formatRoundLabel(scheduleYear, roundLabel)
    : `정기 기사 ${round}회`;
  return `${scheduleYear}년 ${label}`;
}

export default function Calendar() {
  const { calendar, calendarKey, selected, setSelected, setCalendarKey } = useAppContext();
  const current =
    calendar.find((entry) => calendarId(entry) === calendarKey) ??
    calendar.find((entry) => entry.name === selected) ??
    calendar[0];

  return (
    <main className="small-main calendar-main">
      <SmallTitle
        title="캘린더 등록 자격증"
        count={calendar.length}
        sub="캘린더에 등록한 자격증의 상세 정보를 확인하세요."
      />
      <div className="calendar-detail-grid">
        <div className="calendar-list">
          {calendar.map((entry, index) => (
            <button
              key={`${entry.name}:${entry.scheduleId ?? index}`}
              className={current && calendarId(current) === calendarId(entry) ? 'selected' : ''}
              onClick={() => {
                setSelected(entry.name);
                setCalendarKey(calendarId(entry));
              }}
            >
              <strong>{entry.name}</strong>
              <span className="badge">{entry.type}</span>
              <small>{scheduleTitle(entry.year, entry.roundLabel, entry.round)}</small>
              <span>›</span>
            </button>
          ))}
        </div>
        {current ? (
          <section className="calendar-detail">
            <span className="badge">국가기술자격</span>
            <h2>{current.name}</h2>
            <div className="calendar-detail-tags">
              <span className="badge">{current.type}</span>
              <span className="badge">{calendarStatusLabel(current.googleRegistration?.status)}</span>
            </div>
            <p>{scheduleTitle(current.year, current.roundLabel, current.round)}</p>
            {current.googleRegistration && current.googleRegistration.status !== 'completed' && (
              <div role="status">
                <p>{current.googleRegistration.message}</p>
                <ul>
                  {current.googleRegistration.items.filter(item => item.status === 'failed' || item.status === 'unknown')
                    .map(item => <li key={item.item_key}>{item.message || (item.status === 'unknown' ? '등록 여부를 확인해야 합니다.' : '등록하지 못한 항목이 있습니다.')}</li>)}
                  {current.googleRegistration.excluded_items.map((item, index) => <li key={`excluded-${index}`}>{item.reason}</li>)}
                </ul>
              </div>
            )}
            {[
              ['원서접수 기간', current.apply],
              ['시험일', current.exam],
              ['등록된 일정', [...new Set(current.googleRegistration?.items
                .filter(item => item.status === 'created' || item.status === 'already_registered')
                .map(item => ({ registration: '원서접수', written_exam: '필기 시험', practical_exam: '실기 시험', result: '합격발표' })[item.event_type]) ?? [])].join(' · ') || '등록 확인 필요'],
            ].map(([label, value]) => (
              <div className="calendar-detail-line" key={label}>
                <OutlineIcon kind={label === '등록된 일정' ? 'list' : 'calendar'}/>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
            <a
              className="button primary"
              href={current.googleRegistration?.items.map(item => googleCalendarLink(item.html_link)).find(Boolean) || 'https://calendar.google.com/calendar/u/0/r'}
              target="_blank"
              rel="noreferrer"
            >
              캘린더에서 보기 ↗
            </a>
          </section>
        ) : (
          <p className="empty">등록된 일정이 없습니다.</p>
        )}
      </div>
    </main>
  );
}
