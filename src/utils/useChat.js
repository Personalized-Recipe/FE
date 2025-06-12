import { useState, useEffect } from "react";
import { handleSend } from "./chatutils";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [chatTitle, setChatTitle] = useState('');
  const [input, setInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [chatRooms, setChatRooms] = useState(() =>
    JSON.parse(localStorage.getItem("chatRooms")) || []
  );

  useEffect(() => {
    localStorage.setItem("chatRooms", JSON.stringify(chatRooms));
  }, [chatRooms]);

  const sendMessage = (roomId) => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    handleSend({ input, setInput, messages, setMessages });

    let updatedRooms;
    let newRoomId = currentRoomId;

    // 새 채팅방일 경우
    if (messages.length === 0 || !currentRoomId) {
       newRoomId = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`; // 고유 ID 생성
      const newRoom = {
        id: newRoomId,
        title: input.length > 20 ? `${input.substring(0, 20)}...` : input, // 제목 길이 제한
        messages: [newMessage],
        createdAt: new Date().toISOString()
      };

      updatedRooms = [newRoom, ...chatRooms];
      setChatRooms(updatedRooms);
      setChatTitle(newRoom.title);
      setCurrentRoomId(newRoomId);
      scheduleBotReply(newRoomId);
    } else {
      // 기존 채팅방 메시지 업데이트
      updatedRooms = chatRooms.map(room =>
        room.id === currentRoomId
          ? { ...room, messages: [...(room.messages || []), newMessage] }
          : room
      );
      setChatRooms(updatedRooms);
      scheduleBotReply(currentRoomId);
    }
  };

  // 봇 메시지 전송 및 저장
  const BOT_MESSAGE_DELAY = 0;    // 즉시 표시
  const LOADING_START_DELAY = 500; // 0.5초 후 로딩 시작

  const scheduleBotReply = (targetRoomId) => {
    setTimeout(() => {
    const botMessage = { role: 'bot', content: '레시피를 고르는 중입니다.' };

    setMessages(prev => {
      const updatedMessages = [...prev, botMessage];
      
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === targetRoomId
            ? { ...room, messages: updatedMessages }
            : room
        )
      );
      
        return updatedMessages;
      });
    }, BOT_MESSAGE_DELAY);

    setTimeout(() => {
      setIsLoadingRecipe(true);
    }, LOADING_START_DELAY);
  };

  return {
    messages, setMessages,
    chatTitle, setChatTitle,
    currentRoomId, setCurrentRoomId,
    input, setInput,
    isLoadingRecipe, setIsLoadingRecipe,
    chatRooms, setChatRooms,
    sendMessage
  };
};
