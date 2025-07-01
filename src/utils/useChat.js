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

  // messages 상태를 별도로 관리
  const [messages, setMessages] = useState([]);

  // 백엔드에서 채팅방 목록 가져오기
  const fetchChatRooms = async () => {
    console.log("=== 채팅방 목록 가져오기 시작 ===");
    
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        console.log("로그인 상태가 아닙니다.");
        return;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        console.log("인증 정보가 없습니다.");
        return;
      }
      
      const { token, userId } = authInfo;
      
      // console.log("=== 토큰 디버깅 ===");
      // console.log("토큰 존재:", !!token);
      // console.log("토큰 길이:", token ? token.length : 0);
      // console.log("토큰 시작 부분:", token ? token.substring(0, 20) + "..." : "없음");
      // console.log("사용자 ID:", userId);
      // console.log("=== 토큰 디버깅 완료 ===");
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return;
      }

      console.log("채팅방 목록 요청 시작...");
      const response = await axios.get(`/api/chatrooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("채팅방 목록 응답:", response.data);
      console.log("응답 데이터 타입:", typeof response.data);
      console.log("응답 데이터 키들:", Object.keys(response.data || {}));
      
      if (response.data && Array.isArray(response.data)) {
        console.log("응답이 배열입니다. 길이:", response.data.length);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const rooms = response.data.map((room, index) => {
          console.log(`채팅방 ${index + 1}:`, room);
          console.log(`채팅방 ${index + 1} 키들:`, Object.keys(room || {}));
          
          return {
            id: room.chatRoomId || room.id,
            title: room.title,
            messages: [], // 메시지는 별도로 가져와야 함
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            isActive: room.isActive,
            messageCount: room.messageCount
          };
        });
        
        console.log("변환된 채팅방 목록:", rooms);
        setChatRooms(rooms);
        
        // 현재 채팅방 ID가 유효한지 확인하고 설정
        if (rooms.length > 0) {
          const validCurrentRoom = rooms.find(room => room.id === currentRoomId);
          if (!validCurrentRoom) {
            console.log("저장된 currentRoomId가 유효하지 않습니다. 첫 번째 채팅방을 선택합니다.");
            console.log("첫 번째 채팅방을 현재 채팅방으로 설정:", rooms[0].id);
            setCurrentRoomId(rooms[0].id);
            
            // 첫 번째 채팅방의 메시지도 가져오기
            setTimeout(() => {
              fetchChatMessages(rooms[0].id);
            }, 100);
          } else {
            console.log("저장된 currentRoomId가 유효합니다:", currentRoomId);
            // 유효한 채팅방이지만 메시지가 없으면 가져오기
            if (!validCurrentRoom.messages || validCurrentRoom.messages.length === 0) {
              setTimeout(() => {
                fetchChatMessages(currentRoomId);
              }, 100);
            }
          }
        } else {
          console.log("채팅방이 없습니다. currentRoomId를 null로 설정합니다.");
          setCurrentRoomId(null);
        }
        
        console.log("=== 채팅방 목록 가져오기 완료 ===");
      } else {
        console.log("응답이 배열이 아닙니다. 응답 구조:", response.data);
        
        // 응답이 객체이고 내부에 배열이 있는 경우
        if (response.data && typeof response.data === 'object') {
          const dataKeys = Object.keys(response.data);
          console.log("응답 객체의 키들:", dataKeys);
          
          // 가능한 키들: chatRooms, rooms, data, content 등
          const roomsArray = response.data.chatRooms || response.data.rooms || response.data.data || response.data.content || [];
          
          if (Array.isArray(roomsArray)) {
            console.log("찾은 채팅방 배열:", roomsArray);
            
            const rooms = roomsArray.map((room, index) => {
              console.log(`채팅방 ${index + 1}:`, room);
              return {
                id: room.chatRoomId || room.id,
                title: room.title,
                messages: [],
                createdAt: room.createdAt,
                updatedAt: room.updatedAt,
                isActive: room.isActive,
                messageCount: room.messageCount
              };
            });
            
            console.log("변환된 채팅방 목록:", rooms);
            setChatRooms(rooms);
            
            if (rooms.length > 0) {
              const validCurrentRoom = rooms.find(room => room.id === currentRoomId);
              if (!validCurrentRoom) {
                setCurrentRoomId(rooms[0].id);
                setTimeout(() => {
                  fetchChatMessages(rooms[0].id);
                }, 100);
              } else if (!validCurrentRoom.messages || validCurrentRoom.messages.length === 0) {
                setTimeout(() => {
                  fetchChatMessages(currentRoomId);
                }, 100);
              }
            } else {
              setCurrentRoomId(null);
            }
          }
        }
      }
      
    } catch (error) {
      console.error("=== 채팅방 목록 가져오기 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
    }
  };

  // 백엔드에서 채팅방 메시지 가져오기
  const fetchChatMessages = async (roomId) => {
    console.log("=== 채팅방 메시지 가져오기 시작 ===");
    console.log("roomId:", roomId);
    
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        console.log("로그인 상태가 아닙니다.");
        return;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        console.log("인증 정보가 없습니다.");
        return;
      }
      
      const { token, userId } = authInfo;
      
      console.log("=== 토큰 디버깅 ===");
      console.log("토큰 존재:", !!token);
      console.log("토큰 길이:", token ? token.length : 0);
      console.log("토큰 시작 부분:", token ? token.substring(0, 20) + "..." : "없음");
      console.log("사용자 ID:", userId);
      console.log("=== 토큰 디버깅 완료 ===");
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return;
      }

      console.log("채팅방 메시지 요청 시작...");
      const response = await axios.get(`/api/chat/rooms/${roomId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("채팅방 메시지 응답:", response.data);
      console.log("응답 데이터 타입:", typeof response.data);
      console.log("응답 데이터 길이:", Array.isArray(response.data) ? response.data.length : "배열 아님");
      
      if (response.data && Array.isArray(response.data)) {
        console.log("=== 전체 응답 데이터 상세 분석 ===");
        response.data.forEach((msg, index) => {
          console.log(`메시지 ${index + 1} 전체 데이터:`, JSON.stringify(msg, null, 2));
        });
        console.log("=== 전체 응답 데이터 분석 완료 ===");
        
        const messages = response.data.map(parseBackendMessage);
        
        console.log("변환된 메시지 목록:", messages);
        
        // 채팅방에 메시지 업데이트
        setChatRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === roomId
              ? { ...room, messages: messages }
              : room
          )
        );
        
        console.log("=== 채팅방 메시지 가져오기 완료 ===");
      }
      
    } catch (error) {
      console.error("=== 채팅방 메시지 가져오기 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    const initializeChat = async () => {
      console.log("=== 채팅 초기화 시작 ===");
      
      // 로그인 상태 확인
      if (!isLoggedIn()) {
        console.log("로그인되지 않았습니다. 초기화를 건너뜁니다.");
        return;
      }
      
      try {
        // 1. 채팅방 목록 가져오기
        await fetchChatRooms();
        
        // 2. 현재 채팅방이 있으면 메시지 가져오기
        if (currentRoomId) {
          console.log("현재 채팅방 메시지 가져오기:", currentRoomId);
          await fetchChatMessages(currentRoomId);
        }
        
        console.log("=== 채팅 초기화 완료 ===");
      } catch (error) {
        console.error("채팅 초기화 중 오류 발생:", error);
      }
    };
    
    initializeChat();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // chatRooms 변경 시 localStorage 저장
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && chatRooms.length > 0) {
      try {
        // 메모리 사용량을 줄이기 위해 필요한 정보만 저장
        const roomsToStore = chatRooms.map(room => ({
          id: room.id,
          title: room.title,
          createdAt: room.createdAt,
          updatedAt: room.updatedAt,
          isActive: room.isActive,
          messageCount: room.messageCount,
          // messages는 너무 클 수 있으므로 저장하지 않음
        }));
        
        localStorage.setItem(`chatRooms_${userId}`, JSON.stringify(roomsToStore));
        console.log("채팅방 목록 localStorage 저장 완료:", roomsToStore.length, "개");
      } catch (e) {
        console.error("채팅방 목록 localStorage 저장 실패:", e);
        // localStorage 용량 부족 등의 경우 이전 데이터 삭제 후 재시도
        try {
          localStorage.removeItem(`chatRooms_${userId}`);
          const roomsToStore = chatRooms.map(room => ({
            id: room.id,
            title: room.title,
            createdAt: room.createdAt,
            updatedAt: room.updatedAt,
            isActive: room.isActive,
            messageCount: room.messageCount,
          }));
          localStorage.setItem(`chatRooms_${userId}`, JSON.stringify(roomsToStore));
          console.log("채팅방 목록 localStorage 재저장 완료");
        } catch (retryError) {
          console.error("채팅방 목록 localStorage 재저장도 실패:", retryError);
        }
      }
    }
  }, [chatRooms]);

  // currentRoomId 변경 시 localStorage 업데이트 및 메시지 로드
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        if (currentRoomId) {
          localStorage.setItem(`currentRoomId_${userId}`, currentRoomId);
          console.log("현재 채팅방 ID localStorage 저장:", currentRoomId);
          
          // 현재 채팅방의 메시지가 없으면 가져오기
          const currentRoom = chatRooms.find(room => room.id === currentRoomId);
          if (currentRoom && (!currentRoom.messages || currentRoom.messages.length === 0)) {
            console.log("현재 채팅방 메시지가 없어서 가져오기:", currentRoomId);
            fetchChatMessages(currentRoomId);
          }
        } else {
          localStorage.removeItem(`currentRoomId_${userId}`);
        }
      } catch (e) {
        console.error("currentRoomId localStorage 저장 실패:", e);
      }
    }
  }, [currentRoomId]);

  // currentRoomId나 chatRooms가 변경될 때 messages 업데이트
  useEffect(() => {
    console.log("=== messages useEffect 실행 ===");
    console.log("currentRoomId:", currentRoomId);
    console.log("chatRooms 개수:", chatRooms.length);
    
    const currentRoom = chatRooms.find(room => room.id === currentRoomId);
    console.log("현재 채팅방:", currentRoom);
    
    const newMessages = currentRoom ? currentRoom.messages : [];
    console.log("새로운 messages:", newMessages.length, "개 메시지");
    
    setMessages(newMessages);
  }, [currentRoomId, chatRooms]);

  // 새 채팅방 생성
  const createChatRoom = async (title = `새 채팅방 ${chatRooms.length + 1}`) => {
    console.log("=== 새 채팅방 생성 시작 ===");
    console.log("현재 채팅방 개수:", chatRooms.length);
    console.log("제목:", title);
    
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        console.log("로그인 상태가 아닙니다.");
        return null;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        console.log("인증 정보가 없습니다.");
        return null;
      }
      
      const { token, userId } = authInfo;
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return null;
      }

      // 백엔드로 채팅방 생성 요청
      const requestData = {
        userId: parseInt(userId) || 0,
        title: title
      };
      
      console.log("채팅방 생성 요청 데이터:", JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(`/api/chatrooms`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("채팅방 생성 응답:", response.data);
      
      // 백엔드에서 생성된 채팅방 정보 사용
      const newRoom = {
        id: response.data.chatRoomId || response.data.id,
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
      
      setCurrentRoomId(newRoom.id); // 새 채팅방으로 이동
      console.log("현재 채팅방 ID 설정:", newRoom.id);
      console.log("=== 새 채팅방 생성 완료 ===");
      
      return newRoom;
      
    } catch (error) {
      console.error("=== 채팅방 생성 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
      
      // 에러 발생 시 프론트엔드에서만 채팅방 생성 (임시)
      const newRoomId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newRoom = {
        id: newRoomId,
        title: title,
        messages: [],
        createdAt: new Date().toISOString()
      };

      setChatRooms(prevRooms => [newRoom, ...prevRooms]);
      setCurrentRoomId(newRoomId);
      
      return newRoom;
    }
  }

  // 채팅방 제목 변경
  const updateChatTitle = async (roomId, newTitle) => {
    console.log("=== 채팅방 제목 변경 시작 ===");
    console.log("roomId:", roomId);
    console.log("새 제목:", newTitle);
    
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        console.log("로그인 상태가 아닙니다.");
        return;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        console.log("인증 정보가 없습니다.");
        return;
      }
      
      const { token, userId } = authInfo;
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return;
      }

      // 백엔드로 채팅방 제목 변경 요청
      const requestData = {
        title: newTitle
      };
      
      console.log("채팅방 제목 변경 요청 데이터:", JSON.stringify(requestData, null, 2));
      
      const response = await axios.put(`/api/chatrooms/${roomId}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("채팅방 제목 변경 응답:", response.data);
      
      // 프론트엔드 상태 업데이트
      setChatRooms(prevRooms => prevRooms.map(room => 
          room.id === roomId ? { ...room, title: newTitle } : room
      ));
      
      console.log("=== 채팅방 제목 변경 완료 ===");
      
    } catch (error) {
      console.error("=== 채팅방 제목 변경 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
      
      // 에러 발생 시 프론트엔드에서만 변경 (임시)
      setChatRooms(prevRooms => prevRooms.map(room => 
          room.id === roomId ? { ...room, title: newTitle } : room
      ));
    }
  };

  // 메뉴 추천 텍스트를 파싱해서 레시피 리스트로 변환하는 함수
  const parseMenuRecommendation = (text) => {
    console.log("=== parseMenuRecommendation 시작 ===");
    console.log("파싱할 텍스트:", text);
    
    const recipes = [];
    
    // 백엔드에서 이미 파싱된 상세 정보가 있는지 확인
    // "**숫자. 메뉴명**" 패턴을 찾아서 파싱
    const menuPattern = /\*\*(\d+)\.\s*([^*]+)\*\*/g;
    let match;
    
    while ((match = menuPattern.exec(text)) !== null) {
      const menuNumber = parseInt(match[1]);
      const menuTitle = match[2].trim();
      
      console.log(`메뉴 ${menuNumber} 파싱: ${menuTitle}`);
      
      // 해당 메뉴의 상세 정보 추출
      const menuStartIndex = match.index;
      const nextMenuMatch = /\*\*\d+\.\s*[^*]+\*\*/g;
      nextMenuMatch.lastIndex = menuStartIndex + match[0].length;
      const nextMatch = nextMenuMatch.exec(text);
      
      const menuEndIndex = nextMatch ? nextMatch.index : text.length;
      const menuDetailText = text.substring(menuStartIndex + match[0].length, menuEndIndex).trim();
      
      console.log(`메뉴 ${menuNumber} 상세 정보:`, menuDetailText.substring(0, 100) + "...");
      
      // 카테고리, 조리시간, 난이도 추출
      const categoryMatch = menuDetailText.match(/- 카테고리:\s*([^\n]+)/);
      const timeMatch = menuDetailText.match(/예상 조리 시간:\s*([^\n]+)/);
      const difficultyMatch = menuDetailText.match(/난이도:\s*([^\n]+)/);
      
      // 조리 가이드 부분만 추출 (재료와 조리방법)
      let cookingGuide = '';
      
      // "필요한 재료와 양:" 또는 "재료:" 패턴 찾기
      const ingredientsMatch = menuDetailText.match(/(?:필요한 재료와 양:|재료:)([\s\S]*?)(?=\n\n|\n- |$)/);
      if (ingredientsMatch) {
        cookingGuide += ingredientsMatch[1].trim() + '\n\n';
      }
      
      // "조리 방법:" 또는 "만드는 방법:" 패턴 찾기
      const methodMatch = menuDetailText.match(/(?:조리 방법:|만드는 방법:)([\s\S]*?)(?=\n\n|\n- |$)/);
      if (methodMatch) {
        cookingGuide += methodMatch[1].trim();
      }
      
      // 조리 가이드가 없으면 전체 텍스트 사용
      if (!cookingGuide.trim()) {
        cookingGuide = menuDetailText;
      }
      
      const recipe = {
        recipeId: menuNumber,
        title: menuTitle,
        description: cookingGuide.trim(), // 조리 가이드만 포함
        category: categoryMatch ? categoryMatch[1].trim() : "기타",
        imageUrl: null, // 이미지 URL은 백엔드에서 제공하지 않음
        cookingTime: timeMatch ? timeMatch[1].trim() : "정보 없음",
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : "정보 없음",
        hasDetailedInfo: cookingGuide.trim().length > 50 // 상세 정보가 충분한지 판단
      };
      
      console.log(`레시피 ${menuNumber} 생성 완료:`, recipe);
      recipes.push(recipe);
    }
    
    // 만약 **패턴으로 파싱되지 않았다면, 일반적인 메뉴 추천 형태로 파싱
    if (recipes.length === 0) {
      console.log("**패턴으로 파싱되지 않음. 일반 메뉴 추천 형태로 파싱 시도");
      
      // "1. 메뉴명", "2. 메뉴명" 형태로 파싱
      const simpleMenuPattern = /^(\d+)\.\s*([^\n]+)/gm;
      let simpleMatch;
      
      while ((simpleMatch = simpleMenuPattern.exec(text)) !== null) {
        const menuNumber = parseInt(simpleMatch[1]);
        const menuTitle = simpleMatch[2].trim();
        
        console.log(`간단 메뉴 ${menuNumber} 파싱: ${menuTitle}`);
        
        const recipe = {
          recipeId: menuNumber,
          title: menuTitle,
          description: `${menuTitle}의 상세 레시피를 확인하려면 클릭해주세요.`,
          category: "기타",
          imageUrl: null,
          cookingTime: "정보 없음",
          difficulty: "정보 없음",
          hasDetailedInfo: false
        };
        
        recipes.push(recipe);
      }
    }
    
    console.log("=== parseMenuRecommendation 완료 ===");
    console.log("파싱된 레시피 개수:", recipes.length);
    recipes.forEach((recipe, index) => {
      console.log(`레시피 ${index + 1}:`, recipe);
    });
    
    return recipes;
  };

  // 메시지 파싱 함수: 백엔드에서 내려주는 구조를 최대한 그대로 사용
  const parseBackendMessage = (msg) => {
    return {
      chatId: msg.chatId,
      userId: msg.userId,
      message: msg.message,
      isUserMessage: msg.isUserMessage,
      sessionId: msg.sessionId,
      chatRoomId: msg.chatRoomId,
      recipeId: msg.recipeId,
      createdAt: msg.createdAt,
      role: msg.role || (msg.isUserMessage ? 'user' : 'bot'),
      type: msg.type || 'text',
      recipes: msg.recipes,
      recipe: msg.recipe,
      content: msg.content || msg.message
    };
  };

  // 메세지 전송
  const sendMessage = async (roomId, useRefrigerator = false, isSpecificRecipe = false, inputValue = null) => {
    console.log("=== 채팅 메시지 전송 시작 ===");
    console.log("사용자 입력:", inputValue || input);
    console.log("냉장고 사용 여부:", useRefrigerator);
    console.log("특정 레시피 요청 여부:", isSpecificRecipe);
    
    const messageContent = inputValue || input;
    
    if (!messageContent.trim()) {
      console.log("입력이 비어있어 전송하지 않습니다.");
      return;
    }

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
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return;
      }

      // 사용자 메시지 즉시 추가 (UX를 위해)
      const userMessage = { 
        role: 'user', 
        type: 'text',
        content: messageContent
      };
      
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId
            ? {...room, messages: [...room.messages, userMessage] }
            : room
        )
      );

      // 입력 초기화
      setInput('');
      
      // 로딩 시작
      setIsLoadingRecipe(true);
      
      // 백엔드로 요청 전송
      const requestData = {
        userId: parseInt(userId) || 0,
        chatRoomId: roomId,
        request: messageContent,
        useRefrigerator: useRefrigerator,
        isSpecificRecipe: isSpecificRecipe
      };
      
      console.log("백엔드 요청 데이터:", requestData);
      
      console.log("API 요청 시작...");
      const response = await axios.post(`/api/recipes/request`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 60000
      });
      
      console.log("API 요청 완료!");
      
      console.log("=== 백엔드 응답 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      
      // POST 응답도 parseBackendMessage로 통일
      const botMsg = parseBackendMessage(response.data);
      // 유저 메시지와 봇 메시지를 messages 배열에 추가
      setChatRooms(prevRooms => prevRooms.map(room => {
        if (room.id !== roomId) return room;
        return {
          ...room,
          messages: [...(room.messages || []), botMsg]
        };
      }));
      
      // 로딩 상태 해제
      setIsLoadingRecipe(false);
      
    } catch (error) {
      console.error("=== 채팅 메시지 전송 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.name === 'AbortError') {
        console.error("요청이 타임아웃되었습니다 (10초)");
      } else if (error.name === 'CanceledError') {
        console.error("요청이 취소되었습니다. 중복 요청일 수 있습니다.");
        // 취소된 요청은 에러로 처리하지 않고 조용히 종료
        setIsLoadingRecipe(false);
        return;
      } else if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
        console.error("에러 헤더:", error.response.headers);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
        console.error("요청 정보:", error.request);
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
      
      // 에러 발생 시에도 로딩 상태 해제
      setIsLoadingRecipe(false);
    }
  };

  // 봇 메시지 전송 및 저장
  const BOT_MESSAGE_DELAY = 0;    // 즉시 표시
  const LOADING_START_DELAY = 500; // 0.5초 후 로딩 시작

  const scheduleBotReply = (roomId) => {
    setTimeout(() => {
    const botMessage = { role: 'bot', content: '레시피를 고르는 중입니다.', type: 'text' };

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
  const sendRecipeDetail = async (roomId, recipe, useRefrigerator = false, inputValue = null) => {
    console.log("=== 레시피 상세 정보 요청 시작 ===");
    console.log("roomId:", roomId);
    console.log("recipe:", recipe);
    console.log("useRefrigerator:", useRefrigerator);
    console.log("inputValue:", inputValue);
    
    if (!roomId) {
      console.error("roomId가 없습니다.");
      return;
    }
    
    // 로그인 상태 확인
    if (!requireAuth()) {
      console.log("로그인 상태가 아닙니다.");
      return;
    }
    
    const authInfo = getAuthInfo();
    if (!authInfo) {
      console.log("인증 정보가 없습니다.");
      return;
    }
    
    const { token, userId } = authInfo;
    
    if (!token || !userId) {
      console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
      return;
    }
    
    // 사용자 메시지 즉시 추가 (UX를 위해)
    const userMessage = {
      role: 'user',
      type: 'text',
      content: inputValue || `${recipe.title} 레시피 알려줘`
    };
    
    setChatRooms(prevRooms => {
      const updatedRooms = prevRooms.map(room =>
        room.id === roomId
          ? { ...room, messages: [...(room.messages || []), userMessage] }
          : room
      );
      console.log("사용자 메시지 추가 후 채팅방 상태:", updatedRooms);
      return updatedRooms;
    });
    
    // 로딩 상태 설정
    setIsLoadingRecipe(true);
    
    try {
      // 이미 상세 정보가 있는 경우 (description이 충분히 긴 경우)
      if (recipe.description && recipe.description.length > 100) {
        console.log("이미 파싱된 상세 정보 사용:", recipe.title);
        
        // 상세 레시피 메시지 즉시 추가
        const botMessage = {
          role: 'bot',
          type: 'recipe-detail',
          recipe: {
            recipeId: recipe.recipeId,
            title: recipe.title,
            description: recipe.description,
            category: recipe.category || '기타',
            imageUrl: recipe.imageUrl || 'https://i.imgur.com/8tMUxoP.jpg',
            cookingTime: recipe.cookingTime || '정보 없음',
            difficulty: recipe.difficulty || '정보 없음'
          }
        };
        
        setChatRooms(prevRooms => {
          const updatedRooms = prevRooms.map(room =>
            room.id === roomId
              ? { ...room, messages: [...(room.messages || []), botMessage] }
              : room
          );
          console.log("상세 레시피 메시지 추가 후 채팅방 상태:", updatedRooms);
          return updatedRooms;
        });
        
        // 로딩 상태 즉시 해제
        setIsLoadingRecipe(false);
        
      } else {
        console.log("AI 요청으로 상세 레시피 생성:", recipe.title);
        
        // 백엔드 요청
        const requestData = {
          userId: parseInt(userId) || 0,
          chatRoomId: roomId,
          request: inputValue || `${recipe.title} 레시피 알려줘`,
          useRefrigerator: useRefrigerator,
          isSpecificRecipe: true
        };
        
        console.log("백엔드 요청 데이터:", requestData);
        
        const response = await axios.post(`/api/recipes/detail`, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000
        });
        
        console.log("=== 백엔드 응답 수신 ===");
        console.log("응답 상태:", response.status);
        console.log("응답 데이터:", response.data);
        
        // 백엔드 DB 저장이 완료될 시간을 주기 위해 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 백엔드 응답 후에만 채팅방을 새로 조회하여 봇 메시지 추가
        console.log("채팅방 메시지 다시 가져오기 시작...");
        await fetchChatMessages(roomId);
        console.log("채팅방 메시지 다시 가져오기 완료");
        
        // 로딩 상태 해제
        setIsLoadingRecipe(false);
      }
      
    } catch (error) {
      console.error("=== 레시피 상세 정보 요청 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.name === 'AbortError') {
        console.error("요청이 타임아웃되었습니다 (10초)");
      } else if (error.name === 'CanceledError') {
        console.error("요청이 취소되었습니다. 중복 요청일 수 있습니다.");
        // 취소된 요청은 에러로 처리하지 않고 조용히 종료
        setIsLoadingRecipe(false);
        return;
      } else if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
        console.error("에러 헤더:", error.response.headers);
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
        console.error("요청 정보:", error.request);
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
      
      // 에러 발생 시에도 로딩 상태 해제
      setIsLoadingRecipe(false);
    }
  };

  // 채팅방 삭제 (실제로는 비활성화)
  const deleteChatRoom = async (roomId) => {
    console.log("=== 채팅방 비활성화 시작 ===");
    console.log("비활성화할 roomId:", roomId);
    
    try {
      // 로그인 상태 확인
      if (!requireAuth()) {
        console.log("로그인 상태가 아닙니다.");
        return;
      }
      
      const authInfo = getAuthInfo();
      if (!authInfo) {
        console.log("인증 정보가 없습니다.");
        return;
      }
      
      const { token, userId } = authInfo;
      
      if (!token || !userId) {
        console.error("JWT 토큰 또는 사용자 ID가 없습니다.");
        return;
      }

      console.log("채팅방 비활성화 요청 시작...");
      const response = await axios.delete(`/api/chatrooms/${roomId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("채팅방 비활성화 응답:", response.status);
      
      // 성공적으로 비활성화되면 프론트엔드에서도 채팅방 제거
      if (response.status === 204) { // noContent
        setChatRooms(prevRooms => {
          const updatedRooms = prevRooms.filter(room => room.id !== roomId);
          console.log("비활성화 후 채팅방 목록:", updatedRooms);
          return updatedRooms;
        });
        
        // 비활성화된 채팅방이 현재 선택된 채팅방이었다면 첫 번째 채팅방으로 이동
        if (currentRoomId === roomId) {
          const remainingRooms = chatRooms.filter(room => room.id !== roomId);
          if (remainingRooms.length > 0) {
            setCurrentRoomId(remainingRooms[0].id);
            // 첫 번째 채팅방의 메시지 가져오기
            await fetchChatMessages(remainingRooms[0].id);
          } else {
            setCurrentRoomId(null);
          }
        }
        
        console.log("=== 채팅방 비활성화 완료 ===");
      }
      
    } catch (error) {
      console.error("=== 채팅방 비활성화 실패 ===");
      console.error("에러 타입:", error.name);
      console.error("에러 메시지:", error.message);
      
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
        
        // 400 에러는 본인의 채팅방이 아닌 경우
        if (error.response.status === 400) {
          console.error("본인의 채팅방이 아니거나 권한이 없습니다.");
        }
      } else if (error.request) {
        console.error("요청이 전송되었지만 응답을 받지 못했습니다");
      } else {
        console.error("요청 설정 중 에러가 발생했습니다");
      }
    }
  };

  // 컴포넌트 언마운트 시 정리 작업
  useEffect(() => {
    return () => {
      console.log("useChat 훅 정리 작업 실행");
      // 필요한 경우 여기에 정리 작업 추가
    };
  }, []);

  return {
    messages,
    currentRoomId, setCurrentRoomId,
    input, setInput,
    isLoadingRecipe, setIsLoadingRecipe,
    chatRooms, setChatRooms,
    createChatRoom,
    sendMessage,
    updateChatTitle,
    sendRecipeDetail,
    fetchChatMessages,
    deleteChatRoom
  };
};

export default useChat;