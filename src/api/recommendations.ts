import { getProfilePayload, type Profile } from './profile';

export type RecommendationItem = {
  certificate_id: string;
  qnet_code: string;
  name: string;
  category: string;
  category_name: string;
  summary: string;
  position: number;
  reason: string;
  related_jobs: { name?: string; note?: string; [key: string]: unknown }[];
  related_jobs_status: string;
};

export type RecommendationsResponse = {
  status: string;
  ordering: string;
  selection_scope: string;
  total_count: number;
  initial_display_count: number;
  items: RecommendationItem[];
};

export async function createRecommendations(profile: Profile): Promise<RecommendationsResponse> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!baseUrl) throw new Error('VITE_API_BASE_URL 환경변수를 설정해주세요.');
  const payload = getProfilePayload(profile);
  let response: Response;
  try {
    response = await fetch(`${baseUrl.replace(/\/+$/, '')}/recommendations`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('추천 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message = typeof detail === 'string' ? detail : Array.isArray(detail)
      ? detail.map((error: { msg?: string }) => error.msg).filter(Boolean).join(' ')
      : detail && typeof detail.message === 'string' ? detail.message : '';
    const code = detail && typeof detail.code === 'string' ? ` · ${detail.code}` : '';
    throw new Error(`${message || '추천 자격증을 불러오지 못했습니다.'} (HTTP ${response.status}${code})`);
  }
  if (!data || !Array.isArray(data.items) || !data.items.every((item: RecommendationItem) =>
    item && typeof item.certificate_id === 'string' && typeof item.name === 'string' &&
    typeof item.summary === 'string' && typeof item.reason === 'string' &&
    Array.isArray(item.related_jobs)
  )) throw new Error('추천 응답 형식이 올바르지 않습니다.');
  return data as RecommendationsResponse;
}
