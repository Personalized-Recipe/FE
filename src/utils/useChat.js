import { useState, useEffect } from "react";

export const useChat = () => {
  const [input, setInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const [chatRooms, setChatRooms] = useState(() => {
  try {
    const stored = localStorage.getItem("chatRooms");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("localStorage chatRooms 파싱 실패:", e);
    return []; // 오류 났을 땐 그냥 빈 배열로 시작
  }
});

  useEffect(() => {
    localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
  }, [chatRooms]);

  const currentRoom = chatRooms.find(room => room.id === currentRoomId);
  const messages = currentRoom ? currentRoom.messages : [];

  // 새 채팅방 생성
  const createChatRoom = (title = `새 채팅방 ${chatRooms.length + 1}`) => {
    const newRoomId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRoom = {
      id: newRoomId,
      title: title,
      messages: [],
      createdAt: new Date().toISOString()
    };

    setChatRooms(prevRooms => [newRoom, ...prevRooms]);
    setCurrentRoomId(newRoomId); // 새 채팅방으로 이동
    return newRoom;
  }

  // 채팅방 제목 변경
  const updateChatTitle = (roomId, newTitle) => {
    setChatRooms(prevRooms => prevRooms.map(room => 
        room.id === roomId ? { ...room, title: newTitle } : room
    ));
};


  // 메세지 전송
  const sendMessage = (roomId) => {
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
    scheduleBotReply(roomId);
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

  return {
    messages,
    currentRoomId, setCurrentRoomId,
    input, setInput,
    isLoadingRecipe, setIsLoadingRecipe,
    chatRooms, setChatRooms,
    createChatRoom,
    sendMessage,
    updateChatTitle
  };
};

export default useChat;