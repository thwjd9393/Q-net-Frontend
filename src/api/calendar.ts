import { certificates } from './certificates';
import type { CertificateSchedule } from './certificates';
import type { CalendarRegistrationResult } from './googleCalendar';

export type Exam = {
  apply: string;
  exam: string;
  result: string;
  date: string;
  start: string;
  end: string;
  resultDate: string;
};

export type CalendarEntry = {
  name: string;
  type: string;
  apply: string;
  exam: string;
  round: number;
  scheduleId?: string;
  roundLabel?: string;
  year?: number;
  googleRegistration?: CalendarRegistrationResult;
};

export const exams: Exam[] = [
  {
    apply: '1.12(월) ~ 1.15(목)',
    exam: '2.8(일)',
    result: '3.4(수)',
    date: '20260208',
    start: '20260112',
    end: '20260115',
    resultDate: '20260304',
  },
  {
    apply: '4.14(화) ~ 4.17(금)',
    exam: '5.10(일)',
    result: '6.3(수)',
    date: '20260510',
    start: '20260414',
    end: '20260417',
    resultDate: '20260603',
  },
  {
    apply: '7.7(화) ~ 7.10(금)',
    exam: '8.9(일)',
    result: '9.2(수)',
    date: '20260809',
    start: '20260707',
    end: '20260710',
    resultDate: '20260902',
  },
];

export const initialCalendar: CalendarEntry[] = certificates
  .slice(0, 4)
  .map((certificate, index) => ({
    name: certificate.name,
    type: index % 2 ? '실기' : '필기',
    apply: [
      '2026.07.07 ~ 07.10',
      '2026.09.07 ~ 09.10',
      '2026.08.10 ~ 08.13',
      '2026.07.13 ~ 07.16',
    ][index],
    exam: [
      '2026.08.09',
      '2026.10.24 ~ 11.06',
      '2026.09.20',
      '2026.08.08 ~ 08.16',
    ][index],
    round: index === 3 ? 1 : 3,
  }));

export function calendarId(entry: CalendarEntry): string {
  return `${entry.name}:${entry.type}:${entry.scheduleId ?? entry.round}`;
}

export function createGoogleCalendarEntry(
  name: string, schedule: CertificateSchedule, result: CalendarRegistrationResult,
): CalendarEntry | null {
  if (!result.items.some(item => ['created', 'already_registered', 'unknown'].includes(item.status))) return null;
  const periods = schedule.registration_periods.length ? schedule.registration_periods :
    schedule.registration_start && schedule.registration_end ? [{ starts_on: schedule.registration_start, ends_on: schedule.registration_end }] : [];
  return {
    name,
    type: schedule.phase === 'written' ? '필기' : schedule.phase === 'practical' ? '실기' : '면접',
    apply: periods.map(period => `${formatScheduleDate(period.starts_on)} ~ ${formatScheduleDate(period.ends_on)}`).join(', ') || '-',
    exam: schedule.exam_start ? `${formatScheduleDate(schedule.exam_start)}${schedule.exam_end && schedule.exam_end !== schedule.exam_start ? ` ~ ${formatScheduleDate(schedule.exam_end)}` : ''}` : '-',
    round: 0, scheduleId: schedule.id, roundLabel: schedule.round_label, year: schedule.year,
    googleRegistration: result,
  };
}

export function formatScheduleDate(date: string | null): string {
  if (!date) return '-';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

export function formatScheduleDateWithoutYear(date: string | null): string {
  if (!date) return '-';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}

export function formatRoundLabel(year: number, roundLabel: string): string {
  return roundLabel.replace(new RegExp(`^${year}년\\s*`), '');
}

export function downloadCalendar(name: string, schedule: CertificateSchedule): void {
  const events: { title: string; start: string; end: string }[] = [];
  for (const [index, period] of schedule.registration_periods.entries()) {
    events.push({
      title: `원서접수 ${index + 1}`,
      start: period.starts_on,
      end: period.ends_on,
    });
  }
  if (schedule.vacancy_registration_start && schedule.vacancy_registration_end) {
    events.push({
      title: '빈자리 접수',
      start: schedule.vacancy_registration_start,
      end: schedule.vacancy_registration_end,
    });
  }
  if (schedule.exam_start) {
    events.push({
      title: `${schedule.phase === 'written' ? '필기' : schedule.phase === 'practical' ? '실기' : schedule.phase === 'interview' ? '면접' : schedule.phase}시험`,
      start: schedule.exam_start,
      end: schedule.exam_end ?? schedule.exam_start,
    });
  }
  if (schedule.result_date) {
    events.push({
      title: '합격 발표',
      start: schedule.result_date,
      end: schedule.result_display_end ?? schedule.result_date,
    });
  }
  const nextDay = (date: string) => {
    const value = new Date(
      `${date}T00:00:00Z`,
    );
    value.setUTCDate(value.getUTCDate() + 1);
    return value.toISOString().slice(0, 10).replaceAll('-', '');
  };
  const stamp = new Date()
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}/, '');
  const data = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jagyeok Itda//Demo//KO',
    'CALSCALE:GREGORIAN',
    ...events.flatMap(({ title, start, end }) => [
      'BEGIN:VEVENT',
      `UID:${schedule.id}-${title}@jagyeok-itda.demo`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start.replaceAll('-', '')}`,
      `DTEND;VALUE=DATE:${nextDay(end)}`,
      `SUMMARY:${name} ${title}`,
      `DESCRIPTION:${formatRoundLabel(schedule.year, schedule.round_label)} · ${schedule.year}년`,
      'END:VEVENT',
    ]),
    'END:VCALENDAR',
    '',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([data], { type: 'text/calendar;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${name}-${formatRoundLabel(schedule.year, schedule.round_label)}-${schedule.year}.ics`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
