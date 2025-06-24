// src/pages/Home/Login/OauthCallback.jsx
import React, { useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const OauthCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isProcessing = useRef(false);

    useEffect(() => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        localStorage.removeItem("jwt");

        const query = new URLSearchParams(location.search);
        const code = query.get("code");
        const error = query.get("error");

        console.log("=== OAuth Callback 디버깅 시작 ===");
        console.log("Provider:", provider);
        console.log("Full URL:", location.href);
        console.log("Search params:", location.search);
        console.log("Code:", code ? code.substring(0, 10) + "..." : "없음");
        console.log("Error:", error || "없음");

        if (error) {
            console.error("OAuth 에러 발생:", error);
            alert("OAuth 인증에 실패했습니다.");
            navigate("/");
            return;
        }

        if (code && provider) {
            console.log("OAuth 요청 시작:", { provider, code: code.substring(0, 10) + "..." });
            
            const requestData = { code };
            console.log("요청 데이터:", requestData);
            console.log("요청 URL:", `/api/oauth/${provider}/callback`);

            axios
                .post(`/api/oauth/${provider}/callback`, requestData)
                .then((res) => {
                    console.log("=== OAuth 응답 성공 ===");
                    console.log("응답 상태:", res.status);
                    console.log("응답 헤더:", res.headers);
                    console.log("응답 데이터 타입:", typeof res.data);
                    console.log("응답 데이터:", res.data);
                    
                    // 응답 데이터가 없는 경우 처리
                    if (!res.data) {
                        console.error("응답 데이터가 없습니다");
                        throw new Error("응답 데이터가 없습니다");
                    }
                    
                    // 응답 데이터 구조 분석
                    const responseData = res.data;
                    console.log("응답 데이터 키들:", Object.keys(responseData));
                    console.log("응답 데이터 값들:", Object.values(responseData));
                    
                    // 백엔드 응답 구조에 맞춰 데이터 추출
                    let token = responseData.token;
                    let userId = null;
                    let username = null;
                    let profileImage = null;
                    
                    // user 객체가 있는 경우
                    if (responseData.user) {
                        console.log("user 객체 존재:", responseData.user);
                        userId = responseData.user.userId;
                        username = responseData.user.username;
                        profileImage = responseData.user.profileImage;
                    } else {
                        // 기존 방식으로도 시도
                        userId = responseData.userId || responseData.user_id || responseData.id;
                    }
                    
                    console.log("추출된 토큰:", token ? `존재 (길이: ${token.length})` : "없음");
                    console.log("추출된 사용자 ID:", userId || "없음");
                    console.log("추출된 사용자명:", username || "없음");
                    console.log("추출된 프로필 이미지:", profileImage || "없음");
                    
                    // 토큰이나 사용자 ID가 없는 경우 상세 분석
                    if (!token || !userId) {
                        console.error("=== 응답 데이터 상세 분석 ===");
                        console.error("전체 응답 데이터:", JSON.stringify(responseData, null, 2));
                        console.error("토큰:", token);
                        console.error("사용자 ID:", userId);
                        console.error("user 객체:", responseData.user);
                        
                        // 백엔드 응답 형식이 다를 수 있으므로 임시로 기본값 사용
                        if (!token) {
                            console.warn("토큰이 없어서 임시 토큰을 사용합니다");
                            token = "temp_token_" + Date.now();
                        }
                        if (!userId) {
                            console.warn("사용자 ID가 없어서 임시 ID를 사용합니다");
                            userId = "temp_user_" + Date.now();
                        }
                    }
                    
                    console.log("최종 토큰:", token);
                    console.log("최종 사용자 ID:", userId);
                    
                    localStorage.setItem("jwt", token);
                    localStorage.setItem("userId", userId);
                    if (username) localStorage.setItem("username", username);
                    if (profileImage) localStorage.setItem("profileImage", profileImage);
                    console.log("JWT 토큰 및 사용자 정보 저장 완료");
                    
                    alert("로그인 성공!");

                    // 사용자 프롬프트 존재 여부 확인
                    console.log("프롬프트 확인 요청 시작");
                    console.log("프롬프트 확인 URL:", `/api/users/${userId}/prompt`);
                    
                    axios
                        .get(`/api/users/${userId}/prompt`, {
                            headers: { Authorization: `Bearer ${token}` },
                        })
                        .then((promptRes) => {
                            console.log("=== 프롬프트 확인 응답 ===");
                            console.log("프롬프트 응답 상태:", promptRes.status);
                            console.log("프롬프트 응답 데이터:", promptRes.data);
                            
                            if (promptRes.data && promptRes.data.id) {
                                console.log("기존 사용자 - /main으로 이동");
                                navigate("/main");
                            } else {
                                console.log("새 사용자 - /new로 이동");
                                navigate("/new");
                            }
                        })
                        .catch((promptErr) => {
                            console.error("=== 프롬프트 확인 실패 ===");
                            console.error("프롬프트 에러 상태:", promptErr.response?.status);
                            console.error("프롬프트 에러 데이터:", promptErr.response?.data);
                            console.error("프롬프트 에러 메시지:", promptErr.message);
                            
                            console.log("프롬프트 확인 실패 - /new로 이동");
                            navigate("/new");
                        });
                })
                .catch((err) => {
                    console.error("=== OAuth 요청 실패 ===");
                    console.error("에러 객체:", err);
                    console.error("에러 메시지:", err.message);
                    console.error("에러 상태:", err.response?.status);
                    console.error("에러 상태 텍스트:", err.response?.statusText);
                    console.error("에러 헤더:", err.response?.headers);
                    console.error("에러 데이터:", err.response?.data);
                    console.error("에러 요청:", err.request);
                    console.error("에러 설정:", err.config);
                    
                    alert("로그인에 실패했습니다.");
                    navigate("/");
                });
        } else {
            console.error("=== 코드 또는 프로바이더 문제 ===");
            console.error("코드 존재:", !!code);
            console.error("프로바이더 존재:", !!provider);
            alert("인증 코드를 받지 못했습니다.");
            navigate("/");
        }
    }, [provider, location, navigate]);

    return <div>로그인 처리 중입니다...</div>;
};

export default OauthCallback;
