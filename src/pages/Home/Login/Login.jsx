import './Login.scss';

function Login({ onClose }) {
  return (
    <div className="background">
        <div className="login">
            <button onClick={onClose}>x</button>
            <h1 className="h1">만개의 레시피</h1>
            <p className="p">로그인 하기</p>
            <img src="/login.png" alt="로그인" className="loginImg"/>
            <img src="/sec3.png" alt="3초만에" className="secImg"/>
            <img src="/kakao.png" alt="카카오" className="kakaoImg"/>
        </div>
    </div>
  );     
}

export default Login;