import './Login.scss';

function Login({ onClose }) {
  return (
    <div className="background">
        <div className="login">
            <button onClick={onClose}>닫기</button>
        </div>
    </div>
  );     
}

export default Login;