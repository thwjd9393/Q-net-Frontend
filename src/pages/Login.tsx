import { useState } from 'react';
import { getGoogleAuthorizationUrl } from '../api/auth';
import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';

export default function Login() {
  const { go } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const authorizationUrl = await getGoogleAuthorizationUrl();
      window.location.assign(authorizationUrl);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google 로그인을 시작하지 못했습니다.');
      setLoading(false);
    }
  };

  return (
    <main className="login-main">
      <section className={`login-panel${error ? ' has-error' : ''}`}>
        <span className="login-chip">선택한 자격증을 이어서 확인</span>
        <h1>로그인하고<br />계속 이용하세요.</h1>
        <p>
          Google 계정으로 로그인하면 자격증 상세정보와 내 조건에 맞는 추천을 확인할 수 있어요.
        </p>
        <div className="login-hint">
          {'검색어와 선택한 자격증은 그대로 유지됩니다.\n나에게 맞는 자격증을 AI가 추천드려요.\n관심 자격증과 일정을 한곳에서 관리할 수 있어요.'}
        </div>
        <Button className="primary" onClick={startGoogleLogin} disabled={loading}>
          {loading ? 'Google 로그인 연결 중...' : 'Google 계정으로 계속하기'}
        </Button>
        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
        <button className="text-button" onClick={() => go('home')}>
          로그인 없이 둘러보기
        </button>
        <small>
          로그인과 캘린더 권한 동의는 별도입니다. 로그인만으로 일정이 추가되지 않습니다.
        </small>
      </section>
    </main>
  );
}
