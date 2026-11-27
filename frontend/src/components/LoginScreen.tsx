import { useState, type FormEvent } from 'react'

export default function LoginScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Firebase 인증은 아직 연결되지 않았습니다. 입력 화면 미리보기입니다.')
  }

  return (
    <section className="login-section">
      <div className="login-background-mark" aria-hidden="true">LCK</div>
      <div className="login-card">
        <button className="login-back" type="button" onClick={onBack}><span aria-hidden="true">←</span> 홈으로 돌아가기</button>
        <div className="login-kicker"><span /> LCK FAN ACCOUNT</div>
        <div className="login-monogram" aria-hidden="true">L</div>
        <h1>다시, 협곡으로.</h1>
        <p className="login-description">로그인하고 좋아하는 팀과 함께<br />LCK를 더 가까이 즐겨보세요.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">이메일</label>
          <input id="login-email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">비밀번호</label>
          <input id="login-password" type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <button className="login-submit" type="submit">로그인 <span aria-hidden="true">↗</span></button>
          {message && <p className="login-feedback" role="status">{message}</p>}
        </form>
        <p className="login-preview-note">지금은 화면 미리보기 단계예요. 실제 계정 인증은 Firebase 연결 후 사용할 수 있습니다.</p>
      </div>
    </section>
  )
}
