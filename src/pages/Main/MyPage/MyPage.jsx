import React, { useState, useEffect } from "react";
import styles from "./MyPage.module.scss";
import useList from "../../../utils/useList";
import { useUser } from "../../../contexts/UserContext";

function MyPage({onClose, setIsEdited, showAlert, setShowAlert}) {
    const { user, dispatch} = useUser();

    const [gender, setGender] = useState(user.gender); 
    const [isPregnant, setIsPregnant] = useState(""); 
    const [age, setAge] = useState(user.age);

    const [health, setHealth] = useState("");
    const [allergy, setAllergy] = useState("");
    const [prefer, setPrefer] = useState("");
    const [dislike, setDislike] = useState("");

    const [healthList, addHealth, removeHealth] = useList(user?.healthList || []);
    const [allergyList, addAllergy, removeAllergy] = useList(user?.allergyList || []);
    const [preferList, addPrefer, removePrefer] = useList(user?.preferList || []);
    const [dislikeList, addDislike, removeDislike] = useList(user?.dislikeList || []);

    const handlePregnant = value => {
        setIsPregnant(value);
        setIsEdited(true);
    };

    // 수정하기 버튼
    const handleEdit = () => {
        dispatch({
        type: 'UPDATE_USER',
        payload: {
            ...user,
            age,
            gender,
            healthList,
            allergyList,
            preferList,
            dislikeList
        }
        });
        setIsEdited(false)
        console.log("수정하기 버튼 클릭")
    };

    // 전역 상태 user가 바뀔 때마다 localUser 업데이트
    useEffect(() => {
        if (user) {
        setAge(user.age || '');
        setGender(user.gender || '');
        setHealth(user.healthList || []);
        setAllergy(user.allergyList || []);
        setPrefer(user.preferList || []);
        setDislike(user.dislikeList || []);
        }
    }, [user]);


    const handleAlertConfirm = () => {
        console.log("alert 클릭");
        setShowAlert(false);
        setIsEdited(false);
        onClose && onClose();
    };

    return (
        <div className={styles.MyPage}>
            <div className={styles.MyPage__header}>
                <img src="/basic.png" alt="기본 프로필" className={styles.profile}/>
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAge(val);
                                    dispatch({ type: 'UPDATE_FIELD', field: 'age', value: val});
                                    setIsEdited(true);
                                }}
                             />
                        </div>
                    </div>
                </div>
                <div className={styles.user__gender}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>성별</span>
                        <button
                            className={`${styles.button} ${gender === "남자" ? styles.active : ""}`}
                            onClick={() => {
                                setGender("남자");
                                dispatch({ type: 'UPDATE_FIELD', field: 'gender', value: "남자" });
                                setIsEdited(true);
                            }}
                         >남자</button>
                        <button
                            className={`${styles.button} ${gender === "여자" ? styles.active : ""}`}
                            onClick={() => {
                                setGender("여자");
                                dispatch({ type: 'UPDATE_FIELD', field: 'gender', value: "여자" });
                                setIsEdited(true);
                            }}
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
                                onChange={(e) => {
                                    setHealth(e.target.value);
                                    setIsEdited(true);
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                             if (!addHealth(health)) alert("이미 입력된 항목입니다.");
                            setHealth('');
                            setIsEdited(true);
                        }}>확인</button>
                        <div className={styles.infoBox}>
                            {healthList.map((item, index) => (
                                <div className={styles.item} key={index}>
                                    {item}
                                    <button className={styles.deleteBtn} onClick={() => {
                                        removeHealth(index);
                                        setIsEdited(true);
                                    }}>x</button>
                                </div>
                            ))}
                        </div>
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
                                onChange={(e) => {
                                    setAllergy(e.target.value);
                                    setIsEdited(true);
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if(!addAllergy(allergy)) alert("이미 입력된 항목입니다.");
                            setAllergy('');
                            setIsEdited(true);
                        }}>확인</button>
                        <div className={styles.infoBox}>
                            {allergyList.map((item, index) => (
                                <div className={styles.item} key={index}>
                                    {item}
                                    <button className={styles.deleteBtn} onClick={() => {
                                        removeAllergy(index);
                                        setIsEdited(true);
                                    }}>x</button>
                                </div>
                            ))}
                        </div>
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
                                onChange={(e) => {
                                    setPrefer(e.target.value);
                                    setIsEdited(true);
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if(!addPrefer(prefer)) alert("이미 입력된 항목입니다.");
                            setPrefer('');
                            setIsEdited(true);
                        }}>확인</button>
                        <div className={styles.infoBox}>
                            {preferList.map((item, index) => (
                                <div className={styles.item} key={index}>
                                    {item}
                                    <button className={styles.deleteBtn} onClick={() => {
                                        removePrefer(index);
                                        setIsEdited(true);
                                    }}>x</button>
                                </div>
                            ))}
                        </div>
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
                                onChange={(e) => {
                                    setDislike(e.target.value);
                                    setIsEdited(true);
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if(!addDislike(dislike)) alert("이미 입력된 항목입니다.");
                            setDislike('');
                            setIsEdited(true);
                        }}>확인</button>
                        <div className={styles.infoBox}>
                            {dislikeList.map((item, index) => (
                                <div className={styles.item} key={index}>
                                    {item}
                                    <button className={styles.deleteBtn} onClick={() => {
                                        removeDislike(index);
                                        setIsEdited(true);
                                    }}>x</button>
                                </div>
                            ))}
                        </div>
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