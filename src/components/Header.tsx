import { Button } from './Button';
import { useAppContext } from '../AppContext';

export function Header() {
  const { page, go, goHome, protectedGo } = useAppContext();
  const showAccountButton = !['profile', 'related'].includes(page);

  const openAccount = () => {
    go('mypage');
  };

  return (
    <header className="header">
      <button className="brand" onClick={goHome}>
        <span className="brand-mark">자</span>
        <strong>자격잇다</strong>
      </button>
      <nav aria-label="주요 메뉴">
        <button onClick={() => go('home')}>자격증 탐색</button>
        <button onClick={() => protectedGo('profile')}>내 조건으로 찾기</button>
      </nav>
      {showAccountButton && (
        <Button
          className="account"
          onClick={openAccount}
        >
          마이페이지
        </Button>
      )}
    </header>
  );
}
