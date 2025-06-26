import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext.jsx';
import axios from 'axios';

// axios 인터셉터 설정 - 모든 요청에 JWT 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    console.log("=== Axios 인터셉터 실행 ===");
    console.log("요청 URL:", config.url);
    console.log("토큰 존재:", !!token);
    console.log("토큰 길이:", token ? token.length : 0);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Authorization 헤더 설정됨:", `Bearer ${token.substring(0, 20)}...`);
    } else {
      console.log("토큰이 없어서 Authorization 헤더 설정 안됨");
    }
    
    console.log("최종 요청 헤더:", config.headers);
    return config;
  },
  (error) => {
    console.error("Axios 인터셉터 에러:", error);
    return Promise.reject(error);
  }
);

import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <BrowserRouter>
        <UserProvider>
           <App/>
        </UserProvider>
    </BrowserRouter>
  </StrictMode>
);
