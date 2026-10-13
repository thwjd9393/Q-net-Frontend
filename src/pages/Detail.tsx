import { Fragment, useEffect, useState } from 'react';
import assets from '../assets.json';
import {
  getOfficialCertificateDetail,
  getOfficialCertificateSchedules,
  type CertificateSchedule,
  type OfficialCertificateDetail,
} from '../api/certificates';
import {
  formatRoundLabel,
  formatScheduleDateWithoutYear,
} from '../api/calendar';
import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';
import { calendarEventOptions } from '../api/googleCalendar';
import { Icon, OutlineIcon } from '../components/Icons';

type ExamPhase = 'written' | 'practical' | 'interview';

function formatRetrievedAt(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function phaseLabel(phase: string): string {
  if (phase === 'written') return '필기';
  if (phase === 'practical') return '실기';
  if (phase === 'interview') return '면접';
  if (phase === 'common') return '공통';
  return phase;
}

function phaseItems(
  data:
    | {
        written?: string[] | null;
        practical?: string[] | null;
        interview?: string[] | null;
        common?: string[] | null;
      }
    | null
    | undefined,
  phase: ExamPhase,
): string[] {
  if (!data) return [];
  return [...(data[phase] ?? []), ...(data.common ?? [])];
}

function detailPhase(phase: string): ExamPhase {
  if (phase === '실기') return 'practical';
  if (phase === '면접') return 'interview';
  return 'written';
}

function formatPhase(phase: string): string {
  if (phase === 'written') return '필기';
  if (phase === 'practical') return '실기';
  if (phase === 'interview') return '면접';
  return phase;
}

function registrationStatus(schedule: CertificateSchedule, today: string): string {
  const periods = schedule.registration_periods;
  if (!periods.length) return '접수 기간 확인 필요';
  if (periods.every(({ ends_on }) => ends_on < today)) return '접수 종료';
  if (periods.some(({ starts_on, ends_on }) => starts_on <= today && today <= ends_on)) {
    return '접수 중';
  }
  return '접수 예정';
}

function examDateRange(schedule: CertificateSchedule): string {
  if (!schedule.exam_start) return '-';
  const start = formatScheduleDateWithoutYear(schedule.exam_start);
  return schedule.exam_end && schedule.exam_end !== schedule.exam_start
    ? `${start} ~ ${formatScheduleDateWithoutYear(schedule.exam_end)}`
    : start;
}

function registrationPeriodLabels(schedule: CertificateSchedule): string[] {
  return schedule.registration_periods.map(({ starts_on, ends_on }) =>
    `${formatScheduleDateWithoutYear(starts_on)} ~ ${formatScheduleDateWithoutYear(ends_on)}`,
  );
}

function categoryLabel(category: string): string {
  if (category === 'T') return '국가기술자격';
  if (category === 'S') return '국가전문자격';
  return category;
}

function displayMetadata(value: string | null | undefined): string {
  return value && !/[a-z]/i.test(value) ? value : '-';
}

function currencyLabel(currency: string | null | undefined): string {
  const code = currency ?? 'KRW';
  return code === 'KRW' ? '원' : code;
}

function CertificateExamInfo({
  detail,
  phase,
}: {
  detail: OfficialCertificateDetail | null;
  phase: ExamPhase;
}) {
  const examInformation = detail?.exam_information;
  const subjects = examInformation?.subjects;
  const passCriteria = examInformation?.pass_criteria;
  const fees = examInformation?.fees;
  const subjectItems = phaseItems(subjects, phase);
  const passText =
    passCriteria?.status !== 'unavailable'
      ? (passCriteria?.[phase] ?? passCriteria?.common ?? null)
      : null;
  const fee =
    fees?.status !== 'unavailable'
      ? (fees?.[phase] ?? fees?.common ?? null)
      : null;
  const missingData = '확인 필요';

  return (
    <div className="exam-info">
      <article className="info-card subjects">
        <h2><Icon name="imgIconBook"/>시험과목 ({phaseLabel(phase)})</h2>
        {subjects?.status === 'unavailable' || subjectItems.length === 0 ? (
          <p className="info-copy"><strong>{missingData}</strong></p>
        ) : (
          <ol>{subjectItems.map((subject, index) => <li key={`${subject}-${index}`}>{subject}</li>)}</ol>
        )}
      </article>
      <article className="info-card passing">
        <h2><Icon name="imgIconMedal"/>합격기준</h2>
        <div className="info-copy">
          <strong>{passText || missingData}</strong>
          {passText && <small>(공식 자료 기준)</small>}
        </div>
      </article>
      <article className="info-card fee">
        <h2><Icon name="imgIconCoin"/>응시료</h2>
        <div className="info-copy">
          <strong className="fee-amount">
            {typeof fee === 'number'
              ? `${new Intl.NumberFormat('ko-KR').format(fee)}${currencyLabel(fees?.currency)}`
              : missingData}
          </strong>
          {fees?.status === 'unavailable' && (
            <small>공식 응시료 정보가 등록되지 않았습니다.</small>
          )}
        </div>
      </article>
    </div>
  );
}

export default function Detail() {
  const {
    selected,
    favorites,
    toggleFavorite,
    examType,
    setExamType,
    round,
    setRound,
    setActiveSchedule,
    setToast,
    setDialog,
    go,
  } = useAppContext();
  const [detail, setDetail] = useState<OfficialCertificateDetail | null>(null);
  const [schedules, setSchedules] = useState<CertificateSchedule[]>([]);
  const [scheduleYear, setScheduleYear] = useState(new Date().getFullYear());
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState('');
  const [scheduleRetryKey, setScheduleRetryKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const phase = detailPhase(examType);
  const phaseSchedules = schedules.filter((schedule) => schedule.phase === phase);
  const selectedSchedule =
    phaseSchedules.find((schedule) => schedule.id === selectedScheduleId) ??
    phaseSchedules[0] ??
    null;
  const today = (() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  })();
  const selectedRegistrationStatus = selectedSchedule
    ? registrationStatus(selectedSchedule, today)
    : '';
  const canAddSelectedSchedule =
    Boolean(selectedSchedule?.updated_at && calendarEventOptions(selectedSchedule).length);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setDetail(null);

    void getOfficialCertificateDetail(selected, controller.signal)
      .then(setDetail)
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : '자격증 상세정보를 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryKey, selected]);

  useEffect(() => {
    if (!detail) {
      setSchedules([]);
      setSelectedScheduleId('');
      setActiveSchedule(null);
      return;
    }

    const controller = new AbortController();
    setScheduleLoading(true);
    setScheduleError('');
    setSchedules([]);
    setSelectedScheduleId('');
    setActiveSchedule(null);

    void getOfficialCertificateSchedules(detail.id, scheduleYear, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setSchedules(result);
        const phaseSchedule = result.find((schedule) => schedule.phase === phase) ?? null;
        setSelectedScheduleId(phaseSchedule?.id ?? '');
        setActiveSchedule(phaseSchedule);
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return;
        setScheduleError(cause instanceof Error ? cause.message : '시험 일정을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setScheduleLoading(false);
      });

    return () => controller.abort();
  }, [detail?.id, scheduleYear, scheduleRetryKey, setActiveSchedule]);

  useEffect(() => {
    setActiveSchedule(selectedSchedule);
  }, [selectedSchedule, setActiveSchedule]);

  const careerTags = detail?.career_tags ?? [];
  const sourceUrl = detail?.official_url || detail?.source_url;
  const retrievedAt = formatRetrievedAt(
    detail?.exam_information?.retrieved_at ?? detail?.last_synced_at,
  );
  const years = [scheduleYear - 1, scheduleYear, scheduleYear + 1];

  return (
    <main className="detail-main">
      <div className="breadcrumb">
        <button onClick={() => go('home')}>홈</button>
        <Icon name="imgIconChevron"/>
        <span>{detail ? categoryLabel(detail.category) : '자격증'}</span>
        <Icon name="imgIconChevron"/>
        <span>{detail?.name ?? selected}</span>
      </div>
      <div className="detail-heading">
        <h1>{detail?.name ?? selected}</h1>
        {detail && <span className="badge">{categoryLabel(detail.category)} · {detail.qnet_code}</span>}
        <div className="detail-actions">
          <Button
            className="favorite-toggle"
            aria-pressed={favorites.some(favorite => favorite.name === selected)}
            disabled={!detail || loading}
            onClick={() => {
              if (!detail) return;
              toggleFavorite(detail.name, {
                id: detail.id,
                name: detail.name,
                category: detail.category,
                job: detail.career_tags.join(' · '),
              });
            }}
          >
            <OutlineIcon kind="heart"/>
            {favorites.some(favorite => favorite.name === selected) ? '관심 자격증' : '관심 등록'}
          </Button>
          {sourceUrl && (
            <a className="button" href={sourceUrl} target="_blank" rel="noreferrer">
              <Icon name="imgIconLink"/>공식 페이지 ↗
            </a>
          )}
          <Button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
                setToast('링크를 복사했습니다.');
              } catch {
                setToast('주소 표시줄의 링크를 복사해 주세요.');
              }
            }}
          >
            <Icon name="imgIconShare"/>공유하기
          </Button>
        </div>
      </div>

      {loading && <p className="detail-description" role="status">자격증 상세정보를 불러오는 중입니다...</p>}
      {error && (
        <div className="detail-description" role="alert">
          <p>{error}</p>
          <Button onClick={() => setRetryKey((key) => key + 1)}>다시 시도</Button>
        </div>
      )}
      {detail && (
        <>
          <p className="detail-description">{detail.description || '등록된 자격증 설명이 없습니다.'}</p>
          {detail.message && <p className="detail-message" role="status">{detail.message}</p>}
        </>
      )}

      <div className="exam-tabs" role="tablist" aria-label="시험 종류">
        {(['필기', '실기', '면접'] as const).map((type) => (
          <button
            role="tab"
            key={type}
            aria-selected={examType === type}
            className={examType === type ? 'active' : ''}
            onClick={() => setExamType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="detail-columns">
        <div className="exam-content">
          {detail ? (
            <CertificateExamInfo detail={detail} phase={phase}/>
          ) : (
            <div className="exam-info">
              <p className="empty">{loading ? '상세정보를 불러오는 중입니다...' : '공식 상세정보를 표시할 수 없습니다.'}</p>
            </div>
          )}
          <section className="schedule-panel">
            <div className="schedule-heading">
              <h2><Icon name="imgIconCalendar"/>시험 일정 선택</h2>
              <select
                className="button year-button"
                aria-label="시험 일정 연도"
                value={scheduleYear}
                onChange={(event) => setScheduleYear(Number(event.target.value))}
              >
                {years.map((year) => <option key={year} value={year}>{year}년</option>)}
              </select>
            </div>
            <div className="round-grid" role="radiogroup" aria-label="시험 회차">
              {phaseSchedules.map((schedule) => {
                const status = registrationStatus(schedule, today);
                return (
                <button
                  role="radio"
                  key={schedule.id}
                  aria-checked={selectedSchedule?.id === schedule.id}
                  className={`round-card ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedScheduleId(schedule.id);
                    setActiveSchedule(schedule);
                    setRound(phaseSchedules.indexOf(schedule));
                  }}
                >
                  <div className="round-title">
                    <img
                      src={assets['12:1410'][selectedSchedule?.id === schedule.id ? 'imgEllipse1' : 'imgEllipse']}
                      alt=""
                    />
                    <strong>{formatRoundLabel(schedule.year, schedule.round_label)}</strong>
                    <span className={`status ${status === '접수 중' ? 'available' : ''}`}>
                      {status}
                    </span>
                  </div>
                  <div className="round-date" key="registration">
                    <span>원서접수</span>
                    <small>
                      {registrationPeriodLabels(schedule).length
                        ? registrationPeriodLabels(schedule).map((period, index) => (
                            <Fragment key={`${period}-${index}`}>
                              {index > 0 && <br/>}
                              {period}
                            </Fragment>
                          ))
                        : '-'}
                    </small>
                  </div>
                  {[
                    [`${formatPhase(schedule.phase)}시험`, examDateRange(schedule)],
                    ['합격발표', formatScheduleDateWithoutYear(schedule.result_date)],
                  ].map(([label, date]) => (
                    <div className="round-date" key={label}>
                      <span>{label}</span><small>{date}</small>
                    </div>
                  ))}
                </button>
                );
              })}
              {!scheduleLoading && !scheduleError && phaseSchedules.length === 0 && (
                <p className="empty schedule-empty">
                  해당 연도에 수집된 {formatPhase(phase)} 일정이 없습니다. 일정 미수집이 시험 미시행을 의미하지는 않습니다.
                </p>
              )}
              {scheduleLoading && <p className="empty schedule-empty">시험 일정을 불러오는 중입니다...</p>}
              {scheduleError && (
                <div className="empty schedule-empty" role="alert">
                  <p>{scheduleError}</p>
                  <Button onClick={() => setScheduleRetryKey((key) => key + 1)}>다시 시도</Button>
                </div>
              )}
            </div>
            <div className="schedule-summary">
              <h3>
                <Icon name="imgIconCalendar1"/>
                {selectedSchedule
                  ? `선택한 일정 요약 (${scheduleYear}년 ${formatRoundLabel(selectedSchedule.year, selectedSchedule.round_label)} · ${formatPhase(selectedSchedule.phase)})`
                  : '선택한 일정 요약'}
              </h3>
              {selectedSchedule ? (
                <div className="summary-flow schedule-summary-details">
                  <div>
                    <strong>원서접수</strong>
                    <p>
                      {registrationPeriodLabels(selectedSchedule).length
                        ? registrationPeriodLabels(selectedSchedule).map((period, index) => (
                            <Fragment key={`${period}-${index}`}>
                              {index > 0 && <br/>}
                              {period}
                            </Fragment>
                          ))
                        : '-'}
                    </p>
                  </div>
                  <div><strong>시험일</strong><p>{examDateRange(selectedSchedule)}</p></div>
                  <div><strong>합격발표</strong><p>{formatScheduleDateWithoutYear(selectedSchedule.result_date)}</p></div>
                </div>
              ) : (
                <p className="schedule-empty-summary">
                  {scheduleLoading ? '시험 일정을 불러오는 중입니다...' : '선택 가능한 수집 일정이 없습니다.'}
                </p>
              )}
            </div>
            <Button
              className="calendar-add"
              disabled={!canAddSelectedSchedule}
              onClick={() => {
                if (canAddSelectedSchedule) setDialog(true);
              }}
            >
              <Icon name="imgIconCalendar2"/>Google Calendar에 일정 추가하기 <span>G</span>
            </Button>
            {selectedSchedule && !canAddSelectedSchedule && (
              <p className="calendar-disabled-note" role="status">
                등록할 수 있는 날짜 또는 일정 버전 정보가 없습니다.
              </p>
            )}
            <div className="calendar-hint">
              <Icon name="imgIconBulb"/>
              <p>
                <strong>캘린더에 추가되는 일정</strong><br/>
                선택한 회차의 원서접수 기간, {examType}시험일, 합격발표일 중 등록할 항목을 선택할 수 있습니다.
              </p>
            </div>
          </section>
        </div>
        <aside className="detail-sidebar">
          <section className="sidebar-card recommend">
            <h2><Icon name="imgIconChart"/>관련 분야</h2>
            {careerTags.length
              ? careerTags.map((tag) => <span key={tag} className="blue-chip">{tag}</span>)
              : <p>등록된 관련 분야가 없습니다.</p>}
          </section>
          <section className="sidebar-card jobs">
            <h2><Icon name="imgIconInfo"/>정보 상태</h2>
            {detail ? (
              <>
                <p>자료 상태: {displayMetadata(detail.data_status)}</p>
                <p>자료 출처: {displayMetadata(detail.source_type)}</p>
                {retrievedAt && <p>조회 시각: {retrievedAt}</p>}
              </>
            ) : (
              <p>{loading ? '상세정보를 불러오는 중입니다...' : '상세정보가 없습니다.'}</p>
            )}
          </section>
          <section className="sidebar-card sources">
            <h2><Icon name="imgIconInfo"/>공식 자료 출처</h2>
            <p>출처: {displayMetadata(detail?.source_type)}</p>
            {retrievedAt && <p>조회 시각: {retrievedAt}</p>}
            {sourceUrl && (
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                공식 자료 바로가기 ↗
              </a>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
