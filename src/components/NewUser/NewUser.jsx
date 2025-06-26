import React, { useState } from 'react';
import './NewUser.scss';
import Navbar from "../Navbar/Navbar";
import axios from 'axios';

const allergyOptions = [
    "우유", "밀", "땅콩", "알류(가금류)", "메밀", "게",
    "대두", "새우", "복숭아", "돼지고기", "쇠고기", "토마토",
    "고등어", "닭고기", "오징어", "조개류", "호두, 잣", "아황산"
];

const NewUser = () => {
    const [step, setStep] = useState(0);
    const [nickname, setNickname] = useState("");
    const [age, setAge] = useState("");
    const [selectedGender, setSelectedGender] = useState(null);
    const [pregnantStatus, setPregnantStatus] = useState(null);
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [healthInfo, setHealthInfo] = useState("");
    const [preferFood, setPreferFood] = useState("");

    const toggleAllergy = (item) => {
        setSelectedAllergies((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    const handleSubmitPrompt = async () => {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("jwt");
        const username = localStorage.getItem("username");
        
        console.log("=== 프롬프트 저장 시작 ===");
        console.log("사용자 ID:", userId);
        console.log("JWT 토큰 존재:", !!token);
        console.log("OAuth username:", username);
        
        const promptData = {
            name: username,
            nickname,
            age,
            gender: selectedGender === "male" ? "M" : selectedGender === "female" ? "F" : null,
            pregnant: pregnantStatus,
            allergy: selectedAllergies.join(", "),
            health: healthInfo,
            preference: preferFood
        };

        console.log("프롬프트 데이터:", promptData);
        console.log("요청 URL:", `/api/users/${userId}/prompt`);

        try {
            const response = await axios.post(`/api/users/${userId}/prompt`, promptData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("=== 프롬프트 저장 성공 ===");
            console.log("응답 상태:", response.status);
            console.log("응답 데이터:", response.data);
            
            alert("프롬프트 정보가 성공적으로 저장되었습니다!");
            // 메인 페이지로 이동
            window.location.href = "/main";
        } catch (error) {
            console.error("=== 프롬프트 저장 실패 ===");
            console.error("에러 상태:", error.response?.status);
            console.error("에러 상태 텍스트:", error.response?.statusText);
            console.error("에러 데이터:", error.response?.data);
            console.error("에러 메시지:", error.message);
            console.error("요청 헤더:", error.config?.headers);
            console.error("요청 URL:", error.config?.url);
            console.error("요청 데이터:", error.config?.data);
            
            if (error.response?.status === 403) {
                alert("권한이 없습니다. 로그인을 다시 시도해주세요.");
            } else if (error.response?.data?.error?.includes("Duplicate entry")) {
                alert("이미 사용자 정보가 저장되어 있습니다. 메인 페이지로 이동합니다.");
                // 메인 페이지로 이동
                window.location.href = "/main";
            } else {
                alert("프롬프트 저장에 실패했습니다.");
            }
        }
    };

    return (
        <div className="navbar-main">
            <Navbar />
            <div className="modal-background">
                {step === 0 && (
                    <div className="nickname">
                        <div className="nick-title">닉네임을 입력해주세요.</div>
                        <div className="nick-main">
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                maxLength={10}
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && nickname.trim()) {
                                        setStep(1);
                                    }
                                }}
                                placeholder="닉네임(최대 10자)"
                                className="nick-input"
                            />
                        </div>
                        <button className="nick-after" onClick={() => setStep(1)}>다음</button>
                    </div>
                )}

                {step === 1 && (
                    <div className="age">
                        <div className="age-title">나이를 입력해주세요.</div>
                        <div className="age-main">
                            <input
                                type="number"
                                min="1"
                                max="120"
                                step="1"
                                className="age-input"
                                placeholder="숫자로 입력하세요"
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && age.trim()) {
                                        setStep(2);
                                    }
                                }}
                            />
                        </div>
                        <button className="gender-before" onClick={() => setStep(0)}>이전</button>
                        <button className="age-after" onClick={() => setStep(2)}>다음</button>
                    </div>
                )}

                {step === 2 && (
                    <div className="gender" onKeyDown={(e) => {
                        if (e.key === 'Enter' && selectedGender) {
                            setStep(3);
                        }
                    }}>
                        <div className="gender-title">성별을 입력해주세요.</div>
                        <div className="gender-main">
                            <button
                                className={`gender-button ${selectedGender === "male" ? "selected" : ""}`}
                                onClick={() => setSelectedGender("male")}
                            >
                                남
                            </button>
                            <button
                                className={`gender-button ${selectedGender === "female" ? "selected" : ""}`}
                                onClick={() => setSelectedGender("female")}
                            >
                                여
                            </button>
                        </div>
                        <button className="gender-before" onClick={() => setStep(1)}>이전</button>
                        <button className="gender-after" onClick={() => setStep(3)}>다음</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="pregnant" onKeyDown={(e) => {
                        if (e.key === 'Enter' && pregnantStatus) {
                            setStep(4);
                        }
                    }}>
                        <div className="pregnant-title">임신 여부를 체크해주세요.</div>
                        <div className="pregnant-main">
                            <button
                                className={`pregnant-button ${pregnantStatus === "pregnant" ? "selected" : ""}`}
                                onClick={() => setPregnantStatus("pregnant")}
                            >
                                임신함
                            </button>
                            <button
                                className={`pregnant-button ${pregnantStatus === "none" ? "selected" : ""}`}
                                onClick={() => setPregnantStatus("none")}
                            >
                                해당사항 없음
                            </button>
                        </div>
                        <button className="preg-before" onClick={() => setStep(2)}>이전</button>
                        <button className="preg-after" onClick={() => setStep(4)}>다음</button>
                    </div>
                )}

                {step === 4 && (
                    <div className="health-status">
                        <div className="health-status-title">건강상태를 입력해주세요.</div>
                        <div className="health-main">
                            <input
                                id="health-input"
                                type="text"
                                value={healthInfo}
                                maxLength={50}
                                placeholder="예: 천식이 있어요"
                                onChange={(e) => setHealthInfo(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setStep(5);
                                    }
                                }}
                                className="health-input"
                            />
                            <div className="char-count">{healthInfo.length} / 50</div>
                        </div>
                        <button className="health-before" onClick={() => setStep(3)}>이전</button>
                        <button className="health-after" onClick={() => setStep(5)}>다음</button>
                    </div>
                )}

                {step === 5 && (
                    <div className="allergy" onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            setStep(6);
                        }
                    }}>
                        <div className="allergy-title">알러지를 선택해주세요.</div>
                        <div className="allergy-main">
                            {allergyOptions.map((item) => (
                                <button
                                    key={item}
                                    className={`allergy-button ${selectedAllergies.includes(item) ? "selected" : ""}`}
                                    onClick={() => toggleAllergy(item)}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                        <button className="allergy-before" onClick={() => setStep(4)}>이전</button>
                        <button className="allergy-after" onClick={() => setStep(6)}>다음</button>
                    </div>
                )}

                {step === 6 && (
                    <div className="preferred">
                        <div className="preferred-title">선호하는 음식을 입력해주세요.</div>
                        <div className="prefer-main">
                            <input
                                id="prefer-input"
                                type="text"
                                value={preferFood}
                                maxLength={100}
                                placeholder="예: 파스타, 연어, 단백한 음식"
                                onChange={(e) => setPreferFood(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmitPrompt();
                                    }
                                }}
                                className="prefer-input"
                            />
                            <div className="prefer-count">{preferFood.length} / 100</div>
                        </div>
                        <button className="prefer-before" onClick={() => setStep(5)}>이전</button>
                        <button className="prefer-after" onClick={handleSubmitPrompt}>완료</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewUser;