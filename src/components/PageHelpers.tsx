import { useAppContext } from '../AppContext';
import { OutlineIcon } from './Icons';
import { Button } from './Button';
import { calendarStatusLabel } from '../api/googleCalendar';

export function SmallTitle({title,sub,count}:{title:string;sub:string;count?:number}){const {page,go}=useAppContext();return <><div className="small-breadcrumb"><button onClick={()=>go('home')} aria-label="홈"><OutlineIcon kind="home"/></button><span>›</span><button onClick={()=>go('mypage')}>마이페이지</button>{page!=='mypage'&&<><span>›</span><span>{title}</span></>}</div><h1 className="small-title">{title}{count!==undefined&&<span className="count">{count}</span>}</h1><p className="small-subtitle">{sub}</p></>}

export function CalendarRows(){const {calendar,openCalendar,calendarId}=useAppContext();return <div className="calendar-rows">{!calendar.length&&<p className="empty">Google Calendar에 등록한 일정이 없습니다.</p>}{calendar.slice(0,3).map((c,i)=><div className="calendar-row" key={c.name+':'+c.type+':'+i}><div className="registered-cert"><strong>{c.name}</strong><span className="badge">{c.type}</span><p>원서접수 기간</p><b>{c.apply}</b></div><div className="registered-date"><span className="badge">{calendarStatusLabel(c.googleRegistration?.status)}</span><p>시험일</p><b>{c.exam}</b><Button onClick={()=>{openCalendar(c.name,calendarId(c))}}>일정 상세 ↗</Button></div></div>)}</div>}
