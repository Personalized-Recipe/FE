// src/pages/Home/Login/OauthCallback.jsx
import React, { useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const OauthCallback = () => {
    const { provider } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem("jwt"); // 기존 토큰 삭제
        const query = new URLSearchParams(location.search);
        const code = query.get("code");

        if (code && provider) {
            axios.post(`/api/oauth/${provider}/callback`, { code })
                .then((res) => {
                    console.log("OAuth 응답 데이터:", res); // 응답 전체 로그
                    if (res.data && res.data.token) {
                        localStorage.setItem("jwt", res.data.token);
                        alert("로그인 성공!");
                        navigate("/main");
                    } else {
                        console.warn("토큰 없음, 로그인 실패 처리:", res.data);
                        throw new Error("로그인 실패");
                    }
                })
                .catch((err) => {
                    console.error("OAuth 에러:", err); // 에러 로그
                    alert("로그인에 실패했습니다.");
                    navigate("/");
                });
        }
    }, [provider, location, navigate]);

    return <div>로그인 처리 중입니다...</div>;
};

export default OauthCallback;