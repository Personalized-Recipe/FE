import './Login.scss';

function Login({ onClose }) {
  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    const KAKAO_AUTH_URL =
        `https://kauth.kakao.com/oauth/authorize?client_id=8d1a49c1f2fd8b21467e79cea3bcaddd&redirect_uri=http://localhost:3000/oauth/callback/kakao&response_type=code`;
    window.location.href = KAKAO_AUTH_URL;
  };

  // 구글 로그인 핸들러
  const handleGoogleLogin = () => {
    const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";
    const REDIRECT_URI = "http://localhost:3000/oauth/callback/google";
    const GOOGLE_AUTH_URL =
        `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`;
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
      <div className="background">
        <div className="login">
          <button className="close" onClick={onClose}>x</button>
          <h1 className="h1">만개의 레시피</h1>
          <p className="p">로그인 하기</p>
          <img src="/login.png" alt="로그인" className="loginImg" />
          <img src="/sec3.png" alt="3초만에" className="secImg" />

          {/* 카카오 로그인 버튼 */}
          <button className="kakaoBtn" onClick={handleKakaoLogin}>
            <img src="/kakao.png" alt="카카오로 로그인" className="kakaoImg" />
          </button>

          {/* 구글 로그인 버튼 */}
          <button className="googleBtn" onClick={handleGoogleLogin}>
            <div className="googleContent">
              <img src="/google.png" alt="Google G 로고" className="googleLogo" />
              <span className="googleText">Google로 간편 회원가입</span>
            </div>
          </button>
        </div>
      </div>
  );
}


export default Login;
