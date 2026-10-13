export type Profile = {
  field: number;
  education: string;
  educationStatus: string;
  major: string;
  experience: boolean;
  years: string;
};

export type InterestCategory = {
  code: string;
  name: string;
};

export async function getInterestCategories(signal?: AbortSignal): Promise<InterestCategory[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');

  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}/interest-categories`, {
    headers: { Accept: 'application/json' },
    signal,
  });
  if (!response.ok) throw new Error(`관심 분야를 불러오지 못했습니다. (${response.status})`);

  const data: unknown = await response.json();
  if (!Array.isArray(data) || data.length === 0 || !data.every(item =>
    item && typeof item === 'object' &&
    typeof item.code === 'string' && /^(0[1-9]|1[0-9]|2[0-4])$/.test(item.code) &&
    typeof item.name === 'string' && item.name.trim().length > 0
  ) || new Set(data.map(item => item.code)).size !== data.length) {
    throw new Error('관심 분야 응답 형식이 올바르지 않습니다.');
  }
  return (data as InterestCategory[]).sort((a, b) => a.code.localeCompare(b.code));
}

export const profileFields = [
  '사업관리',
  '경영·회계·사무',
  '금융·보험',
  '교육·자연·사회과학',
  '법률·경찰·소방·교도·국방',
  '보건·의료',
  '사회복지·종교',
  '문화·예술·디자인·방송',
  '운전·운송',
  '영업판매',
  '경비·청소',
  '이용·숙박·여행·오락·스포츠',
  '음식서비스',
  '건설',
  '기계',
  '재료',
  '화학·바이오',
  '섬유·의복',
  '전기·전자',
  '정보통신',
  '식품가공',
  '인쇄·목재·가구·공예',
  '환경·에너지·안전',
  '농림어업',
];

export const initialProfile: Profile = {
  field: 14,
  education: '',
  educationStatus: '',
  major: '',
  experience: true,
  years: '',
};

export const educationOptions = [
  { value: 'high_school_or_below', label: '고졸 이하' },
  { value: 'college', label: '전문대' },
  { value: 'university', label: '대학교' },
  { value: 'graduate_school', label: '대학원' },
  { value: 'other', label: '기타' },
];

export const educationStatusOptions = [
  { value: 'graduated', label: '졸업' },
  { value: 'enrolled', label: '재학' },
  { value: 'expected', label: '졸업 예정' },
  { value: 'other', label: '기타' },
];

export function getProfilePayload(profile: Profile) {
  if (!Number.isInteger(profile.field) || profile.field < 0 || profile.field >= profileFields.length ||
      !educationOptions.some(option => option.value === profile.education) ||
      !educationStatusOptions.some(option => option.value === profile.educationStatus)) {
    throw new Error('관심 분야·학력·졸업 상태를 선택해주세요.');
  }
  if (profile.experience && (!profile.years.trim() || !Number.isFinite(Number(profile.years)) ||
      Number(profile.years) < 0 || Number(profile.years) > 80)) {
    throw new Error('관련 직무 년차를 0~80 사이 숫자로 입력해주세요.');
  }
  return {
    interest_category_codes: [String(profile.field + 1).padStart(2, '0')],
    education_level: profile.education,
    education_status: profile.educationStatus,
    major: profile.major.trim() || '해당 없음',
    has_career: profile.experience,
    career_years: profile.experience ? Number(profile.years) : null,
  };
}
