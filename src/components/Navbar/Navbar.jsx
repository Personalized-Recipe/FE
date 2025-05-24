import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.scss";
function Navbar({ onClickLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className={styles.navbar}>
            <div className={styles.navbar__logo}>
                <img src="/logo.svg" alt="로고" />
                <p> 만개의 레시피</p>
            </div>
            <button className={styles.sign_up} onClick={onClickLogin}>간편 로그인</button>
            <div className={styles.navbar__links}>
                <button className="help">도움</button>
                <button onClick={() => navigate("/Recipe", { state: { background: location } })}>
                    내 레시피
                </button>
                <button onClick={() => navigate("/MyIngre", { state: { background: location } })}>
                    내 재료
                </button>
                <button onClick={() => navigate("/MyPage", { state: { background: location } })}>
                    프로필
                </button>
                <button onClick={() => navigate("/Logout", { state: { background: location } })}>
                    로그아웃
                </button>
            </div>
        </div>
    );
}

export default Navbar;