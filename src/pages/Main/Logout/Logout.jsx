import React from "react"; 
import { useNavigate } from "react-router-dom"; 
import styles from "./Logout.module.scss";

function Logout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        // 로그아웃 로직을 여기에 추가
        console.log("로그아웃 처리");
        // localStorage에서 사용자 정보 삭제
        localStorage.removeItem("user");
        // 홈 페이지로 리다이렉트
        window.location.href = "/";
    };

    const handleCancel = () => {
        navigate(-1);
    }
    return (
        <div className={styles.logout}>
            <h1>로그아웃 하시겠습니까?</h1>
            <div className={styles.logout__buttons}>
                <button className={styles.logout__confirm} onClick={handleLogout}>네</button>
                <button className={styles.logout__cancel} onClick={handleCancel}>돌아가기</button>

            </div>
        </div>
    )
}

export default Logout;