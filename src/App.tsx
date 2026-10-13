import { useEffect, useState } from 'react';
import { AppContextProvider } from './AppContext';
import {
  AuthApiError,
  clearAccessToken,
  getAccessToken,
  refreshAccessToken,
  saveAccessToken,
} from './api/auth';
import {
  calendarId,
  createGoogleCalendarEntry,
  formatRoundLabel,
  formatScheduleDate,
} from './api/calendar';
import type { CalendarEntry } from './api/calendar';
import { certificates, type CertificateSchedule, type Page } from './api/certificates';
import { toggleFavorite as updateFavorites, type FavoriteCertificate, type FavoriteInput } from './api/favorites';
import { initialProfile } from './api/profile';
import type { RecommendationsResponse } from './api/recommendations';
import { useStored } from './api/storage';
import Calendar from './pages/Calendar';
import Detail from './pages/Detail';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Login from './pages/Login';
import Mypage from './pages/Mypage';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Related from './pages/Related';
import { Header } from './components/Header';
import CalendarRegistrationDialog, { CALENDAR_OAUTH_PENDING, CALENDAR_CONNECTED_UNTIL } from './components/CalendarRegistrationDialog';
import { completeCalendarAuthorization, type CalendarRegistrationResult } from './api/googleCalendar';
import './styles/common.css';
import './styles/home.css';
import './styles/login.css';
import './styles/profile.css';
import './styles/related.css';
import './styles/recommendations.css';
import './styles/detail.css';
import './styles/mypage.css';
import './styles/favorites.css';
import './styles/calendar.css';

const pages: Page[] = [
  'home',
  'login',
  'profile',
  'related',
  'recommendations',
  'detail',
  'mypage',
  'favorites',
  'calendar',
];

function route(): Page {
  const path =
    location.hash.slice(1).split('?')[0] ||
    location.pathname.split('/').pop()?.replace(/\.html$/, '') ||
    document.documentElement.dataset.page ||
    'home';
  if (path === 'login') return 'home';
  return pages.includes(path as Page) ? (path as Page) : 'home';
}

export default function App() {
  const [page, setPage] = useState<Page>(route);
  const [logged, setLogged] = useState(() => Boolean(getAccessToken()));
  const [selected, setSelected] = useStored('selected', certificates[0].name);
  const [favorites, setFavorites] = useStored<FavoriteCertificate[]>('favorite-certificates', []);
  const [calendar, setCalendar] = useStored<CalendarEntry[]>('google-calendar-registrations', []);
  const [search, setSearch] = useStored('search', '');
  const [submitted, setSubmitted] = useState(search);
  const [category, setCategory] = useState('전체');
  const [more, setMore] = useState(false);
  const [homeResetKey, setHomeResetKey] = useState(0);
  const [returnPage, setReturnPage] = useStored<Page>('return-page', 'detail');
  const [profile, setProfile] = useStored('profile', initialProfile);
  const [recommendationResult, setRecommendationResult] = useStored<RecommendationsResponse | null>('recommendations', null);
  const [calendarKey, setCalendarKey] = useState('');
  const [examType, setExamType] = useState('필기');
  const [round, setRound] = useState(2);
  const [activeSchedule, setActiveSchedule] = useState<CertificateSchedule | null>(null);
  const [toast, setToast] = useState('');
  const [dialog, setDialog] = useState(false);
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [sort, setSort] = useState('최신 등록순');

  useEffect(() => {
    const onNavigate = () => {
      if (
        route() === 'home' &&
        (location.pathname.endsWith('/login.html') || location.hash === '#login')
      ) {
        if (location.protocol === 'file:') {
          location.hash = 'home';
        } else {
          history.replaceState(
            {},
            '',
            `${location.pathname.replace(/login\.html$/, 'home.html')}${location.search}`,
          );
        }
        document.title = '자격잇다 · 내 다음 자격';
      }
      setPage(route());
      window.scrollTo(0, 0);
    };
    onNavigate();
    addEventListener('hashchange', onNavigate);
    addEventListener('popstate', onNavigate);
    return () => {
      removeEventListener('hashchange', onNavigate);
      removeEventListener('popstate', onNavigate);
    };
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const code = query.get('code');
    const state = query.get('state');
    const oauthError = query.get('error');
    let cancelled = false;

    const isCalendarCallback = location.pathname.endsWith('/calendar-callback.html') ||
      location.pathname.endsWith('/callback.html') || Boolean(sessionStorage.getItem(CALENDAR_OAUTH_PENDING));
    if (isCalendarCallback && (code || state || oauthError)) {
      history.replaceState({}, '', `${location.pathname}${location.hash}`);
      if (oauthError || !code || !state) {
        sessionStorage.removeItem(CALENDAR_OAUTH_PENDING);
        setToast('Google Calendar 권한 동의를 완료하지 못했습니다. 다시 연결해주세요.');
        go('mypage');
        return;
      }
      void completeCalendarAuthorization(code, state)
        .then(({ expires_in }) => {
          if (cancelled) return;
          sessionStorage.setItem(CALENDAR_CONNECTED_UNTIL, String(Date.now() + expires_in * 1000));
          const saved = sessionStorage.getItem(CALENDAR_OAUTH_PENDING);
          sessionStorage.removeItem(CALENDAR_OAUTH_PENDING);
          go('mypage');
          if (saved) {
            const pending = JSON.parse(saved) as { name: string; schedule: CertificateSchedule };
            setSelected(pending.name);
            setActiveSchedule(pending.schedule);
            setExamType(pending.schedule.phase === 'written' ? '필기' : pending.schedule.phase === 'practical' ? '실기' : '면접');
            setDialog(true);
          }
          setToast('Google Calendar가 연결되었습니다. 등록할 항목을 확인해주세요.');
        })
        .catch((cause: unknown) => {
          if (cancelled) return;
          sessionStorage.removeItem(CALENDAR_OAUTH_PENDING);
          setToast(cause instanceof Error ? cause.message : 'Google Calendar 연결에 실패했습니다.');
          go('mypage');
        });
      return () => { cancelled = true; };
    }
    if (code || state || oauthError) {
      history.replaceState({}, '', `${location.pathname}${location.hash}`);
      setToast('Google Calendar 연결 버튼에서 다시 시작해주세요.');
      go('mypage');
    } else {
      void refreshAccessToken()
        .then((accessToken) => {
          if (cancelled) return;
          saveAccessToken(accessToken);
          setLogged(true);
        })
        .catch((cause: unknown) => {
          if (cancelled) return;
          if (cause instanceof AuthApiError && cause.status === 401) {
            clearAccessToken();
            setLogged(false);
            return;
          }
          setToast(
            cause instanceof Error ? cause.message : '로그인 상태를 확인하지 못했습니다.',
          );
        });
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const go = (to: Page) => {
    const destination = to === 'login' ? 'home' : to;
    if (location.protocol === 'file:') {
      location.hash = destination;
    } else {
      history.pushState({}, '', `${destination}.html`);
      setPage(destination);
      window.scrollTo(0, 0);
    }
  };
  const goHome = () => {
    setSearch('');
    setSubmitted('');
    setCategory('전체');
    setMore(false);
    setHomeResetKey((key) => key + 1);
    go('home');
  };
  const protectedGo = (to: Page) => {
    go(to);
  };
  const openDetail = (name: string) => {
    setSelected(name);
    protectedGo('detail');
  };
  const openCalendar = (name: string, id = '') => {
    setSelected(name);
    setCalendarKey(id);
    go('calendar');
  };
  const toggleFavorite = (name: string, certificate?: FavoriteInput) =>
    setFavorites((previous) => updateFavorites(previous, name, certificate));
  const cert = certificates.find(({ name }) => name === selected) || certificates[0];
  const registered = activeSchedule
    ? calendar.some((entry) => entry.scheduleId === activeSchedule.id)
    : false;
  const register = () => setDialog(true);
  const saveGoogleRegistration = (result: CalendarRegistrationResult) => {
    if (!activeSchedule) return;
    const entry = createGoogleCalendarEntry(selected, activeSchedule, result);
    if (!entry) return;
    setCalendar(previous => [entry, ...previous.filter(item => item.scheduleId !== entry.scheduleId)]);
  };
  const small = ['mypage', 'favorites', 'calendar'].includes(page);
  const detail = page === 'detail';

  return (
    <AppContextProvider
      value={{
        page,
        setPage,
        logged,
        setLogged,
        selected,
        setSelected,
        favorites,
        setFavorites,
        calendar,
        setCalendar,
        search,
        setSearch,
        submitted,
        setSubmitted,
        category,
        setCategory,
        more,
        setMore,
        homeResetKey,
        returnPage,
        setReturnPage,
        profile,
        setProfile,
        recommendationResult,
        setRecommendationResult,
        calendarKey,
        setCalendarKey,
        examType,
        setExamType,
        round,
        setRound,
        activeSchedule,
        setActiveSchedule,
        toast,
        setToast,
        dialog,
        setDialog,
        favoriteSearch,
        setFavoriteSearch,
        sort,
        setSort,
        go,
        goHome,
        protectedGo,
        openDetail,
        toggleFavorite,
        openCalendar,
        calendarId,
        cert,
        registered,
        register,
      }}
    >
      <div className={`site ${page}${small ? ' small-site' : ''}${detail ? ' detail-site' : ''}`}>
        <Header />
        {page === 'home' && <Home />}
        {page === 'login' && <Login />}
        {page === 'profile' && <Profile />}
        {page === 'related' && <Related />}
        {page === 'recommendations' && <Recommendations />}
        {page === 'detail' && <Detail />}
        {page === 'mypage' && <Mypage />}
        {page === 'favorites' && <Favorites />}
        {page === 'calendar' && <Calendar />}
        {toast && (
          <div role="status" className="toast">
            {toast}
          </div>
        )}
        {dialog && activeSchedule && (
          <CalendarRegistrationDialog
            key={activeSchedule.id}
            name={selected}
            schedule={activeSchedule}
            onClose={() => setDialog(false)}
            onSaved={saveGoogleRegistration}
          />
        )}
      </div>
    </AppContextProvider>
  );
}
