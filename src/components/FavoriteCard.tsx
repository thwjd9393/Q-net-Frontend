import type { FavoriteCertificate } from '../api/favorites';
import { useAppContext } from '../AppContext';
import { Button } from './Button';

export function FavoriteCard({ c }: { c: FavoriteCertificate }) {
  const { openDetail, toggleFavorite, page } = useAppContext();
  const registeredOn = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(c.registeredAt));

  return (
    <article className="favorite-card">
      <span className="badge">{c.category === 'T' ? '국가기술자격' : '국가전문자격'}</span>
      <h2>{c.name}</h2>
      <p>{c.job || '직무 정보가 없습니다.'}</p>
      <Button className="primary" onClick={() => openDetail(c.name)}>상세보기</Button>
      <div className="favorite-footer">
        <button type="button" onClick={() => toggleFavorite(c.name)}>관심 해제</button>
        {page === 'favorites' && <span className="registered-on">{registeredOn} 등록</span>}
      </div>
    </article>
  );
}
