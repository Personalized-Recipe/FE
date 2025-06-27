import { useState, useEffect } from "react";
import axios from "axios";
import { isLoggedIn, getAuthInfo, requireAuth } from "./auth.js";

export const useChat = () => {
  const [input, setInput] = useState('');
  
  // currentRoomId를 사용자별로 관리
  const [currentRoomId, setCurrentRoomId] = useState(() => {
    const userId = localStorage.getItem("userId");
    return localStorage.getItem(`currentRoomId_${userId}`) || null;
  });
  
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const [chatRooms, setChatRooms] = useState(() => {
  try {
    const userId = localStorage.getItem("userId");
    const stored = localStorage.getItem(`chatRooms_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("localStorage chatRooms 파싱 실패:", e);
    return []; // 오류 났을 땐 그냥 빈 배열로 시작
  }
});

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      localStorage.setItem(`chatRooms_${userId}`, JSON.stringify(chatRooms));
    }
  }, [chatRooms]);

  // currentRoomId 변경 시 localStorage 업데이트
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      if (currentRoomId) {
        localStorage.setItem(`currentRoomId_${userId}`, currentRoomId);
      } else {
        localStorage.removeItem(`currentRoomId_${userId}`);
      }
    }
  }, [currentRoomId]);

  const currentRoom = chatRooms.find(room => room.id === currentRoomId);
  const messages = currentRoom ? currentRoom.messages : [];

  // 새 채팅방 생성
  const createChatRoom = (title = `새 채팅방 ${chatRooms.length + 1}`) => {
    console.log("=== 새 채팅방 생성 시작 ===");
    console.log("현재 채팅방 개수:", chatRooms.length);
    console.log("제목:", title);
    
    const newRoomId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRoom = {
      id: newRoomId,
      title: title,
      messages: [],
      createdAt: new Date().toISOString()
    };

    console.log("새 채팅방 객체:", newRoom);

    setChatRooms(prevRooms => {
      console.log("이전 채팅방 목록:", prevRooms);
      const updatedRooms = [newRoom, ...prevRooms];
      console.log("업데이트된 채팅방 목록:", updatedRooms);
      return updatedRooms;
    });
    
    setCurrentRoomId(newRoomId); // 새 채팅방으로 이동
    console.log("현재 채팅방 ID 설정:", newRoomId);
    console.log("=== 새 채팅방 생성 완료 ===");
    
    return newRoom;
  }

  // 채팅방 제목 변경
  const updateChatTitle = (roomId, newTitle) => {
    setChatRooms(prevRooms => prevRooms.map(room => 
        room.id === roomId ? { ...room, title: newTitle } : room
    ));
};

  // 메세지 전송
  const sendMessage = async (roomId, useRefrigerator = false, isSpecificRecipe = false) => {
    const trimmed = input.trim();
    if (!trimmed || !currentRoomId) return;

    const newMessage = { role: 'user', content: trimmed};

    // 현재 채팅방에 메시지 추가
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, messages: [...room.messages, newMessage] }
          : room
      )
    );

    setInput(''); // 입력 필드 초기화

    // 백엔드로 POST 요청 보내기
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        return;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        return;
      }
      
      const { token, userId } = authInfo;
      
      console.log("=== JWT 토큰 확인 ===");
      console.log("토큰 존재:", !!token);
      console.log("토큰 길이:", token ? token.length : 0);
      console.log("토큰 시작 부분:", token ? token.substring(0, 20) + "..." : "없음");
      console.log("사용자 ID:", userId);
      
      // JWT 토큰 만료 확인
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Date.now() / 1000;
          console.log("토큰 만료 시간:", new Date(payload.exp * 1000));
          console.log("현재 시간:", new Date(currentTime * 1000));
          console.log("토큰 만료까지 남은 시간:", Math.floor(payload.exp - currentTime), "초");
          
          if (payload.exp < currentTime) {
            console.error("JWT 토큰이 만료되었습니다.");
            alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
            localStorage.clear();
            window.location.href = "/";
            return;
          }
        } catch (error) {
          console.error("JWT 토큰 파싱 실패:", error);
        }
      }
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        console.error("토큰:", token);
        console.error("사용자 ID:", userId);
        alert("로그인이 필요합니다. 다시 로그인해주세요.");
        window.location.href = "/";
        return;
      }

      console.log("=== 채팅 메시지 전송 시작 ===");
      console.log("사용자 ID:", userId);
      console.log("메시지 내용:", trimmed);
      console.log("채팅방 ID:", roomId);
      console.log("냉장고 사용 여부:", useRefrigerator);
      console.log("특정 레시피 요청 여부:", isSpecificRecipe);
      console.log("요청 헤더:", {
        'Content-Type': 'application/json'
      });

      const requestData = {
        userId: parseInt(userId) || 0,
        request: trimmed,
        chatRoomId: roomId,
        useRefrigerator: useRefrigerator,
        isSpecificRecipe: isSpecificRecipe
      };
      
      // 요청 데이터 검증
      if (!requestData.userId || requestData.userId === 0) {
        console.error("유효하지 않은 userId:", userId);
        return;
      }
      
      if (!requestData.request || requestData.request.trim() === '') {
        console.error("유효하지 않은 request:", requestData.request);
        return;
      }
      
      console.log("=== 백엔드로 보내는 요청 데이터 ===");
      console.log("요청 URL:", `/api/recipes/request`);
      console.log("요청 데이터:", JSON.stringify(requestData, null, 2));
      console.log("요청 데이터 타입 확인:");
      console.log("- userId 타입:", typeof requestData.userId, "값:", requestData.userId);
      console.log("- request 타입:", typeof requestData.request, "값:", requestData.request);
      console.log("- chatRoomId 타입:", typeof requestData.chatRoomId, "값:", requestData.chatRoomId);
      console.log("- useRefrigerator 타입:", typeof requestData.useRefrigerator, "값:", requestData.useRefrigerator);
      
      // curl 형태로 출력 (백엔드 개발자용)
      const curlCommand = `curl -X POST http://localhost:8080/api/recipes/request \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(requestData)}' \\
  -v`;
      console.log("=== CURL 명령어 (백엔드 개발자용) ===");
      console.log(curlCommand);

      const response = await axios.post(`/api/recipes/request`, requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("=== 실제 요청 헤더 확인 ===");
      console.log("요청 URL:", `/api/recipes/request`);
      console.log("요청 데이터:", JSON.stringify(requestData, null, 2));
      console.log("Authorization 헤더:", `Bearer ${token.substring(0, 20)}...`);

      console.log("=== 채팅 메시지 전송 성공 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      console.log("응답 데이터 타입:", typeof response.data);
      console.log("응답 데이터 키들:", Object.keys(response.data || {}));

      // 백엔드 응답이 있으면 봇 메시지로 추가
      if (response.data) {
        // 레시피 리스트 응답 처리 (새로운 백엔드 형식)
        if (response.data.recipes && Array.isArray(response.data.recipes)) {
          const botMessage = { role: 'bot', type: 'recipe-list', recipes: response.data.recipes };
          setChatRooms(prevRooms =>
            prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            )
          );
          return; // 아래 기존 메시지 추가 로직은 실행하지 않음
        }
        
        // 단일 레시피 응답 처리 (새로운 백엔드 형식)
        if (response.data.recipeId && response.data.title) {
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: {
              recipeId: response.data.recipeId,
              title: response.data.title,
              description: response.data.description,
              category: response.data.category,
              imageUrl: response.data.imageUrl,
              cookingTime: response.data.cookingTime,
              difficulty: response.data.difficulty
            }
          };
          setChatRooms(prevRooms =>
            prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            )
          );
          return; // 아래 기존 메시지 추가 로직은 실행하지 않음
        }
        
        // 기존 단일 메시지 응답 처리
        let botContent = '';
        
        // 레시피 응답 형식에 맞게 description 필드 사용
        if (response.data.description) {
          botContent = response.data.description;
          console.log("description 필드에서 레시피 추출:", botContent);
        } else if (response.data.response) {
          botContent = response.data.response;
          console.log("response 필드에서 메시지 추출:", botContent);
        } else if (response.data.reply) {
          botContent = response.data.reply;
          console.log("reply 필드에서 메시지 추출:", botContent);
        } else if (response.data.message) {
          botContent = response.data.message;
          console.log("message 필드에서 메시지 추출:", botContent);
        } else if (response.data.content) {
          botContent = response.data.content;
          console.log("content 필드에서 메시지 추출:", botContent);
        } else if (typeof response.data === 'string') {
          botContent = response.data;
          console.log("문자열 응답에서 메시지 추출:", botContent);
        }
        
        if (botContent) {
          const botMessage = { role: 'bot', content: botContent };
          console.log("봇 메시지 객체 생성:", botMessage);
          
          setChatRooms(prevRooms => {
            console.log("이전 채팅방 상태:", prevRooms);
            const updatedRooms = prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            );
            console.log("업데이트된 채팅방 상태:", updatedRooms);
            return updatedRooms;
          });
          
          console.log("봇 메시지 추가됨:", botContent);
        } else {
          console.log("백엔드 응답에 메시지 내용이 없습니다.");
          console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
        }
      } else {
        console.log("백엔드 응답이 비어있습니다.");
      }

    } catch (error) {
      console.error("=== 채팅 메시지 전송 실패 ===");
      console.error("에러 상태:", error.response?.status);
      console.error("에러 데이터:", error.response?.data);
      console.error("에러 메시지:", error.message);
      
      // 에러 발생 시에도 기본 봇 응답 표시
      scheduleBotReply(roomId);
    }
  };

  // 봇 메시지 전송 및 저장
  const BOT_MESSAGE_DELAY = 0;    // 즉시 표시
  const LOADING_START_DELAY = 500; // 0.5초 후 로딩 시작

  const scheduleBotReply = (roomId) => {
    setTimeout(() => {
    const botMessage = { role: 'bot', content: '레시피를 고르는 중입니다.' };

    setChatRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId
          ? {...room, messages: [...room.messages || [], botMessage] }
          : room
        )
    );
    }, BOT_MESSAGE_DELAY);

    setTimeout(() => {
      setIsLoadingRecipe(true);
    }, LOADING_START_DELAY);
  };

  // 레시피 클릭 시 상세 레시피 메시지 추가 함수
  const sendRecipeDetail = (roomId, recipe) => {
    const botMessage = { 
      role: 'bot', 
      type: 'recipe-detail', 
      recipe: {
        recipeId: recipe.recipeId,
        title: recipe.title,
        description: recipe.description,
        category: recipe.category,
        imageUrl: recipe.imageUrl,
        cookingTime: recipe.cookingTime,
        difficulty: recipe.difficulty
      }
    };
    setChatRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId
          ? { ...room, messages: [...room.messages, botMessage] }
          : room
      )
    );
  };

  return {
    messages,
    currentRoomId, setCurrentRoomId,
    input, setInput,
    isLoadingRecipe, setIsLoadingRecipe,
    chatRooms, setChatRooms,
    createChatRoom,
    sendMessage,
    updateChatTitle,
    sendRecipeDetail
  };
};

export default useChat;