import React,{ useState } from "react";
import styles from "./Main.module.scss";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import ChatInput from "../../components/ChatInput/ChatInput";
import { useChat } from "../../utils/useChat.js";
import { useIngre } from "../../utils/useIngre.js";

function Main() {
    const {
        currentRoomId, setCurrentRoomId,
        input, setInput,
        isLoadingRecipe, setIsLoadingRecipe,
        sendMessage,
        createChatRoom,
        chatRooms,
        updateChatTitle,
        fetchChatMessages,
        deleteChatRoom
    } = useChat();

    const { ingredients, handleIngredient } = useIngre();
    const [showIngredient, setShowIngredient] = useState(false);
    const [isSpecificRecipe, setIsSpecificRecipe] = useState(false);

     // 현재 선택된 방의 messages 
    const currentRoom = chatRooms.find(room => room.id === currentRoomId);
    const messages = currentRoom ? currentRoom.messages : [];
    const chatTitle = currentRoom ? currentRoom.title : '새 채팅방';

    const handleToggleIngredient = () => {
        handleIngredient();
        setShowIngredient(prev => !prev);
    };

    const handleToggleSpecificRecipe = () => {
        setIsSpecificRecipe(prev => !prev);
    };

    const handleSelectChat = async (room) => {
        setCurrentRoomId(room.id);
        setInput('');
        setIsLoadingRecipe(false); // 초기화
        
        // 채팅방 선택 시 해당 채팅방의 메시지를 백엔드에서 가져오기
        await fetchChatMessages(room.id);
    };

    // 새 채팅방 생성
    const handleCreateChatRoom = async () => {
        console.log("=== 채팅방 생성 버튼 클릭 ===");
        console.log("현재 채팅방 개수:", chatRooms.length);
        console.log("현재 선택된 채팅방 ID:", currentRoomId);
        
        const newRoom = await createChatRoom();
        console.log("생성된 새 채팅방:", newRoom);
        console.log("=== 채팅방 생성 완료 ===");
    };

    // 채팅 메시지 전송
    const handleSend = () => {
        let roomId = currentRoomId;
        let inputValue = input.trim();
        // 채팅방이 없거나 선택된 방이 없으면 새로 생성 (입력값을 제목으로)
        if ((!chatRooms.length || !roomId) && inputValue) {
            const newRoom = createChatRoom(inputValue);
            roomId = newRoom.id;
            setCurrentRoomId(roomId);
        } else if (roomId && inputValue) {
            // 이미 채팅방이 있고, 해당 방의 메시지가 0개이고 기본 제목인 경우에만 제목 변경
            const room = chatRooms.find(r => r.id === roomId);
            if (room && (!room.messages || room.messages.length === 0)) {
                // 기본 제목 패턴인 경우에만 변경 (예: "새 채팅방 1", "새 채팅방 2" 등)
                const defaultTitlePattern = /^새 채팅방 \d+$/;
                if (defaultTitlePattern.test(room.title)) {
                    updateChatTitle(roomId, inputValue);
                }
            }
        }
        sendMessage(roomId, showIngredient, isSpecificRecipe, inputValue);
        console.log("채팅 전송, 냉장고 사용:", showIngredient);
        console.log("채팅 전송, 특정 레시피 요청:", isSpecificRecipe);
    }

    return (
        <div className={styles.main}>
            <Navbar />
            <div className={styles.main__content}>
                <Sidebar 
                    showIngredient={showIngredient}
                    ingredients={ingredients}
                    onSelectChat={handleSelectChat} 
                    chatRooms={chatRooms}
                    onCreateChatRoom={handleCreateChatRoom}
                    onUpdateTitle={updateChatTitle}
                    onDeleteChatRoom={deleteChatRoom}
                    currentRoomId={currentRoomId}
                    // 이 정도를 받아야함
                />
                <div className={styles.main__chat}>
                    <ChatWindow 
                    messages={messages} 
                    chatTitle={chatTitle} 
                    isLoadingRecipe={isLoadingRecipe} 
                    currentRoomId={currentRoomId}
                    showIngredient={showIngredient}
                    input={input}
                    />  
                    <ChatInput 
                        input={input}
                        setInput={setInput}
                        onToggleIngredient={handleToggleIngredient}
                        isSpecificRecipe={isSpecificRecipe}
                        onToggleSpecificRecipe={handleToggleSpecificRecipe}
                        onSend={handleSend}
                    />
                </div>
            </div>
        </div>
    )
}

export default Main;