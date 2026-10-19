import type { ReactNode } from 'react';
import '../styles/legal.css';

export default function LegalDocument({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="legal-page">
      <nav className="legal-nav" aria-label="약관 및 서비스 이동">
        <a href="/enter">자격잇다로 돌아가기</a>
        <a href="/privacy.html">개인정보처리방침</a>
        <a href="/google5c0b4520e20ab76e.html">Google 사이트 소유권 확인</a>
        <a href="/terms.html">서비스 이용약관</a>
      </nav>
      <article className="legal-document">
        <h1>{title}</h1>
        <p><strong>시행일: <time dateTime="2026-10-19">2026년 10월 19일</time></strong></p>
        {children}
      </article>
    </main>
  );
}

export function LegalTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="legal-table-scroll" role="region" aria-label={headers.join(', ')} tabIndex={0}>
      <table>
        <thead><tr>{headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, column) => <td key={column}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
