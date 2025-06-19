import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Login from './Login/Login.jsx';
import './Home.scss';

function Home() {
    const [showLogin, setShowLogin] = useState(false);

    const handleLoginClick = () => {
    setShowLogin(true);
    }
    const handleCloseLogin = () => {
    setShowLogin(false);
    }

    useEffect(() => {
        document.body.style.overflow = showLogin ? 'hidden' : 'auto';
        return () => {
            document.body.style.overflow = 'auto'; // 혹시라도 깔끔하게 정리
        };
    }, [showLogin]);

  return (
    <div className="Home">
        <Navbar onClickLogin={handleLoginClick} />
        <div className="info">
            <h1 className="cong" style={{ fontSize: "2.5rem" }}><strong style={{ fontSize: "3rem" }}>{'\u00a0'}만개의 레시피{'\u00a0'}</strong>에 오신걸 환영합니다!</h1>
            <p className="sup">저희는 차별화된 서비스를 제공합니다.</p>
            <div className="personality">
                <div style={{ fontSize: "130px" }}>🍱</div>
                <div className="per-footer">
                    개인화된 레시피 솔루션
                </div>
            </div>
            <div className="ingredient">
                <div style={{ fontSize: "130px" }}>👩🏻‍🌾</div>
                <div className="ing-footer">
                    냉장고 재료로 레시피 추천
                </div>
            </div>
            <div className="replace">
                <div style={{ fontSize: "130px" }}>🥒</div>
                <div className="rep-footer">
                    대체 재료 추천
                </div>
            </div>
        </div>
        <div className="to_exp">
            <h1 className="title">개인화된 요리 레시피 추천</h1>
            <p className="subtitle">
                일반적인 상담이 아닌 {'\u00a0'}‘나’{'\u00a0'} 를 위한 개인 영양사
            </p>
            <button className="action-button">나만의 레시피 체험해보기</button>
        </div>
        <div className="etc">
            <div class="footer-links">
                <span>개인정보 처리방침</span>
                <span>서비스 이용 약관</span>
                <span>고객센터</span>
            </div>
        </div>
        {showLogin && <Login onClose={handleCloseLogin}/>}
    </div>
  );     
}

export default Home;