export type Page =
  | 'home'
  | 'login'
  | 'profile'
  | 'related'
  | 'recommendations'
  | 'detail'
  | 'mypage'
  | 'favorites'
  | 'calendar';

export type Certificate = {
  name: string;
  job: string;
  description: string;
  level: string;
};

export type OfficialCertificate = {
  id: string;
  qnet_code: string;
  name: string;
  category: string;
  career_tags: string[];
  description: string | null;
  source_url: string;
  last_synced_at: string;
  updated_at: string;
};

type ExamData<T> = {
  status: string;
  source_url: string | null;
  retrieved_at: string | null;
  phases: string[];
  written?: T | null;
  practical?: T | null;
  interview?: T | null;
  common?: T | null;
};

export type OfficialCertificateDetail = OfficialCertificate & {
  exam_information: {
    subjects: ExamData<string[]>;
    pass_criteria: ExamData<string>;
    fees: ExamData<number> & { currency: string };
    retrieved_at: string | null;
    updated_at: string | null;
  } | null;
  data_status: string;
  source_type: string;
  official_url: string | null;
  message: string | null;
};

export type CertificateSchedule = {
  certificate_id: string;
  year: number;
  round_key: string;
  round_label: string;
  phase: string;
  registration_start: string | null;
  registration_end: string | null;
  registration_periods: {
    starts_on: string;
    ends_on: string;
    source_url: string | null;
    retrieved_at: string | null;
  }[];
  exam_start: string | null;
  exam_end: string | null;
  result_date: string | null;
  result_display_end: string | null;
  vacancy_registration_start: string | null;
  vacancy_registration_end: string | null;
  exam_site: string | null;
  source_url: string | null;
  last_synced_at: string | null;
  id: string;
  updated_at: string | null;
};

export class CertificateApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'CertificateApiError';
  }
}

type CertificateSearchOptions = {
  query: string;
  category?: 'T' | 'S';
  limit: number;
  offset: number;
  signal?: AbortSignal;
};

export async function searchOfficialCertificates({
  query,
  category,
  limit,
  offset,
  signal,
}: CertificateSearchOptions): Promise<OfficialCertificate[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  }

  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    offset: String(offset),
  });
  if (category) params.set('category', category);

  let response: Response;
  try {
    response = await fetch(
      `${baseUrl.replace(/\/+$/, '')}/certificates?${params.toString()}`,
      {
        headers: { Accept: 'application/json' },
        signal,
      },
    );
  } catch (error) {
    throw new Error('공식 자격증 목록을 불러오지 못했습니다. 백엔드 연결을 확인해주세요.', {
      cause: error,
    });
  }

  if (!response.ok) {
    let message = `공식 자격증 목록 조회에 실패했습니다. (${response.status})`;
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
    throw new Error(message);
  }

  const result: unknown = await response.json();
  if (
    !Array.isArray(result) ||
    !result.every(
      (item): item is OfficialCertificate =>
        item !== null &&
        typeof item === 'object' &&
        'id' in item &&
        typeof item.id === 'string' &&
        'qnet_code' in item &&
        typeof item.qnet_code === 'string' &&
        'name' in item &&
        typeof item.name === 'string' &&
        'category' in item &&
        typeof item.category === 'string' &&
        'career_tags' in item &&
        Array.isArray(item.career_tags) &&
        'description' in item &&
        (typeof item.description === 'string' || item.description === null) &&
        'source_url' in item &&
        typeof item.source_url === 'string' &&
        'last_synced_at' in item &&
        typeof item.last_synced_at === 'string' &&
        'updated_at' in item &&
        typeof item.updated_at === 'string',
    )
  ) {
    throw new Error('백엔드가 올바르지 않은 자격증 목록을 반환했습니다.');
  }
  return result;
}

export async function getOfficialCertificateDetail(
  name: string,
  signal?: AbortSignal,
): Promise<OfficialCertificateDetail> {
  const matches = await searchOfficialCertificates({
    query: name,
    limit: 100,
    offset: 0,
    signal,
  });
  const certificate = matches.find((item) => item.name === name);
  if (!certificate) {
    throw new CertificateApiError('해당 종목을 찾을 수 없습니다.', 404);
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  }

  let response: Response;
  try {
    response = await fetch(
      `${baseUrl.replace(/\/+$/, '')}/certificates/${encodeURIComponent(certificate.id)}`,
      {
        headers: { Accept: 'application/json' },
        signal,
      },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('자격증 상세정보를 불러오지 못했습니다. 백엔드 연결을 확인해주세요.', {
      cause: error,
    });
  }

  if (!response.ok) {
    let message: string;
    if (response.status === 404) {
      message = '해당 종목의 상세정보가 없습니다.';
    } else if (response.status === 422) {
      message = '자격증 식별자 형식이 올바르지 않습니다.';
    } else if (response.status === 503) {
      message = '데이터베이스를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.';
    } else {
      message = `자격증 상세정보 조회에 실패했습니다. (${response.status})`;
    }
    throw new CertificateApiError(message, response.status);
  }

  const result: unknown = await response.json();
  if (
    result === null ||
    typeof result !== 'object' ||
    !('id' in result) ||
    typeof result.id !== 'string' ||
    !('name' in result) ||
    typeof result.name !== 'string' ||
    !('qnet_code' in result) ||
    typeof result.qnet_code !== 'string' ||
    !('category' in result) ||
    typeof result.category !== 'string' ||
    !('career_tags' in result) ||
    !Array.isArray(result.career_tags) ||
    !('description' in result) ||
    (typeof result.description !== 'string' && result.description !== null) ||
    !('exam_information' in result) ||
    !('data_status' in result) ||
    typeof result.data_status !== 'string' ||
    !('source_type' in result) ||
    typeof result.source_type !== 'string' ||
    !('official_url' in result) ||
    (typeof result.official_url !== 'string' && result.official_url !== null) ||
    !('message' in result) ||
    (typeof result.message !== 'string' && result.message !== null)
  ) {
    throw new Error('백엔드가 올바르지 않은 자격증 상세정보를 반환했습니다.');
  }
  return result as OfficialCertificateDetail;
}

export async function getOfficialCertificateSchedules(
  certificateId: string,
  year: number,
  signal?: AbortSignal,
): Promise<CertificateSchedule[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  }

  let response: Response;
  try {
    response = await fetch(
      `${baseUrl.replace(/\/+$/, '')}/certificates/${encodeURIComponent(certificateId)}/schedules?year=${year}`,
      {
        headers: { Accept: 'application/json' },
        signal,
      },
    );
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new Error('시험 일정을 불러오지 못했습니다. 백엔드 연결을 확인해주세요.', {
      cause: error,
    });
  }

  if (!response.ok) {
    const message =
      response.status === 422
        ? '시험 일정 조회에 필요한 종목 ID 또는 연도가 올바르지 않습니다.'
        : response.status === 503
          ? '시험 일정 데이터베이스를 조회할 수 없습니다. 잠시 후 다시 시도해주세요.'
          : `시험 일정 조회에 실패했습니다. (${response.status})`;
    throw new CertificateApiError(message, response.status);
  }

  const result: unknown = await response.json();
  if (
    !Array.isArray(result) ||
    !result.every(
      (item): item is CertificateSchedule =>
        item !== null &&
        typeof item === 'object' &&
        'id' in item &&
        typeof item.id === 'string' &&
        'certificate_id' in item &&
        typeof item.certificate_id === 'string' &&
        'year' in item &&
        typeof item.year === 'number' &&
        'round_key' in item &&
        typeof item.round_key === 'string' &&
        'round_label' in item &&
        typeof item.round_label === 'string' &&
        'phase' in item &&
        typeof item.phase === 'string' &&
        'registration_periods' in item &&
        Array.isArray(item.registration_periods) &&
        item.registration_periods.every(
          (period: unknown): period is CertificateSchedule['registration_periods'][number] =>
            period !== null &&
            typeof period === 'object' &&
            'starts_on' in period &&
            typeof period.starts_on === 'string' &&
            'ends_on' in period &&
            typeof period.ends_on === 'string',
        ),
    )
  ) {
    throw new Error('백엔드가 올바르지 않은 시험 일정 목록을 반환했습니다.');
  }
  return result;
}

export const certificates: Certificate[] = [
  {
    name: '프레스금형기사',
    job: '금형 설계 · 금형 제작',
    description: '프레스 금형의 설계·제작 분야를 알아볼 수 있는 자격증입니다.',
    level: '기사',
  },
  {
    name: '일반기계기사',
    job: '기계 설계 · 생산기술',
    description: '기계 설계·제작 분야를 알아볼 수 있는 자격증입니다.',
    level: '기사',
  },
  {
    name: '기계설계산업기사',
    job: '기계 설계 · CAD',
    description: '기계 설계 분야의 역량을 알아볼 수 있는 자격증입니다.',
    level: '산업기사',
  },
  {
    name: '산업안전기사',
    job: '산업 안전 · 위험성 평가',
    description: '산업 현장의 안전 관리 분야를 알아볼 수 있는 자격증입니다.',
    level: '기사',
  },
  {
    name: '자동차정비기사',
    job: '자동차 정비 · 자동차 부품 제조',
    description: '자동차 정비 분야를 알아볼 수 있는 자격증입니다.',
    level: '기사',
  },
];
