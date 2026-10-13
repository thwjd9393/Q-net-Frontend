import React from 'react';

export function Button({children,onClick,className='',type='button',...props}:React.ButtonHTMLAttributes<HTMLButtonElement>){return <button type={type} className={'button '+className} onClick={onClick} {...props}>{children}</button>}
