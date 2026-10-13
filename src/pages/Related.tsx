import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';

export default function Related() {
  const { recommendationResult, go, openDetail } = useAppContext();
  const items = recommendationResult?.items.slice(0, 3) ?? [];

  return (
    <main className="related-main">
      <h1>관심분야 관련 자격증</h1>
      <p className="muted">선택한 분야와 입력 정보를 바탕으로 추천한 자격증입니다.</p>
      <div className="related-grid">
        {items.map(item => (
          <article className="related-card" key={item.certificate_id}>
            <span className="badge">{item.category_name || (item.category === 'T' ? '국가기술자격' : '국가전문자격')}</span>
            <h2>{item.name}</h2>
            <p className="description">{item.summary}</p>
            <h3>활용할 수 있는 직군·직업</h3>
            <p className="job-description">
              {item.related_jobs.map(job => job.name).filter(Boolean).join(' · ') || '연관 직무 정보가 없습니다.'}
            </p>
            <h3 className="reason">이 자격증을 제시한 이유</h3>
            <p className="recommendation-reason">{item.reason}</p>
            <Button className="primary" onClick={() => openDetail(item.name)}>상세정보 보기</Button>
          </article>
        ))}
        {!items.length && (
          <p className="empty">
            {recommendationResult ? '선택한 조건에 맞는 추천 자격증이 없습니다. 관심 분야·정보를 수정해주세요.' : '관심 분야·정보를 입력하고 추천 자격증을 조회해주세요.'}
          </p>
        )}
      </div>
      <div className="related-actions">
        <Button onClick={() => go('profile')}>관심 분야·정보 수정</Button>
        <Button className="primary" disabled={!items.length} onClick={() => go('recommendations')}>추천 자격증 더 보기</Button>
      </div>
    </main>
  );
}
