import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

const ENTRY_KEY = 'jagyeok:entry-passed';
const RETURN_KEY = 'jagyeok:entry-return';

function hasEntered() {
  try {
    return sessionStorage.getItem(ENTRY_KEY) === 'yes';
  } catch {
    return false;
  }
}

function getDestination() {
  try {
    const saved = sessionStorage.getItem(RETURN_KEY) || '/';
    const url = new URL(saved, location.origin);

    if (
      url.origin === location.origin &&
      url.pathname.replace(/\/+$/, '') !== '/enter'
    ) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // 저장값이 없거나 잘못됐으면 메인으로 이동합니다.
  }
  return '/';
}

export default function EnterGate({ children }: { children: ReactNode }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const allowed = hasEntered();
  const isEnter = ['/enter', '/EnterDate.html'].includes(location.pathname.replace(/\/+$/, ''));

  useEffect(() => {
    if (!allowed && !isEnter) {
      try {
        sessionStorage.setItem(
          RETURN_KEY,
          `${location.pathname}${location.search}${location.hash}`,
        );
      } catch {
        // 입장 화면에서 저장소 오류를 안내합니다.
      }
      location.replace('/enter');
      return;
    }

    if (allowed && isEnter) {
      location.replace(getDestination());
    }
  }, [allowed, isEnter]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== 'aio2') {
      setError('비밀번호가 올바르지 않습니다.');
      return;
    }

    try {
      sessionStorage.setItem(ENTRY_KEY, 'yes');
    } catch {
      setError('브라우저의 사이트 저장소를 허용해주세요.');
      return;
    }

    const destination = getDestination();
    sessionStorage.removeItem(RETURN_KEY);
    location.replace(destination);
  };

  // 입장 전에는 기존 앱을 렌더링하지 않습니다.
  if (!allowed && !isEnter) return null;
  if (allowed && isEnter) return null;
  if (allowed) return <>{children}</>;

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f5f7ff',
        padding: 24,
        boxSizing: 'border-box',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%',
          maxWidth: 380,
          padding: 32,
          boxSizing: 'border-box',
          background: '#fff',
          borderRadius: 24,
          boxShadow: '0 12px 40px #14235b12',
        }}
      >
        <h1 style={{ margin: '0 0 12px', color: '#0c1b4d' }}>
          자격잇다
        </h1>
        <p style={{ marginBottom: 24 }}>
          입장 비밀번호를 입력해주세요.
        </p>

        <label htmlFor="entry-password">비밀번호</label>
        <input
          id="entry-password"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          required
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setError('');
          }}
          style={{
            display: 'block',
            width: '100%',
            boxSizing: 'border-box',
            marginTop: 8,
            padding: 14,
            border: '1px solid #cbd2ef',
            borderRadius: 12,
            fontSize: 18,
          }}
        />

        {error && (
          <p role="alert" style={{ color: '#b42318' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            marginTop: 20,
            padding: 14,
            border: 0,
            borderRadius: 12,
            background: '#515bff',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          입장하기
        </button>
        <nav className="entry-legal-links" aria-label="서비스 정책">
          <a href="/privacy.html">개인정보처리방침</a>
          <a href="/terms.html">서비스 이용약관</a>
        </nav>
      </form>
    </main>
  );
}
