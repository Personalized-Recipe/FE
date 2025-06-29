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
          } else {
            console.log("저장된 currentRoomId가 유효합니다:", currentRoomId);
          }
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
            
            if (rooms.length > 0 && !currentRoomId) {
              setCurrentRoomId(rooms[0].id);
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
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const messages = response.data.map((msg, index) => {
          console.log(`=== 메시지 ${index + 1} 상세 분석 ===`);
          console.log("원본 메시지:", msg);
          console.log("메시지 타입:", typeof msg);
          console.log("메시지 키들:", Object.keys(msg || {}));
          console.log("isUserMessage 필드:", msg.isUserMessage);
          console.log("content 필드:", msg.content);
          console.log("content 타입:", typeof msg.content);
          console.log("content 길이:", msg.content ? msg.content.length : 0);
          console.log("createdAt 필드:", msg.createdAt);
          console.log("=== 메시지 ${index + 1} 분석 완료 ===");
          
          // 백엔드에서 isUserMessage 필드로 사용자/봇 구분
          const role = msg.isUserMessage ? 'user' : 'bot';
          
          // content 필드가 비어있는 경우 기본값 설정
          let messageContent = msg.message || msg.content || msg.text || msg.body || msg.description;
          
          // 여전히 비어있다면 기본값 설정
          if (!messageContent) {
            messageContent = msg.isUserMessage ? '사용자 메시지' : '봇 응답';
            console.warn(`메시지 ${index + 1}: message 필드를 찾을 수 없어 기본값 사용`);
          }
          
          // 메시지 타입 결정 (기본값: text)
          let type = 'text';
          let recipes = null;
          let recipe = null;
          
          // 봇 메시지이고 레시피 관련 내용이면 타입 결정
          if (!msg.isUserMessage && messageContent) {
            console.log("봇 메시지 내용 분석:", messageContent);
            
            // 메뉴 추천 메시지인지 확인 (더 유연한 패턴 매칭)
            if (messageContent.includes('메뉴 추천') || 
                messageContent.includes('추천 메뉴') || 
                messageContent.includes('추천:') ||
                messageContent.includes('다음과 같은') ||
                messageContent.includes('추천드립니다') ||
                (messageContent.includes('-') && messageContent.split('\n').length > 2)) {
              
              console.log("메뉴 추천 메시지 감지");
              type = 'recipe-list';
              
              // 메뉴 추천 텍스트를 파싱해서 recipes 배열 생성
              const lines = messageContent.split('\n');
              recipes = [];
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                // 다양한 메뉴 패턴 매칭
                const patterns = [
                  /^[-•]\s*(.+)$/,           // "- 메뉴명" 또는 "• 메뉴명"
                  /^\d+\.\s*(.+)$/,          // "1. 메뉴명"
                  /^[가-힣\s]+$/,            // 한글만 있는 줄 (메뉴명일 가능성)
                  /^(.+?)(?:\s*[-•]\s*|$)/   // 일반적인 메뉴명 패턴
                ];
                
                let menuTitle = null;
                for (const pattern of patterns) {
                  const match = trimmedLine.match(pattern);
                  if (match && match[1]) {
                    const candidate = match[1].trim();
                    // 메뉴명이 아닌 키워드 제외
                    if (candidate && 
                        candidate.length > 1 && 
                        !candidate.includes('메뉴 추천') && 
                        !candidate.includes('추천 메뉴') &&
                        !candidate.includes('다음과 같은') &&
                        !candidate.includes('추천드립니다') &&
                        !candidate.includes('레시피') &&
                        !candidate.includes('재료') &&
                        !candidate.includes('조리법')) {
                      menuTitle = candidate;
                      break;
                    }
                  }
                }
                
                if (menuTitle) {
                  console.log("메뉴 추출:", menuTitle);
                  recipes.push({
                    recipeId: recipes.length + 1,
                    title: menuTitle,
                    description: '',
                    category: '기타',
                    imageUrl: null,
                    cookingTime: '정보 없음',
                    difficulty: '정보 없음'
                  });
                }
              }
              
              console.log("파싱된 메뉴 목록:", recipes);
            } 
            // 레시피 상세 정보인지 확인
            else if (messageContent.includes('레시피') || messageContent.includes('재료') || messageContent.includes('조리법')) {
              console.log("레시피 상세 정보 감지");
              type = 'recipe-detail';
              
              const lines = messageContent.split('\n');
              const title = lines[0] || '레시피';
              const description = lines.slice(1).join('\n');
              
              recipe = {
                recipeId: Date.now(),
                title: title,
                description: description,
                category: '기타',
                imageUrl: null,
                cookingTime: '정보 없음',
                difficulty: '정보 없음'
              };
              
              console.log("파싱된 레시피:", recipe);
            }
          }
          
          // 메시지 타입 자동 판별 및 파싱 함수
          const parsedMsg = parseMessageType({ ...msg, message: messageContent, role });
          
          return {
            ...parsedMsg,
            createdAt: msg.createdAt,
            role,
          };
        });
        
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

  // 컴포넌트 마운트 시 채팅방 목록 가져오기
  useEffect(() => {
    fetchChatRooms();
  }, []);

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

  // currentRoomId나 chatRooms가 변경될 때 messages 업데이트
  useEffect(() => {
    console.log("=== messages useEffect 실행 ===");
    console.log("currentRoomId:", currentRoomId);
    console.log("chatRooms 개수:", chatRooms.length);
    
    const currentRoom = chatRooms.find(room => room.id === currentRoomId);
    console.log("현재 채팅방:", currentRoom);
    
    const newMessages = currentRoom ? currentRoom.messages : [];
    console.log("새로운 messages:", newMessages.length, "개 메시지");
    console.log("messages 내용:", newMessages);
    
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
    const recipes = [];
    
    // **숫자. 메뉴명** 패턴을 찾아서 파싱
    const menuPattern = /\*\*(\d+)\.\s*([^*]+)\*\*/g;
    let match;
    
    while ((match = menuPattern.exec(text)) !== null) {
      const menuNumber = parseInt(match[1]);
      const menuTitle = match[2].trim();
      
      // 해당 메뉴의 상세 정보 추출
      const menuStartIndex = match.index;
      const nextMenuMatch = /\*\*\d+\.\s*[^*]+\*\*/g;
      nextMenuMatch.lastIndex = menuStartIndex + match[0].length;
      const nextMatch = nextMenuMatch.exec(text);
      
      const menuEndIndex = nextMatch ? nextMatch.index : text.length;
      const menuDetailText = text.substring(menuStartIndex + match[0].length, menuEndIndex).trim();
      
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
        difficulty: difficultyMatch ? difficultyMatch[1].trim() : "정보 없음"
      };
      
      recipes.push(recipe);
    }
    
    console.log("파싱된 레시피 개수:", recipes.length);
    recipes.forEach((recipe, index) => {
      console.log(`레시피 ${index + 1}:`, recipe);
    });
    
    return recipes;
  };

  // 메시지 타입 자동 판별 및 파싱 함수
  const parseMessageType = (msg) => {
    // 이미 type이 있으면 그대로 사용
    if (msg.type) return msg;

    // 레시피 상세로 추정되는 경우
    if (
      msg.message &&
      (msg.message.includes('필요한 재료와 양:') || msg.message.includes('조리 방법:'))
    ) {
      return {
        ...msg,
        type: 'recipe-detail',
        recipe: {
          title: msg.message.split('\n')[0] || '레시피',
          description: msg.message,
          category: '기타',
          imageUrl: null,
          cookingTime: '정보 없음',
          difficulty: '정보 없음',
        },
      };
    }

    // 메뉴 추천으로 추정되는 경우
    if (
      msg.message &&
      (msg.message.includes('- ') || /\d+\. /.test(msg.message))
    ) {
      return {
        ...msg,
        type: 'recipe-list',
        recipes: parseMenuRecommendation(msg.message),
      };
    }

    // 그 외는 일반 텍스트
    return {
      ...msg,
      type: 'text',
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

      // 사용자 메시지 추가
      const userMessage = { role: 'user', content: messageContent, type: 'text' };
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
        request: messageContent,
        chatRoomId: roomId,
        useRefrigerator: useRefrigerator,
        isSpecificRecipe: isSpecificRecipe
      };
      
      console.log("백엔드 요청 데이터:", JSON.stringify(requestData, null, 2));
      
      // 타임아웃 설정 (10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      console.log("API 요청 시작...");
      const response = await axios.post(`/api/recipes/request`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log("API 요청 완료!");
      
      console.log("=== 백엔드 응답 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      console.log("응답 데이터 타입:", typeof response.data);
      console.log("응답 데이터 키들:", Object.keys(response.data || {}));
      
      // 응답 데이터의 모든 필드를 자세히 로깅
      if (response.data) {
        console.log("=== 응답 데이터 상세 분석 ===");
        console.log("response.data.type:", response.data.type);
        console.log("response.data.recipe:", response.data.recipe);
        console.log("response.data.recipeId:", response.data.recipeId);
        console.log("response.data.title:", response.data.title);
        console.log("response.data.description:", response.data.description);
        console.log("response.data.category:", response.data.category);
        console.log("response.data.imageUrl:", response.data.imageUrl);
        console.log("response.data.cookingTime:", response.data.cookingTime);
        console.log("response.data.difficulty:", response.data.difficulty);
        console.log("=== 응답 데이터 분석 완료 ===");
      }
      
      // 로딩 종료
      setIsLoadingRecipe(false);
      
      // 백엔드 응답 처리 (sendMessage와 동일한 로직)
      if (response.data) {
        console.log("=== 응답 처리 시작 ===");
        console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
        console.log("response.data.type:", response.data.type);
        console.log("response.data.recipe 존재:", !!response.data.recipe);
        console.log("response.data.recipeId 존재:", !!response.data.recipeId);
        console.log("response.data.message 존재:", !!response.data.message);
        console.log("response.data.content 존재:", !!response.data.content);
        console.log("response.data.description 존재:", !!response.data.description);
        
        // 특정 레시피 상세 응답 처리
        if (response.data.type === 'recipe-detail' && response.data.recipe) {
          console.log("레시피 상세 응답 감지:", response.data);
          console.log("조건문 통과: type === 'recipe-detail' && recipe 존재");
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
          };
          
          console.log("생성된 botMessage:", botMessage);
          
          setChatRooms(prevRooms => {
            console.log("이전 채팅방 상태:", prevRooms);
            const updatedRooms = prevRooms.map(room => {
              if (room.id === roomId) {
                console.log("채팅방 업데이트:", room.id, "메시지 개수:", room.messages.length);
                const newMessages = [...room.messages, botMessage];
                console.log("새로운 메시지 개수:", newMessages.length);
                return { ...room, messages: newMessages };
              }
              return room;
            });
            console.log("업데이트된 채팅방 상태:", updatedRooms);
            return updatedRooms;
          });
          
          console.log("채팅방 상태 업데이트 완료");
          return;
        } else {
          console.log("레시피 상세 응답 조건 불만족:");
          console.log("type === 'recipe-detail':", response.data.type === 'recipe-detail');
          console.log("recipe 존재:", !!response.data.recipe);
        }
        
        // recipe 객체가 직접 응답으로 오는 경우
        if (response.data.recipe && response.data.recipe.recipeId) {
          console.log("레시피 객체 직접 응답 감지:", response.data.recipe);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
          };
          
          setChatRooms(prevRooms => {
            const updatedRooms = prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            );
            console.log("채팅방 상태 업데이트 완료:", updatedRooms);
            return updatedRooms;
          });
          return;
        }
        
        // 기존 응답 형식 처리
        if (response.data.recipeId) {
          console.log("기존 응답 형식 감지:", response.data);
          
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
          
          setChatRooms(prevRooms => {
            const updatedRooms = prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            );
            console.log("채팅방 상태 업데이트 완료:", updatedRooms);
            return updatedRooms;
          });
          return;
        }
        
        // 일반 텍스트 응답 처리
        if (response.data.message || response.data.content || response.data.description) {
          console.log("일반 텍스트 응답 감지:", response.data);
          
          const responseText = response.data.message || response.data.content || response.data.description;
          console.log("응답 텍스트:", responseText);
          
          const botMessage = { 
            role: 'bot', 
            type: 'text',
            content: responseText
          };
          
          setChatRooms(prevRooms => 
            prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            )
          );
          return;
        }
        
        // 어떤 조건도 만족하지 않는 경우
        console.error("백엔드 응답을 처리할 수 없습니다. 알 수 없는 형식입니다.");
        console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
        
      } else {
        console.log("백엔드 응답이 비어있습니다.");
      }

    } catch (error) {
      console.error("=== 채팅 메시지 전송 실패 ===");
      console.error("에러 상태:", error.response?.status);
      console.error("에러 데이터:", error.response?.data);
      console.error("에러 메시지:", error.message);
      
      // 에러 발생 시에도 로딩 상태 해제
      setIsLoadingRecipe(false);
      
      // 에러 발생 시에도 기본 봇 응답 표시
      scheduleBotReply(roomId);
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
    console.log("=== 레시피 상세 정보 표시 시작 ===");
    console.log("표시할 레시피:", recipe);
    console.log("현재 roomId:", roomId);
    console.log("냉장고 사용 여부:", useRefrigerator);
    
    // 현재 채팅방 상태 확인
    console.log("현재 채팅방 개수:", chatRooms.length);
    console.log("현재 채팅방들:", chatRooms.map(room => ({ id: room.id, title: room.title })));
    
    // 이미 로딩 중이면 중복 요청 방지
    if (isLoadingRecipe) {
      console.log("이미 로딩 중입니다. 중복 요청을 방지합니다.");
      return;
    }
    
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

      // 로딩 시작
      console.log("로딩 상태 설정 시작...");
      setIsLoadingRecipe(true);
      console.log("로딩 상태 설정 완료");
      
      // 사용자 메시지 먼저 추가 (특정 레시피 체크박스와 동일한 방식)
      const userMessage = { role: 'user', content: recipe.title, type: 'text' };
      console.log("사용자 메시지 추가:", userMessage);
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId
            ? {...room, messages: [...room.messages, userMessage] }
            : room
        )
      );
      console.log("사용자 메시지 추가 완료");
      
      // 백엔드로 특정 레시피 요청 전송 (메뉴 클릭용 엔드포인트)
      const requestData = {
        userId: parseInt(userId) || 0,
        chatRoomId: roomId,
        request: inputValue || `${recipe.title} 레시피 알려줘`, // 사용자 입력값 우선 사용
        useRefrigerator: useRefrigerator,
        isSpecificRecipe: true
      };
      
      console.log("백엔드 요청 데이터:", JSON.stringify(requestData, null, 2));
      console.log("요청 제목:", recipe.title);
      
      // 타임아웃 설정 (10초)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      console.log("API 요청 시작...");
      const response = await axios.post(`/api/recipes/detail`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      console.log("API 요청 완료!");
      
      console.log("=== 백엔드 응답 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      console.log("응답 데이터 타입:", typeof response.data);
      console.log("응답 데이터 키들:", Object.keys(response.data || {}));
      
      // 응답 데이터의 모든 필드를 자세히 로깅
      if (response.data) {
        console.log("=== 응답 데이터 상세 분석 ===");
        console.log("response.data.type:", response.data.type);
        console.log("response.data.recipe:", response.data.recipe);
        console.log("response.data.recipeId:", response.data.recipeId);
        console.log("response.data.title:", response.data.title);
        console.log("response.data.description:", response.data.description);
        console.log("response.data.category:", response.data.category);
        console.log("response.data.imageUrl:", response.data.imageUrl);
        console.log("response.data.cookingTime:", response.data.cookingTime);
        console.log("response.data.difficulty:", response.data.difficulty);
        console.log("=== 응답 데이터 분석 완료 ===");
      }
      
      // 로딩 종료
      setIsLoadingRecipe(false);
      
      // 백엔드 응답 처리 (sendMessage와 동일한 로직)
      if (response.data) {
        console.log("=== 응답 처리 시작 ===");
        console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
        console.log("response.data.type:", response.data.type);
        console.log("response.data.recipe 존재:", !!response.data.recipe);
        console.log("response.data.recipeId 존재:", !!response.data.recipeId);
        console.log("response.data.message 존재:", !!response.data.message);
        console.log("response.data.content 존재:", !!response.data.content);
        console.log("response.data.description 존재:", !!response.data.description);
        
        // 특정 레시피 상세 응답 처리
        if (response.data.type === 'recipe-detail' && response.data.recipe) {
          console.log("레시피 상세 응답 감지:", response.data);
          console.log("조건문 통과: type === 'recipe-detail' && recipe 존재");
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
          };
          
          console.log("생성된 botMessage:", botMessage);
          
          setChatRooms(prevRooms => {
            console.log("이전 채팅방 상태:", prevRooms);
            const updatedRooms = prevRooms.map(room => {
              if (room.id === roomId) {
                console.log("채팅방 업데이트:", room.id, "메시지 개수:", room.messages.length);
                const newMessages = [...room.messages, botMessage];
                console.log("새로운 메시지 개수:", newMessages.length);
                return { ...room, messages: newMessages };
              }
              return room;
            });
            console.log("업데이트된 채팅방 상태:", updatedRooms);
            return updatedRooms;
          });
          
          console.log("채팅방 상태 업데이트 완료");
          return;
        } else {
          console.log("레시피 상세 응답 조건 불만족:");
          console.log("type === 'recipe-detail':", response.data.type === 'recipe-detail');
          console.log("recipe 존재:", !!response.data.recipe);
        }
        
        // recipe 객체가 직접 응답으로 오는 경우
        if (response.data.recipe && response.data.recipe.recipeId) {
          console.log("레시피 객체 직접 응답 감지:", response.data.recipe);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
          };
          
          setChatRooms(prevRooms => {
            const updatedRooms = prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            );
            console.log("채팅방 상태 업데이트 완료:", updatedRooms);
            return updatedRooms;
          });
          return;
        }
        
        // 기존 응답 형식 처리
        if (response.data.recipeId) {
          console.log("기존 응답 형식 감지:", response.data);
          
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
          
          setChatRooms(prevRooms => {
            const updatedRooms = prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            );
            console.log("채팅방 상태 업데이트 완료:", updatedRooms);
            return updatedRooms;
          });
          return;
        }
        
        // 일반 텍스트 응답 처리
        if (response.data.message || response.data.content || response.data.description) {
          console.log("일반 텍스트 응답 감지:", response.data);
          
          const responseText = response.data.message || response.data.content || response.data.description;
          console.log("응답 텍스트:", responseText);
          
          const botMessage = { 
            role: 'bot', 
            type: 'text',
            content: responseText
          };
          
          setChatRooms(prevRooms => 
            prevRooms.map(room =>
              room.id === roomId
                ? { ...room, messages: [...room.messages, botMessage] }
                : room
            )
          );
          return;
        }
        
        // 어떤 조건도 만족하지 않는 경우
        console.error("백엔드 응답을 처리할 수 없습니다. 알 수 없는 형식입니다.");
        console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
        
      } else {
        console.log("백엔드 응답이 비어있습니다.");
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