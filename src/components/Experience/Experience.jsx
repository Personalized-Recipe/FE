import React, { useState } from 'react';
import './Experience.scss';
import Navbar from "../Navbar/Navbar";

const allergyOptions = [
    "우유", "밀", "땅콩", "알류(가금류)", "메밀", "게",
    "대두", "새우", "복숭아", "돼지고기", "쇠고기", "토마토",
    "고등어", "닭고기", "오징어", "조개류", "호두, 잣", "아황산"
];

const NewUser = () => {
    const [step, setStep] = useState(0);
    const [selectedAllergies, setSelectedAllergies] = useState([]);
    const [healthInfo, setHealthInfo] = useState("");
    const [preferFood, setPreferFood] = useState("");

    const toggleAllergy = (item) => {
        setSelectedAllergies((prev) =>
            prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
        );
    };

    return (
        <div className="navbar-main">
            <Navbar />
            <div className="modal-background">

                {step === 0 && (
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
                                className="health-input"
                            />
                            <div className="char-count">{healthInfo.length} / 50</div>
                        </div>
                        <button className="health-after" onClick={() => setStep(1)}>다음</button>
                    </div>
                )}

                {step === 1 && (
                    <div className="allergy">
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
                        <button className="allergy-before" onClick={() => setStep(0)}>이전</button>
                        <button className="allergy-after" onClick={() => setStep(2)}>다음</button>
                    </div>
                )}

                {step === 2 && (
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
                                className="prefer-input"
                            />
                            <div className="prefer-count">{preferFood.length} / 100</div>
                        </div>
                        <button className="prefer-before" onClick={() => setStep(1)}>이전</button>
                        <button className="prefer-after">완료</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewUser;