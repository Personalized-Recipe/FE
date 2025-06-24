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

        if (error) {
            alert("OAuth 인증에 실패했습니다.");
            navigate("/");
            return;
        }

        if (code && provider) {
            console.log("OAuth 요청 시작:", { provider, code: code.substring(0, 10) + "..." });

            axios
                .post(`/api/oauth/${provider}/callback`, { code })
                .then((res) => {
                    if (res.data && res.data.token && res.data.userId) {
                        const { token, userId } = res.data;
                        localStorage.setItem("jwt", token);
                        alert("로그인 성공!");

                        // 사용자 프롬프트 존재 여부 확인
                        axios
                            .get(`/api/users/${userId}/prompt`, {
                                headers: { Authorization: `Bearer ${token}` },
                            })
                            .then((promptRes) => {
                                if (promptRes.data && promptRes.data.id) {
                                    navigate("/main");
                                } else {
                                    navigate("/new-user");
                                }
                            })
                            .catch(() => {
                                navigate("/new-user");
                            });
                    } else {
                        throw new Error("응답에 토큰이나 사용자 ID가 없습니다");
                    }
                })
                .catch((err) => {
                    console.error("OAuth 에러:", err.response?.status, err.response?.data);
                    alert("로그인에 실패했습니다.");
                    navigate("/");
                });
        } else {
            alert("인증 코드를 받지 못했습니다.");
            navigate("/");
        }
    }, [provider, location, navigate]);

    return <div>로그인 처리 중입니다...</div>;
};

export default OauthCallback;
