import React from 'react';
import assets from '../assets.json';
import { certificates } from '../api/certificates';
import { exams, initialCalendar } from '../api/calendar';
import { profileFields } from '../api/profile';
import { useAppContext } from '../AppContext';
import { Button } from '../components/Button';
import { Icon, OutlineIcon } from '../components/Icons';
import { FavoriteCard } from '../components/FavoriteCard';
import { CalendarRows, SmallTitle } from '../components/PageHelpers';

export default function Mypage(){const {page,logged,setLogged,selected,setSelected,favorites,setFavorites,calendar,setCalendar,search,setSearch,submitted,setSubmitted,category,setCategory,more,setMore,returnPage,setReturnPage,profile,setProfile,calendarKey,setCalendarKey,examType,setExamType,round,setRound,toast,setToast,dialog,setDialog,favoriteSearch,setFavoriteSearch,sort,setSort,go,protectedGo,openDetail,toggleFavorite,openCalendar,calendarId,cert,registered,register}=useAppContext();
return <main className="small-main mypage-main"><SmallTitle title="마이페이지" sub="관심 자격증과 등록한 일정을 한곳에서 관리하세요."/><section className="mypage-panel"><div className="panel-title"><h2><span className="outline-symbol"><OutlineIcon kind="heart"/></span>관심 자격증 <span className="count">{favorites.length}</span></h2><Button onClick={()=>go('favorites')}>더보기 ↗</Button></div><p>최근 관심 등록한 자격증 3개를 보여드립니다.</p><div className="mypage-favorites">{favorites.slice(0,3).map(c=><FavoriteCard key={c.id} c={c}/>)}{!favorites.length&&<p className="empty">관심 자격증을 등록해 주세요.</p>}</div></section><section className="mypage-panel calendar-overview"><div className="panel-title"><h2><span className="outline-symbol"><OutlineIcon kind="calendar"/></span>캘린더 등록 자격증 <span className="count">{calendar.length}</span></h2><Button onClick={()=>go('calendar')}>더보기 ↗</Button></div><p>등록한 시험 일정을 한눈에 확인하세요.</p><CalendarRows/></section></main>}
