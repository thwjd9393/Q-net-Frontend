import { useEffect, useState } from 'react';
import assets from '../assets.json';
import { searchOfficialCertificates, type OfficialCertificate } from '../api/certificates';
import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';

const PAGE_SIZE = 20;
const categories = [
  { label: '전체', value: undefined },
  { label: '기술자격', value: 'T' },
  { label: '전문자격', value: 'S' },
] as const;

export default function Home() {
  const {
    search,
    setSearch,
    submitted,
    setSubmitted,
    category,
    setCategory,
    homeResetKey,
    protectedGo,
    openDetail,
  } = useAppContext();
  const [items, setItems] = useState<OfficialCertificate[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setOffset(0);
  }, [homeResetKey]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError('');
    if (offset === 0) {
      setItems([]);
      setHasMore(false);
    }

    void searchOfficialCertificates({
      query: submitted.trim(),
      category: category === '기술자격' ? 'T' : category === '전문자격' ? 'S' : undefined,
      limit: PAGE_SIZE,
      offset,
      signal: controller.signal,
    })
      .then((results) => {
        if (cancelled) return;
        setItems((current) => (offset === 0 ? results : [...current, ...results]));
        setHasMore(results.length === PAGE_SIZE);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : '자격증 목록을 불러오지 못했습니다.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [category, offset, retryKey, submitted]);

  const searchCertificates = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    setSubmitted(search);
  };

  return (
    <>
      <section className="hero">
        <img className="hero-bg" src={assets.main.imgBg} alt="" />
        <h1>내 다음 자격을 찾아보세요.</h1>
        <p>관심 있는 자격증을 검색하거나, 내 조건에 맞는 후보를 찾아보세요.</p>
        <div className="hero-controls">
          <form className="search" onSubmit={searchCertificates}>
            <input
              aria-label="찾으시는 자격증"
              placeholder="찾으시는 자격증을 검색하세요"
              maxLength={100}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button className="primary" type="submit">검색</Button>
          </form>
          <Button onClick={() => protectedGo('profile')}>내 조건으로 찾기</Button>
        </div>
        <small>공식 종목명이나 코드를 검색할 수 있어요. 내 조건으로 자격증을 추천받아 보세요.</small>
      </section>
      <section className="catalog">
        <div className="catalog-title">
          <h2>자격증 목록</h2>
          <span>Q-Net 공식 목록</span>
        </div>
        <div className="filters" role="group" aria-label="자격증 분류">
          {categories.map(({ label, value }) => (
            <button
              key={label}
              aria-pressed={category === label}
              className={category === label ? 'active' : ''}
              onClick={() => {
                setCategory(label);
                setOffset(0);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="catalog-grid" aria-busy={loading}>
          {items.map((item) => (
            <button className="catalog-card" key={item.id} onClick={() => openDetail(item.name)}>
              <img src={assets.main.imgVector11} className="card-bg" alt="" />
              <span className="badge">
                {item.category === 'T' ? '국가기술자격' : '국가전문자격'}
              </span>
              <h3>{item.name}</h3>
              <span className="link">공식 코드 {item.qnet_code} · 상세정보 더 보기 →</span>
            </button>
          ))}
          {loading && <p className="empty">공식 자격증 목록을 불러오는 중입니다...</p>}
          {!loading && error && (
            <div className="empty" role="alert">
              <p>{error}</p>
              <Button onClick={() => setRetryKey((key) => key + 1)}>다시 시도</Button>
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="empty">검색 조건에 맞는 공식 자격증이 없습니다.</p>
          )}
        </div>
        {hasMore && (
          <Button
            className="more-button"
            disabled={loading}
            onClick={() => setOffset(items.length)}
          >
            {loading ? '불러오는 중...' : '더 보기'}
          </Button>
        )}
      </section>
    </>
  );
}
