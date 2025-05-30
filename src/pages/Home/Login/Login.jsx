import './Login.scss';

function Login({ onClose }) {
  // 카카오 로그인 핸들러
  const handleKakaoLogin = () => {
    const REST_API_KEY = "8d1a49c1f2fd8b21467e79cea3bcaddd"; // REST API KEY
    const REDIRECT_URI = "http://localhost:3000/oauth/callback/kakao"; // 리디렉트 URI
    const KAKAO_AUTH_URL =
      `https://kauth.kakao.com/oauth/authorize?client_id=8d1a49c1f2fd8b21467e79cea3bcaddd&redirect_uri=http://localhost:3000/oauth/callback/kakao&response_type=code`;

    window.location.href = KAKAO_AUTH_URL; // 로그인 창으로 이동
  };

  return (
    <div className="background">
      <div className="login">
        <button onClick={onClose}>x</button>
        <h1 className="h1">만개의 레시피</h1>
        <p className="p">로그인 하기</p>
        <img src="/login.png" alt="로그인" className="loginImg" />
        <img src="/sec3.png" alt="3초만에" className="secImg" />

        {/* 카카오 버튼을 누르면 로그인 요청 */}
        <button className="kakaoBtn" onClick={handleKakaoLogin}>
          <img src="/kakao.png" alt="카카오로 로그인" className="kakaoImg" />
        </button>
      </div>
    </div>
  );
}

export default Login;
