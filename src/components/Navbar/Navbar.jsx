import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Navbar.module.scss";
function Navbar({ onClickLogin }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isMainPage = location.pathname === "/main";

    return (
        <div className={styles.navbar}>
            <div className={styles.navbar__logo}>
                <img src="/logo.svg" alt="로고" />
                <p> 만개의 레시피</p>
            </div>
            {!isMainPage && (<button className={styles.sign_up} onClick={onClickLogin}>간편 로그인</button>)}
            {isMainPage && (<div className={styles.navbar__links}>
                <button className={styles["hover-area"]} onClick={() => navigate("/MyRecipe", { state: { background: location } })}>
                    내 레시피
                    <div className={styles["tooltip"]}>
                    저장한 레시피의 정보를 한 눈에 볼 수 있어요
                    </div>
                </button>
                <button className={styles["hover-area"]} onClick={() => navigate("/MyIngre", { state: { background: location } })}>
                    내 재료
                    <div className={styles["tooltip"]}>
                    냉장고에 있는 재료를 기록할 수 있어요
                    </div>
                </button>
                <button onClick={() => navigate("/MyPage", { state: { background: location } })}>
                    프로필
                </button>
                <button onClick={() => navigate("/Logout", { state: { background: location } })}>
                    로그아웃
                </button>
            </div>)}
        </div>
    );
}

export default Navbar;