import React from 'react';
import assets from '../assets.json';

export function Icon({name}:{name:keyof typeof assets['12:1410']}){return <img className="icon" alt="" src={assets['12:1410'][name]}/>}

export function OutlineIcon({kind}:{kind:'calendar'|'list'|'heart'|'search'|'home'}){return <svg className="outline-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind==='calendar'?<><rect x="3" y="6" width="26" height="24" rx="2"/><path d="M3 13h26M10 2v9M22 2v9"/></>:kind==='list'?<path d="M3 6h1m8 0h18M3 16h1m8 0h18M3 26h1m8 0h18"/>:kind==='heart'?<path d="M16 29 3 17C-5 6 8-3 16 6 24-3 37 6 29 17Z"/>:kind==='search'?<><circle cx="13" cy="13" r="9"/><path d="m20 20 9 9"/></>:<path d="m5 14 11-10 11 10v15H5Z"/>}</svg>}
