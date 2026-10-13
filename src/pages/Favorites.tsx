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

export default function Favorites(){const {page,logged,setLogged,selected,setSelected,favorites,setFavorites,calendar,setCalendar,search,setSearch,submitted,setSubmitted,category,setCategory,more,setMore,returnPage,setReturnPage,profile,setProfile,calendarKey,setCalendarKey,examType,setExamType,round,setRound,toast,setToast,dialog,setDialog,favoriteSearch,setFavoriteSearch,sort,setSort,go,protectedGo,openDetail,toggleFavorite,openCalendar,calendarId,cert,registered,register}=useAppContext();let list=favorites.filter(c=>c.name.includes(favoriteSearch));if(sort==='이름순')list=[...list].sort((a,b)=>a.name.localeCompare(b.name,'ko'));return <main className="small-main favorites-main"><SmallTitle title="관심 자격증" count={favorites.length} sub="관심 등록한 자격증 전체 목록을 확인하세요."/><div className="favorites-controls"><label><OutlineIcon kind="search"/><input aria-label="관심 자격증 검색" placeholder="자격증 이름 검색" value={favoriteSearch} onChange={e=>setFavoriteSearch(e.target.value)}/></label><select aria-label="관심 자격증 정렬" value={sort} onChange={e=>setSort(e.target.value)}><option>최신 등록순</option><option>이름순</option></select></div><div className="favorites-grid">{list.map(c=><FavoriteCard key={c.id} c={c}/>)}{!list.length&&<p className="empty">관심 자격증이 없습니다.</p>}</div></main>}
