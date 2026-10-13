import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';

export default function Recommendations() {
  const { go, openDetail, recommendationResult } = useAppContext();
  const recommendations = recommendationResult?.items.slice(0, 10) ?? [];

  return (
    <main className="recommendations-main">
      <nav className="recommendations-breadcrumb" aria-label="현재 위치">
        <button aria-label="홈으로" onClick={() => go('home')}>⌂</button>
        <span aria-hidden="true">›</span>
        <button onClick={() => go('profile')}>내 조건으로 찾기</button>
        <span aria-hidden="true">›</span>
        <button onClick={() => go('related')}>관심분야 관련 자격증</button>
        <span aria-hidden="true">›</span>
        <span aria-current="page">추천 자격증 더 보기</span>
      </nav>

      <header className="recommendations-heading">
        <h1>추천 자격증 더 보기</h1>
        <p>같은 추천 결과에서 자격증을 더 살펴보세요.</p>
      </header>

      <aside className="recommendations-summary" aria-label="추천 목록 안내">
        <span className="recommendations-count">{recommendations.length}개 추천</span>
        <p>응답 순서대로 추천 자격증을 최대 10개 모두 표시합니다.</p>
      </aside>

      <section className="recommendations-list" aria-labelledby="recommendations-list-title">
        <div className="recommendations-list-heading">
          <h2 id="recommendations-list-title">전체 추천 자격증</h2>
          <span>{recommendations.length}개 표시</span>
        </div>
        <div className="recommendations-items">
          {!recommendations.length && <p className="empty">추천 자격증이 없습니다. 관심 분야·정보를 입력하고 추천을 조회해주세요.</p>}
          {recommendations.map(({ certificate_id, name, summary, category_name }) => (
            <article className="recommendation-card" key={certificate_id}>
              <div className="recommendation-copy">
                <h3>{name}</h3>
                <div className="recommendation-description">
                  <span className="badge">{category_name}</span>
                  <p>{summary}</p>
                </div>
              </div>
              <Button className="primary" onClick={() => openDetail(name)}>
                상세정보 보기
              </Button>
            </article>
          ))}
        </div>
      </section>

      <aside className="recommendations-notice">
        <strong>추천은 응시 가능 여부의 확정 판정이 아닙니다.</strong>
        <p>추가 후보가 개별 자격 요건을 만족한다는 뜻은 아닙니다. 후보가 없으면 안내 영역은 숨깁니다.</p>
      </aside>
    </main>
  );
}
