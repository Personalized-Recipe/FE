// 로그인 상태 관리 유틸리티

// 로그인 상태 확인
export const isLoggedIn = () => {
  const token = localStorage.getItem("jwt");
  const userId = localStorage.getItem("userId");
  
  if (!token || !userId) {
    return false;
  }
  
  // JWT 토큰 만료 확인
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp < currentTime) {
      // 토큰 만료 시 localStorage 정리
      localStorage.clear();
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("JWT 토큰 파싱 실패:", error);
    localStorage.clear();
    return false;
  }
};

// 로그인 정보 가져오기
export const getAuthInfo = () => {
  console.log("=== getAuthInfo 호출 ===");
  
  if (!isLoggedIn()) {
    console.log("로그인 상태가 아닙니다.");
    return null;
  }
  
  const token = localStorage.getItem("jwt");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const profileImage = localStorage.getItem("profileImage");
  
  console.log("localStorage에서 가져온 토큰:", token ? `존재 (길이: ${token.length})` : "없음");
  console.log("localStorage에서 가져온 사용자 ID:", userId || "없음");
  console.log("localStorage에서 가져온 사용자명:", username || "없음");
  console.log("localStorage에서 가져온 프로필 이미지:", profileImage || "없음");
  
  return {
    token: token,
    userId: userId,
    username: username,
    profileImage: profileImage
  };
};

// 로그아웃
export const logout = () => {
  const userId = localStorage.getItem("userId");
  
  // 현재 사용자의 채팅방 정보만 정리
  if (userId) {
    localStorage.removeItem(`chatRooms_${userId}`);
    localStorage.removeItem(`currentRoomId_${userId}`);
  }
  
  // 인증 정보 정리
  localStorage.removeItem("jwt");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("profileImage");
  
  window.location.href = "/";
};

// 로그인 필요 시 리다이렉트
export const requireAuth = () => {
  if (!isLoggedIn()) {
    alert("로그인이 필요합니다.");
    window.location.href = "/";
    return false;
  }
  return true;
}; 