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
      
      const recipe = {
        recipeId: menuNumber,
        title: menuTitle,
        description: menuDetailText,
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

  // 메세지 전송
  const sendMessage = async (roomId, useRefrigerator = false, isSpecificRecipe = false) => {
    console.log("=== 채팅 메시지 전송 시작 ===");
    console.log("사용자 입력:", input);
    console.log("냉장고 사용 여부:", useRefrigerator);
    console.log("특정 레시피 요청 여부:", isSpecificRecipe);
    
    if (!input.trim()) {
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
      const userMessage = { role: 'user', content: input };
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === roomId
            ? {...room, messages: [...room.messages || [], userMessage] }
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
        request: input,
        chatRoomId: roomId,
        useRefrigerator: useRefrigerator,
        isSpecificRecipe: isSpecificRecipe
      };
      
      console.log("백엔드 요청 데이터:", JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(`/api/recipes/request`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("=== 백엔드 응답 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      
      // 로딩 종료
      setIsLoadingRecipe(false);
      
      // 백엔드 응답 처리
      if (response.data) {
        // 새로운 백엔드 응답 형식 처리 (type 필드가 있는 경우)
        if (response.data.type === 'recipe-list' && response.data.recipes) {
          console.log("레시피 리스트 응답 감지:", response.data);
          
          // 백엔드에서 이미 구조화된 레시피 데이터를 보낸 경우
          if (response.data.recipes.length > 0 && response.data.recipes[0].title !== "메뉴 추천") {
            const botMessage = { 
              role: 'bot', 
              type: 'recipe-list',
              recipes: response.data.recipes
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
          
          // 백엔드에서 description에 텍스트로 레시피 정보를 보낸 경우
          if (response.data.recipes.length > 0 && response.data.recipes[0].description) {
            const description = response.data.recipes[0].description;
            console.log("텍스트에서 레시피 파싱 시작:", description);
            
            const parsedRecipes = parseMenuRecommendation(description);
            if (parsedRecipes.length > 0) {
              console.log("파싱된 레시피 리스트:", parsedRecipes);
              
              const botMessage = { 
                role: 'bot', 
                type: 'recipe-list',
                recipes: parsedRecipes
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
          }
        }
        
        // 특정 레시피 상세 응답 처리
        if (response.data.type === 'recipe-detail' && response.data.recipe) {
          console.log("레시피 상세 응답 감지:", response.data);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
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
        
        // recipe 객체가 직접 응답으로 오는 경우
        if (response.data.recipe && response.data.recipe.recipeId) {
          console.log("레시피 객체 직접 응답 감지:", response.data.recipe);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
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
        
        // 기존 응답 형식 처리
        if (response.data.recipeId) {
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
        } else {
          console.error("백엔드에서 레시피 상세 정보를 받지 못했습니다.");
          console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
          
          // 에러 시 기존 방식으로 표시
          const fallbackMessage = { 
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
                ? { ...room, messages: [...room.messages, fallbackMessage] }
                : room
            )
          );
        }
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
  const sendRecipeDetail = async (roomId, recipe) => {
    console.log("=== 레시피 상세 정보 요청 시작 ===");
    console.log("요청할 레시피:", recipe.title);
    
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
      
      // 로딩 시작
      setIsLoadingRecipe(true);
      
      // 백엔드로 특정 레시피 상세 정보 요청
      const requestData = {
        userId: parseInt(userId) || 0,
        request: `${recipe.title} 레시피`,
        chatRoomId: roomId,
        useRefrigerator: false,
        isSpecificRecipe: true  // 특정 레시피 요청임을 명시
      };
      
      console.log("레시피 상세 요청 데이터:", JSON.stringify(requestData, null, 2));
      
      const response = await axios.post(`/api/recipes/request`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log("=== 레시피 상세 정보 응답 ===");
      console.log("응답 상태:", response.status);
      console.log("응답 데이터:", response.data);
      
      // 로딩 종료
      setIsLoadingRecipe(false);
      
      // 백엔드 응답 처리
      if (response.data) {
        // 새로운 백엔드 응답 형식 처리 (type 필드가 있는 경우)
        if (response.data.type === 'recipe-detail' && response.data.recipe) {
          console.log("레시피 상세 응답 감지:", response.data);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
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
        
        // recipe 객체가 직접 응답으로 오는 경우
        if (response.data.recipe && response.data.recipe.recipeId) {
          console.log("레시피 객체 직접 응답 감지:", response.data.recipe);
          
          const botMessage = { 
            role: 'bot', 
            type: 'recipe-detail', 
            recipe: response.data.recipe
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
        
        // 기존 응답 형식 처리
        if (response.data.recipeId) {
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
        } else {
          console.error("백엔드에서 레시피 상세 정보를 받지 못했습니다.");
          console.log("전체 응답 데이터:", JSON.stringify(response.data, null, 2));
          
          // 에러 시 기존 방식으로 표시
          const fallbackMessage = { 
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
                ? { ...room, messages: [...room.messages, fallbackMessage] }
                : room
            )
          );
        }
      } else {
        console.error("백엔드 응답이 비어있습니다.");
      }
      
    } catch (error) {
      console.error("=== 레시피 상세 정보 요청 실패 ===");
      console.error("에러 상태:", error.response?.status);
      console.error("에러 데이터:", error.response?.data);
      console.error("에러 메시지:", error.message);
      
      // 에러 발생 시에도 로딩 상태 해제
      setIsLoadingRecipe(false);
      
      // 에러 시 기존 방식으로 표시
      const fallbackMessage = { 
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
            ? { ...room, messages: [...room.messages, fallbackMessage] }
            : room
        )
      );
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
    sendRecipeDetail
  };
};

export default useChat;