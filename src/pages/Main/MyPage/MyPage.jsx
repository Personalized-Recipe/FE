import React, { useState, useEffect } from "react";
import styles from "./MyPage.module.scss";
import useList from "../../../utils/useList";
import { useUser } from "../../../contexts/UserContext";
import axios from "axios";

// 프로필 이미지 유효성 검사 및 기본값 처리 함수
const getValidProfileImage = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === "" || imageUrl === "null" || imageUrl === "undefined") {
        return "/basic.png";
    }
    return imageUrl;
};

function MyPage({onClose, setIsEdited, showAlert, setShowAlert}) {
    const { user, dispatch} = useUser();

    const [gender, setGender] = useState(user.gender); 
    const [isPregnant, setIsPregnant] = useState(""); 
    const [age, setAge] = useState(user.age);
    const [nickname, setNickname] = useState("");
    const [profileImage, setProfileImage] = useState("/basic.png");

    const [health, setHealth] = useState("");
    const [allergy, setAllergy] = useState("");
    const [prefer, setPrefer] = useState("");

    const [healthList, addHealth, ,removeHealth] = useList(user?.healthList || []);
    const [allergyList, addAllergy, ,removeAllergy] = useList(user?.allergyList || []);
    const [preferList, addPrefer, ,removePrefer] = useList(user?.preferList || []);

    const handlePregnant = value => {
        setIsPregnant(value);
        setIsEdited(true);
    };

    // 수정하기 버튼
    const handleEdit = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("jwt");
        const username = localStorage.getItem("username");
        
        console.log("=== MyPage 수정 요청 시작 ===");
        console.log("사용자 ID:", userId);
        console.log("JWT 토큰 존재:", !!token);
        console.log("OAuth username:", username);
        
        const promptData = {
            name: username,
            nickname: nickname,
            age,
            gender,
            pregnant: isPregnant === "예" ? true : false,
            allergy: allergyList.join(", "),
            health: healthList.join(", "),
            preference: preferList.join(", "),
            isUpdate: true // 수정임을 나타내는 플래그
        };

        console.log("수정할 프롬프트 데이터:", promptData);
        console.log("요청 URL:", `/api/users/${userId}/prompt`);

        try {
            const response = await axios.post(`/api/users/${userId}/prompt`, promptData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("=== MyPage 수정 성공 ===");
            console.log("응답 상태:", response.status);
            console.log("응답 데이터:", response.data);
            
            // 전역 상태 업데이트
            dispatch({
                type: 'UPDATE_USER',
                payload: {
                    ...user,
                    age,
                    gender,
                    healthList,
                    allergyList,
                    preferList,
                }
            });
            
            setIsEdited(false);
            alert("사용자 정보가 성공적으로 수정되었습니다!");
            
        } catch (error) {
            console.error("=== MyPage 수정 실패 ===");
            console.error("에러 상태:", error.response?.status);
            console.error("에러 상태 텍스트:", error.response?.statusText);
            console.error("에러 데이터:", error.response?.data);
            console.error("에러 메시지:", error.message);
            console.error("요청 헤더:", error.config?.headers);
            console.error("요청 URL:", error.config?.url);
            console.error("요청 데이터:", error.config?.data);
            
            if (error.response?.status === 403) {
                alert("권한이 없습니다. 로그인을 다시 시도해주세요.");
            } else {
                alert("사용자 정보 수정에 실패했습니다.");
            }
        }
    };

    // 컴포넌트 마운트 시 사용자 정보 및 프로필 정보 가져오기 (한 번만 실행)
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("jwt");
                const userId = localStorage.getItem("userId");
                
                if (token) {
                    // 1. 기본 사용자 정보 가져오기
                    const userResponse = await axios.get(`/api/users/me`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    const userData = userResponse.data;
                    
                    // 2. user_prompt 테이블에서 nickname 가져오기
                    let promptNickname = null;
                    let promptData = null;
                    try {
                        const promptResponse = await axios.get(`/api/users/${userId}/prompt`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        promptData = promptResponse.data;
                        promptNickname = promptData?.nickname;
                        console.log("user_prompt에서 가져온 데이터:", promptData);
                        console.log("user_prompt에서 가져온 nickname:", promptNickname);
                    } catch (promptError) {
                        console.log("user_prompt 가져오기 실패 (새 사용자일 수 있음):", promptError);
                    }
                    
                    // 우선순위: user_prompt nickname > user nickname > localStorage username > 기본값
                    const displayName = promptNickname || userData.nickname || localStorage.getItem("username") || "사용자";
                    
                    console.log("=== MyPage 사용자 이름 설정 ===");
                    console.log("백엔드 user 테이블 nickname:", userData.nickname);
                    console.log("백엔드 user_prompt 테이블 nickname:", promptNickname);
                    console.log("localStorage username:", localStorage.getItem("username"));
                    console.log("최종 사용할 displayName:", displayName);
                    
                    setNickname(displayName);
                    
                    // user_prompt 데이터로 입력 필드 초기화
                    if (promptData) {
                        setAge(promptData.age || '');
                        
                        // 성별 변환 (M/F -> M/F, 남자/여자 -> M/F)
                        let genderValue = promptData.gender || '';
                        if (genderValue === "남자") genderValue = "M";
                        if (genderValue === "여자") genderValue = "F";
                        setGender(genderValue);
                        
                        // 임신 여부 변환 (boolean -> 예/아니오)
                        let pregnantValue = promptData.isPregnant;
                        if (pregnantValue === true) pregnantValue = "예";
                        else if (pregnantValue === false) pregnantValue = "아니오";
                        else pregnantValue = "";
                        setIsPregnant(pregnantValue);
                        
                        // 기저질환 (healthStatus)
                        if (promptData.healthStatus) {
                            const healthArray = promptData.healthStatus.split(", ").filter(item => item.trim());
                            healthArray.forEach(item => addHealth(item));
                        }
                        
                        if (promptData.allergy) {
                            const allergyArray = promptData.allergy.split(", ").filter(item => item.trim());
                            allergyArray.forEach(item => addAllergy(item));
                        }
                        
                        if (promptData.preference) {
                            const preferArray = promptData.preference.split(", ").filter(item => item.trim());
                            preferArray.forEach(item => addPrefer(item));
                        }
                    }
                    
                    // 프로필 이미지 처리
                    const validProfileImage = getValidProfileImage(userData.profileImage);
                    setProfileImage(validProfileImage);
                    
                    // 전역 상태 업데이트
                    dispatch({
                        type: 'UPDATE_USER',
                        payload: {
                            ...user,
                            nickname: displayName,
                            profileImage: validProfileImage
                        }
                    });
                }
            } catch (error) {
                console.error("사용자 프로필 가져오기 실패:", error);
                // 에러 발생 시에도 localStorage의 username 사용
                const fallbackName = localStorage.getItem("username") || "사용자";
                setNickname(fallbackName);
                setProfileImage("/basic.png");
            }
        };

        fetchUserProfile();
    }, []); // 빈 의존성 배열로 컴포넌트 마운트 시에만 실행

    // 전역 상태 user가 바뀔 때마다 localUser 업데이트 (별도 useEffect)
    useEffect(() => {
        setHealth('');
        setAllergy('');
        setPrefer('');
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
                <img src={profileImage} alt={nickname} className={styles.profile}/>
                <p>{nickname}</p>
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
                <div className={styles.user__nickname}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>닉네임</span>
                        <div className={styles.user__input}>
                            <input 
                                type="text" 
                                placeholder="닉네임을 입력하세요."
                                value={nickname}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setNickname(val);
                                    setIsEdited(true);
                                }}
                                maxLength={10}
                             />
                        </div>
                    </div>
                </div>
                <div className={styles.user__gender}>
                    <div className={styles.labeledBox}>
                        <span className={styles.boxLabel}>성별</span>
                        <button
                            className={`${styles.button} ${gender === "M" ? styles.active : ""}`}
                            onClick={() => {
                                setGender("M");
                                dispatch({ type: 'UPDATE_FIELD', field: 'gender', value: "M" });
                                setIsEdited(true);
                            }}
                         >남자</button>
                        <button
                            className={`${styles.button} ${gender === "F" ? styles.active : ""}`}
                            onClick={() => {
                                setGender("F");
                                dispatch({ type: 'UPDATE_FIELD', field: 'gender', value: "F" });
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && health.trim()) {
                                        if (!addHealth(health)) {
                                            alert("이미 입력된 항목입니다.");
                                        } else {
                                            setHealth('');
                                            setIsEdited(true);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if (!health.trim()) {
                                alert("입력된 항목이 없습니다.");
                                return;
                            }
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
                                    }}>삭제</button>
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && allergy.trim()) {
                                        if (!addAllergy(allergy)) {
                                            alert("이미 입력된 항목입니다.");
                                        } else {
                                            setAllergy('');
                                            setIsEdited(true);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if (!allergy.trim()) {
                                alert("입력된 항목이 없습니다.")
                                return;
                            }
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
                                    }}>삭제</button>
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
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && prefer.trim()) {
                                        if (!addPrefer(prefer)) {
                                            alert("이미 입력된 항목입니다.");
                                        } else {
                                            setPrefer('');
                                            setIsEdited(true);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <button className={styles.checkButton} onClick={() => {
                            if (!prefer.trim()) {
                                alert("입력된 항목이 없습니다.")
                                return;
                            }
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
                                    }}>삭제</button>
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