import { useState } from "react";
import { handleSend } from "./chatutils";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [chatTitle, setChatTitle] = useState('');
  const [input, setInput] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    handleSend({ input, setInput, messages, setMessages });

    const savedRooms = JSON.parse(localStorage.getItem("chatRooms")) || [];

    // 새 채팅방일 경우
    if (messages.length === 0 || !currentRoomId) {
      const newRoomId = Date.now(); // ✅ 지역 변수로 ID 생성
      const newRoom = {
        id: newRoomId,
        title: input,
        messages: [newMessage],
        createdAt: new Date().toISOString()
      };

      localStorage.setItem("chatRooms", JSON.stringify([newRoom, ...savedRooms]));
      setChatTitle(input);
      setCurrentRoomId(newRoomId);

      scheduleBotReply(newRoomId);
    } else {
      // 기존 채팅방 메시지 업데이트
      const updatedRooms = savedRooms.map(room =>
        room.id === currentRoomId
          ? { ...room, messages: [...(room.messages || []), newMessage] }
          : room
      );
      localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));

      scheduleBotReply(currentRoomId);
    }
  };

  // ✅ 봇 메시지 전송 및 저장
  const scheduleBotReply = (targetRoomId) => {
    setTimeout(() => {
      const botMessage = { role: 'bot', content: '레시피를 고르는 중입니다.' };

      setMessages(prev => {
        const updatedMessages = [...prev, botMessage];

        const savedRooms = JSON.parse(localStorage.getItem("chatRooms")) || [];
        const updatedRooms = savedRooms.map(room =>
          room.id === targetRoomId
            ? { ...room, messages: [...(room.messages || []), botMessage] }
            : room
        );

        localStorage.setItem("chatRooms", JSON.stringify(updatedRooms));
        return updatedMessages;
      });

      setIsLoadingRecipe(true);
    }, 100);
  };

  return {
    messages, setMessages,
    chatTitle, setChatTitle,
    currentRoomId, setCurrentRoomId,
    input, setInput,
    isLoadingRecipe, setIsLoadingRecipe,
    sendMessage
  };
};
