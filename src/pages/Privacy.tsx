import LegalDocument, { LegalTable } from '../components/LegalDocument';

export default function Privacy() {
  return (
    <LegalDocument title="자격잇다 개인정보처리방침">
      <p>플레이데이터 2기 자격잇다 운영팀(이하 “운영팀”)은 자격잇다 서비스를 제공하면서 이용자의 개인정보를 보호하기 위하여 다음과 같이 개인정보처리방침을 공개합니다.</p>
      <ul>
        <li><strong>서비스명:</strong> 자격잇다</li>
        <li><strong>운영자:</strong> 플레이데이터 2기 자격잇다 운영팀</li>
        <li><strong>서비스 주소:</strong> <a href="https://q-net-frontend.vercel.app">https://q-net-frontend.vercel.app</a></li>
        <li><strong>개인정보 관련 문의:</strong> <a href="mailto:bagppyuyun@gmail.com">bagppyuyun@gmail.com</a></li>
      </ul>

      <h2>1. 개인정보의 처리 목적 및 항목</h2>
      <p>운영팀은 이용자가 요청한 기능을 제공하고 서비스를 안정적으로 운영하기 위해 다음 정보를 처리합니다.</p>
      <LegalTable headers={['구분', '처리하는 정보', '처리 목적']} rows={[
        ['자격증 추천', '이용자가 입력한 학력, 전공, 경력, 보유 자격, 관심 분야, 희망 직무, 목표 시기 등의 조건', '입력 조건에 따른 자격증 추천 및 추천 설명 제공'],
        ['Google Calendar 연결', 'OAuth 인증 코드와 상태값, 접근·갱신 토큰, 승인한 권한 범위, 연결 상태 및 만료정보', '이용자가 승인한 Calendar 연결과 권한 유지'],
        ['Calendar 일정 등록', '선택한 자격증, 회차, 일정 종류와 날짜, 등록 요청·결과, Google 이벤트 식별자', '선택한 일정 등록, 중복 등록 방지, 처리 결과 확인'],
        ['브라우저 상태 유지', '입력 프로필, 관심 자격증, 추천 결과, 화면 선택 상태, 입장 여부, 일정 등록 표시 정보', '동일 브라우저에서 이용 상태 유지'],
        ['접속·오류 처리', 'IP 주소, 요청 시각과 경로, 응답 상태, 접속·오류 관련 기록', '장애 분석, 보안 및 서비스 운영'],
        ['문의 처리', '이용자가 제공한 이메일 주소와 문의 내용', '문의 응답과 개인정보 권리 행사 요청 처리'],
      ]} />
      <p>모든 정보가 모든 이용자에게 필수인 것은 아닙니다. 추천 기능은 이용자가 입력한 조건을 처리하며, Google Calendar는 별도의 권한 동의 후 연결합니다.</p>
      <p>운영팀은 이용자의 <strong>Google 계정 비밀번호를 수집하지 않습니다.</strong></p>
      <p>이용자는 입력란에 주민등록번호, 계정 비밀번호, 인증 토큰 또는 타인의 개인정보 등 서비스 이용에 불필요한 정보를 입력하지 않아야 합니다.</p>

      <h2>2. 개인정보의 수집 방법</h2>
      <p>운영팀은 다음 방법으로 정보를 처리합니다.</p>
      <ol>
        <li>이용자가 서비스 화면에 정보를 입력하거나 기능을 선택하는 경우</li>
        <li>이용자가 Google 권한 동의 화면에서 Calendar 연결을 승인하는 경우</li>
        <li>서비스 요청 처리 중 접속·오류 기록이 생성되는 경우</li>
        <li>이용자가 이메일로 문의하거나 개인정보 관련 요청을 접수하는 경우</li>
      </ol>
      <p>기능 제공에 별도 동의가 필요한 경우에는 관련 법령에 따라 동의를 받습니다.</p>

      <h2>3. Google 사용자 데이터의 처리</h2>
      <p>Google Calendar 연결은 이용자가 선택한 시험 일정을 이용자의 Google Calendar에 등록하기 위한 기능입니다.</p>
      <p>운영팀은 다음 원칙에 따라 Google 사용자 데이터를 처리합니다.</p>
      <ol>
        <li>승인받은 정보와 권한은 이용자가 요청한 Calendar 기능을 제공하는 데 사용합니다.</li>
        <li>Google 사용자 데이터를 판매하거나 광고·마케팅 목적으로 이용하지 않습니다.</li>
        <li>Google 사용자 데이터를 범용 AI·머신러닝 모델의 개발·학습 목적으로 사용하지 않습니다.</li>
        <li>Google 인증 토큰을 AI 추천 입력으로 전달하지 않습니다.</li>
        <li>담당자의 데이터 접근은 기능 지원·보안 대응 등 필요한 경우에 한하여 제한하며, Google 정책에서 요구하는 조건을 준수합니다.</li>
        <li>권한 범위와 이용 목적에 중요한 변경이 발생하면 필요한 안내 및 동의 절차를 진행합니다.</li>
      </ol>
      <p>자격잇다의 Google API를 통한 정보 이용 및 다른 앱으로의 전송은 <strong>Limited Use 요건을 포함한 Google API Services User Data Policy</strong>를 준수합니다.</p>
      <p>정책 확인: <a href="https://developers.google.com/terms/api-services-user-data-policy">https://developers.google.com/terms/api-services-user-data-policy</a></p>

      <h2>4. AI 추천과 외부 서비스 이용</h2>
      <p>자격잇다는 AI 추천 제공을 위해 OpenAI API를 이용합니다. 추천 생성에 필요한 입력 조건과 관련 정보가 OpenAI로 전달될 수 있습니다.</p>
      <p>AI 추천 입력정보와 Google Calendar 인증정보는 목적을 구분하여 처리합니다. Google Calendar 연결 토큰은 추천 생성을 위한 입력으로 사용하지 않습니다.</p>
      <p>운영팀은 서비스 제공에 필요한 범위에서 다음 외부 서비스를 이용합니다.</p>
      <LegalTable headers={['사업자', '이용 목적']} rows={[
        ['Vercel Inc.', '프론트엔드 화면 제공, 접속 처리 및 서비스 운영'],
        ['Render Services, Inc.', '백엔드 실행, PostgreSQL 데이터 보관 및 접속·오류 처리'],
        ['OpenAI OpCo, LLC', 'AI 추천 생성 및 관련 처리'],
        ['Google LLC 및 관련 계열사', 'OAuth 인증과 Google Calendar 일정 등록'],
      ]} />
      <p>관계 법령에 근거가 있거나 적법한 동의를 받은 경우 등 허용된 경우를 제외하고 개인정보를 별도 목적으로 제3자에게 제공하지 않습니다.</p>

      <h2>5. 국외 처리에 관한 안내</h2>
      <p>외부 서비스 이용 과정에서 정보가 국외에서 처리될 수 있습니다. 사업자의 법인 소재지와 실제 데이터 처리 위치는 다를 수 있습니다.</p>
      <LegalTable headers={['사업자', '처리 국가·지역', '처리 항목 및 목적', '시기·방법', '보유기간']} rows={[
        ['Vercel Inc.', '미국 및 Vercel이 서비스를 운영하는 국가', '접속 관련 정보와 요청정보, 화면 제공·보안·운영', '사이트 접속 시 HTTPS 통신', 'Vercel의 처리 목적 및 보관 정책에 따른 기간'],
        ['Render Services, Inc.', '서비스와 DB 설정에서 선택된 국외 지역. 계정·운영정보는 미국 등에서 처리될 수 있음', 'Calendar 연결정보, 암호화된 토큰, 등록 이력, 접속·오류 기록', '기능 이용 시 암호화 통신 및 DB 처리', '운영팀 보관정보는 제6조 기준 적용. 현재 Pro 기본 로그는 14일'],
        ['OpenAI OpCo, LLC', 'API 프로젝트의 데이터 지역 설정 및 이용 기능에 따른 국외 처리 지역', '추천에 필요한 입력정보와 생성 결과, AI 처리', '추천 요청 시 HTTPS 통신', '기본 남용 방지 로그는 최대 30일. 사용 기능·저장 설정 및 법령·안전상 예외에 따라 달라질 수 있음'],
        ['Google LLC 및 관련 계열사', '미국 등 Google이 데이터센터를 운영하는 국가', '인증·권한정보와 선택 일정, Calendar 연결·등록', '연결·등록 시 HTTPS 통신', '인증 관련 정보는 Google 정책에 따름. 생성 일정은 이용자 계정의 보관·삭제 정책에 따름'],
      ]} />
      <p>운영팀은 실제 처리 지역과 계약·설정에 맞춰 필요한 국외 이전 정보와 적용 근거를 안내하고, 별도 동의가 필요한 경우 동의를 받습니다.</p>
      <p>국외 처리와 관련한 문의 또는 관련 권리 행사는 <strong><a href="mailto:bagppyuyun@gmail.com">bagppyuyun@gmail.com</a></strong>으로 요청할 수 있습니다. 해당 처리가 필요한 기능은 처리 거부 시 이용이 제한될 수 있습니다.</p>
      <p>사업자별 정책:</p>
      <ul>
        <li>Vercel: <a href="https://vercel.com/legal/privacy-notice">https://vercel.com/legal/privacy-notice</a></li>
        <li>Render: <a href="https://render.com/dpa">https://render.com/dpa</a></li>
        <li>OpenAI: <a href="https://developers.openai.com/api/docs/guides/your-data">https://developers.openai.com/api/docs/guides/your-data</a></li>
        <li>Google: <a href="https://policies.google.com/privacy?hl=ko">https://policies.google.com/privacy?hl=ko</a></li>
      </ul>

      <h2>6. 개인정보의 보유 및 이용기간</h2>
      <p>운영팀은 개인정보를 처리 목적에 필요한 범위와 기간 동안 보유하며, 목적 달성 또는 보유기간 종료 후 관계 법령에 따른 보존 사유가 없으면 파기합니다.</p>
      <p>본 서비스는 <strong>6개월간 운영할 예정</strong>이며, 정확한 종료일과 변경사항은 서비스에 공지합니다.</p>
      <LegalTable headers={['정보 구분', '보유 및 삭제 기준']} rows={[
        ['브라우저 세션 저장정보', '브라우저 세션 종료 또는 이용자의 사이트 데이터 삭제에 따라 삭제됩니다. 브라우저의 세션 복원 기능 등에 따라 유지될 수 있습니다.'],
        ['브라우저의 영구 저장소에 보관한 프로필·관심 자격증·이용 상태', '브라우저 저장 정책 또는 이용자의 삭제에 따라 유지·삭제됩니다. 탭을 닫는 것만으로 삭제되지 않을 수 있습니다.'],
        ['서버의 Calendar 연결정보·토큰·등록 이력', '처리 목적 달성, 적법한 삭제 요청 처리 또는 서비스 운영 종료 중 먼저 도래하는 시점에 삭제합니다.'],
        ['서버에 별도 보관되는 개인정보가 포함된 문의·운영 기록', '문의 해결 또는 운영 목적 달성 후 불필요한 정보는 삭제하며, 법령에 따른 보존 사유가 있으면 해당 범위에서 보관합니다.'],
        ['접속·오류 로그', '사용 중인 호스팅 사업자와 실제 로그 설정에 따릅니다. 현재 Render Pro 기본 로그 보관기간은 14일입니다.'],
        ['Google Calendar에 생성된 일정', '이용자의 Google 계정에 저장됩니다. 서비스 세션 종료·연결 해제·운영 종료만으로 자동 삭제되지 않습니다.'],
      ]} />
      <p>브라우저 저장정보 삭제와 서버 DB 정보 삭제는 서로 다른 작업입니다. 운영팀은 서버 보관정보에 대한 삭제 요청을 접수하면 필요한 범위에서 요청자를 확인하고 관계 법령에 따라 처리합니다.</p>
      <p>서비스 종료 시 운영팀이 관리하는 개인정보는 삭제하며, 백업 및 외부 사업자의 보안·계정·법적 보관정보는 적용되는 계약과 정책에 따라 처리합니다.</p>

      <h2>7. 쿠키 및 브라우저 저장소</h2>
      <p>자격잇다는 쿠키, <code>sessionStorage</code>, <code>localStorage</code> 등을 사용하여 다음 기능을 제공합니다.</p>
      <ul>
        <li>Google 인증 요청의 유효성 확인</li>
        <li>Calendar 연결 상태 유지</li>
        <li>프로필, 관심 자격증, 추천 결과 및 화면 상태 유지</li>
        <li>공용 입장 비밀번호 통과 여부 유지</li>
      </ul>
      <p>이용자는 브라우저 설정에서 쿠키와 사이트 데이터를 삭제하거나 차단할 수 있습니다. 이 경우 Calendar 연결과 일부 상태 유지 기능이 작동하지 않을 수 있습니다.</p>
      <p>공용 기기에서는 이용 종료 후 사이트 데이터를 정리하는 것이 좋습니다.</p>

      <h2>8. 이용자의 권리와 동의 철회</h2>
      <p>이용자는 관계 법령에 따라 개인정보의 열람, 정정, 삭제, 처리정지 및 동의 철회를 요청할 수 있습니다.</p>
      <p>요청 접수: <strong><a href="mailto:bagppyuyun@gmail.com">bagppyuyun@gmail.com</a></strong></p>
      <p>운영팀은 본인 확인이 필요한 경우 최소한의 정보를 요청하며, Google 비밀번호나 인증 토큰을 이메일로 요구하지 않습니다. 법령상 요청을 제한해야 하는 경우에는 사유를 안내합니다.</p>
      <p>Google 관련 정보는 다음과 같이 관리할 수 있습니다.</p>
      <ol>
        <li><strong>접근 권한 철회</strong><p>Google 계정의 연결된 앱 관리 화면에서 자격잇다의 권한을 철회할 수 있습니다.</p></li>
        <li><strong>서버 보관정보 삭제</strong><p>Calendar 연결정보와 등록 이력 삭제는 운영팀 이메일로 요청할 수 있습니다.</p></li>
        <li><strong>이미 생성된 일정 삭제</strong><p>Google Calendar에서 직접 삭제할 수 있습니다. 연결 해제나 서버 보관정보 삭제가 Google 일정 삭제를 대신하지 않습니다.</p></li>
        <li><strong>브라우저 정보 삭제</strong><p>브라우저의 사이트 데이터 관리 기능으로 저장정보를 삭제할 수 있습니다.</p></li>
      </ol>

      <h2>9. 보호조치와 파기 방법</h2>
      <p>운영팀은 개인정보 보호를 위해 다음과 같은 조치를 적용합니다.</p>
      <ul>
        <li>서비스 관리 권한 및 비밀정보 접근 제한</li>
        <li>HTTPS 등 암호화 통신 사용</li>
        <li>API 키와 비밀 키의 환경변수 관리</li>
        <li>Google 갱신 토큰의 암호화 보관</li>
        <li>오류 기록에 비밀 키·인증정보가 포함되지 않도록 관리</li>
      </ul>
      <p>파기 대상 전자정보는 복구·재사용을 방지할 수 있는 방법으로 삭제합니다. 외부 사업자의 백업·로그에 적용되는 삭제 시점은 해당 사업자의 정책과 계약을 확인하여 관리합니다.</p>

      <h2>10. 처리방침 변경 및 문의</h2>
      <p>개인정보 처리 항목, 목적, 보유기간 등이 변경되면 변경 내용과 적용일을 서비스에 공개합니다. 별도 동의가 필요한 변경은 관계 법령에 따른 절차를 진행합니다.</p>
      <ul>
        <li><strong>운영자:</strong> 플레이데이터 2기 자격잇다 운영팀</li>
        <li><strong>개인정보 관련 문의:</strong> <a href="mailto:bagppyuyun@gmail.com">bagppyuyun@gmail.com</a></li>
        <li><strong>시행일:</strong> 2026년 10월 19일</li>
      </ul>
    </LegalDocument>
  );
}
