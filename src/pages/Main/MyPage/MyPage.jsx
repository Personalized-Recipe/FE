import React, { useState } from "react";
import styles from "./MyPage.module.scss";

function MyPage({onClose, setIsEdited, showAlert, setShowAlert}) {
    const [gender, setGender] = useState(""); 
    const [isPregnant, setIsPregnant] = useState(""); 
    const [age, setAge] = useState("");
    const [health, setHealth] = useState("");
    const [allergy, setAllergy] = useState("");
    const [prefer, setPrefer] = useState("");
    const [dislike, setDislike] = useState("");

    const handleInput = setter => e => {
        setter(e.target.value);
        setIsEdited(true);
    };

    const handleGender = value => {
        setGender(value);
        setIsEdited(true);
    };

    const handlePregnant = value => {
        setIsPregnant(value);
        setIsEdited(true);
    };

    // 수정하기 버튼
    const handleEdit = () => {
        // 여기서 유저 정보 업데이트 로직 실행
        setIsEdited(false);
    };

    const handleAlertConfirm = () => {
        console.log("alert 클릭");
        setShowAlert(false);
        setIsEdited(false);
        onClose && onClose();
    };


    return (
        <div className={styles.MyPage}>
            <div className={styles.MyPage__header}>
                <h1>프로필 이미지</h1>
                <p>홍길동</p>
            </div>
            <div className={styles.MyPage__content}>
                <div className={styles.user__age}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>나이</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text" 
                                placeholder="나이를 입력하세요."
                                value={age}
                                onChange={handleInput(setAge)}
                             />
                        </div>
                    </div>
                </div>
                <div className={styles.user__gender}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>성별</span>
                        <button
                            className={`${styles.button} ${gender === "남자" ? styles.active : ""}`}
                            onClick={() => handleGender("남자")}
                         >남자</button>
                        <button
                            className={`${styles.button} ${gender === "여자" ? styles.active : ""}`}
                            onClick={() => handleGender("여자")}
                        >여자</button> 
                    </div>
                </div>
                <div className={styles.user__isPregnant}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>임신 여부</span>
                        <button
                            className={`${styles.button} ${isPregnant === "예" ? styles.active : ""}`}
                            onClick={() => handlePregnant("예")}
                        >예</button>
                        <button
                            className={`${styles.button} ${isPregnant === "아니오" ? styles.active : ""}`}
                            onClick={() => handlePregnant("아니오")}
                        >아니오</button>
                    </div>
                </div>
                <div className={styles.user__health}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>기저질환</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text" 
                                placeholder="질환명을 입력하세요."
                                value={health}
                                onChange={handleInput(setHealth)}
                            />
                        </div>
                        <button className={styles.checkButton}>확인</button>
                        <div className={styles.infoBox}>여기에 입력항목</div>
                    </div>
                </div>
                <div className={styles.user__allergy}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>알레르기 정보</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text"    
                                placeholder="알레르기명을 입력하세요." 
                                value={allergy}
                                onChange={handleInput(setAllergy)}
                            />
                        </div>
                        <button className={styles.checkButton}>확인</button>
                        <div className={styles.infoBox}>여기에 입력항목</div>
                    </div>
                </div>
                <div className={styles.user__prefer}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>선호재료/음식</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text" 
                                placeholder="좋아하는 재료나 음식을 입력하세요."
                                value={prefer}
                                onChange={handleInput(setPrefer)}
                            />
                        </div>
                        <button className={styles.checkButton}>확인</button>
                        <div className={styles.infoBox}>여기에 입력항목</div>
                    </div>
                </div>
                <div className={styles.user__dislike}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>비선호재료/음식</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text" 
                                placeholder="싫어하는 재료나 음식을 입력하세요." 
                                value={dislike}
                                onChange={handleInput(setDislike)}
                            />
                        </div>
                        <button className={styles.checkButton}>확인</button>
                        <div className={styles.infoBox}>여기에 입력항목</div>
                    </div>
                </div>
                <button className={styles.editButton} onClick={handleEdit}> 수정하기 </button>
            </div>
            {showAlert && (
                <div className={styles.alertBox}>
                    <div>
                        <span>변경사항이 저장되지 않습니다.</span><br />
                        <button onClick={handleAlertConfirm}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyPage;